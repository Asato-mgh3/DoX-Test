import { Request, Response } from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';
import { storage } from '../storage';
import { db } from '../db';
import { chapterItems, insertChapterItemSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * CSVファイルから参考書アイテムデータをインポートする関数
 */
export async function importChapterItemsFromCSV(req: Request, res: Response) {
  try {
    console.log('参考書アイテムCSVアップロード開始');
    
    if (!req.file && !req.body.csvPath) {
      return res.status(400).json({ message: 'CSVファイルが指定されていません' });
    }
    
    // ファイルパスを取得
    const csvPath = req.file ? req.file.path : req.body.csvPath;
    console.log(`CSVファイルパス: ${csvPath}`);
    
    // CSVデータを格納する配列
    const items: any[] = [];
    
    // CSVデータを読み込み
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => {
          items.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    console.log(`CSVから${items.length}件の参考書アイテムを読み込みました`);
    
    // 処理結果を追跡
    const result = {
      totalItems: items.length,
      insertedItems: 0,
      skippedItems: 0,
      errors: [] as string[]
    };
    
    // バッチサイズを設定
    const BATCH_SIZE = 50;
    
    // 処理済みのアイテムIDを追跡
    const processedIds = new Set<string>();
    
    // データをバッチ処理
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, Math.min(i + BATCH_SIZE, items.length));
      console.log(`バッチ処理中: ${i + 1}～${i + batch.length}/${items.length}`);
      
      await Promise.all(batch.map(async (item) => {
        try {
          // 必須フィールドのチェック
          if (!item.item_id || !item.chapter_id || !item.book_id || !item.title) {
            const errorMessage = `データ不足: item_id=${item.item_id}, chapter_id=${item.chapter_id}, book_id=${item.book_id}, title=${item.title}`;
            result.errors.push(errorMessage);
            console.error(errorMessage);
            return;
          }
          
          // すでに処理済みのアイテムはスキップ
          if (processedIds.has(item.item_id)) {
            result.skippedItems++;
            return;
          }
          
          // 既存アイテムの確認
          const existingItem = await storage.getChapterItemById(item.item_id);
          if (existingItem) {
            console.log(`既存アイテムをスキップ: ${item.item_id}`);
            processedIds.add(item.item_id);
            result.skippedItems++;
            return;
          }
          
          // 参考書アイテムデータを作成
          const chapterItemData = {
            itemId: item.item_id,
            chapterId: item.chapter_id,
            bookId: item.book_id,
            title: item.title,
            order: parseInt(item.order || '0', 10),
            keyPoints: item.key_points || null,
            fullText: item.full_text || null,
            pageReference: item.page_reference || null
          };
          
          // データバリデーション
          const validatedData = insertChapterItemSchema.parse(chapterItemData);
          
          // データを保存
          await storage.createChapterItem(validatedData);
          
          processedIds.add(item.item_id);
          result.insertedItems++;
          console.log(`参考書アイテムを追加しました: ${item.item_id}`);
          
        } catch (error: any) {
          const errorMessage = `処理エラー (${item.item_id}): ${error.message}`;
          result.errors.push(errorMessage);
          console.error(errorMessage);
        }
      }));
    }
    
    console.log('参考書アイテムCSVのインポート完了:', result);
    
    // 一時ファイルを削除
    try {
      fs.unlinkSync(csvPath);
      console.log(`一時ファイルを削除しました: ${csvPath}`);
    } catch (error) {
      console.error(`一時ファイルの削除に失敗しました: ${csvPath}`, error);
    }
    
    // 結果をクライアントに返す
    res.status(200).json({
      message: `${result.insertedItems}件の参考書アイテムがインポートされました (スキップ: ${result.skippedItems}件, エラー: ${result.errors.length}件)`,
      result
    });
    
  } catch (error: any) {
    console.error('参考書アイテムCSVのインポート中にエラーが発生しました:', error);
    res.status(500).json({
      message: '参考書アイテムCSVのインポート中にエラーが発生しました',
      error: error.message
    });
  }
}