import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  createdAt: timestamp("created_at").defaultNow(),
});

export const userInsertSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type UserInsert = z.infer<typeof userInsertSchema>;
export type User = typeof users.$inferSelect;

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
});

export const mechanicProfileInsertSchema = createInsertSchema(mechanicProfiles).omit({
  id: true,
  isVerified: true,
  rating: true,
  reviewCount: true,
});

export type MechanicProfileInsert = z.infer<typeof mechanicProfileInsertSchema>;
export type MechanicProfile = typeof mechanicProfiles.$inferSelect;

// Job model
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  vehicle: text("vehicle").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, completed, canceled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  photos: text("photos").array(),
  preferredDate: timestamp("preferred_date"),
  budget: integer("budget"),
  assignedMechanicId: integer("assigned_mechanic_id").references(() => users.id),
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

// Message model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  jobId: integer("job_id").references(() => jobs.id),
});

export const messageInsertSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type MessageInsert = z.infer<typeof messageInsertSchema>;
export type Message = typeof messages.$inferSelect;
