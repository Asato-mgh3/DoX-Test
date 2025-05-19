import { db } from "../db";
import { textbooks, chapters, chapterItems, insertTextbookSchema, insertChapterSchema, insertChapterItemSchema } from "@shared/schema";
import { eq, count, sql } from "drizzle-orm";
import csvParser from "csv-parser";
import fs from "fs";
import { Request, Response } from "express";

export async function importUnifiedCSV(req: Request, res: Response) {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "CSVファイルが見つかりません" });
    }

    const csvPath = req.file.path;
    console.log(`統合CSVファイルを処理中: ${csvPath}`);

    // CSVデータを格納する配列
    const rows: any[] = [];

    // CSVデータを読み込み
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    console.log(`CSVから${rows.length}行のデータを読み込みました`);

    // 処理済みのIDを追跡するセット
    const processedBooks = new Set();
    const processedChapters = new Set();
    const processedItems = new Set();

    // インポート結果を記録
    const result = {
      booksAdded: 0,
      chaptersAdded: 0,
      itemsAdded: 0
    };

    // データをバッチ処理
    for (const row of rows) {
      // 教科書データの処理
      if (row.book_id && row.book_title && !processedBooks.has(row.book_id)) {
        try {
          // 既存の教科書をチェック
          const [existingBook] = await db
            .select()
            .from(textbooks)
            .where(eq(textbooks.bookId, row.book_id));
            
          if (!existingBook) {
            // 教科書データを作成
            const textbookData = {
              bookId: row.book_id,
              title: row.book_title,
              subject: row.subject || '英語',
              publisher: row.publisher || '出版社情報なし',
              chapterCount: 0,
              questionCount: 0
            };
            
            // 教科書を追加
            await db.insert(textbooks).values(textbookData);
            result.booksAdded++;
            console.log(`教科書を追加しました: ${row.book_title}`);
          }
          
          processedBooks.add(row.book_id);
        } catch (error: any) {
          console.error(`教科書データの処理エラー: ${error.message}`);
        }
      }
      
      // 章データの処理
      if (row.book_id && row.chapter_id && row.chapter_title && !processedChapters.has(row.chapter_id)) {
        try {
          // 既存の章をチェック
          const [existingChapter] = await db
            .select()
            .from(chapters)
            .where(eq(chapters.chapterId, row.chapter_id));
            
          if (!existingChapter) {
            // 章データを作成
            const chapterData = {
              chapterId: row.chapter_id,
              bookId: row.book_id,
              title: row.chapter_title,
              order: parseInt(row.chapter_order || '0', 10),
              questionCount: 0
            };
            
            // 章を追加
            await db.insert(chapters).values(chapterData);
            result.chaptersAdded++;
            console.log(`章を追加しました: ${row.chapter_title}`);
          }
          
          processedChapters.add(row.chapter_id);
        } catch (error: any) {
          console.error(`章データの処理エラー: ${error.message}`);
        }
      }
      
      // 章アイテムの処理
      if (row.book_id && row.chapter_id && row.item_id && row.item_title && !processedItems.has(row.item_id)) {
        try {
          // 既存の章アイテムをチェック
          const [existingItem] = await db
            .select()
            .from(chapterItems)
            .where(eq(chapterItems.itemId, row.item_id));
            
          if (!existingItem) {
            // 章アイテムデータを作成
            const itemData = {
              itemId: row.item_id,
              chapterId: row.chapter_id,
              bookId: row.book_id,
              title: row.item_title,
              order: parseInt(row.item_order || '0', 10),
              keyPoints: row.key_points || null,
              fullText: row.full_text || null,
              pageReference: row.page_reference || null
            };
            
            // 章アイテムを追加
            await db.insert(chapterItems).values(itemData);
            result.itemsAdded++;
            console.log(`章アイテムを追加しました: ${row.item_title}`);
          }
          
          processedItems.add(row.item_id);
        } catch (error: any) {
          console.error(`章アイテムデータの処理エラー: ${error.message}`);
        }
      }
    }

    // アップロード後に教科書の章数を更新
    processedBooks.forEach(async (bookId) => {
      // 章数をカウント
      const chaptersResult = await db
        .select({ chapterCount: count() })
        .from(chapters)
        .where(eq(chapters.bookId, bookId as string));
      
      const chapterCount = Number(chaptersResult[0]?.chapterCount || 0);
        
      // 教科書の章数を更新
      await db
        .update(textbooks)
        .set({ chapterCount: chapterCount })
        .where(eq(textbooks.bookId, bookId as string));
      
      console.log(`教科書 ${bookId} の章数を更新: ${chapterCount}章`);
    });

    // 一時ファイルを削除
    try {
      fs.unlinkSync(csvPath);
      console.log(`一時ファイルを削除しました: ${csvPath}`);
    } catch (error: any) {
      console.error(`一時ファイルの削除に失敗しました: ${csvPath}`, error);
    }

    // レスポンスを送信
    res.json({
      success: true,
      message: `インポート完了: ${result.booksAdded}冊の参考書、${result.chaptersAdded}件の章、${result.itemsAdded}件の章アイテムがインポートされました`,
      result
    });
    
  } catch (error: any) {
    console.error("統合CSVインポートエラー:", error);
    res.status(500).json({ message: "CSVのインポート中にエラーが発生しました: " + error.message });
  }
}