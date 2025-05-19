import { pgTable, unique, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const questions = pgTable("questions", {
	id: serial().primaryKey().notNull(),
	questionId: text("question_id").notNull(),
	bookId: text("book_id").notNull(),
	chapterId: text("chapter_id").notNull(),
	questionText: text("question_text").notNull(),
	optionA: text("option_a").notNull(),
	optionB: text("option_b").notNull(),
	optionC: text("option_c").notNull(),
	optionD: text("option_d").notNull(),
	correctAnswer: text("correct_answer").notNull(),
	explanation: text(),
	difficulty: integer().notNull(),
	questionType: text("question_type").notNull(),
	setId: text("set_id"),
}, (table) => [
	unique("questions_question_id_unique").on(table.questionId),
]);

export const testResults = pgTable("test_results", {
	id: serial().primaryKey().notNull(),
	testId: text("test_id").notNull(),
	userId: integer("user_id").notNull(),
	score: integer().notNull(),
	totalQuestions: integer("total_questions").notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow(),
});

export const chapters = pgTable("chapters", {
	id: serial().primaryKey().notNull(),
	chapterId: text("chapter_id").notNull(),
	bookId: text("book_id").notNull(),
	title: text().notNull(),
	order: integer().notNull(),
	questionCount: integer("question_count").notNull(),
	description: text(),
}, (table) => [
	unique("chapters_chapter_id_unique").on(table.chapterId),
]);

export const tests = pgTable("tests", {
	id: serial().primaryKey().notNull(),
	testId: text("test_id").notNull(),
	creatorId: text("creator_id").notNull(),
	title: text().notNull(),
	description: text(),
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
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("tests_test_id_unique").on(table.testId),
]);

export const textbooks = pgTable("textbooks", {
	id: serial().primaryKey().notNull(),
	bookId: text("book_id").notNull(),
	title: text().notNull(),
	subject: text().notNull(),
	publisher: text().notNull(),
	chapterCount: integer("chapter_count").notNull(),
	questionCount: integer("question_count").notNull(),
}, (table) => [
	unique("textbooks_book_id_unique").on(table.bookId),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	nickname: text(),
	profileImage: text("profile_image"),
	affiliation: text(),
	role: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const chapterItems = pgTable("chapter_items", {
	id: serial().primaryKey().notNull(),
	itemId: text("item_id").notNull(),
	chapterId: text("chapter_id").notNull(),
	bookId: text("book_id").notNull(),
	title: text().notNull(),
	order: integer().notNull(),
	fullText: text("full_text"),
	pageReference: text("page_reference"),
	keyPoints: text("key_points"),
}, (table) => [
	unique("chapter_items_item_id_unique").on(table.itemId),
]);
