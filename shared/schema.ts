import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"), // user, mechanic, admin
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userInsertSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type UserInsert = z.infer<typeof userInsertSchema>;
export type User = typeof users.$inferSelect;

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  mechanicProfile: one(mechanicProfiles, {
    fields: [users.id],
    references: [mechanicProfiles.userId],
  }),
  jobs: many(jobs),
  bidsAsMechanic: many(bids, {
    relationName: "mechanicBids",
  }),
  reviewsAsUser: many(reviews, {
    relationName: "userReviews",
  }),
  reviewsAsMechanic: many(reviews, {
    relationName: "mechanicReviews",
  }),
  sentMessages: many(messages, {
    relationName: "senderMessages",
  }),
  receivedMessages: many(messages, {
    relationName: "receiverMessages",
  }),
}));

// Mechanic profile model
export const mechanicProfiles = pgTable("mechanic_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specializations: text("specializations").array(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  certifications: text("certifications").array(),
  isVerified: boolean("is_verified").default(false),
  hourlyRate: integer("hourly_rate"),
  isMobile: boolean("is_mobile").default(false),
  servicesOffered: text("services_offered").array(),
  verificationDocuments: text("verification_documents").array(),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  isAvailable: boolean("is_available").default(true),
  availabilitySchedule: text("availability_schedule"),
});

export const mechanicProfileInsertSchema = createInsertSchema(mechanicProfiles).omit({
  id: true,
  isVerified: true,
  rating: true,
  reviewCount: true,
});

export type MechanicProfileInsert = z.infer<typeof mechanicProfileInsertSchema>;
export type MechanicProfile = typeof mechanicProfiles.$inferSelect;

// Mechanic profile relations
export const mechanicProfilesRelations = relations(mechanicProfiles, ({ one }) => ({
  user: one(users, {
    fields: [mechanicProfiles.userId],
    references: [users.id],
  }),
}));

// Job model
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  vehicle: text("vehicle").notNull(),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  status: text("status").notNull().default("open"), // open, in_progress, completed, canceled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  photos: text("photos").array(),
  audioFiles: text("audio_files").array(),
  preferredDate: timestamp("preferred_date"),
  budget: integer("budget"),
  assignedMechanicId: integer("assigned_mechanic_id").references(() => users.id),
  isEmergency: boolean("is_emergency").default(false),
  urgencyLevel: text("urgency_level").default("medium"), // low, medium, high, emergency
  aiDiagnostics: text("ai_diagnostics"),
});

export const jobInsertSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  assignedMechanicId: true,
});

export type JobInsert = z.infer<typeof jobInsertSchema>;
export type Job = typeof jobs.$inferSelect;

// Job relations
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
  assignedMechanic: one(users, {
    fields: [jobs.assignedMechanicId],
    references: [users.id],
    relationName: "assignedJobs",
  }),
  bids: many(bids),
  reviews: many(reviews),
  messages: many(messages),
}));

// Bid model
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  mechanicId: integer("mechanic_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  estimatedTime: text("estimated_time"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const bidInsertSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type BidInsert = z.infer<typeof bidInsertSchema>;
export type Bid = typeof bids.$inferSelect;

// Bid relations
export const bidsRelations = relations(bids, ({ one }) => ({
  job: one(jobs, {
    fields: [bids.jobId],
    references: [jobs.id],
  }),
  mechanic: one(users, {
    fields: [bids.mechanicId],
    references: [users.id],
    relationName: "mechanicBids",
  }),
}));

// Review model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  mechanicId: integer("mechanic_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewInsertSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type ReviewInsert = z.infer<typeof reviewInsertSchema>;
export type Review = typeof reviews.$inferSelect;

// Review relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  job: one(jobs, {
    fields: [reviews.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
    relationName: "userReviews",
  }),
  mechanic: one(users, {
    fields: [reviews.mechanicId],
    references: [users.id],
    relationName: "mechanicReviews",
  }),
}));

// Message model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  jobId: integer("job_id").references(() => jobs.id),
  isEmergencyAlert: boolean("is_emergency_alert").default(false),
});

export const messageInsertSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type MessageInsert = z.infer<typeof messageInsertSchema>;
export type Message = typeof messages.$inferSelect;

