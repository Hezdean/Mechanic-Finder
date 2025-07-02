import { 
  users, type User, type UserInsert,
  mechanicProfiles, type MechanicProfile, type MechanicProfileInsert,
  jobs, type Job, type JobInsert,
  bids, type Bid, type BidInsert,
  reviews, type Review, type ReviewInsert,
  messages, type Message, type MessageInsert,
  transactions, type Transaction, type TransactionInsert,
  verificationCodes, type VerificationCode, type VerificationCodeInsert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, count } from "drizzle-orm";
import bcrypt from "bcrypt";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  constructor() {
    // Initialize with seed data if needed
    this.initializeData();
  }

  private async initializeData() {
    try {
      console.log('Starting database initialization...');
      
      // Check if admin user exists
      const existingAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
      
      if (existingAdmin.length === 0) {
        // Create admin user
        const adminUser = await this.createUser({
          username: "admin",
          password: "adminpass",
          email: "admin@sameshit.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
        });
        console.log('Admin user created with ID:', adminUser.id);

        // Create initial data
        await this.seedMechanics();
        console.log('Mechanics seeded');
        
        await this.seedJobs();
        console.log('Jobs seeded');
      } else {
        console.log('Database already initialized');
      }
      
      console.log('Data initialization complete');
      
      // Add some test messages for demonstration
      await this.seedMessages();
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }

  private async seedMessages() {
    try {
      // Check if messages already exist
      const existingMessages = await db.select().from(messages).limit(1);
      if (existingMessages.length > 0) {
        console.log('Messages already exist, skipping seed');
        return;
      }

      console.log('Seeding test messages...');

      // Create test messages for different users (especially for mechanic user ID 2)
      const testMessages = [
        {
          senderId: 5,
          receiverId: 2,
          content: 'Hi Michael! I need help with my car brake issue. Are you available this week?',
          isRead: false,
        },
        {
          senderId: 1,
          receiverId: 2,
          content: 'Welcome to MechConnect! Your profile has been approved.',
          isRead: false,
        },
        {
          senderId: 3,
          receiverId: 2,
          content: 'Thanks for the great service on my last repair!',
          isRead: false,
        },
        {
          senderId: 4,
          receiverId: 2,
          content: 'Can you help me with a battery replacement? Its urgent.',
          isRead: false,
        },
        {
          senderId: 2,
          receiverId: 5,
          content: 'Yes, I can help with your brakes. What time works for you?',
          isRead: false,
        },
      ];

      for (const message of testMessages) {
        await db.insert(messages).values(message);
      }

      console.log('Test messages seeded successfully');
    } catch (error) {
      console.error('Error seeding messages:', error);
    }
  }

  // Seed some initial mechanics
  private async seedMechanics() {
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

    // Verify all mechanics and add ratings
    const profiles = await this.listMechanicProfiles();
    for (const profile of profiles) {
      await this.updateMechanicProfile(profile.id, { 
        isVerified: true,
        rating: 45 + Math.floor(Math.random() * 10), // 4.5-5.0 stars
        reviewCount: 80 + Math.floor(Math.random() * 100)
      });
    }
  }

  // Seed some initial jobs
  private async seedJobs() {
    // Check if car owner user exists
    const existingUser = await db.select().from(users).where(eq(users.username, "carowner")).limit(1);
    let user: User;
    
    if (existingUser.length === 0) {
      user = await this.createUser({
        username: "carowner",
        password: "password",
        email: "user@example.com",
        firstName: "Car",
        lastName: "Owner",
        role: "user",
        city: "Seattle",
        state: "WA",
      });
    } else {
      user = existingUser[0];
    }

    // Create some jobs
    const job1 = await this.createJob({
      userId: user.id,
      title: "Engine Misfire Diagnosis",
      description: "Check engine light is on, engine misfires when accelerating. Need diagnostic and repair. Prefer mobile mechanic who can come to my location.",
      vehicle: "2015 Honda Accord, 78K miles",
      location: "Seattle, WA",
      budget: 200,
    });

    const job2 = await this.createJob({
      userId: user.id,
      title: "Brake Pad Replacement",
      description: "Front brakes are squeaking and performance is declining. Need to replace front brake pads and possibly rotors. I can bring the car to you or you can come to me.",
      vehicle: "2018 Toyota Camry, 45K miles",
      location: "Phoenix, AZ",
      budget: 250,
    });

    const job3 = await this.createJob({
      userId: user.id,
      title: "Alternator Replacement",
      description: "Battery warning light is on. Local shop diagnosed it as a failing alternator. Need alternator replacement. Parts will be provided. Looking for installation only.",
      vehicle: "2014 Ford F-150, 110K miles",
      location: "Dallas, TX",
      budget: 300,
    });

    // Set the third job to in_progress with assigned mechanic
    await this.updateJob(job3.id, { status: "in_progress", assignedMechanicId: 1 });
    
    // Add some bids to the jobs
    const mechanics = await this.listMechanicProfiles();
    for (const job of [job1, job2, job3]) {
      // Add 3-8 bids per job
      const bidCount = 3 + Math.floor(Math.random() * 6);
      for (let i = 0; i < bidCount; i++) {
        const mechanic = mechanics[i % mechanics.length];
        await this.createBid({
          jobId: job.id,
          mechanicId: mechanic.userId,
          amount: 150 + Math.floor(Math.random() * 200),
          description: `I can fix this issue efficiently. I have ${mechanic.yearsOfExperience} years of experience with this type of repair.`,
          estimatedTime: `${2 + Math.floor(Math.random() * 4)} hours`,
        });
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: UserInsert): Promise<User> {
    // Hash the password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    
    const result = await db.insert(users).values({
      ...user,
      password: hashedPassword,
      role: user.role || "user",
      emailVerified: false,
      phoneVerified: false,
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Mechanic profile methods
  async getMechanicProfile(id: number): Promise<MechanicProfile | undefined> {
    const result = await db.select().from(mechanicProfiles).where(eq(mechanicProfiles.id, id)).limit(1);
    return result[0];
  }

  async getMechanicProfileByUserId(userId: number): Promise<MechanicProfile | undefined> {
    const result = await db.select().from(mechanicProfiles).where(eq(mechanicProfiles.userId, userId)).limit(1);
    return result[0];
  }

  async createMechanicProfile(profile: MechanicProfileInsert): Promise<MechanicProfile> {
    const result = await db.insert(mechanicProfiles).values({
      ...profile,
      isVerified: false,
      rating: 0,
      reviewCount: 0,
    }).returning();
    
    return result[0];
  }

  async updateMechanicProfile(id: number, profile: Partial<MechanicProfile>): Promise<MechanicProfile | undefined> {
    const result = await db.update(mechanicProfiles).set(profile).where(eq(mechanicProfiles.id, id)).returning();
    return result[0];
  }

  async listMechanicProfiles(limit?: number): Promise<MechanicProfile[]> {
    let query = db.select().from(mechanicProfiles);
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }

  async verifyMechanicProfile(id: number): Promise<MechanicProfile | undefined> {
    return await this.updateMechanicProfile(id, { isVerified: true });
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async createJob(job: JobInsert): Promise<Job> {
    const result = await db.insert(jobs).values({
      ...job,
      status: "open",
      photos: job.photos || [],
    }).returning();
    
    return result[0];
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const result = await db.update(jobs).set({
      ...jobData,
      updatedAt: new Date(),
    }).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async listJobs(limit?: number): Promise<Job[]> {
    let query = db.select().from(jobs).orderBy(desc(jobs.createdAt));
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }

  async listJobsByUserId(userId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
  }

  async listJobsByStatus(status: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.status, status)).orderBy(desc(jobs.createdAt));
  }

  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    const result = await db.select().from(bids).where(eq(bids.id, id)).limit(1);
    return result[0];
  }

  async createBid(bid: BidInsert): Promise<Bid> {
    const result = await db.insert(bids).values({
      ...bid,
      status: "pending",
    }).returning();
    
    return result[0];
  }

  async updateBid(id: number, bidData: Partial<Bid>): Promise<Bid | undefined> {
    const result = await db.update(bids).set(bidData).where(eq(bids.id, id)).returning();
    return result[0];
  }

  async listBidsByJobId(jobId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.jobId, jobId)).orderBy(bids.amount);
  }

  async listBidsByMechanicId(mechanicId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.mechanicId, mechanicId)).orderBy(desc(bids.createdAt));
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
    const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return result[0];
  }

  async createReview(review: ReviewInsert): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    
    // Update mechanic's rating
    const mechanicProfile = await this.getMechanicProfileByUserId(review.mechanicId);
    if (mechanicProfile) {
      const allReviews = await this.listReviewsByMechanicId(review.mechanicId);
      const total = allReviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
      const reviewCount = allReviews.length + 1;
      const avgRating = Math.round((total / reviewCount) * 10); // Store as 1-50 (1-5 stars with decimal)
      
      await this.updateMechanicProfile(mechanicProfile.id, {
        rating: avgRating,
        reviewCount: reviewCount
      });
    }
    
    return result[0];
  }

  async listReviewsByMechanicId(mechanicId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.mechanicId, mechanicId)).orderBy(desc(reviews.createdAt));
  }

  async listReviewsByUserId(userId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return result[0];
  }

  async createMessage(message: MessageInsert): Promise<Message> {
    const result = await db.insert(messages).values({
      ...message,
      isRead: false,
    }).returning();
    
    return result[0];
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const result = await db.update(messages).set({ isRead: true }).where(eq(messages.id, id)).returning();
    return result[0];
  }

  async listMessagesByUserId(userId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async listMessagesByConversation(userId1: number, userId2: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async listMessagesByJobId(jobId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.jobId, jobId)).orderBy(messages.createdAt);
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }

  async createTransaction(transaction: TransactionInsert): Promise<Transaction> {
    const result = await db.insert(transactions).values({
      ...transaction,
      status: "pending",
    }).returning();
    
    return result[0];
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const result = await db.update(transactions).set({
      ...transactionData,
      updatedAt: new Date(),
    }).where(eq(transactions.id, id)).returning();
    return result[0];
  }

  async listTransactionsByJobId(jobId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.jobId, jobId)).orderBy(desc(transactions.createdAt));
  }

  async listTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async listTransactionsByMechanicId(mechanicId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.mechanicId, mechanicId)).orderBy(desc(transactions.createdAt));
  }

  // Verification code methods
  async getVerificationCode(id: number): Promise<VerificationCode | undefined> {
    const result = await db.select().from(verificationCodes).where(eq(verificationCodes.id, id)).limit(1);
    return result[0];
  }

  async createVerificationCode(code: VerificationCodeInsert): Promise<VerificationCode> {
    const result = await db.insert(verificationCodes).values(code).returning();
    return result[0];
  }

  async getVerificationCodeByToken(token: string): Promise<VerificationCode | undefined> {
    const result = await db.select().from(verificationCodes).where(eq(verificationCodes.token, token)).limit(1);
    return result[0];
  }

  async updateVerificationCode(id: number, code: Partial<VerificationCode>): Promise<VerificationCode | undefined> {
    const result = await db.update(verificationCodes).set(code).where(eq(verificationCodes.id, id)).returning();
    return result[0];
  }

  async deleteVerificationCode(id: number): Promise<void> {
    await db.delete(verificationCodes).where(eq(verificationCodes.id, id));
  }

  // Placeholder methods for unimplemented interfaces
  async createInventoryItem(): Promise<any> { throw new Error("Not implemented"); }
  async listInventoryByMechanicId(): Promise<any[]> { return []; }
  async updateInventoryItem(): Promise<any> { throw new Error("Not implemented"); }
  async createBooking(): Promise<any> { throw new Error("Not implemented"); }
  async listBookingsByUserId(): Promise<any[]> { return []; }
  async listBookingsByMechanicId(): Promise<any[]> { return []; }
  async updateBooking(): Promise<any> { throw new Error("Not implemented"); }
  async getMechanicAnalytics(): Promise<any[]> { return []; }
  async updateMechanicAnalytics(): Promise<void> { }
}