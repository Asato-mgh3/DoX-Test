import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { storage } from './storage';
import { db } from './db';
import {
  textbooks,
  chapters,
  questions,
  chapterItems,
  insertTextbookSchema,
  insertChapterSchema,
  insertQuestionSchema,
  insertChapterItemSchema
} from '@shared/schema';
import { eq } from 'drizzle-orm';

// 教科書データをインポートする関数
export async function importTextbooksFromCSV(req: Request, res: Response) {
  try {
    console.log('importTextbooksFromCSV called, req.file:', req.file);
    console.log('req.body:', req.body);
    
    // アップロードされたファイルのパスを取得
    let csvPath;
    
    if (req.file) {
      csvPath = req.file.path;
      console.log('Using uploaded file path:', csvPath);
    } else if (req.body && req.body.csvPath) {
      csvPath = req.body.csvPath;
      console.log('Using csvPath from body:', csvPath);
    } else {
      csvPath = './attached_assets/参考書構造化データ (2).csv';
      console.log('Using default file path:', csvPath);
    }
    
    // CSVファイルの存在確認
    console.log('Checking if file exists at path:', csvPath);
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at path: ${csvPath}`);
      return res.status(404).json({ error: `CSVファイルが見つかりません: ${csvPath}` });
    }
    console.log('CSV file found at path:', csvPath);
    
    // すでにインポート済みのデータを格納する集合
    const processedBooks = new Set<string>();
    const processedChapters = new Set<string>();
    
    // CSVを解析する
    const textbookData: any[] = [];
    
    // CSVを読み込む
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => {
        textbookData.push(row);
      })
      .on('end', async () => {
        // 教科書データを処理
        for (const row of textbookData) {
          try {
            // すでに処理済みの教科書はスキップ
            if (processedBooks.has(row.book_id)) {
              continue;
            }
            
            // 教科書情報を追加
            const textbookData = {
              bookId: row.book_id,
              title: row.book_title,
              subject: row.subject,
              publisher: "出版社情報なし", // CSVにない情報
              chapterCount: 0, // 後で更新
              questionCount: 0, // 後で更新
            };
            
            // スキーマバリデーション
            const validatedData = insertTextbookSchema.parse(textbookData);
            
            try {
              // 同じIDの教科書が既に存在するか確認
              const existingTextbook = await storage.getTextbookById(row.book_id);
              if (existingTextbook) {
                console.log(`重複する教科書ID: ${row.book_id} - 既存のデータは変更されません`);
                
                // 処理としては完了扱いにするが、実際には追加しない
                processedBooks.add(row.book_id);
              } else {
                // データベースに追加
                await storage.createTextbook(validatedData);
                processedBooks.add(row.book_id);
                console.log(`教科書を追加しました: ${row.book_title}`);
              }
            } catch (error) {
              if (String(error).includes('duplicate key')) {
                console.log(`重複する教科書IDのため追加をスキップ: ${row.book_id}`);
                processedBooks.add(row.book_id);
              } else {
                throw error;
              }
            }
          } catch (error) {
            console.error(`教科書データの追加エラー: ${error}`);
          }
        }
        
        // 章データを処理
        for (const row of textbookData) {
          try {
            // すでに処理済みの章はスキップ
            if (processedChapters.has(row.chapter_id)) {
              continue;
            }
            
            // 章情報を追加
            const chapterData = {
              chapterId: row.chapter_id,
              bookId: row.book_id,
              title: row.chapter_title,
              order: Number(row.chapter_order) || 0,
              questionCount: 0, // 後で更新
            };
            
            // スキーマバリデーション
            const validatedData = insertChapterSchema.parse(chapterData);
            
            try {
              // 同じIDの章が既に存在するか確認
              const existingChapter = await storage.getChapterById(row.chapter_id);
              if (existingChapter) {
                console.log(`重複する章ID: ${row.chapter_id} - 既存のデータは変更されません`);
                
                // 処理としては完了扱いにするが、実際には追加しない
                processedChapters.add(row.chapter_id);
              } else {
                // データベースに追加
                await storage.createChapter(validatedData);
                processedChapters.add(row.chapter_id);
                console.log(`章を追加しました: ${row.chapter_title}`);
              }
            } catch (error) {
              if (String(error).includes('duplicate key')) {
                console.log(`重複する章IDのため追加をスキップ: ${row.chapter_id}`);
                processedChapters.add(row.chapter_id);
              } else {
                throw error;
              }
            }
          } catch (error) {
            console.error(`章データの追加エラー: ${error}`);
          }
        }
        
        // 章の数を集計して教科書データを更新
        // ES5互換性のために Array.from を使用
        Array.from(processedBooks).forEach(async (bookId) => {
          const bookChapters = await storage.getChaptersByTextbook(bookId);
          await db.update(textbooks)
            .set({ chapterCount: bookChapters.length })
            .where(eq(textbooks.bookId, bookId));
        });
        
        res.status(200).json({ 
          message: 'インポート完了', 
          booksAdded: processedBooks.size,
          chaptersAdded: processedChapters.size
        });
      });
  } catch (error) {
    console.error('CSVインポートエラー:', error);
    res.status(500).json({ error: 'CSVデータのインポート中にエラーが発生しました' });
  }
}

// 参考書アイテムデータをインポートする関数
export { importChapterItemsFromCSV } from './admin/import-chapter-items-csv';

// 問題データをインポートする関数
export async function importQuestionsFromCSV(req: Request, res: Response) {
  try {
    console.log('importQuestionsFromCSV called, req.file:', req.file);
    console.log('req.body:', req.body);
    
    // アップロードされたファイルのパスを取得
    let csvPath;
    
    if (req.file) {
      csvPath = req.file.path;
      console.log('Using uploaded file path:', csvPath);
    } else if (req.body && req.body.csvPath) {
      csvPath = req.body.csvPath;
      console.log('Using csvPath from body:', csvPath);
    } else {
      csvPath = './attached_assets/問題セット構造化データ (1).csv';
      console.log('Using default file path:', csvPath);
    }
    
    // CSVファイルの存在確認
    console.log('Checking if file exists at path:', csvPath);
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at path: ${csvPath}`);
      return res.status(404).json({ error: `CSVファイルが見つかりません: ${csvPath}` });
    }
    console.log('CSV file found at path:', csvPath);
    
    // すでにインポート済みのデータを格納する集合
    const processedQuestions = new Set<string>();
    const questionCountByChapter = new Map<string, number>();
    const questionCountByBook = new Map<string, number>();
    
    // CSVを解析する
    const questionData: any[] = [];
    
    // CSVを読み込む
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => {
        questionData.push(row);
      })
      .on('end', async () => {
        // 問題データを処理（バッチ処理による高速化）
        console.log(`処理開始: ${questionData.length}件の問題データを処理します`);
        
        // バリデーション済みデータを格納する配列
        const questionsToInsert = [];
        const duplicateIds = []; // 重複IDのリスト
        
        // バッチ処理のための前処理
        for (const row of questionData) {
          try {
            // すでに処理済みの問題はスキップ
            if (processedQuestions.has(row.question_id)) {
              continue;
            }
            
            // 問題情報を追加
            // 章IDが正しい形式（ch01など）かチェックし、必要に応じて整形
            let formattedChapterId = row.chapter_id;
            
            // 数字のみの場合（例: "1"）は "ch01" の形式に変換
            if (/^\d+$/.test(formattedChapterId)) {
              formattedChapterId = `ch${formattedChapterId.padStart(2, '0')}`;
              console.log(`章ID変換: ${row.chapter_id} → ${formattedChapterId}`);
            }
            
            // CSVから直接セットIDを使用
            const setId = row.set_id || '';
            
            if (setId) {
              console.log(`問題 ${row.question_id} のセットID: ${setId}`);
            } else {
              console.warn(`問題 ${row.question_id} にセットIDがCSVに含まれていません`);
            }
            
            const questionData = {
              questionId: row.question_id,
              bookId: row.book_id,
              chapterId: formattedChapterId,
              setId: setId, // 抽出したセットIDを追加
              questionText: row.question_text,
              optionA: row.option_a,
              optionB: row.option_b,
              optionC: row.option_c,
              optionD: row.option_d,
              correctAnswer: row.correct_answer,
              explanation: row.explanation,
              difficulty: Number(row.difficulty) || 1,
              questionType: row.question_type || 'multiple_choice',
            };
            
            // スキーマバリデーション
            const validatedData = insertQuestionSchema.parse(questionData);
            
            // 同じIDの問題が既に存在するか確認（重複チェックをコメントアウト）
            // 以下のコードをコメントアウトすることで、重複データも上書きインポートできるようになります
            /*
            const existingQuestion = await storage.getQuestionById(row.question_id);
            if (existingQuestion) {
              console.log(`重複する問題ID: ${row.question_id} - スキップします`);
              duplicateIds.push(row.question_id);
              processedQuestions.add(row.question_id);
              continue;
            }
            */
            
            // 挿入待ちデータに追加
            questionsToInsert.push(validatedData);
            processedQuestions.add(row.question_id);
            
            // 集計用データを更新
            questionCountByChapter.set(
              row.chapter_id, 
              (questionCountByChapter.get(row.chapter_id) || 0) + 1
            );
            
            questionCountByBook.set(
              row.book_id, 
              (questionCountByBook.get(row.book_id) || 0) + 1
            );
          } catch (error) {
            console.error(`問題データの前処理エラー: ${error}`);
          }
        }
        
        // バッチサイズの定義
        const BATCH_SIZE = 50;
        console.log(`バッチ処理を開始: 合計${questionsToInsert.length}件、バッチサイズ${BATCH_SIZE}`);
        
        // バッチ処理でデータベースに挿入
        try {
          // バッチに分割して処理
          for (let i = 0; i < questionsToInsert.length; i += BATCH_SIZE) {
            const batch = questionsToInsert.slice(i, i + BATCH_SIZE);
            
            // Promise.allを使って並列処理
            const promises = batch.map(questionData => storage.createQuestion(questionData));
            await Promise.all(promises);
            
            console.log(`バッチ処理完了: ${i}～${Math.min(i + BATCH_SIZE, questionsToInsert.length)}件`);
          }
        } catch (error) {
          console.error(`バッチ処理エラー: ${error}`);
        }
        
        // 章の問題数を更新（一括更新に変更）
        console.log('章と教科書の問題数を一括更新します');
        
        const chapterUpdatePromises: Promise<any>[] = [];
        // ES5互換性のために Map.forEach を使用
        questionCountByChapter.forEach((count, chapterId) => {
          const promise = db.update(chapters)
            .set({ questionCount: count })
            .where(eq(chapters.chapterId, chapterId));
          chapterUpdatePromises.push(promise);
        });
        
        // 教科書の問題数を更新（一括更新に変更）
        const bookUpdatePromises: Promise<any>[] = [];
        // ES5互換性のために Map.forEach を使用
        questionCountByBook.forEach((count, bookId) => {
          const promise = db.update(textbooks)
            .set({ questionCount: count })
            .where(eq(textbooks.bookId, bookId));
          bookUpdatePromises.push(promise);
        });
        
        // 両方の更新を並列実行
        try {
          await Promise.all([
            Promise.all(chapterUpdatePromises),
            Promise.all(bookUpdatePromises)
          ]);
          console.log('問題数の更新が完了しました');
        } catch (error) {
          console.error('問題数の更新中にエラーが発生しました:', error);
        }
        
        // 処理時間の計測結果をログ出力
        console.log(`インポート処理が完了しました。合計${processedQuestions.size}件の問題を処理しました。`);
        if (duplicateIds.length > 0) {
          console.log(`重複IDにより${duplicateIds.length}件の問題はスキップされました。`);
        }
        
        // 結果をレスポンス（JSON形式を整形してユーザーに表示）
        res.status(200).json({
          message: duplicateIds.length > 0 ? 
            `インポート完了（${duplicateIds.length}件のIDが重複していました）` : 
            'インポート完了',
          questionsAdded: questionsToInsert.length,
          duplicatesSkipped: duplicateIds.length,
          chaptersUpdated: questionCountByChapter.size,
          booksUpdated: questionCountByBook.size
        });
      });
  } catch (error) {
    console.error('CSVインポートエラー:', error);
    res.status(500).json({ error: '問題データのインポート中にエラーが発生しました' });
  }
}