import { 
  users,
  textbooks,
  chapters,
  chapterItems,
  questions,
  tests,
  testResults,
  User, 
  InsertUser,
  Textbook,
  InsertTextbook,
  Chapter,
  InsertChapter,
  ChapterItem,
  InsertChapterItem,
  Question,
  InsertQuestion,
  Test,
  InsertTest,
  TestResult,
  InsertTestResult
} from "@shared/schema";
import { SubjectType } from "../client/src/types";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";

// Sample subject types 
const SUBJECT_TYPES: SubjectType[] = [
  "英語", "現代文", "古文", "漢文", "小論文", "日本史探求", "世界史探求", 
  "地理探求", "政治経済", "倫理公共", "情報", "数学", "化学", "物理", "生物", "地学"
];

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Textbook operations
  getTextbooks(): Promise<Textbook[]>;
  getTextbookById(id: string): Promise<Textbook | undefined>;
  getTextbooksBySubject(subject: string): Promise<Textbook[]>;
  createTextbook(textbook: InsertTextbook): Promise<Textbook>;
  
  // Chapter operations
  getChapters(): Promise<Chapter[]>;
  getChapterById(id: string): Promise<Chapter | undefined>;
  getChaptersByTextbook(textbookId: string): Promise<Chapter[]>;
  getChaptersByTextbooks(textbookIds: string[]): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  
  // Chapter Item operations
  getChapterItems(): Promise<ChapterItem[]>;
  getChapterItemById(id: string): Promise<ChapterItem | undefined>;
  getChapterItemsByChapter(chapterId: string): Promise<ChapterItem[]>;
  createChapterItem(item: InsertChapterItem): Promise<ChapterItem>;
  
  // Question operations
  getQuestions(): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;
  getQuestionsByChapter(chapterId: string): Promise<Question[]>;
  getQuestionsByChapters(chapterIds: string[]): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Test operations
  getTests(): Promise<Test[]>;
  getTestById(id: string): Promise<Test | undefined>;
  getTestsByUser(userId: string): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  
  // Test result operations
  getTestResults(): Promise<TestResult[]>;
  getTestResultById(id: number): Promise<TestResult | undefined>;
  getTestResultsByUser(userId: string): Promise<TestResult[]>;
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  
  // Subject operations
  getSubjects(): Promise<any[]>;
  getSubjectDashboard(subject: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Textbook operations
  async getTextbooks(): Promise<Textbook[]> {
    return await db.select().from(textbooks);
  }
  
  async getTextbookById(id: string): Promise<Textbook | undefined> {
    const [textbook] = await db.select().from(textbooks).where(eq(textbooks.bookId, id));
    return textbook || undefined;
  }
  
  async getTextbooksBySubject(subject: string): Promise<Textbook[]> {
    return await db.select().from(textbooks).where(eq(textbooks.subject, subject));
  }
  
  async createTextbook(insertTextbook: InsertTextbook): Promise<Textbook> {
    const [textbook] = await db
      .insert(textbooks)
      .values(insertTextbook)
      .returning();
    return textbook;
  }
  
  // Chapter operations
  async getChapters(): Promise<Chapter[]> {
    return await db.select().from(chapters);
  }
  
  async getChapterById(id: string): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.chapterId, id));
    return chapter || undefined;
  }
  
  async getChaptersByTextbook(textbookId: string): Promise<Chapter[]> {
    return await db.select().from(chapters).where(eq(chapters.bookId, textbookId));
  }
  
  async getChaptersByTextbooks(textbookIds: string[]): Promise<Chapter[]> {
    return await db.select().from(chapters).where(inArray(chapters.bookId, textbookIds));
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const [chapter] = await db
      .insert(chapters)
      .values(insertChapter)
      .returning();
    return chapter;
  }
  
  // Chapter Item operations
  async getChapterItems(): Promise<ChapterItem[]> {
    return await db.select().from(chapterItems).orderBy(chapterItems.order);
  }
  
  async getChapterItemById(id: string): Promise<ChapterItem | undefined> {
    const [item] = await db.select().from(chapterItems).where(eq(chapterItems.itemId, id));
    return item || undefined;
  }
  
  async getChapterItemsByChapter(chapterId: string): Promise<ChapterItem[]> {
    return await db
      .select()
      .from(chapterItems)
      .where(eq(chapterItems.chapterId, chapterId))
      .orderBy(chapterItems.order);
  }
  
  async createChapterItem(insertItem: InsertChapterItem): Promise<ChapterItem> {
    const [item] = await db
      .insert(chapterItems)
      .values(insertItem)
      .returning();
    return item;
  }
  
  // Question operations
  async getQuestions(): Promise<Question[]> {
    return await db.select().from(questions);
  }
  
  async getQuestionById(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.questionId, id));
    return question || undefined;
  }
  
  async getQuestionsByChapter(chapterId: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.chapterId, chapterId));
  }
  
  async getQuestionsByChapters(chapterIds: string[]): Promise<Question[]> {
    return await db.select().from(questions).where(inArray(questions.chapterId, chapterIds));
  }
  
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }
  
  // Test operations
  async getTests(): Promise<Test[]> {
    return await db.select().from(tests);
  }
  
  async getTestById(id: string): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.testId, id));
    return test || undefined;
  }
  
  async getTestsByUser(userId: string): Promise<Test[]> {
    return await db.select().from(tests).where(eq(tests.creatorId, userId));
  }
  
  async createTest(insertTest: InsertTest): Promise<Test> {
    const [test] = await db
      .insert(tests)
      .values(insertTest)
      .returning();
    return test;
  }
  
  // Test result operations
  async getTestResults(): Promise<TestResult[]> {
    return await db.select().from(testResults);
  }
  
  async getTestResultById(id: number): Promise<TestResult | undefined> {
    const [result] = await db.select().from(testResults).where(eq(testResults.id, id));
    return result || undefined;
  }
  
  async getTestResultsByUser(userId: string): Promise<TestResult[]> {
    return await db.select().from(testResults).where(
      eq(testResults.userId.toString(), userId)
    );
  }
  
  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const [result] = await db
      .insert(testResults)
      .values(insertTestResult)
      .returning();
    return result;
  }
  
  // Subject operations
  async getSubjects(): Promise<any[]> {
    // この例では、すべての科目タイプを返す
    return SUBJECT_TYPES.map(subject => ({
      id: subject,
      name: subject,
      // 他の科目関連の情報（アイコン、説明など）を追加可能
    }));
  }
  
  async getSubjectDashboard(subject: string): Promise<any> {
    // 指定された科目のダッシュボードデータを返す
    // 実際のアプリでは、科目に関連する情報（参考書、章、問題数など）を集約する
    const subjectTextbooks = await this.getTextbooksBySubject(subject);
    
    // テキストブックが見つからない場合
    if (subjectTextbooks.length === 0) {
      return null;
    }
    
    // 関連する章の取得
    const textbookIds = subjectTextbooks.map(book => book.bookId);
    const subjectChapters = await this.getChaptersByTextbooks(textbookIds);
    
    // 関連する問題の取得
    const chapterIds = subjectChapters.map(chapter => chapter.chapterId);
    const subjectQuestions = await this.getQuestionsByChapters(chapterIds);
    
    return {
      subject,
      textbooks: subjectTextbooks,
      chapters: subjectChapters,
      questions: subjectQuestions,
      
      // 統計情報
      stats: {
        textbookCount: subjectTextbooks.length,
        chapterCount: subjectChapters.length,
        questionCount: subjectQuestions.length,
      }
    };
  }
}

export const storage = new DatabaseStorage();