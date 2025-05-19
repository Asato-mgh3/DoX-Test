const { db } = require('../db');
const { chapterItems } = require('@shared/schema');
const chapterItemsData = require('../sample-data/chapter-items');

/**
 * サンプルの章アイテムデータをデータベースにインポートする関数
 */
async function importChapterItems() {
  console.log('章アイテムデータのインポートを開始します...');
  
  try {
    // 既存の章アイテムの数を確認
    const existingItems = await db.select().from(chapterItems);
    console.log(`既存の章アイテム数: ${existingItems.length}`);
    
    if (existingItems.length > 0) {
      console.log('章アイテムデータはすでに存在します。スキップします。');
      return {
        success: true,
        message: '章アイテムデータはすでにインポートされています',
        itemCount: existingItems.length
      };
    }
    
    // 章アイテムデータをインポート
    console.log(`インポートする章アイテム数: ${chapterItemsData.length}`);
    
    const insertedItems = [];
    
    for (const item of chapterItemsData) {
      try {
        // 既に同じIDのアイテムが存在するか確認
        const existingItem = await db
          .select()
          .from(chapterItems)
          .where(chapterItems.itemId.equals(item.itemId));
        
        if (existingItem && existingItem.length > 0) {
          console.log(`章アイテム ${item.itemId} はすでに存在します。スキップします。`);
          continue;
        }
        
        // アイテムを挿入
        const [insertedItem] = await db
          .insert(chapterItems)
          .values({
            itemId: item.itemId,
            chapterId: item.chapterId,
            bookId: item.bookId,
            title: item.title,
            order: item.order,
            keyPoints: item.keyPoints,
            fullText: item.fullText,
            pageReference: item.pageReference
          })
          .returning();
        
        insertedItems.push(insertedItem);
        console.log(`章アイテム ${item.itemId} をインポートしました。`);
      } catch (itemError) {
        console.error(`章アイテム ${item.itemId} のインポートに失敗しました:`, itemError);
      }
    }
    
    console.log(`インポート完了。${insertedItems.length}件の章アイテムをインポートしました。`);
    
    return {
      success: true,
      message: `${insertedItems.length}件の章アイテムをインポートしました`,
      items: insertedItems
    };
  } catch (error) {
    console.error('章アイテムのインポート中にエラーが発生しました:', error);
    return {
      success: false,
      message: '章アイテムのインポート中にエラーが発生しました',
      error: error.message
    };
  }
}

module.exports = { importChapterItems };