const fs = require('fs');
const csv = require('csv-parser');
const { db } = require('../db');
const { chapterItems, insertChapterItemSchema } = require('@shared/schema');
const { storage } = require('../storage');
const { eq } = require('drizzle-orm');
const { z } = require('zod');

/**
 * CSVから参考書アイテムデータをインポートする関数
 * @param {Object} req - Expressリクエストオブジェクト
 * @param {Object} res - Expressレスポンスオブジェクト
 */
async function importChapterItemsFromCSV(req, res) {
  try {
    // CSVファイルのパスを取得
    const csvPath = req.body.csvPath;
    if (!csvPath) {
      return res.status(400).json({ message: "CSVファイルのパスが指定されていません" });
    }

    // 処理済みのアイテムを追跡
    const processedItems = new Set();
    const results = {
      totalRows: 0,
      processedItems: 0,
      errors: []
    };

    // CSVデータの配列
    const chapterItemsData = [];

    // CSVを読み込む
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // 必須フィールドのチェック
          if (!row.item_id || !row.chapter_id || !row.book_id || !row.title) {
            results.errors.push(`レコードにデータ不足: ${JSON.stringify(row)}`);
            return;
          }

          results.totalRows++;
          chapterItemsData.push(row);
        })
        .on('end', resolve)
        .on('error', (error) => {
          reject(error);
        });
    });

    console.log(`CSVからロードされた参考書アイテム: ${chapterItemsData.length}件`);

    // バッチサイズ（大きすぎるとパフォーマンスが低下する可能性がある）
    const BATCH_SIZE = 50;

    // データを小さなバッチに分割
    for (let i = 0; i < chapterItemsData.length; i += BATCH_SIZE) {
      const batch = chapterItemsData.slice(i, i + BATCH_SIZE);

      // バッチ内のすべてのアイテムを非同期で処理
      await Promise.all(batch.map(async (row) => {
        try {
          // すでに処理済みのアイテムはスキップ
          if (processedItems.has(row.item_id)) {
            return;
          }

          // アイテム情報を追加
          const chapterItemData = {
            itemId: row.item_id,
            chapterId: row.chapter_id,
            bookId: row.book_id,
            title: row.title,
            order: Number(row.order) || 0,
            keyPoints: row.key_points || null,
            fullText: row.full_text || null,
            pageReference: row.page_reference || null
          };

          // スキーマバリデーション
          const validatedData = insertChapterItemSchema.parse(chapterItemData);

          // 同じIDのアイテムが既に存在するか確認
          const existingItem = await storage.getChapterItemById(row.item_id);
          if (existingItem) {
            console.log(`重複するアイテムID: ${row.item_id} - 既存のデータは変更されません`);
            
            // 処理済み扱いにする
            processedItems.add(row.item_id);
          } else {
            // データベースに追加
            await storage.createChapterItem(validatedData);
            processedItems.add(row.item_id);
            console.log(`アイテムを追加しました: ${row.title}`);
            results.processedItems++;
          }
        } catch (error) {
          if (String(error).includes('duplicate key')) {
            console.log(`重複するアイテムIDのため追加をスキップ: ${row.item_id}`);
            processedItems.add(row.item_id);
          } else {
            results.errors.push(`アイテム処理エラー (${row.item_id}): ${error.message}`);
            console.error(`参考書アイテムデータの追加エラー: ${error}`);
          }
        }
      }));

      console.log(`処理済みバッチ: ${i + Math.min(BATCH_SIZE, chapterItemsData.length - i)}/${chapterItemsData.length}`);
    }

    // 結果を返す
    res.status(200).json({
      message: `${results.processedItems}件の参考書アイテムを正常にインポートしました`,
      results
    });
  } catch (error) {
    console.error('参考書アイテムCSVのインポート中にエラーが発生しました:', error);
    res.status(500).json({ 
      message: "参考書アイテムCSVのインポート中にエラーが発生しました", 
      error: error.message 
    });
  }
}

module.exports = { importChapterItemsFromCSV };