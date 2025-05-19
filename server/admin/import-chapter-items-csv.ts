import { Request, Response } from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';
import { storage } from '../storage';
import { 
  chapterItems,
  insertChapterItemSchema
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db';

/**
 * CSVから参考書アイテムデータをインポートする関数
 */
export async function importChapterItemsFromCSV(req: Request, res: Response) {
  try {
    console.log('importChapterItemsFromCSV called, req.file:', req.file);
    console.log('req.body:', req.body);
    
    // アップロードされたファイルのパスを取得
    let csvPath;
    
    if (req.file) {
      csvPath = req.file.path;
      console.log('Using uploaded file path:', csvPath);
    } else if (req.body && req.body.csvPath) {
      csvPath = req.body.csvPath;
      console.log('Using path from request body:', csvPath);
    } else {
      return res.status(400).json({ message: 'CSVファイルが見つかりません' });
    }
    
    // CSVデータを解析して保存
    const chapterItemsData: any[] = [];
    const processedItemIds = new Set<string>();
    
    // CSVファイルを読み込む
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row: any) => {
          console.log('CSV row:', row);
          
          // item_id（参考書アイテムID）が必須
          if (!row.item_id) {
            console.warn('Invalid row, missing item_id:', row);
            return;
          }
          
          // chapter_id（章ID）が必須
          if (!row.chapter_id) {
            console.warn('Invalid row, missing chapter_id:', row);
            return;
          }
          
          // book_id（参考書ID）が必須
          if (!row.book_id) {
            console.warn('Invalid row, missing book_id:', row);
            return;
          }
          
          // title（タイトル）が必須
          if (!row.title) {
            console.warn('Invalid row, missing title:', row);
            return;
          }
          
          chapterItemsData.push(row);
        })
        .on('end', () => {
          console.log(`${chapterItemsData.length} chapter items loaded from CSV`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          reject(error);
        });
    });
    
    // インポート結果を追跡
    const results = {
      totalProcessed: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [] as string[]
    };
    
    // バッチサイズ（大きすぎるとパフォーマンスが低下する可能性がある）
    const BATCH_SIZE = 50;
    
    // データを小さなバッチに分割
    for (let i = 0; i < chapterItemsData.length; i += BATCH_SIZE) {
      const batch = chapterItemsData.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(chapterItemsData.length / BATCH_SIZE)}`);
      
      await Promise.all(batch.map(async (row) => {
        try {
          results.totalProcessed++;
          
          // 既に処理済みのアイテムIDはスキップ
          if (processedItemIds.has(row.item_id)) {
            console.log(`Skipping duplicate item_id: ${row.item_id}`);
            results.skipped++;
            return;
          }
          
          // 既存のアイテムをチェック
          const existingItem = await db
            .select()
            .from(chapterItems)
            .where(eq(chapterItems.itemId, row.item_id));
          
          if (existingItem.length > 0) {
            console.log(`Skipping existing item_id: ${row.item_id}`);
            processedItemIds.add(row.item_id);
            results.skipped++;
            return;
          }
          
          // アイテムをデータ構造に変換
          const chapterItemData = {
            itemId: row.item_id,
            chapterId: row.chapter_id,
            bookId: row.book_id,
            title: row.title,
            order: parseInt(row.order || '0', 10),
            keyPoints: row.key_points || null,
            fullText: row.full_text || null,
            pageReference: row.page_reference || null
          };
          
          // バリデーション
          const validatedData = insertChapterItemSchema.parse(chapterItemData);
          
          // データベースに保存
          await storage.createChapterItem(validatedData);
          
          processedItemIds.add(row.item_id);
          results.inserted++;
          console.log(`Inserted chapter item: ${row.item_id}`);
        } catch (error: any) {
          results.errors++;
          const errorMessage = `Error processing item ${row.item_id}: ${error.message}`;
          results.errorDetails.push(errorMessage);
          console.error(errorMessage);
        }
      }));
    }
    
    console.log('Import completed:', results);
    
    // 一時ファイルを削除
    try {
      fs.unlinkSync(csvPath);
      console.log(`Deleted temporary file: ${csvPath}`);
    } catch (err) {
      console.error(`Failed to delete temporary file: ${csvPath}`, err);
    }
    
    // 結果をクライアントに返す
    res.status(200).json({
      message: `${results.inserted} 件の参考書アイテムをインポートしました`,
      results
    });
    
  } catch (error: any) {
    console.error('Error importing chapter items from CSV:', error);
    res.status(500).json({ 
      message: '参考書アイテムのインポート中にエラーが発生しました',
      error: error.message 
    });
  }
}