import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nickname: text("nickname"),
  profileImage: text("profile_image"),
  affiliation: text("affiliation"),
  role: text("role"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const textbooks = pgTable("textbooks", {
  id: serial("id").primaryKey(),
  bookId: text("book_id").notNull().unique(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  publisher: text("publisher").notNull(),
  chapterCount: integer("chapter_count").notNull(),
  questionCount: integer("question_count").notNull(),
});

export const insertTextbookSchema = createInsertSchema(textbooks).omit({
  id: true,
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  chapterId: text("chapter_id").notNull().unique(),
  bookId: text("book_id").notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  questionCount: integer("question_count").notNull(),
  description: text("description"),
});

export const chapterItems = pgTable("chapter_items", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull().unique(),
  chapterId: text("chapter_id").notNull(),
  bookId: text("book_id").notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  keyPoints: text("key_points"),
  fullText: text("full_text"),
  pageReference: text("page_reference"),
});

export const insertChapterItemSchema = createInsertSchema(chapterItems).omit({
  id: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionId: text("question_id").notNull().unique(),
  bookId: text("book_id").notNull(),
  chapterId: text("chapter_id").notNull(),
  setId: text("set_id"), // セットID（問題グループ）を格納するフィールド
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: integer("difficulty").notNull(),
  questionType: text("question_type").notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  testId: text("test_id").notNull().unique(),
  creatorId: text("creator_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  bookIds: text("book_ids").array().notNull(),
  chapterIds: text("chapter_ids").array().notNull(),
  questionIds: text("question_ids").array().notNull(),
  studentNameField: boolean("student_name_field").default(true),
  classField: boolean("class_field").default(true),
  dateField: boolean("date_field").default(true),
  scoreField: boolean("score_field").default(true),
  shuffleQuestions: boolean("shuffle_questions").default(false),
  shuffleOptions: boolean("shuffle_options").default(false),
  showAnswers: boolean("show_answers").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
  createdAt: true,
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  testId: text("test_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  completedAt: true,
});

// フィードバックテーブルの追加
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  bookId: text("book_id"),
  chapterId: text("chapter_id"),
  questionId: text("question_id"),
  feedbackType: text("feedback_type").notNull(),
  feedbackCategories: text("feedback_categories").array(),
  feedbackContent: text("feedback_content"),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("未対応"),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Textbook = typeof textbooks.$inferSelect;
export type InsertTextbook = z.infer<typeof insertTextbookSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type ChapterItem = typeof chapterItems.$inferSelect;
export type InsertChapterItem = z.infer<typeof insertChapterItemSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
