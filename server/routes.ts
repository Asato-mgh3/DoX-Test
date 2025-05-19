import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { insertTextbookSchema, insertChapterSchema, insertQuestionSchema, insertTestSchema, chapterItems } from "@shared/schema";
import { createWriteStream } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { importTextbooksFromCSV, importQuestionsFromCSV } from "./admin";
import { importChapterItemsFromCSV } from "./admin/import-chapter-items-handler";
import { importUnifiedCSV } from "./admin/unified-csv-import";
import multer from "multer";
import { WebSocketServer } from "ws";
import { storage as dataStorage } from "./storage";
import { db } from "./db";
import { textbooks, chapters, questions, feedback } from "@shared/schema";
import { eq, like, or, and, sql } from "drizzle-orm";
import csvParser from "csv-parser";

// Ensure upload directory exists
import fs from "fs";
import { mkdir } from "fs/promises";

// CSVアップロード用の設定
const uploadDir = "/tmp/uploads";

// アプリケーションレベルのキャッシュ
const cache = {
  textbooks: new Map<string, any[]>(),
  chapters: new Map<string, any[]>(),
};

// ディレクトリが存在しない場合は作成
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  }
} catch (err) {
  console.error(`Error creating upload directory: ${err}`);
}

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".csv");
  },
});

