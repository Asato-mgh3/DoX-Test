import { Textbook, Chapter, Question, Test, SubjectType } from "@/types/index";

/**
 * Get the appropriate color class for a subject
 */
export const getSubjectColor = (subject: SubjectType): string => {
  if (subject === "英語") return "english";
  if (["現代文", "古文", "漢文", "小論文"].includes(subject)) return "japanese";
  if (subject === "数学") return "math";
  if (["化学", "物理", "生物", "地学"].includes(subject)) return "science";
  return "social"; // Default for social studies subjects
};

/**
 * Format date to Japanese style (YYYY年MM月DD日)
 */
export const formatJapaneseDate = (date: Date): string => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

/**
 * Calculate the percentage score for a test result
 */
export const calculatePercentageScore = (score: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Shuffle an array (for test questions or options)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Filter textbooks by subject
 */
export const filterTextbooksBySubject = (textbooks: Textbook[], subject: string): Textbook[] => {
  if (subject === "すべて") return textbooks;
  return textbooks.filter(textbook => textbook.subject === subject);
};

/**
 * Filter questions by difficulty
 */
export const filterQuestionsByDifficulty = (questions: Question[], difficulty: number | null): Question[] => {
  if (difficulty === null) return questions;
  return questions.filter(question => question.difficulty === difficulty);
};

/**
 * Get questions for selected chapters
 */
export const getQuestionsForChapters = (
  questions: Question[], 
  selectedChapterIds: string[]
): Question[] => {
  return questions.filter(question => 
    selectedChapterIds.includes(question.chapterId)
  );
};

/**
 * Auto-select questions based on criteria
 */
export const autoSelectQuestions = (
  questions: Question[],
  count: number,
  maxDifficulty: number,
  random: boolean
): Question[] => {
  // Filter by difficulty
  let filtered = questions.filter(q => q.difficulty <= maxDifficulty);
  
  // Sort by difficulty or randomly
  if (random) {
    filtered = shuffleArray(filtered);
  } else {
    filtered = filtered.sort((a, b) => a.difficulty - b.difficulty);
  }
  
  // Take requested count (or all if not enough)
  return filtered.slice(0, Math.min(count, filtered.length));
};

/**
 * Generate a unique test ID
 */
export const generateTestId = (): string => {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Validate test settings before saving or exporting
 */
export const validateTestSettings = (test: Partial<Test>): { valid: boolean, message?: string } => {
  if (!test.title || test.title.trim() === "") {
    return { valid: false, message: "テスト名を入力してください" };
  }
  
  return { valid: true };
};

/**
 * Format test document for preview
 */
export const formatTestPreview = (
  questions: Question[],
  testSettings: Partial<Test>,
  textbooks: Textbook[],
  chapters: Chapter[]
): {
  title: string;
  description?: string;
  textbookNames: string;
  chapterNames: string;
  questionCount: number;
  questions: Question[];
} => {
  return {
    title: testSettings.title || "無題のテスト",
    description: testSettings.description,
    textbookNames: textbooks.map(t => t.title).join(", "),
    chapterNames: chapters.map(c => c.title).join(", "),
    questionCount: questions.length,
    questions: testSettings.shuffleQuestions ? shuffleArray(questions) : questions
  };
};
