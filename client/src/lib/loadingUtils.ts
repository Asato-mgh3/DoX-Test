import { AnySubjectType, getBackgroundColor } from "@/components/dashboard/SubjectCard";

/**
 * テスト開始時のロード処理用のユーティリティ関数
 */

// ロードメッセージのリスト
export const getLoadingMessages = () => [
  "問題を準備しています...",
  "テスト環境を構築中...",
  "最適な問題を選定中...",
  "完了しました！"
];

// テストデータをプリロードする関数
export const preloadTestData = async (
  bookId: string, 
  chapterId: string, 
  setId: string
): Promise<boolean> => {
  try {
    // キャッシュにデータを設定するためのキーを生成
    const cacheKey = `test_data_${bookId}_${chapterId}_${setId}`;
    
    // データのプリロードを開始
    const response = await fetch(`/api/test-questions?bookId=${bookId}&chapterId=${chapterId}&setId=${setId}`);
    
    if (!response.ok) {
      console.warn("テストデータのプリロードに失敗:", response.statusText);
      return false;
    }
    
    const data = await response.json();
    
    // データをローカルストレージに一時保存
    localStorage.setItem(cacheKey, JSON.stringify(data));
    console.log("テストデータをプリロード完了:", data.length, "問");
    return true;
  } catch (e) {
    console.warn("プリロード時にエラー:", e);
    return false;
  }
};

// ロードアニメーションのCSSスタイルを取得する関数
export const getLoadingAnimationStyle = (subject: AnySubjectType) => {
  const subjectColor = getBackgroundColor(subject);
  return {
    "--subject-color": subjectColor,
  } as React.CSSProperties;
};

// テスト開始用のパスを生成する関数
export const getTestPath = (
  subject: AnySubjectType,
  selectedBook: string,
  selectedChapter: string,
  setNum: string
): string => {
  return `/subject/${subject}/take-test/${selectedBook}/${selectedChapter}/${setNum}`;
};

// ランダムなセット番号を取得する関数
export const getRandomSetNumber = (): string => {
  const setNumbers = ["01", "02", "03", "04", "05"];
  return setNumbers[Math.floor(Math.random() * setNumbers.length)];
};