const upload = multer({ storage: multerStorage });

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Get subjects data
  app.get("/api/subjects", async (req, res) => {
    const subjects = await dataStorage.getSubjects();
    res.json(subjects);
  });

  // Get subject dashboard data for a specific subject
  app.get("/api/subjects/:subject", async (req, res) => {
    const { subject } = req.params;
    const dashboardData = await dataStorage.getSubjectDashboard(subject);
    
    if (!dashboardData) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    res.json(dashboardData);
  });

  // Get textbooks - 科目フィルターに対応・パフォーマンス最適化版
  app.get("/api/textbooks", async (req, res) => {
    try {
      const { subject } = req.query;
      
      // 科目指定があればフィルターする
      if (subject) {
        const subjectStr = String(subject);
        const cacheKey = `subject_${subjectStr}`;
        
        // キャッシュがあればそれを返す
        if (cache.textbooks.has(cacheKey)) {
          console.log(`科目「${subjectStr}」の参考書をキャッシュから取得`);
          return res.json(cache.textbooks.get(cacheKey));
        }
        
        console.log(`科目「${subjectStr}」の参考書を取得します`);
        
        // データベースから取得
        const filteredTextbooks = await dataStorage.getTextbooksBySubject(subjectStr);
        
        // キャッシュに保存
        cache.textbooks.set(cacheKey, filteredTextbooks);
        
        console.log(`科目「${subjectStr}」の参考書: ${filteredTextbooks.length}件`);
        return res.json(filteredTextbooks);
      }
      
      // 科目指定がなければすべての参考書を取得
      const allTextbooks = await dataStorage.getTextbooks();
      res.json(allTextbooks);
    } catch (error) {
      console.error("Error fetching textbooks:", error);
      res.status(500).json({ error: "教科書データの取得に失敗しました" });
    }
  });

  // Get chapters for selected textbooks - キャッシュ最適化版
  app.get("/api/chapters", async (req, res) => {
    try {
      // パラメータを取得
      const textbookIds = req.query.textbookIds ? 
        String(req.query.textbookIds).split(",") : 
        [];
        
      // 特定の教科書の章を取得する場合
      if (textbookIds.length === 1) {
        const bookId = textbookIds[0];
        const cacheKey = `book_${bookId}`;
        
        // キャッシュがあればそれを返す
        if (cache.chapters.has(cacheKey)) {
          console.log(`参考書ID: ${bookId} の章をキャッシュから取得`);
          return res.json(cache.chapters.get(cacheKey));
        }
        
        console.log(`参考書ID: ${bookId} の章を取得します`);
        const startTime = performance.now();
        
        // データベースから章を取得
        const chapters = await dataStorage.getChaptersByTextbook(bookId);
        
        // キャッシュに保存
        cache.chapters.set(cacheKey, chapters);
        
        console.log(`参考書の章を取得完了: ${chapters.length}件`,
                   `(${Math.round(performance.now() - startTime)}ms)`);
        return res.json(chapters);
      }
      
      // 複数の参考書の章を取得する場合
      const chapters = await dataStorage.getChaptersByTextbooks(textbookIds);
      res.json(chapters);
    } catch (error) {
      console.error("章データの取得に失敗:", error);
      res.status(500).json({ error: "章データの取得に失敗しました" });
    }
  });

  // Get questions for selected chapters and optionally filter by setId
  app.get("/api/questions", async (req, res) => {
    try {
      const { chapterIds, setId } = req.query;
      
      // パラメータがない場合は全ての問題を返す
      if (!chapterIds) {
        const allQuestions = await dataStorage.getQuestions();
        return res.json(allQuestions);
      }
      
      const chapIds = String(chapterIds).split(",");
      let questions = await dataStorage.getQuestionsByChapters(chapIds);
      
      // セットIDによるフィルタリング
      if (setId) {
        const setIdStr = String(setId);
        console.log(`セットID ${setIdStr} でフィルタリングします`);
        questions = questions.filter(q => q.setId === setIdStr);
        console.log(`フィルタリング後の問題数: ${questions.length}件`);
      }
      
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "問題データの取得に失敗しました" });
    }
  });
  
  // テスト問題セットを取得する専用API
  app.get("/api/test-questions", async (req, res) => {
    try {
      const { bookId, chapterId, setId } = req.query;
      
      if (!bookId || !chapterId) {
        return res.status(400).json({ error: "bookId と chapterId は必須パラメータです" });
      }
      
      // パラメータを文字列に変換
      const bookIdStr = String(bookId);
      const chapterIdStr = String(chapterId);
      
      // セットIDのログ記録
      if (setId) {
        console.log(`テスト用セットID ${setId} でフィルタリングします`);
      }
      
      try {
        // 章に関連する問題を取得
        const allQuestions = await dataStorage.getQuestionsByChapter(chapterIdStr);
        
        // 問題がない場合のエラーハンドリング
        if (!allQuestions || allQuestions.length === 0) {
          console.warn(`問題が見つかりません: bookId=${bookIdStr}, chapterId=${chapterIdStr}`);
          return res.status(404).json({ 
            error: "この章には問題が存在しません。別の章を選択してください。" 
          });
        }
        
        // セットIDが指定されている場合はフィルタリング
        let filteredQuestions = allQuestions;
        if (setId) {
          const setIdStr = String(setId);
          filteredQuestions = allQuestions.filter(q => q.setId === setIdStr);
          console.log(`フィルタリング後の問題数: ${filteredQuestions.length}件`);
        } else {
          // セットIDが指定されていない場合は、ランダムなセットを選択
          const uniqueSetIds = [...new Set(allQuestions
            .filter(q => q.setId)
            .map(q => q.setId))];
            
          if (uniqueSetIds.length > 0) {
            const randomSetId = uniqueSetIds[Math.floor(Math.random() * uniqueSetIds.length)];
            console.log(`ランダムに選択されたセットID: ${randomSetId}`);
            filteredQuestions = allQuestions.filter(q => q.setId === randomSetId);
          }
        }
        
        // 問題が存在しない場合のエラーハンドリング
        if (!filteredQuestions || filteredQuestions.length === 0) {
          console.warn(`問題が見つかりません: bookId=${bookIdStr}, chapterId=${chapterIdStr}, setId=${setId || 'なし'}`);
          return res.status(404).json({ 
            error: "問題が見つかりません。別の章またはセットを選択してください。" 
          });
        }
        
        // 最大10問をランダムに選択
        let selectedQuestions = filteredQuestions;
        if (filteredQuestions.length > 10) {
          selectedQuestions = [...filteredQuestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
        }
        
        console.log(`選択された問題数: ${selectedQuestions.length}件`);
        
        // データベースに保存されている正確な選択肢情報を使用
        const processedQuestions = selectedQuestions.map(q => {
          // 元データの確認とデバッグ出力
          console.log(`問題ID: ${q.questionId}, 正解ラベル: ${q.correctAnswer}`);
          
          // 選択肢を配列に格納
          const choices = [
            { label: 'A', text: q.optionA },
            { label: 'B', text: q.optionB },
            { label: 'C', text: q.optionC },
            { label: 'D', text: q.optionD }
          ].filter(choice => choice.text);
          
          // 元の正解選択肢のラベルと内容
          const correctLabel = q.correctAnswer || 'A';
          const correctOption = choices.find(c => c.label === correctLabel);
          
          if (!correctOption) {
            console.warn(`問題ID: ${q.questionId} - 正解の選択肢が見つかりません:`, correctLabel);
            return q; // そのまま返す
          }
          
          // 正解の選択肢内容を保存
          const correctText = correctOption.text;
          
          // 選択肢をシャッフル
          const shuffledChoices = [...choices].sort(() => Math.random() - 0.5);
          const shuffledTexts = shuffledChoices.map(c => c.text);
          
          // シャッフル後の正解の位置を特定
          const newCorrectIndex = shuffledTexts.indexOf(correctText);
          const newCorrectLabel = "ABCD"[newCorrectIndex];
          
          return {
            ...q,
            // シャッフルされた選択肢
            shuffledChoices: shuffledTexts,
            // シャッフル後の新しい正解ラベル
            correctAnswer: newCorrectLabel,
            // 元の正解の内容（表示用）
            originalCorrectAnswer: correctLabel,
            originalCorrectText: correctText
          };
        });
        
        return res.json(processedQuestions);
      } catch (err) {
        console.error("問題データの取得エラー:", err);
        return res.status(500).json({ error: "問題データの取得中にエラーが発生しました" });
      }
    } catch (error) {
      console.error("テスト問題API全体エラー:", error);
      res.status(500).json({ error: "テスト問題の取得に失敗しました" });
    }
  });
  
  // 参考書アイテムのAPI
  app.get("/api/chapter-items", async (req, res) => {
    try {
      const chapterId = req.query.chapterId;
      
      if (chapterId) {
        const chapId = Array.isArray(chapterId) ? chapterId[0] : String(chapterId);
        const data = await dataStorage.getChapterItemsByChapter(chapId);
        return res.json(data);
      }
      
      const data = await dataStorage.getChapterItems();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching chapter items:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // 特定の参考書アイテムの取得API
  app.get("/api/chapter-items/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const item = await dataStorage.getChapterItemById(itemId);
      
      if (!item) {
        return res.status(404).json({ error: "Chapter item not found" });
      }
      
      res.json(item);
    } catch (error: any) {
      console.error("Error fetching chapter item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new test
  app.post("/api/tests", async (req, res) => {
    try {
      // Validate request body against schema
      const testData = insertTestSchema.parse({
        ...req.body,
        testId: `test_${uuidv4().slice(0, 8)}`,
        creatorId: "user123" // This would be the actual user ID in a real app
      });
      
      const newTest = await dataStorage.createTest(testData);
      res.status(201).json(newTest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid test data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create test" });
    }
  });

  // Get user's tests
  app.get("/api/tests", async (req, res) => {
    // In a real app, we would get the user ID from the session
    const userId = "user123";
    const tests = await dataStorage.getTestsByUser(userId);
    res.json(tests);
  });

  // Get test by ID
  app.get("/api/tests/:id", async (req, res) => {
    const { id } = req.params;
    const test = await dataStorage.getTestById(id);
    
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    res.json(test);
  });

  // Download test
  app.post("/api/tests/download", async (req, res) => {
    try {
      const { format, testSettings, questions } = req.body;
      
      if (!format || !testSettings || !questions) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // In a real implementation, we would generate the actual document here
      // using a library like docx for Word documents and pdf-lib for PDFs
      
      // For this mock implementation, we'll just send a basic response
      // indicating success but without an actual document
      
      // Set appropriate headers based on format
      if (format === "docx") {
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${testSettings.title || "test"}.docx"`);
      } else if (format === "pdf") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${testSettings.title || "test"}.pdf"`);
      } else {
        return res.status(400).json({ message: "Invalid format specified" });
      }
      
      // Here we would normally send the actual file
      // For this implementation, we'll send a JSON response
      res.json({
        success: true,
        message: `${format.toUpperCase()} file would be generated here`
      });
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  // Get test results
  app.get("/api/test-results", async (req, res) => {
    // In a real app, we would get the user ID from the session
    const userId = "user123";
    const results = await dataStorage.getTestResultsByUser(userId);
    res.json(results);
  });

  // Submit test results
  app.post("/api/test-results", async (req, res) => {
    try {
      // Validate request body
      const { testId, answers } = req.body;
      
      if (!testId || !answers) {
        return res.status(400).json({ message: "Missing testId or answers" });
      }
      
      // Get the test questions
      const test = await dataStorage.getTestById(testId);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      // Calculate score (this would be more complex in a real implementation)
      const score = 0; // Placeholder
      
      // Save the test result
      const result = await dataStorage.createTestResult({
        testId,
        userId: 1, // Placeholder
        score,
        totalQuestions: test.questionIds.length
      });
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit test results" });
    }
  });

  // API for adding textbooks (admin only in a real app)
  app.post("/api/textbooks", async (req, res) => {
    try {
      const textbookData = insertTextbookSchema.parse(req.body);
      const newTextbook = await dataStorage.createTextbook(textbookData);
      res.status(201).json(newTextbook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid textbook data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create textbook" });
    }
  });

  // API for adding chapters (admin only in a real app)
  app.post("/api/chapters", async (req, res) => {
    try {
      const chapterData = insertChapterSchema.parse(req.body);
      const newChapter = await dataStorage.createChapter(chapterData);
      res.status(201).json(newChapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid chapter data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  // API for adding questions (admin only in a real app)
  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const newQuestion = await dataStorage.createQuestion(questionData);
      res.status(201).json(newQuestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid question data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Import textbook data via CSV (admin only in a real app)
  app.post("/api/import/textbooks", importTextbooksFromCSV);

  // Import question data via CSV (admin only in a real app)
  app.post("/api/import/questions", importQuestionsFromCSV);
  
  // Import chapter items data (admin only in a real app)
  app.post("/api/import/chapter-items", async (req, res) => {
    try {
      const { importChapterItems } = require('./admin/import-chapter-items');
      const result = await importChapterItems();
      res.status(200).json(result);
    } catch (error) {
      console.error('章アイテムのインポート中にエラーが発生しました:', error);
      res.status(500).json({ 
        success: false,
        message: '章アイテムのインポート中にエラーが発生しました',
        error: error.message 
      });
    }
  });
  
  // Initialize database with sample data from CSV
  app.post("/api/init-database", async (req, res) => {
    try {
      // 教科書と章のデータをインポート
      await importTextbooksFromCSV(req, res);
      
      // 問題データをインポート
      await importQuestionsFromCSV(req, res);
      
      // 章アイテムデータをインポート
      const { importChapterItems } = require('./admin/import-chapter-items');
      const chapterItemsResult = await importChapterItems();
      
      res.status(200).json({ 
        message: "データベースの初期化が完了しました",
        chapterItemsResult 
      });
    } catch (error) {
      console.error('データベース初期化エラー:', error);
      res.status(500).json({ message: "データベースの初期化中にエラーが発生しました" });
    }
  });

  // 管理者用: ユーザー数の取得
  app.get("/api/admin/user-stats", async (req, res) => {
    try {
      // データベースからユーザー数を取得
      const users = await dataStorage.getUsers();
      
      // ユーザー統計情報を返す
      res.status(200).json({
        totalUsers: users.length,
        activeUsers: users.filter((user: any) => user.lastLoginAt !== null).length,
        newUsersToday: users.filter((user: any) => {
          const today = new Date();
          const createdAt = new Date(user.createdAt);
          return (
            createdAt.getDate() === today.getDate() &&
            createdAt.getMonth() === today.getMonth() &&
            createdAt.getFullYear() === today.getFullYear()
          );
        }).length
      });
    } catch (error) {
      console.error('ユーザー統計取得エラー:', error);
      res.status(500).json({ message: "ユーザー統計情報の取得中にエラーが発生しました" });
    }
  });

  // 管理者用: CSVアップロード（教科書データ）
  app.post("/api/admin/upload/textbooks", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "ファイルがアップロードされていません" });
      }

      // CSVファイルのパスをリクエストに追加
      req.body.csvPath = req.file.path;
      
      // CSVからデータをインポート
      await importTextbooksFromCSV(req, res);
    } catch (error) {
      console.error('CSVアップロードエラー:', error);
      res.status(500).json({ message: "CSVのアップロード中にエラーが発生しました" });
    }
  });

  // 管理者用: CSVアップロード（問題データ）
  app.post("/api/admin/upload/questions", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "ファイルがアップロードされていません" });
      }

      // CSVファイルのパスをリクエストに追加
      req.body.csvPath = req.file.path;
      
      // CSVからデータをインポート
      await importQuestionsFromCSV(req, res);
    } catch (error) {
      console.error('CSVアップロードエラー:', error);
      res.status(500).json({ message: "CSVのアップロード中にエラーが発生しました" });
    }
  });
  
  // 管理者用: CSVアップロード（参考書アイテムデータ）
  app.post("/api/admin/upload/chapterItems", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "ファイルがアップロードされていません" });
      }

      // CSVファイルのパスをリクエストに追加
      req.body.csvPath = req.file.path;
      
      // CSVからデータをインポート
      await importChapterItemsFromCSV(req, res);
    } catch (error) {
      console.error('CSVアップロードエラー:', error);
      res.status(500).json({ message: "CSVのアップロード中にエラーが発生しました" });
    }
  });
  
  // 管理者用: 統合CSVアップロード（教科書・章・アイテムの一括インポート）
  app.post("/api/admin/upload/unified", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "ファイルがアップロードされていません" });
      }
      
      // インポート関数を実行
      await importUnifiedCSV(req, res);
      
    } catch (error: any) {
      console.error('CSVアップロードエラー:', error);
      res.status(500).json({ message: "CSVのアップロード中にエラーが発生しました: " + error.message });
    }
  });
  
  // 管理者用: 参考書データを削除
  app.delete("/api/admin/textbooks/:bookId", async (req, res) => {
    try {
      const { bookId } = req.params;
      
      if (!bookId) {
        return res.status(400).json({ message: "参考書IDが指定されていません" });
      }
      
      console.log(`参考書データを削除します: ${bookId}`);
      
      // 既存のデータを取得して存在確認
      const textbookToDelete = await db.select().from(textbooks).where(eq(textbooks.bookId, bookId));
      
      if (textbookToDelete.length === 0) {
        return res.status(404).json({ message: `参考書ID: ${bookId} が見つかりません` });
      }
      
      console.log(`削除する参考書データ: `, JSON.stringify(textbookToDelete[0]));
      
      // 関連する章アイテムを先に削除
      console.log(`関連する章アイテムデータを削除します: ${bookId}`);
      const itemsToDelete = await db.select().from(chapterItems).where(eq(chapterItems.bookId, bookId));
      console.log(`削除される章アイテム数: ${itemsToDelete.length}`);
      
      await db.delete(chapterItems).where(eq(chapterItems.bookId, bookId));
      
      // 関連する問題を削除
      console.log(`関連する問題データを削除します: ${bookId}`);
      const questionsToDelete = await db.select().from(questions).where(eq(questions.bookId, bookId));
      console.log(`削除される問題数: ${questionsToDelete.length}`);
      
      await db.delete(questions).where(eq(questions.bookId, bookId));
      
      // 関連する章を削除
      console.log(`関連する章データを削除します: ${bookId}`);
      const chaptersToDelete = await db.select().from(chapters).where(eq(chapters.bookId, bookId));
      console.log(`削除される章数: ${chaptersToDelete.length}`);
      
      await db.delete(chapters).where(eq(chapters.bookId, bookId));
      
      // 最後に参考書自体を削除
      console.log(`参考書本体を削除します: ${bookId}`);
      await db.delete(textbooks).where(eq(textbooks.bookId, bookId));
      
      res.status(200).json({
        message: "参考書データと関連データが正常に削除されました",
        deletedTextbook: textbookToDelete[0],
        chaptersDeleted: chaptersToDelete.length,
        itemsDeleted: itemsToDelete.length,
        questionsDeleted: questionsToDelete.length
      });
    } catch (error) {
      console.error('参考書削除エラー:', error);
      res.status(500).json({ message: "参考書データの削除中にエラーが発生しました" });
    }
  });

  // 問題データのセットIDを更新するエンドポイント
  app.post('/api/admin/update-set-ids', async (req, res) => {
    try {
      console.log("問題データのセットIDを更新しています...");
      
      // すべての問題を取得
      const allQuestions = await db.select().from(questions);
      console.log(`更新対象: ${allQuestions.length}件の問題`);
      
      let successCount = 0;
      let failCount = 0;
      
      // 各問題のセットIDを更新
      for (const question of allQuestions) {
        try {
          // 問題IDからセットIDを抽出
          let setId = "";
          
          if (question.questionId && question.questionId.includes('-')) {
            const parts = question.questionId.split('-');
            if (parts.length >= 3) {
              setId = parts[2]; // 3番目の部分がセットID
              console.log(`問題ID ${question.questionId} からセットID ${setId} を抽出しました`);
              
              // データベースを更新
              await db.update(questions)
                .set({ setId: setId })
                .where(eq(questions.id, question.id));
                
              successCount++;
            } else {
              console.warn(`フォーマットが不正: ${question.questionId}`);
              failCount++;
            }
          } else {
            console.warn(`問題IDからセットIDを抽出できません: ${question.questionId}`);
            failCount++;
          }
        } catch (error) {
          console.error(`更新エラー (問題ID: ${question.questionId}):`, error);
          failCount++;
        }
      }
      
      const summary = {
        success: successCount,
        failed: failCount,
        total: allQuestions.length
      };
      
      console.log("セットID更新完了:", summary);
      res.status(200).json({
        message: "セットIDの更新が完了しました",
        summary
      });
    } catch (error) {
      console.error("セットID更新エラー:", error);
      res.status(500).json({ error: "セットIDの更新中にエラーが発生しました" });
    }
  });
  
  // フィードバックを保存するエンドポイント
  app.post("/api/feedback", async (req, res) => {
    try {
      const { feedbackType, feedbackCategories, feedbackContent, bookId, chapterId, questionId } = req.body;
      
      if (!feedbackType) {
        return res.status(400).json({ error: "フィードバックの種類が指定されていません" });
      }
      
      // フィードバックをデータベースに保存
      // 注: セッション情報は現状では使用せず、匿名フィードバックとして扱う
      const [newFeedback] = await db
        .insert(feedback)
        .values({
          userId: null, // 匿名フィードバック
          bookId: bookId || null,
          chapterId: chapterId || null,
          questionId: questionId || null,
          feedbackType,
          feedbackCategories: feedbackCategories || [],
          feedbackContent: feedbackContent || null,
        })
        .returning();
      
      console.log("フィードバックを保存しました:", newFeedback);
      
      res.status(200).json({
        success: true,
        message: "フィードバックを受け取りました。ありがとうございます。",
        feedbackId: newFeedback.id
      });
    } catch (error) {
      console.error("フィードバック保存エラー:", error);
      res.status(500).json({ 
        success: false,
        error: "フィードバックの保存中にエラーが発生しました" 
      });
    }
  });

  // 参考書ページ内容を取得するエンドポイント
  app.get("/api/textbook-pages", async (req, res) => {
    try {
      const { pageRef, bookId } = req.query;
      
      if (!pageRef) {
        return res.status(400).json({ error: "ページ参照が指定されていません" });
      }
      
      // ページ参照を正規化
      const pageRefStr = String(pageRef);
      
      // ページ番号を抽出
      const pageNumbers = pageRefStr.match(/\d+/g) || [];
      
      if (pageNumbers.length === 0) {
        return res.status(400).json({ error: "有効なページ番号が見つかりません" });
      }
      
      console.log(`ページ参照: ${pageRefStr}, ページ番号: ${pageNumbers.join(', ')}`);
      
      // 各ページ番号に対して検索
      const foundPages = [];
      
      for (const num of pageNumbers) {
        // 完全一致（P15）を検索
        const singlePage = await db.select()
          .from(chapterItems)
          .where(eq(chapterItems.pageReference, `P${num}`))
          .limit(1);
          
        if (singlePage.length > 0) {
          console.log(`ページP${num}: 完全一致しました`);
          foundPages.push(singlePage[0]);
          continue;
        }
          
        // カンマリスト（P15, P16）か範囲（P15-P16）を検索
        // P15が含まれる形式を優先検索
        const listOrRangePages = await db.select()
          .from(chapterItems)
          .where(
            or(
              like(chapterItems.pageReference, `P${num},%`),
              like(chapterItems.pageReference, `%, P${num}`),
              like(chapterItems.pageReference, `P${num}-P%`),
              like(chapterItems.pageReference, `P%-P${num}`)
            )
          )
          .limit(2);
        
        if (listOrRangePages.length > 0) {
          console.log(`ページP${num}: ${listOrRangePages[0].pageReference}で見つかりました`);
          
          // 重複チェック
          const alreadyExists = foundPages.some(p => p.itemId === listOrRangePages[0].itemId);
          if (!alreadyExists) {
            foundPages.push(listOrRangePages[0]);
          }
        } else {
          console.log(`ページP${num}: 見つかりませんでした`);
        }
      }
      
      // 結果がない場合
      if (foundPages.length === 0) {
        return res.json({
          title: `参考書ページ ${pageRef}`,
          content: `<h2 class="text-xl font-bold mb-3">参考書ページ ${pageRef}</h2>
                   <p class="mb-3">指定されたページの内容が見つかりませんでした。</p>`,
          pageReference: pageRefStr
        });
      }
      
      // 順序でソート
      foundPages.sort((a, b) => a.order - b.order);
      
      // HTML形式でフォーマット
      const formattedContent = foundPages.map(page => {
        const formattedText = formatPageContent(page.fullText);
        
        return `<div class="mb-4">
                  <h3 class="text-lg font-bold mb-2">${page.title}</h3>
                  <div class="prose prose-sm whitespace-pre-wrap">${formattedText}</div>
                </div>`;
      }).join('');
      
      // 結果を返す
      return res.json({
        title: `参考書ページ ${pageRef}`,
        content: `<h2 class="text-xl font-bold mb-3">参考書ページ ${pageRef}</h2>${formattedContent}`,
        pageReference: pageRefStr
      });
    } catch (error) {
      console.error("Error fetching textbook page content:", error);
      res.status(500).json({ error: "参考書ページの取得に失敗しました" });
    }
  });
  
  // ページ内容を整形するヘルパー関数
  function formatPageContent(fullText: string | null): string {
    if (!fullText) return '内容がありません';
    
    return fullText
      // 以下の順序で処理することが重要
      .replace(/\\\\n/g, '<br>') // エスケープされたバックスラッシュ + n を<br>に
      .replace(/\\n/g, '<br>') // バックスラッシュ + n を<br>に
      .replace(/\n/g, '<br>') // 通常の改行コードを<br>に
      .replace(/\r/g, '') // キャリッジリターンを削除
      .replace(/(?:\r\n|\r|\n)/g, '<br>'); // 残りの改行タイプをすべて<br>に
  }

  const httpServer = createServer(app);
  return httpServer;
}
