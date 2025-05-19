import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import { 
  userInsertSchema, 
  mechanicProfileInsertSchema, 
  jobInsertSchema,
  bidInsertSchema,
  reviewInsertSchema,
  messageInsertSchema
} from "@shared/schema";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const validateRequest = (schema: z.ZodType<any>) => (req: Request, res: Response, next: Function) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid request data", error });
  }
};

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Role-based authorization middleware
const hasRole = (role: string) => (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && (req.user as any).role === role) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

// Any role from allowed list
const hasAnyRole = (roles: string[]) => (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && roles.includes((req.user as any).role)) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session setup
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'sameshit-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      if (user.password !== password) { // In a real app, use bcrypt to compare
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Auth routes
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
  
  // User routes
  app.post('/api/users', validateRequest(userInsertSchema), async (req, res) => {
    try {
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  });
  
  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user", error });
    }
  });
  
  app.put('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Users can only update their own profile unless they're an admin
      if (userId !== (req.user as any).id && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const user = await storage.updateUser(userId, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  });
  
  app.get('/api/users', hasRole('admin'), async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving users", error });
    }
  });
  
  // Mechanic profile routes
  app.post('/api/mechanic-profiles', isAuthenticated, validateRequest(mechanicProfileInsertSchema), async (req, res) => {
    try {
      // Check if user already has a mechanic profile
      const existingProfile = await storage.getMechanicProfileByUserId((req.user as any).id);
      if (existingProfile) {
        return res.status(400).json({ message: "Mechanic profile already exists for this user" });
      }
      
      // Only allow current user to create their own profile
      if (req.body.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const profile = await storage.createMechanicProfile(req.body);
      
      // Update user role to mechanic
      await storage.updateUser(req.body.userId, { role: 'mechanic' });
      
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error creating mechanic profile", error });
    }
  });
  
  app.get('/api/mechanic-profiles/:id', async (req, res) => {
    try {
      const profile = await storage.getMechanicProfile(parseInt(req.params.id));
      if (!profile) {
        return res.status(404).json({ message: "Mechanic profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving mechanic profile", error });
    }
  });
  
  app.get('/api/mechanic-profiles/user/:userId', async (req, res) => {
    try {
      const profile = await storage.getMechanicProfileByUserId(parseInt(req.params.userId));
      if (!profile) {
        return res.status(404).json({ message: "Mechanic profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving mechanic profile", error });
    }
  });
  
  app.put('/api/mechanic-profiles/:id', isAuthenticated, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getMechanicProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Mechanic profile not found" });
      }
      
      // Only allow the owner or admin to update the profile
      if (profile.userId !== (req.user as any).id && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedProfile = await storage.updateMechanicProfile(profileId, req.body);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Error updating mechanic profile", error });
    }
  });
  
  app.get('/api/mechanic-profiles', async (req, res) => {
    try {
      let limit = req.query.limit ? parseInt(req.query.limit as string) : 0;
      const profiles = await storage.listMechanicProfiles(limit);
      
      // Get full user data for each profile
      const profilesWithUserData = await Promise.all(
        profiles.map(async (profile) => {
          const user = await storage.getUser(profile.userId);
          return { ...profile, user };
        })
      );
      
      res.json(profilesWithUserData);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving mechanic profiles", error });
    }
  });
  
  app.put('/api/mechanic-profiles/:id/verify', hasRole('admin'), async (req, res) => {
    try {
      const profile = await storage.verifyMechanicProfile(parseInt(req.params.id));
      if (!profile) {
        return res.status(404).json({ message: "Mechanic profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error verifying mechanic profile", error });
    }
  });
  
  // Job routes
  app.post('/api/jobs', isAuthenticated, validateRequest(jobInsertSchema), async (req, res) => {
    try {
      // Only allow current user to create their own job
      if (req.body.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const job = await storage.createJob(req.body);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: "Error creating job", error });
    }
  });
  
  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get bids for the job
      const bids = await storage.listBidsByJobId(job.id);
      
      // Get user data for job owner
      const user = await storage.getUser(job.userId);
      
      res.json({ ...job, user, bids });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving job", error });
    }
  });
  
  app.put('/api/jobs/:id', isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only allow the owner or admin to update the job
      if (job.userId !== (req.user as any).id && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Error updating job", error });
    }
  });
  
  app.get('/api/jobs', async (req, res) => {
    try {
      let jobs;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 0;
      
      if (req.query.status) {
        jobs = await storage.listJobsByStatus(req.query.status as string);
      } else if (req.query.userId) {
        jobs = await storage.listJobsByUserId(parseInt(req.query.userId as string));
      } else {
        jobs = await storage.listJobs(limit);
      }
      
      // Get user data for each job
      const jobsWithUserData = await Promise.all(
        jobs.map(async (job) => {
          const user = await storage.getUser(job.userId);
          const bids = await storage.listBidsByJobId(job.id);
          return { ...job, user, bidCount: bids.length };
        })
      );
      
      res.json(jobsWithUserData);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving jobs", error });
    }
  });
  
  // Bid routes
  // Get all bids for the current mechanic
  app.get('/api/mechanic/bids', isAuthenticated, hasRole('mechanic'), async (req, res) => {
    try {
      const mechanicId = (req.user as any).id;
      const bids = await storage.listBidsByMechanicId(mechanicId);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving mechanic bids", error });
    }
  });

  app.post('/api/bids', isAuthenticated, hasRole('mechanic'), validateRequest(bidInsertSchema), async (req, res) => {
    try {
      // Check if job exists
      const job = await storage.getJob(req.body.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only allow current mechanic to create their own bid
      if (req.body.mechanicId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if mechanic already placed a bid
      const existingBids = await storage.listBidsByJobId(req.body.jobId);
      if (existingBids.some(bid => bid.mechanicId === req.body.mechanicId)) {
        return res.status(400).json({ message: "You already placed a bid on this job" });
      }
      
      const bid = await storage.createBid(req.body);
      res.status(201).json(bid);
    } catch (error) {
      res.status(500).json({ message: "Error creating bid", error });
    }
  });
  
  app.get('/api/bids/:id', isAuthenticated, async (req, res) => {
    try {
      const bid = await storage.getBid(parseInt(req.params.id));
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      const job = await storage.getJob(bid.jobId);
      const mechanic = await storage.getUser(bid.mechanicId);
      
      // Only allow job owner, bid owner, or admin to view bid details
      if ((req.user as any).id !== job?.userId && 
          (req.user as any).id !== bid.mechanicId &&
          (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json({ ...bid, job, mechanic });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving bid", error });
    }
  });
  
  app.get('/api/jobs/:jobId/bids', isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only allow job owner, assigned mechanic, or admin to view all bids
      if ((req.user as any).id !== job.userId && 
          (req.user as any).id !== job.assignedMechanicId &&
          (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const bids = await storage.listBidsByJobId(jobId);
      
      // Get mechanic data for each bid
      const bidsWithMechanicData = await Promise.all(
        bids.map(async (bid) => {
          const mechanic = await storage.getUser(bid.mechanicId);
          const mechanicProfile = await storage.getMechanicProfileByUserId(bid.mechanicId);
          return { ...bid, mechanic, mechanicProfile };
        })
      );
      
      res.json(bidsWithMechanicData);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving bids", error });
    }
  });
  
  app.put('/api/bids/:id/accept', isAuthenticated, async (req, res) => {
    try {
      const bidId = parseInt(req.params.id);
      const bid = await storage.getBid(bidId);
      
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      const job = await storage.getJob(bid.jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only allow job owner or admin to accept a bid
      if ((req.user as any).id !== job.userId && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Only allow accepting bids for open jobs
      if (job.status !== 'open') {
        return res.status(400).json({ message: "Cannot accept bid for a job that is not open" });
      }
      
      const acceptedBid = await storage.acceptBid(bidId);
      res.json(acceptedBid);
    } catch (error) {
      res.status(500).json({ message: "Error accepting bid", error });
    }
  });
  
  // Review routes
  app.post('/api/reviews', isAuthenticated, validateRequest(reviewInsertSchema), async (req, res) => {
    try {
      const job = await storage.getJob(req.body.jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only job owner can leave a review and only for completed jobs
      if ((req.user as any).id !== job.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (job.status !== 'completed') {
        return res.status(400).json({ message: "Cannot review an incomplete job" });
      }
      
      // Check if the mechanic is the assigned mechanic for the job
      if (job.assignedMechanicId !== req.body.mechanicId) {
        return res.status(400).json({ message: "Can only review the assigned mechanic" });
      }
      
      // Check if already reviewed
      const reviews = await storage.listReviewsByMechanicId(req.body.mechanicId);
      if (reviews.some(r => r.jobId === req.body.jobId)) {
        return res.status(400).json({ message: "Already reviewed this job" });
      }
      
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "Error creating review", error });
    }
  });
  
  app.get('/api/mechanics/:mechanicId/reviews', async (req, res) => {
    try {
      const mechanicId = parseInt(req.params.mechanicId);
      const reviews = await storage.listReviewsByMechanicId(mechanicId);
      
      // Get user data for each review
      const reviewsWithUserData = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          const job = await storage.getJob(review.jobId);
          return { ...review, user, job };
        })
      );
      
      res.json(reviewsWithUserData);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving reviews", error });
    }
  });
  
  // Message routes
  app.post('/api/messages', isAuthenticated, validateRequest(messageInsertSchema), async (req, res) => {
    try {
      // Only allow current user to send messages as themselves
      if (req.body.senderId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // If job ID is provided, validate that both users are involved with the job
      if (req.body.jobId) {
        const job = await storage.getJob(req.body.jobId);
        
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
        
        // Check if sender and receiver are involved with the job
        const isJobOwner = job.userId === req.body.senderId || job.userId === req.body.receiverId;
        const isMechanic = job.assignedMechanicId === req.body.senderId || job.assignedMechanicId === req.body.receiverId;
        
        if (!isJobOwner || !isMechanic) {
          return res.status(403).json({ message: "Both users must be involved with the job" });
        }
      }
      
      const message = await storage.createMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Error sending message", error });
    }
  });
  
  app.get('/api/messages', isAuthenticated, async (req, res) => {
    try {
      let messages;
      
      if (req.query.jobId) {
        const jobId = parseInt(req.query.jobId as string);
        const job = await storage.getJob(jobId);
        
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
        
        // Check if user is involved with the job
        if ((req.user as any).id !== job.userId && (req.user as any).id !== job.assignedMechanicId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        messages = await storage.listMessagesByJobId(jobId);
      } else if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        
        // Check if user is trying to access their own messages or if they are admin
        if ((req.user as any).id !== userId && (req.user as any).role !== 'admin') {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        messages = await storage.listMessagesByUserId(userId);
      } else if (req.query.conversation) {
        const otherUserId = parseInt(req.query.conversation as string);
        messages = await storage.listMessagesByConversation((req.user as any).id, otherUserId);
      } else {
        // Default to getting current user's messages
        messages = await storage.listMessagesByUserId((req.user as any).id);
      }
      
      // Get user data for each message
      const messagesWithUserData = await Promise.all(
        messages.map(async (message) => {
          const sender = await storage.getUser(message.senderId);
          const receiver = await storage.getUser(message.receiverId);
          return { ...message, sender, receiver };
        })
      );
      
      res.json(messagesWithUserData);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving messages", error });
    }
  });
  
  app.put('/api/messages/:id/read', isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only allow receiver to mark message as read
      if (message.receiverId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Error marking message as read", error });
    }
  });

  return httpServer;
}
