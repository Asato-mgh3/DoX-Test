import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AnySubjectType } from "@/components/dashboard/SubjectCard";
import { 
  getLoadingMessages, 
  preloadTestData, 
  getTestPath,
  getRandomSetNumber 
} from "@/lib/loadingUtils";
import TestLoadingAnimation from "./TestLoadingAnimation";

interface StartTestButtonProps {
  subject: AnySubjectType;
  selectedBook: string | null;
  selectedChapter: string | null;
  buttonText?: string;
  className?: string;
}

/**
 * 共通のテスト開始ボタンコンポーネント
 * どの科目ページからでも同じロード体験を実現
 */
export const StartTestButton: React.FC<StartTestButtonProps> = ({
  subject,
  selectedBook,
  selectedChapter,
  buttonText = "テストを開始",
  className = ""
}) => {
  // ローディング状態
  const [isStartingTest, setIsStartingTest] = useState(false);
  // ローディングメッセージ
  const [loadingMessage, setLoadingMessage] = useState("問題を準備しています...");
  // ローディング完了状態
  const [loadingComplete, setLoadingComplete] = useState(false);
  // ロードの進捗状況
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // location関数を使用してクライアントサイドルーティング
  const [, setLocation] = useLocation();
  
  // テスト開始ハンドラー
  const handleStartTest = () => {
    if (selectedBook && selectedChapter) {
      // ローディング状態を有効にして、ユーザーにフィードバック
      setIsStartingTest(true);
      
      // 問題セットのプレフィックスを作成
      const bookId = selectedBook;
      const chapterId = selectedChapter;
      
      // セット番号をランダムに選択（共通関数を使用）
      const setNum = getRandomSetNumber();
      
      console.log("テスト開始:", selectedBook, selectedChapter, setNum);
      
      // 問題ページのURLを共通関数で準備
      const testPagePath = getTestPath(subject, selectedBook, selectedChapter, setNum);
      
      // 事前にデータの準備やプリロードを試みる（共通関数を使用）
      preloadTestData(bookId, chapterId, setNum)
        .then(success => {
          if (success) {
            console.log("テストデータのプリロードに成功しました");
            setLoadingProgress(50); // プリロードが完了したので進捗を50%に
          } else {
            console.warn("テストデータのプリロードに失敗しました");
            setLoadingProgress(30); // 失敗したが続行可能なので進捗を30%に
          }
        });
      
      // ローディングメッセージを共通関数から取得
      const messages = getLoadingMessages();
      
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
        
        // 進捗状況をメッセージのインデックスに応じて更新
        const progress = [25, 50, 75, 100][messageIndex];
        setLoadingProgress(progress);
        
        // 最後のメッセージ（完了）になったら、すぐにページ遷移
        if (messages[messageIndex] === "完了しました！") {
          // ローディング完了状態をセット
          setLoadingComplete(true);
          // クライアントサイドルーティングを使用して滑らかに遷移
          setTimeout(() => {
            clearInterval(messageInterval);
            // window.location.hrefの代わりにsetLocationを使用
            setLocation(testPagePath);
          }, 300);
        }
      }, 600);
    } else {
      // 選択されていない場合はアラートを表示
      alert("参考書と章を選択してください");
    }
  };
  
  if (isStartingTest) {
    return (
      <TestLoadingAnimation
        subject={subject}
        message={loadingMessage}
        isComplete={loadingComplete}
        loadingProgress={loadingProgress}
      />
    );
  }
  
  return (
    <Button 
      onClick={handleStartTest}
      className={className}
      size="lg"
    >
      {buttonText}
    </Button>
  );
};

export default StartTestButton;