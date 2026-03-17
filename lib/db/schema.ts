import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  timestamp,
  date,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);

export const entrySourceEnum = pgEnum("entry_source", [
  "ai_voice",
  "ai_text",
  "manual",
  "search",
]);

export const confidenceEnum = pgEnum("confidence", ["high", "medium", "low"]);

export const activityLevelEnum = pgEnum("activity_level", [
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
  "extra_active",
]);

export const sexEnum = pgEnum("sex", ["male", "female", "other"]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const mealEntries = pgTable("meal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(), // YYYY-MM-DD
  name: text("name").notNull(),
  mealType: mealTypeEnum("meal_type").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  source: entrySourceEnum("source").notNull().default("manual"),
  confidence: confidenceEnum("confidence"),
  notes: text("notes"),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const userProfile = pgTable("user_profile", {
  userId: uuid("user_id").primaryKey(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  weightKg: real("weight_kg"),
  heightCm: real("height_cm"),
  ageYears: integer("age_years"),
  sex: sexEnum("sex"),
  activityLevel: activityLevelEnum("activity_level"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const userMeta = pgTable("user_meta", {
  userId: uuid("user_id").primaryKey(),
  onboardingSeen: boolean("onboarding_seen").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();
