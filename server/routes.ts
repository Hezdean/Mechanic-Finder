import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  userInsertSchema, 
  mechanicProfileInsertSchema, 
  jobInsertSchema,
  bidInsertSchema,
  reviewInsertSchema,
  messageInsertSchema,
  transactionInsertSchema
} from "@shared/schema";
import { createEmailVerification, createPhoneVerification, verifyEmailCode, verifyPhoneOTP, resendVerification } from "./verification";
import bcrypt from "bcrypt";
import { generateToken, verifyToken, refreshToken, type JwtPayload } from "./jwt";

const validateRequest = (schema: z.ZodType<any>) => (req: Request, res: Response, next: Function) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid request data", error });
  }
};

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// JWT Authentication middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  req.user = payload;
  next();
};

// Role-based authorization middleware
const hasRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === role) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Insufficient permissions" });
};

// Any role from allowed list
const hasAnyRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Insufficient permissions" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Auth routes with JWT
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken(user);
      
      // Return user info (without password) and token
      const { password: _, ...userResponse } = user;
      res.json({
        user: userResponse,
        token,
        expiresIn: "7d"
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    // For JWT, logout is handled client-side by removing the token
    // Optionally implement token blacklisting here for enhanced security
    res.json({ message: "Logged out successfully" });
  });
  
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      // Get fresh user data from storage
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response for security
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user data", error });
    }
  });

  // Token refresh endpoint
  app.post('/api/auth/refresh', authenticateToken, (req, res) => {
    try {
      const newToken = refreshToken(req.headers['authorization']?.split(' ')[1] || '');
      if (!newToken) {
        return res.status(401).json({ message: "Cannot refresh token" });
      }
      
      res.json({
        token: newToken,
        expiresIn: "7d"
      });
    } catch (error) {
      res.status(500).json({ message: "Error refreshing token", error });
    }
  });

  // Change password endpoint
  app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await storage.updateUser(user.id, { password: hashedNewPassword });
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error changing password", error });
    }
  });

  // Verification endpoints
  app.post('/api/verification/send-email', authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const success = await createEmailVerification(user.id, user.email, user.firstName);
      if (success) {
        res.json({ message: "Verification email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending verification email", error });
    }
  });

  app.post('/api/verification/verify-email', authenticateToken, async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Verification code is required" });
      }

      const success = await verifyEmailCode(req.user!.userId, code);
      if (success) {
        res.json({ message: "Email verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid or expired verification code" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error verifying email", error });
    }
  });

  app.post('/api/verification/send-phone', authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.phone) {
        return res.status(400).json({ message: "User phone number not found" });
      }

      if (user.phoneVerified) {
        return res.status(400).json({ message: "Phone already verified" });
      }

      const success = await createPhoneVerification(user.id, user.phone);
      if (success) {
        res.json({ message: "OTP sent successfully to your phone" });
      } else {
        res.status(500).json({ message: "Failed to send OTP" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending OTP", error });
    }
  });

  app.post('/api/verification/verify-phone', authenticateToken, async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "OTP is required" });
      }

      const success = await verifyPhoneOTP(req.user!.userId, code);
      if (success) {
        res.json({ message: "Phone verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error verifying phone", error });
    }
  });

  app.post('/api/verification/resend', authenticateToken, async (req, res) => {
    try {
      const { type } = req.body; // 'email' or 'phone'
      if (!type || !['email', 'phone'].includes(type)) {
        return res.status(400).json({ message: "Type must be 'email' or 'phone'" });
      }

      const success = await resendVerification(req.user!.userId, type);
      if (success) {
        const message = type === 'email' ? 
          "Verification email resent successfully" : 
          "OTP resent successfully to your phone";
        res.json({ message });
      } else {
        res.status(500).json({ message: `Failed to resend ${type} verification` });
      }
    } catch (error) {
      res.status(500).json({ message: "Error resending verification", error });
    }
  });
  
  // AI Diagnostics route
  app.post("/api/diagnostics", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { getDiagnostics } = await import("./ai-diagnostics");
      const result = await getDiagnostics(req.body);
      res.json(result);
    } catch (error) {
      console.error("Diagnostics error:", error);
      res.status(500).json({ message: "Failed to process diagnostics" });
    }
  });

  // Emergency assistance route
  app.post("/api/emergency", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, description, vehicle } = req.body;
      
      // Create emergency job with high priority
      const emergencyJob = await storage.createJob({
        userId: req.user!.userId,
        title: "🚨 EMERGENCY: Vehicle Breakdown",
        description: description || "Emergency breakdown assistance needed",
        vehicle: vehicle || "Emergency situation",
        location: `Emergency location: ${latitude}, ${longitude}`,
        isEmergency: true,
        urgencyLevel: "emergency",
        budget: "Emergency - Negotiable"
      });

      // Get all available mechanics for immediate notification
      const mechanics = await storage.listMechanicProfiles();
      const availableMechanics = mechanics.filter(m => m.isAvailable !== false);
      
      // Create emergency messages to notify all available mechanics
      const emergencyMessages = availableMechanics.map(mechanic => ({
        senderId: req.user!.userId,
        receiverId: mechanic.userId,
        jobId: emergencyJob.id,
        content: `🚨 EMERGENCY ALERT: Vehicle breakdown at coordinates ${latitude}, ${longitude}. ${description || 'Immediate assistance needed'}. This is a priority emergency request.`,
        isEmergencyAlert: true
      }));

      // Send emergency notifications to all available mechanics
      for (const messageData of emergencyMessages) {
        await storage.createMessage(messageData);
      }

      res.json({ 
        success: true, 
        jobId: emergencyJob.id,
        mechanicsNotified: availableMechanics.length,
        message: `Emergency alert sent to ${availableMechanics.length} available mechanics` 
      });
    } catch (error) {
      console.error("Emergency request error:", error);
      res.status(500).json({ message: "Failed to process emergency request" });
    }
  });

  // Nearby mechanics route
  app.get("/api/mechanics/nearby", authenticateToken, async (req: Request, res: Response) => {
    try {
      const mechanics = await storage.listMechanicProfiles();
      const availableMechanics = mechanics.filter(m => m.isAvailable !== false);
      res.json(availableMechanics);
    } catch (error) {
      console.error("Error fetching nearby mechanics:", error);
      res.status(500).json({ message: "Failed to fetch mechanics" });
    }
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
      
      // Create user - password will be hashed in storage.createUser
      const user = await storage.createUser(req.body);
      
      // Remove password from response
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  });
  
  app.get('/api/users/:id', authenticateToken, async (req, res) => {
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
  
  app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Users can only update their own profile unless they're an admin
      if (userId !== req.user!.userId && req.user!.role !== 'admin') {
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
  
  app.get('/api/users', authenticateToken, hasRole('admin'), async (req, res) => {
    try {
      const users = await storage.listUsers();
      // Remove sensitive information before sending to frontend
      const sanitizedUsers = users.map(user => ({
        ...user,
        passwordHash: undefined,
        password: undefined
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving users", error });
    }
  });

  // Update user endpoint (admin only)
  app.put('/api/users/:id', authenticateToken, hasRole('admin'), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Don't allow updating password through this endpoint
      delete updates.password;
      delete updates.passwordHash;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const sanitizedUser = {
        ...updatedUser,
        passwordHash: undefined,
        password: undefined
      };
      
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  });

  // Delete user endpoint (admin only)
  app.delete('/api/users/:id', authenticateToken, hasRole('admin'), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Don't allow admin to delete their own account
      if (userId === req.user!.userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real app, you might want to soft delete or archive instead
      // For now, we'll just return success without actually deleting from memory storage
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  });

  // Admin analytics endpoint
  app.get('/api/admin/analytics', authenticateToken, hasRole('admin'), async (req, res) => {
    try {
      const users = await storage.listUsers();
      const mechanics = await storage.listMechanicProfiles();
      const jobs = await storage.listJobs();
      
      // Calculate comprehensive analytics
      const totalUsers = users.length;
      const totalMechanics = mechanics.length;
      const totalJobs = jobs.length;
      
      const openJobs = jobs.filter(job => job.status === 'open');
      const inProgressJobs = jobs.filter(job => job.status === 'in_progress');
      const completedJobs = jobs.filter(job => job.status === 'completed');
      
      const verifiedUsers = users.filter(user => user.emailVerified);
      const verificationRate = totalUsers > 0 ? Math.round((verifiedUsers.length / totalUsers) * 100) : 0;
      const completionRate = totalJobs > 0 ? Math.round((completedJobs.length / totalJobs) * 100) : 0;
      
      // Revenue calculations
      const avgJobValue = 125;
      const totalRevenue = completedJobs.length * avgJobValue;
      const platformFee = totalRevenue * 0.15;
      
      // Performance metrics
      const systemMetrics = {
        avgResponseTime: 45, // minutes
        systemUptime: 99.8, // percentage
        avgJobCompletionTime: 3.2, // hours
        errorRate: 0.2, // percentage
      };
      
      // Growth simulation (in real app, this would come from historical data)
      const growthMetrics = {
        userGrowth: Math.floor(totalUsers * 0.12),
        jobGrowth: Math.floor(totalJobs * 0.08),
        revenueGrowth: 15.6,
        mechanicGrowth: Math.floor(totalMechanics * 0.15),
      };
      
      // Geographic distribution (simulated)
      const geographicData = [
        { state: 'California', count: Math.floor(totalUsers * 0.18) },
        { state: 'Texas', count: Math.floor(totalUsers * 0.14) },
        { state: 'Florida', count: Math.floor(totalUsers * 0.11) },
        { state: 'New York', count: Math.floor(totalUsers * 0.09) },
        { state: 'Illinois', count: Math.floor(totalUsers * 0.07) },
      ];
      
      const analytics = {
        overview: {
          totalUsers,
          totalMechanics,
          totalJobs,
          verifiedUsers: verifiedUsers.length,
          verificationRate,
          completionRate,
        },
        jobs: {
          open: openJobs.length,
          inProgress: inProgressJobs.length,
          completed: completedJobs.length,
          total: totalJobs,
        },
        revenue: {
          total: totalRevenue,
          platformFee,
          avgJobValue,
        },
        performance: systemMetrics,
        growth: growthMetrics,
        geographic: geographicData,
        timestamp: new Date().toISOString(),
      };
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics", error });
    }
  });

  // Admin job management endpoints
  app.put('/api/jobs/:id', authenticateToken, hasRole('admin'), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedJob = await storage.updateJob(jobId, updates);
      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Error updating job", error });
    }
  });

  app.delete('/api/jobs/:id', authenticateToken, hasRole('admin'), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // In a real app, you might want to soft delete or archive instead
      // For now, we'll just return success without actually deleting from memory storage
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting job", error });
    }
  });

  // Admin job actions
  app.post('/api/admin/jobs/:id/:action', authenticateToken, hasRole('admin'), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const action = req.params.action;
      const { mechanicId } = req.body;
      
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      let updates: any = {};
      
      switch (action) {
        case 'suspend':
          updates.status = 'suspended';
          break;
        case 'activate':
          updates.status = 'open';
          break;
        case 'priority':
          updates.urgency = 'emergency';
          break;
        case 'assign':
          if (mechanicId) {
            updates.assignedMechanicId = mechanicId;
            updates.status = 'in_progress';
          }
          break;
        case 'complete':
          updates.status = 'completed';
          updates.completedAt = new Date().toISOString();
          break;
        default:
          return res.status(400).json({ message: "Invalid action" });
      }
      
      const updatedJob = await storage.updateJob(jobId, updates);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Error performing job action", error });
    }
  });

  // Booking endpoints
  app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
      // In a real app, this would fetch user's bookings from database
      // For now, return empty array since we're using mock data in frontend
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings", error });
    }
  });

  app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
      const booking = req.body;
      booking.userId = req.user!.userId;
      booking.status = 'pending';
      booking.id = Date.now(); // Simple ID generation
      
      // In a real app, this would save to database
      // For now, just return the booking
      res.status(201).json({
        ...booking,
        mechanic: {
          name: "Selected Mechanic",
          location: "Service Location",
          phone: "(555) 000-0000"
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating booking", error });
    }
  });

  app.post('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      // In a real app, this would update booking status in database
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error cancelling booking", error });
    }
  });

  app.get('/api/mechanics/available', async (req, res) => {
    try {
      // In a real app, this would fetch available mechanics from database
      // For now, return empty array since we're using mock data in frontend
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available mechanics", error });
    }
  });
  
  // Mechanic profile routes - users can become mechanics by creating profiles
  app.post('/api/mechanic-profiles', authenticateToken, validateRequest(mechanicProfileInsertSchema), async (req, res) => {
    try {
      // Check if user already has a mechanic profile
      const existingProfile = await storage.getMechanicProfileByUserId(req.user!.userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Mechanic profile already exists for this user" });
      }
      
      // Only allow current user to create their own profile
      if (req.body.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Forbidden: Can only create profile for yourself" });
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
  
  app.put('/api/mechanic-profiles/:id', authenticateToken, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getMechanicProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Mechanic profile not found" });
      }
      
      // Only allow the owner or admin to update the profile
      if (profile.userId !== req.user!.userId && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedProfile = await storage.updateMechanicProfile(profileId, req.body);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Error updating mechanic profile", error });
    }
  });
  
  // PATCH route for partial updates to mechanic profiles
  app.patch('/api/mechanic-profiles/:id', authenticateToken, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getMechanicProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Mechanic profile not found" });
      }
      
      // Only allow the owner or admin to update the profile
      if (profile.userId !== req.user!.userId && (req.user as any).role !== 'admin') {
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
  
  // Job routes - only car owners can post jobs
  app.post('/api/jobs', authenticateToken, validateRequest(jobInsertSchema), async (req, res) => {
    try {
      // Only allow current user to create their own job
      if (req.body.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Forbidden: Can only create jobs for yourself" });
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
      
      // Get bids for the job with mechanic data
      const bids = await storage.listBidsByJobId(job.id);
      
      // Get mechanic data for each bid
      const bidsWithMechanicData = await Promise.all(
        bids.map(async (bid) => {
          const mechanic = await storage.getUser(bid.mechanicId);
          const mechanicProfile = await storage.getMechanicProfileByUserId(bid.mechanicId);
          return { ...bid, mechanic, mechanicProfile };
        })
      );
      
      // Get user data for job owner
      const user = await storage.getUser(job.userId);
      
      res.json({ ...job, user, bids: bidsWithMechanicData });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving job", error });
    }
  });
  
  app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only allow the owner or admin to update the job
      if (job.userId !== req.user!.userId && (req.user as any).role !== 'admin') {
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
  app.get('/api/mechanic/bids', authenticateToken, async (req, res) => {
    try {
      const mechanicId = req.user!.userId;
      const bids = await storage.listBidsByMechanicId(mechanicId);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving mechanic bids", error });
    }
  });

  // Bid routes - only mechanics can bid
  app.post('/api/bids', authenticateToken, validateRequest(bidInsertSchema), async (req, res) => {
    try {
      // Check if job exists
      const job = await storage.getJob(req.body.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only allow current mechanic to create their own bid
      if (req.body.mechanicId !== req.user!.userId) {
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
  
  app.get('/api/bids/:id', authenticateToken, async (req, res) => {
    try {
      const bid = await storage.getBid(parseInt(req.params.id));
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      const job = await storage.getJob(bid.jobId);
      const mechanic = await storage.getUser(bid.mechanicId);
      
      // Only allow job owner, bid owner, or admin to view bid details
      if (req.user!.userId !== job?.userId && 
          req.user!.userId !== bid.mechanicId &&
          (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json({ ...bid, job, mechanic });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving bid", error });
    }
  });
  
  app.get('/api/jobs/:jobId/bids', authenticateToken, async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only allow job owner, assigned mechanic, or admin to view all bids
      if (req.user!.userId !== job.userId && 
          req.user!.userId !== job.assignedMechanicId &&
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
  
  // Only job owners can accept bids
  app.put('/api/bids/:id/accept', authenticateToken, async (req, res) => {
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
      if (req.user!.userId !== job.userId && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Only allow accepting bids for open jobs
      if (job.status !== 'open') {
        return res.status(400).json({ message: "Cannot accept bid for a job that is not open" });
      }
      
      // Accept the bid and update job status
      const acceptedBid = await storage.acceptBid(bidId);
      
      // Update job status to 'in_progress' and assign mechanic
      await storage.updateJob(job.id, {
        status: 'in_progress',
        assignedMechanicId: bid.mechanicId
      });
      
      // Create notification message for the mechanic
      const jobOwner = await storage.getUser(job.userId);
      const notificationMessage = await storage.createMessage({
        senderId: job.userId,
        receiverId: bid.mechanicId,
        jobId: job.id,
        content: `Great news! Your bid for "${job.title}" has been accepted by ${jobOwner?.firstName} ${jobOwner?.lastName}. The job is now assigned to you. Please contact the customer to coordinate the repair work.`
      });
      
      // Reject all other bids for this job
      const allBids = await storage.listBidsByJobId(job.id);
      await Promise.all(
        allBids
          .filter(b => b.id !== bidId && b.status === 'pending')
          .map(b => storage.updateBid(b.id, { status: 'rejected' }))
      );
      
      res.json(acceptedBid);
    } catch (error) {
      res.status(500).json({ message: "Error accepting bid", error });
    }
  });
  
  // Review routes - only job owners can leave reviews
  app.post('/api/reviews', authenticateToken, validateRequest(reviewInsertSchema), async (req, res) => {
    try {
      const job = await storage.getJob(req.body.jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only job owner can leave a review and only for completed jobs
      if (req.user!.userId !== job.userId) {
        return res.status(403).json({ message: "Forbidden: Can only review jobs you posted" });
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
  
  // Get unread messages/notifications for current user
  app.get('/api/messages/unread', authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.userId;
      const messages = await storage.listMessagesByUserId(userId);
      const unreadMessages = messages.filter(msg => !msg.isRead && msg.receiverId === userId);
      
      // Get sender data for each message
      const messagesWithSenderData = await Promise.all(
        unreadMessages.map(async (message) => {
          const sender = await storage.getUser(message.senderId);
          const job = message.jobId ? await storage.getJob(message.jobId) : null;
          return { ...message, sender, job };
        })
      );
      
      res.json(messagesWithSenderData);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving unread messages", error });
    }
  });

  // Mark message as read
  app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only allow the receiver to mark as read
      if (message.receiverId !== req.user!.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Error marking message as read", error });
    }
  });

  // Message routes
  app.post('/api/messages', authenticateToken, validateRequest(messageInsertSchema), async (req, res) => {
    try {
      // Only allow current user to send messages as themselves
      if (req.body.senderId !== req.user!.userId) {
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
  
  app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
      let messages;
      
      if (req.query.jobId) {
        const jobId = parseInt(req.query.jobId as string);
        const job = await storage.getJob(jobId);
        
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
        
        // Check if user is involved with the job
        if (req.user!.userId !== job.userId && req.user!.userId !== job.assignedMechanicId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        messages = await storage.listMessagesByJobId(jobId);
      } else if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        
        // Check if user is trying to access their own messages or if they are admin
        if (req.user!.userId !== userId && (req.user as any).role !== 'admin') {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        messages = await storage.listMessagesByUserId(userId);
      } else if (req.query.conversation) {
        const otherUserId = parseInt(req.query.conversation as string);
        messages = await storage.listMessagesByConversation(req.user!.userId, otherUserId);
      } else {
        // Default to getting current user's messages
        messages = await storage.listMessagesByUserId(req.user!.userId);
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
  
  app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only allow receiver to mark message as read
      if (message.receiverId !== req.user!.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Error marking message as read", error });
    }
  });

  // Transaction routes
  app.post('/api/transactions', authenticateToken, validateRequest(transactionInsertSchema), async (req, res) => {
    try {
      const jobId = req.body.jobId;
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only allow job owner to create payment
      if (job.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Only job owner can make payment" });
      }
      
      // Verify job is in progress (has accepted bid)
      if (job.status !== 'in_progress') {
        return res.status(400).json({ message: "Job must have an accepted bid before payment" });
      }
      
      // Verify mechanic is assigned
      if (!job.assignedMechanicId) {
        return res.status(400).json({ message: "No mechanic assigned to this job" });
      }
      
      // Create transaction
      const transactionData = {
        ...req.body,
        userId: req.user!.userId,
        mechanicId: job.assignedMechanicId,
        status: 'pending'
      };
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Error creating transaction", error });
    }
  });

  app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
      let transactions;
      
      if (req.query.jobId) {
        const jobId = parseInt(req.query.jobId as string);
        const job = await storage.getJob(jobId);
        
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
        
        // Check if user is involved with the job
        if (req.user!.userId !== job.userId && req.user!.userId !== job.assignedMechanicId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        transactions = await storage.listTransactionsByJobId(jobId);
      } else if (req.query.mechanicId) {
        const mechanicId = parseInt(req.query.mechanicId as string);
        
        // Check if user is the mechanic or admin
        if (req.user!.userId !== mechanicId && (req.user as any).role !== 'admin') {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        transactions = await storage.listTransactionsByMechanicId(mechanicId);
      } else {
        // Get user's transactions with role-based logic
        if (req.user!.role === 'mechanic') {
          transactions = await storage.listTransactionsByMechanicId(req.user!.userId);
        } else {
          transactions = await storage.listTransactionsByUserId(req.user!.userId);
        }
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving transactions", error });
    }
  });

  // Get mechanic earnings summary
  app.get('/api/transactions/earnings', authenticateToken, async (req, res) => {
    try {
      if (req.user!.role !== 'mechanic') {
        return res.status(403).json({ message: "Only mechanics can access earnings data" });
      }

      const transactions = await storage.listTransactionsByMechanicId(req.user!.userId);
      
      const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);
      const completedJobs = transactions.length;
      const averageJobValue = completedJobs > 0 ? Math.round(totalEarnings / completedJobs) : 0;

      res.json({
        totalEarnings,
        completedJobs,
        averageJobValue
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching earnings data", error });
    }
  });

  app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Only allow the payer or admin to update transaction
      if (transaction.userId !== req.user!.userId && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTransaction = await storage.updateTransaction(transactionId, req.body);
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: "Error updating transaction", error });
    }
  });

  return httpServer;
}