// Message relations
export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "senderMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiverMessages",
  }),
  job: one(jobs, {
    fields: [messages.jobId],
    references: [jobs.id],
  }),
}));

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  mechanicId: integer("mechanic_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // Amount in cents
  paymentMethod: text("payment_method").notNull(), // cash, mobile_money, bank_transfer, etc.
  status: text("status").notNull().default("pending"), // pending, completed, failed
  transactionReference: text("transaction_reference"), // For tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactionInsertSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  mechanicId: true,
  status: true,
});

export type TransactionInsert = z.infer<typeof transactionInsertSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Transaction relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  job: one(jobs, {
    fields: [transactions.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
    relationName: "userTransactions",
  }),
  mechanic: one(users, {
    fields: [transactions.mechanicId],
    references: [users.id],
    relationName: "mechanicTransactions",
  }),
}));

// Verification codes table for email and phone verification
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  type: text("type").notNull(), // 'email' or 'phone'
  purpose: text("purpose").notNull(), // 'verification', 'password_reset', etc.
  email: text("email"),
  phone: text("phone"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationCodeInsertSchema = createInsertSchema(verificationCodes).omit({
  id: true,
  createdAt: true,
});

export type VerificationCodeInsert = z.infer<typeof verificationCodeInsertSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;

export const verificationCodesRelations = relations(verificationCodes, ({ one }) => ({
  user: one(users, { fields: [verificationCodes.userId], references: [users.id] }),
}));

// New tables for enhanced features

// Service History for digital logbook
export const serviceHistory = pgTable("service_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  mechanicId: integer("mechanic_id").references(() => users.id).notNull(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  partsUsed: text("parts_used").array(),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  invoiceUrl: text("invoice_url"),
  warrantyExpiry: timestamp("warranty_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceHistoryRelations = relations(serviceHistory, ({ one }) => ({
  user: one(users, { fields: [serviceHistory.userId], references: [users.id] }),
  mechanic: one(users, { fields: [serviceHistory.mechanicId], references: [users.id] }),
  job: one(jobs, { fields: [serviceHistory.jobId], references: [jobs.id] }),
}));

// Inventory management for mechanics
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  mechanicId: integer("mechanic_id").references(() => users.id).notNull(),
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  quantity: integer("quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  supplier: text("supplier"),
  lastRestocked: timestamp("last_restocked"),
  minimumStock: integer("minimum_stock").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventoryRelations = relations(inventory, ({ one }) => ({
  mechanic: one(users, { fields: [inventory.mechanicId], references: [users.id] }),
}));

// Booking system for instant scheduling
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  mechanicId: integer("mechanic_id").references(() => users.id).notNull(),
  jobId: integer("job_id").references(() => jobs.id),
  scheduledDateTime: timestamp("scheduled_date_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default("scheduled"), // scheduled, confirmed, in_progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  mechanic: one(users, { fields: [bookings.mechanicId], references: [users.id] }),
  job: one(jobs, { fields: [bookings.jobId], references: [jobs.id] }),
}));

// Analytics for mechanic performance tracking
export const mechanicAnalytics = pgTable("mechanic_analytics", {
  id: serial("id").primaryKey(),
  mechanicId: integer("mechanic_id").references(() => users.id).notNull(),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0"),
  jobsCompleted: integer("jobs_completed").default(0),
  repeatCustomers: integer("repeat_customers").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mechanicAnalyticsRelations = relations(mechanicAnalytics, ({ one }) => ({
  mechanic: one(users, { fields: [mechanicAnalytics.mechanicId], references: [users.id] }),
}));

// Insert schemas for new tables
export const serviceHistoryInsertSchema = createInsertSchema(serviceHistory).omit({
  id: true,
  createdAt: true,
});
export type ServiceHistoryInsert = z.infer<typeof serviceHistoryInsertSchema>;
export type ServiceHistory = typeof serviceHistory.$inferSelect;

export const inventoryInsertSchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InventoryInsert = z.infer<typeof inventoryInsertSchema>;
export type Inventory = typeof inventory.$inferSelect;

export const bookingInsertSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type BookingInsert = z.infer<typeof bookingInsertSchema>;
export type Booking = typeof bookings.$inferSelect;

export const mechanicAnalyticsInsertSchema = createInsertSchema(mechanicAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type MechanicAnalyticsInsert = z.infer<typeof mechanicAnalyticsInsertSchema>;
export type MechanicAnalytics = typeof mechanicAnalytics.$inferSelect;
