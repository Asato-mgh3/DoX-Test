// Subject type
export type SubjectType = 
  | "英語" 
  | "現代文" 
  | "古文" 
  | "漢文" 
  | "小論文" 
  | "日本史探求" 
  | "世界史探求" 
  | "地理探求" 
  | "政治経済" 
  | "倫理公共" 
  | "情報" 
  | "数学" 
  | "化学" 
  | "物理" 
  | "生物" 
  | "地学";

// User type
export interface User {
  id: number;
  username: string;
  nickname?: string;
  profileImage?: string;
  affiliation?: string;
  role?: string;
  createdAt: Date;
}

// Textbook type
export interface Textbook {
  id: number;
  bookId: string;
  title: string;
  subject: SubjectType;
  publisher: string;
  chapterCount: number;
  questionCount: number;
}

// Chapter type
export interface Chapter {
  id: number;
  chapterId: string;
  bookId: string;
  title: string;
  order: number;
  questionCount: number;
}

// Question type
export interface Question {
  id: number;
  questionId: string;
  bookId: string;
  chapterId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  difficulty: number;
  questionType: string;
}

// Test type
export interface Test {
  id: number;
  testId: string;
  creatorId: string;
  title: string;
  description?: string;
  bookIds: string[];
  chapterIds: string[];
  questionIds: string[];
  studentNameField: boolean;
  classField: boolean;
  dateField: boolean;
  scoreField: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showAnswers: boolean;
  createdAt: Date;
}

// Test Result type
export interface TestResult {
  id: number;
  testId: string;
  userId: number;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

// Subject Dashboard Data
export interface SubjectDashboardData {
  subject: SubjectType;
  textbooks: {
    id: number;
    title: string;
    publisher: string;
    progress: number;
  }[];
  recentTests: {
    id: number;
    title: string;
    date: string;
    score: number;
    totalQuestions: number;
  }[];
  recommendedTests: {
    id: number;
    title: string;
    difficulty: number;
    questionCount: number;
  }[];
}

// Test Download Options
export interface TestDownloadOptions {
  format: "docx" | "pdf";
  testSettings: Partial<Test>;
  questions: Question[];
}

// Subject Data for Home Page
export interface SubjectData {
  subject: SubjectType;
  progress: number;
  testsCount: number;
  materialCount: number;
}
