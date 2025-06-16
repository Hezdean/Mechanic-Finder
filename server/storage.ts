import { 
  users, type User, type UserInsert,
  mechanicProfiles, type MechanicProfile, type MechanicProfileInsert,
  jobs, type Job, type JobInsert,
  bids, type Bid, type BidInsert,
  reviews, type Review, type ReviewInsert,
  messages, type Message, type MessageInsert,
  transactions, type Transaction, type TransactionInsert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UserInsert): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;

  // Mechanic profile methods
  getMechanicProfile(id: number): Promise<MechanicProfile | undefined>;
  getMechanicProfileByUserId(userId: number): Promise<MechanicProfile | undefined>;
  createMechanicProfile(profile: MechanicProfileInsert): Promise<MechanicProfile>;
  updateMechanicProfile(id: number, profile: Partial<MechanicProfile>): Promise<MechanicProfile | undefined>;
  listMechanicProfiles(limit?: number): Promise<MechanicProfile[]>;
  verifyMechanicProfile(id: number): Promise<MechanicProfile | undefined>;

  // Job methods
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: JobInsert): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  listJobs(limit?: number): Promise<Job[]>;
  listJobsByUserId(userId: number): Promise<Job[]>;
  listJobsByStatus(status: string): Promise<Job[]>;

  // Bid methods
  getBid(id: number): Promise<Bid | undefined>;
  createBid(bid: BidInsert): Promise<Bid>;
  updateBid(id: number, bid: Partial<Bid>): Promise<Bid | undefined>;
  listBidsByJobId(jobId: number): Promise<Bid[]>;
  listBidsByMechanicId(mechanicId: number): Promise<Bid[]>;
  acceptBid(id: number): Promise<Bid | undefined>;

  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: ReviewInsert): Promise<Review>;
  listReviewsByMechanicId(mechanicId: number): Promise<Review[]>;
  listReviewsByUserId(userId: number): Promise<Review[]>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: MessageInsert): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  listMessagesByUserId(userId: number): Promise<Message[]>;
  listMessagesByConversation(userId1: number, userId2: number): Promise<Message[]>;
  listMessagesByJobId(jobId: number): Promise<Message[]>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: TransactionInsert): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  listTransactionsByJobId(jobId: number): Promise<Transaction[]>;
  listTransactionsByUserId(userId: number): Promise<Transaction[]>;
  listTransactionsByMechanicId(mechanicId: number): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mechanicProfiles: Map<number, MechanicProfile>;
  private jobs: Map<number, Job>;
  private bids: Map<number, Bid>;
  private reviews: Map<number, Review>;
  private messages: Map<number, Message>;
  private transactions: Map<number, Transaction>;
  private currentIds: {
    users: number;
    mechanicProfiles: number;
    jobs: number;
    bids: number;
    reviews: number;
    messages: number;
    transactions: number;
  };

  constructor() {
    this.users = new Map();
    this.mechanicProfiles = new Map();
    this.jobs = new Map();
    this.bids = new Map();
    this.reviews = new Map();
    this.messages = new Map();
    this.transactions = new Map();
    this.currentIds = {
      users: 1,
      mechanicProfiles: 1,
      jobs: 1,
      bids: 1,
      reviews: 1,
      messages: 1,
      transactions: 1,
    };

    // Initialize data asynchronously
    this.initializeData();
  }

  private async initializeData() {
    try {
      console.log('Starting data initialization...');
      
      // Clear existing data to ensure fresh start with proper password hashing
      this.users.clear();
      this.mechanicProfiles.clear();
      this.jobs.clear();
      this.bids.clear();
      this.reviews.clear();
      this.messages.clear();
      this.currentIds = {
        users: 1,
        mechanicProfiles: 1,
        jobs: 1,
        bids: 1,
        reviews: 1,
        messages: 1,
      };
      
      // Create admin user with bcrypt-hashed password
      const adminUser = await this.createUser({
        username: "admin",
        password: "adminpass",
        email: "admin@sameshit.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      });
      console.log('Admin user created with ID:', adminUser.id);

      // Create some initial mechanics
      await this.seedMechanics();
      console.log('Mechanics seeded');
      
      // Create some initial jobs
      await this.seedJobs();
      console.log('Jobs seeded');
      
      console.log('Data initialization complete');
    } catch (error) {
      console.error('Error during data initialization:', error);
    }
  }

  // Seed some initial mechanics
  private async seedMechanics() {
    // Create mechanic users
    const mechanic1 = await this.createUser({
      username: "michaelT",
      password: "mechpass1",
      email: "michael@example.com",
      firstName: "Michael",
      lastName: "Thompson",
      role: "mechanic",
      profilePicture: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
      city: "Denver",
      state: "CO",
    });

    const mechanic2 = await this.createUser({
      username: "sarahM",
      password: "mechpass2",
      email: "sarah@example.com",
      firstName: "Sarah",
      lastName: "Martinez",
      role: "mechanic",
      profilePicture: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
      city: "Austin",
      state: "TX",
    });

    const mechanic3 = await this.createUser({
      username: "robertJ",
      password: "mechpass3",
      email: "robert@example.com",
      firstName: "Robert",
      lastName: "Johnson",
      role: "mechanic",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      city: "Chicago",
      state: "IL",
    });

    // Create mechanic profiles
    await this.createMechanicProfile({
      userId: mechanic1.id,
      specializations: ["Engine Repair", "Transmission", "Diagnostics"],
      yearsOfExperience: 15,
      certifications: ["ASE"],
      hourlyRate: 75,
      isMobile: true,
      servicesOffered: ["Engine Repair", "Transmission Service", "Diagnostics"],
      verificationDocuments: ["license.jpg", "certification.pdf"],
    });

    await this.createMechanicProfile({
      userId: mechanic2.id,
      specializations: ["Electrical", "Brake Systems", "European Cars"],
      yearsOfExperience: 10,
      certifications: ["BMW"],
      hourlyRate: 85,
      isMobile: true,
      servicesOffered: ["Electrical Repairs", "Brake Service", "European Car Specialist"],
      verificationDocuments: ["license.jpg", "bmw_cert.pdf"],
    });

    await this.createMechanicProfile({
      userId: mechanic3.id,
      specializations: ["Classic Cars", "Restoration", "Performance"],
      yearsOfExperience: 30,
      certifications: ["ASE Master"],
      hourlyRate: 90,
      isMobile: false,
      servicesOffered: ["Classic Car Restoration", "Performance Upgrades", "Custom Work"],
      verificationDocuments: ["license.jpg", "master_cert.pdf"],
    });

    // Verify all mechanics for demo
    for (let i = 1; i <= 3; i++) {
      await this.verifyMechanicProfile(i);
      // Add some reviews and ratings
      const profile = await this.getMechanicProfile(i);
      if (profile) {
        await this.updateMechanicProfile(profile.id, { 
          rating: 45 + Math.floor(Math.random() * 10), // 4.5-5.0 stars
          reviewCount: 80 + Math.floor(Math.random() * 100)
        });
      }
    }
  }

  // Seed some initial jobs
  private async seedJobs() {
    // Create regular user
    const user = await this.createUser({
      username: "carowner",
      password: "userpass1",
      email: "user@example.com",
      firstName: "Car",
      lastName: "Owner",
      role: "user",
      city: "Seattle",
      state: "WA",
    });

    // Create some jobs
    await this.createJob({
      userId: user.id,
      title: "Engine Misfire Diagnosis",
      description: "Check engine light is on, engine misfires when accelerating. Need diagnostic and repair. Prefer mobile mechanic who can come to my location.",
      vehicle: "2015 Honda Accord, 78K miles",
      location: "Seattle, WA",
      photos: [],
      budget: 200,
    });

    await this.createJob({
      userId: user.id,
      title: "Brake Pad Replacement",
      description: "Front brakes are squeaking and performance is declining. Need to replace front brake pads and possibly rotors. I can bring the car to you or you can come to me.",
      vehicle: "2018 Toyota Camry, 45K miles",
      location: "Phoenix, AZ",
      photos: [],
      budget: 250,
    });

    const job3 = await this.createJob({
      userId: user.id,
      title: "Alternator Replacement",
      description: "Battery warning light is on. Local shop diagnosed it as a failing alternator. Need alternator replacement. Parts will be provided. Looking for installation only.",
      vehicle: "2014 Ford F-150, 110K miles",
      location: "Dallas, TX",
      photos: [],
      budget: 300,
    });

    // Set the third job to in_progress
    await this.updateJob(job3.id, { status: "in_progress" });
    
    // Add some bids to the jobs
    for (let jobId = 1; jobId <= 3; jobId++) {
      // Add 3-8 bids per job
      const bidCount = 3 + Math.floor(Math.random() * 6);
      for (let i = 0; i < bidCount; i++) {
        const mechanicId = 1 + (i % 3); // Use our 3 mechanics
        await this.createBid({
          jobId,
          mechanicId,
          amount: 150 + Math.floor(Math.random() * 200),
          description: `I can fix this. I'll bring all the necessary tools and parts.`,
          estimatedTime: `${1 + Math.floor(Math.random() * 3)} hours`,
        });
      }
    }

    // Assign job 3 to mechanic 1
    await this.updateJob(3, { assignedMechanicId: 1 });
    await this.acceptBid(7); // Assuming bid 7 is from mechanic 1 for job 3
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return [...this.users.values()].find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return [...this.users.values()].find(user => user.email === email);
  }

  async createUser(user: UserInsert): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    
    // Hash the password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: now,
      password: hashedPassword 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return [...this.users.values()];
  }

  // Mechanic profile methods
  async getMechanicProfile(id: number): Promise<MechanicProfile | undefined> {
    return this.mechanicProfiles.get(id);
  }

  async getMechanicProfileByUserId(userId: number): Promise<MechanicProfile | undefined> {
    return [...this.mechanicProfiles.values()].find(profile => profile.userId === userId);
  }

  async createMechanicProfile(profile: MechanicProfileInsert): Promise<MechanicProfile> {
    const id = this.currentIds.mechanicProfiles++;
    const newProfile: MechanicProfile = { 
      ...profile, 
      id, 
      isVerified: false,
      rating: 0,
      reviewCount: 0
    };
    this.mechanicProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateMechanicProfile(id: number, profileData: Partial<MechanicProfile>): Promise<MechanicProfile | undefined> {
    const profile = await this.getMechanicProfile(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.mechanicProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async listMechanicProfiles(limit: number = 0): Promise<MechanicProfile[]> {
    const profiles = [...this.mechanicProfiles.values()];
    return limit > 0 ? profiles.slice(0, limit) : profiles;
  }

  async verifyMechanicProfile(id: number): Promise<MechanicProfile | undefined> {
    return this.updateMechanicProfile(id, { isVerified: true });
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(job: JobInsert): Promise<Job> {
    const id = this.currentIds.jobs++;
    const now = new Date();
    const newJob: Job = { 
      ...job, 
      id, 
      status: "open", 
      createdAt: now, 
      updatedAt: now,
      assignedMechanicId: null
    };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const job = await this.getJob(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...jobData, updatedAt: new Date() };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async listJobs(limit: number = 0): Promise<Job[]> {
    const jobsList = [...this.jobs.values()];
    // Sort by created date desc
    jobsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return limit > 0 ? jobsList.slice(0, limit) : jobsList;
  }

  async listJobsByUserId(userId: number): Promise<Job[]> {
    return [...this.jobs.values()].filter(job => job.userId === userId);
  }

  async listJobsByStatus(status: string): Promise<Job[]> {
    return [...this.jobs.values()].filter(job => job.status === status);
  }

  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    return this.bids.get(id);
  }

  async createBid(bid: BidInsert): Promise<Bid> {
    const id = this.currentIds.bids++;
    const now = new Date();
    const newBid: Bid = { ...bid, id, status: "pending", createdAt: now };
    this.bids.set(id, newBid);
    return newBid;
  }

  async updateBid(id: number, bidData: Partial<Bid>): Promise<Bid | undefined> {
    const bid = await this.getBid(id);
    if (!bid) return undefined;
    
    const updatedBid = { ...bid, ...bidData };
    this.bids.set(id, updatedBid);
    return updatedBid;
  }

  async listBidsByJobId(jobId: number): Promise<Bid[]> {
    return [...this.bids.values()].filter(bid => bid.jobId === jobId);
  }

  async listBidsByMechanicId(mechanicId: number): Promise<Bid[]> {
    return [...this.bids.values()].filter(bid => bid.mechanicId === mechanicId);
  }

  async acceptBid(id: number): Promise<Bid | undefined> {
    const bid = await this.getBid(id);
    if (!bid) return undefined;
    
    // Update bid status
    const updatedBid = await this.updateBid(id, { status: "accepted" });
    
    // Update job status and assigned mechanic
    const job = await this.getJob(bid.jobId);
    if (job) {
      await this.updateJob(job.id, { 
        status: "in_progress", 
        assignedMechanicId: bid.mechanicId 
      });
      
      // Reject all other bids for this job
      const otherBids = await this.listBidsByJobId(job.id);
      for (const otherBid of otherBids) {
        if (otherBid.id !== id) {
          await this.updateBid(otherBid.id, { status: "rejected" });
        }
      }
    }
    
    return updatedBid;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(review: ReviewInsert): Promise<Review> {
    const id = this.currentIds.reviews++;
    const now = new Date();
    const newReview: Review = { ...review, id, createdAt: now };
    this.reviews.set(id, newReview);
    
    // Update mechanic's rating
    const mechanicProfile = await this.getMechanicProfileByUserId(review.mechanicId);
    if (mechanicProfile) {
      const reviews = await this.listReviewsByMechanicId(review.mechanicId);
      const total = reviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
      const count = reviews.length + 1;
      const avgRating = Math.round((total / count) * 10); // Store as 1-50 (1-5 stars with decimal)
      
      await this.updateMechanicProfile(mechanicProfile.id, {
        rating: avgRating,
        reviewCount: count
      });
    }
    
    return newReview;
  }

  async listReviewsByMechanicId(mechanicId: number): Promise<Review[]> {
    return [...this.reviews.values()].filter(review => review.mechanicId === mechanicId);
  }

  async listReviewsByUserId(userId: number): Promise<Review[]> {
    return [...this.reviews.values()].filter(review => review.userId === userId);
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(message: MessageInsert): Promise<Message> {
    const id = this.currentIds.messages++;
    const now = new Date();
    const newMessage: Message = { ...message, id, isRead: false, createdAt: now };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = await this.getMessage(id);
    if (!message) return undefined;
    
    return this.updateMessage(id, { isRead: true });
  }

  private async updateMessage(id: number, messageData: Partial<Message>): Promise<Message | undefined> {
    const message = await this.getMessage(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...messageData };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async listMessagesByUserId(userId: number): Promise<Message[]> {
    return [...this.messages.values()].filter(
      message => message.senderId === userId || message.receiverId === userId
    );
  }

  async listMessagesByConversation(userId1: number, userId2: number): Promise<Message[]> {
    return [...this.messages.values()].filter(
      message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
    );
  }

  async listMessagesByJobId(jobId: number): Promise<Message[]> {
    return [...this.messages.values()].filter(message => message.jobId === jobId);
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: TransactionInsert): Promise<Transaction> {
    const id = this.currentIds.transactions++;
    const now = new Date();
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) return undefined;
    
    const updatedTransaction = { 
      ...existingTransaction, 
      ...transactionData, 
      updatedAt: new Date() 
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async listTransactionsByJobId(jobId: number): Promise<Transaction[]> {
    return [...this.transactions.values()].filter(transaction => transaction.jobId === jobId);
  }

  async listTransactionsByUserId(userId: number): Promise<Transaction[]> {
    const userTransactions = [...this.transactions.values()].filter(transaction => transaction.userId === userId);
    
    // Enhance with related data
    return userTransactions.map(transaction => {
      const job = this.jobs.get(transaction.jobId);
      const mechanic = this.users.get(transaction.mechanicId);
      
      return {
        ...transaction,
        job: job ? {
          title: job.title,
          description: job.description,
          vehicle: job.vehicle,
          location: job.location,
          status: job.status
        } : undefined,
        mechanic: mechanic ? {
          firstName: mechanic.firstName,
          lastName: mechanic.lastName,
          username: mechanic.username
        } : undefined
      };
    });
  }

  async listTransactionsByMechanicId(mechanicId: number): Promise<Transaction[]> {
    const mechanicTransactions = [...this.transactions.values()].filter(transaction => transaction.mechanicId === mechanicId);
    
    // Enhance with related data
    return mechanicTransactions.map(transaction => {
      const job = this.jobs.get(transaction.jobId);
      const user = this.users.get(transaction.userId);
      
      return {
        ...transaction,
        job: job ? {
          title: job.title,
          description: job.description,
          vehicle: job.vehicle,
          location: job.location,
          status: job.status
        } : undefined,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username
        } : undefined
      };
    });
  }
}

// Database implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: UserInsert): Promise<User> {
    // Hash the password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    
    const userData = {
      ...user,
      password: hashedPassword
    };
    
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Mechanic profile methods
  async getMechanicProfile(id: number): Promise<MechanicProfile | undefined> {
    const [profile] = await db.select().from(mechanicProfiles).where(eq(mechanicProfiles.id, id));
    return profile || undefined;
  }

  async getMechanicProfileByUserId(userId: number): Promise<MechanicProfile | undefined> {
    const [profile] = await db.select().from(mechanicProfiles).where(eq(mechanicProfiles.userId, userId));
    return profile || undefined;
  }

  async createMechanicProfile(profile: MechanicProfileInsert): Promise<MechanicProfile> {
    const [newProfile] = await db.insert(mechanicProfiles).values(profile).returning();
    return newProfile;
  }

  async updateMechanicProfile(id: number, profileData: Partial<MechanicProfile>): Promise<MechanicProfile | undefined> {
    const [updatedProfile] = await db
      .update(mechanicProfiles)
      .set(profileData)
      .where(eq(mechanicProfiles.id, id))
      .returning();
    return updatedProfile || undefined;
  }

  async listMechanicProfiles(limit: number = 0): Promise<MechanicProfile[]> {
    const query = db.select().from(mechanicProfiles);
    
    if (limit > 0) {
      query.limit(limit);
    }
    
    return await query;
  }

  async verifyMechanicProfile(id: number): Promise<MechanicProfile | undefined> {
    const [verifiedProfile] = await db
      .update(mechanicProfiles)
      .set({ isVerified: true })
      .where(eq(mechanicProfiles.id, id))
      .returning();
    return verifiedProfile || undefined;
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(job: JobInsert): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set(jobData)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob || undefined;
  }

  async listJobs(limit: number = 0): Promise<Job[]> {
    const query = db.select().from(jobs);
    
    if (limit > 0) {
      query.limit(limit);
    }
    
    return await query;
  }

  async listJobsByUserId(userId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.userId, userId));
  }

  async listJobsByStatus(status: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.status, status));
  }

  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid || undefined;
  }

  async createBid(bid: BidInsert): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }

  async updateBid(id: number, bidData: Partial<Bid>): Promise<Bid | undefined> {
    const [updatedBid] = await db
      .update(bids)
      .set(bidData)
      .where(eq(bids.id, id))
      .returning();
    return updatedBid || undefined;
  }

  async listBidsByJobId(jobId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.jobId, jobId));
  }

  async listBidsByMechanicId(mechanicId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.mechanicId, mechanicId));
  }

  async acceptBid(id: number): Promise<Bid | undefined> {
    const bid = await this.getBid(id);
    if (!bid) return undefined;

    // Transaction to update both the bid and the job
    const [updatedBid] = await db.transaction(async (tx) => {
      // Update bid status
      const [bid] = await tx
        .update(bids)
        .set({ status: 'accepted' })
        .where(eq(bids.id, id))
        .returning();

      // Update job status and assigned mechanic
      await tx
        .update(jobs)
        .set({ 
          status: 'in_progress',
          assignedMechanicId: bid.mechanicId
        })
        .where(eq(jobs.id, bid.jobId));

      return [bid];
    });

    return updatedBid;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async createReview(review: ReviewInsert): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update mechanic's rating after review is added
    await this.updateMechanicRating(review.mechanicId);
    
    return newReview;
  }

  async listReviewsByMechanicId(mechanicId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.mechanicId, mechanicId));
  }

  async listReviewsByUserId(userId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  // Helper method to update mechanic rating
  private async updateMechanicRating(mechanicId: number): Promise<void> {
    const mechanicReviews = await this.listReviewsByMechanicId(mechanicId);
    
    if (mechanicReviews.length > 0) {
      const totalRating = mechanicReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = Math.round(totalRating / mechanicReviews.length);
      
      const profile = await this.getMechanicProfileByUserId(mechanicId);
      if (profile) {
        await db
          .update(mechanicProfiles)
          .set({ 
            rating: averageRating,
            reviewCount: mechanicReviews.length 
          })
          .where(eq(mechanicProfiles.id, profile.id));
      }
    }
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async createMessage(message: MessageInsert): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage || undefined;
  }

  async listMessagesByUserId(userId: number): Promise<Message[]> {
    // Get messages where user is either sender or receiver
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      );
  }

  async listMessagesByConversation(userId1: number, userId2: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId1),
            eq(messages.receiverId, userId2)
          ),
          and(
            eq(messages.senderId, userId2),
            eq(messages.receiverId, userId1)
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async listMessagesByJobId(jobId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.jobId, jobId))
      .orderBy(messages.createdAt);
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(transaction: TransactionInsert): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ ...transactionData, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }

  async listTransactionsByJobId(jobId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.jobId, jobId))
      .orderBy(transactions.createdAt);
  }

  async listTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt);
  }

  async listTransactionsByMechanicId(mechanicId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.mechanicId, mechanicId))
      .orderBy(transactions.createdAt);
  }
}

export const storage = new MemStorage();
