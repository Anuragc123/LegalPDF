import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("user_system_enum", ["system", "user"]);
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
});

export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userSystemEnum("role").notNull(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 256 })
    .notNull()
    .unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", {
    length: 256,
  }).unique(),
  stripePriceId: varchar("stripe_price_id", { length: 256 }),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_ended_at"),
});

export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  documentType: text("document_type").notNull(),
  documentName: text("document_name").notNull(),
  documentUrl: text("document_url").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
