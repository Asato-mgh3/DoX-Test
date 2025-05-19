-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"book_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"question_text" text NOT NULL,
	"option_a" text NOT NULL,
	"option_b" text NOT NULL,
	"option_c" text NOT NULL,
	"option_d" text NOT NULL,
	"correct_answer" text NOT NULL,
	"explanation" text,
	"difficulty" integer NOT NULL,
	"question_type" text NOT NULL,
	"set_id" text,
	CONSTRAINT "questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" text NOT NULL,
	"book_id" text NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"question_count" integer NOT NULL,
	"description" text,
	CONSTRAINT "chapters_chapter_id_unique" UNIQUE("chapter_id")
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"book_ids" text[] NOT NULL,
	"chapter_ids" text[] NOT NULL,
	"question_ids" text[] NOT NULL,
	"student_name_field" boolean DEFAULT true,
	"class_field" boolean DEFAULT true,
	"date_field" boolean DEFAULT true,
	"score_field" boolean DEFAULT true,
	"shuffle_questions" boolean DEFAULT false,
	"shuffle_options" boolean DEFAULT false,
	"show_answers" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tests_test_id_unique" UNIQUE("test_id")
);
--> statement-breakpoint
CREATE TABLE "textbooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" text NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"publisher" text NOT NULL,
	"chapter_count" integer NOT NULL,
	"question_count" integer NOT NULL,
	CONSTRAINT "textbooks_book_id_unique" UNIQUE("book_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"nickname" text,
	"profile_image" text,
	"affiliation" text,
	"role" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "chapter_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"book_id" text NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"full_text" text,
	"page_reference" text,
	"key_points" text,
	CONSTRAINT "chapter_items_item_id_unique" UNIQUE("item_id")
);

*/