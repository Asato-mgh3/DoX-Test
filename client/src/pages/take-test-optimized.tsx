import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 科目ごとの色を定義
const subjectColors = {
  // 主要カテゴリー
  英語: "#1D4A4A",
  国語: "#781D33",
  数学: "#142B50",
  理科: "#57386B",
  社会: "#DE721A",
  
  // 国語カテゴリーの科目
  現代文: "#781D33",
  古文: "#781D33",
  漢文: "#781D33",
  小論文: "#781D33",
  
  // 英語カテゴリーの科目
  リーディング: "#1D4A4A",
  リスニング: "#1D4A4A",
  スピーキング: "#1D4A4A",
  ライティング: "#1D4A4A",
  
  // 数学カテゴリーの科目
  "数学I": "#142B50",
  "数学A": "#142B50", 
  "数学II": "#142B50",
  "数学B": "#142B50",
  "数学III": "#142B50",
  "数学C": "#142B50",
  
  // 理科カテゴリーの科目
  物理: "#57386B",
  化学: "#57386B",
  生物: "#57386B",
  地学: "#57386B",
  
  // 社会カテゴリーの科目
  世界史: "#DE721A",
  日本史: "#DE721A",
  地理: "#DE721A",
  公民: "#DE721A",
  倫理: "#DE721A",
  政治経済: "#DE721A"
};

// データベースから参考書データを取得する - 最適化版
const useTextbooksData = (subject: string) => {
  // クライアント側キャッシュ機能を強化
  const { data: textbooks, isLoading: textbooksLoading } = useQuery({
    queryKey: ['textbooks', subject],
    queryFn: async () => {
      // ローカルストレージからキャッシュを試みる
      const cachedData = localStorage.getItem(`textbooks_${subject}`);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          console.log(`科目「${subject}」の参考書をローカルキャッシュから取得`);
          return parsed;
        } catch (e) {
          // パースエラーの場合はキャッシュを無視
          localStorage.removeItem(`textbooks_${subject}`);
        }
      }
      
      // キャッシュがない場合はサーバーから取得
      console.log(`科目「${subject}」の参考書を取得します`);
      const startTime = performance.now();
      const response = await fetch(`/api/textbooks?subject=${encodeURIComponent(subject)}`);
      
      if (!response.ok) {
        throw new Error('参考書データの取得に失敗しました');
      }
      
      const data = await response.json();
      
      // 結果をローカルストレージにキャッシュ
      localStorage.setItem(`textbooks_${subject}`, JSON.stringify(data));
      
      console.log(`科目「${subject}」の参考書: ${data.length}件`, 
                 `(${Math.round(performance.now() - startTime)}ms)`);
      return data;
    },
    staleTime: 1000 * 60 * 60 // 1時間キャッシュを保持
  });

  // フィルタリング済みデータを直接使用
  const filteredTextbooks = textbooks || [];
  
  // ステップ2: 章データは参考書が選択されたときだけ取得するよう変更
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  
  // 章データを取得 - 特定の参考書が選択された場合のみ取得（キャッシュ強化版）
  const { data: allChapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', selectedBookId],
    queryFn: async () => {
      if (!selectedBookId) return [];
      
      // ローカルストレージからキャッシュを試みる
      const cachedChapters = localStorage.getItem(`chapters_${selectedBookId}`);
      if (cachedChapters) {
        try {
          const parsed = JSON.parse(cachedChapters);
          console.log(`参考書ID: ${selectedBookId} の章をローカルキャッシュから取得`);
          return parsed;
        } catch (e) {
          // パースエラーの場合はキャッシュを無視
          localStorage.removeItem(`chapters_${selectedBookId}`);
        }
      }
      
      // キャッシュがない場合はサーバーから取得
      console.log(`参考書ID: ${selectedBookId} の章を取得します`);
      const startTime = performance.now();
      const response = await fetch(`/api/chapters?textbookIds=${selectedBookId}`);
      
      if (!response.ok) {
        throw new Error('章データの取得に失敗しました');
      }
      
      const data = await response.json();
      
      // 結果をローカルストレージにキャッシュ
      localStorage.setItem(`chapters_${selectedBookId}`, JSON.stringify(data));
      
      console.log(`参考書の章を取得完了: ${data.length}件`,
                 `(${Math.round(performance.now() - startTime)}ms)`);
      return data;
    },
    // 特定の参考書が選択された場合のみ有効化
    enabled: !!selectedBookId,
    staleTime: 1000 * 60 * 60 // 1時間キャッシュを保持
  });
  
  // 問題データはテスト開始時に必要になったときだけ取得するため、ここでは取得しない

  // 参考書ごとに章をグループ化 - 選択した参考書が変わった時だけ実行
  // selectedBookIdを外部から更新できるようにする関数を作成
  const updateSelectedBook = useCallback((bookId: string) => {
    setSelectedBookId(bookId);
  }, []);
  
  // 最適化された参考書リスト - 章は選択されたときだけ表示
  const textbooksWithChapters = filteredTextbooks.map((book: any) => {
    // 選択された参考書の場合のみ章を追加
    if (selectedBookId === book.bookId && allChapters) {
      // 必要な章のみをフィルタリング
      const bookChapters = allChapters.filter((ch: any) => ch.bookId === book.bookId) || [];
      
      return {
        ...book,
        chapters: bookChapters
      };
    }
    
    // それ以外の参考書には空の章リストを持たせる
    return {
      ...book,
      chapters: []
    };
  });
  
  return {
    textbooks: textbooksWithChapters,
    isLoading: textbooksLoading || chaptersLoading,
    updateSelectedBook, // 参考書選択用の関数を公開
  };
};

const TakeTest = () => {
  // Extract subject from URL
  const [match, params] = useRoute("/subject/:subject/take-test");
  
  // Redirect if no valid subject is found
  useEffect(() => {
    if (!match) {
      window.location.href = '/';
    }
  }, [match]);

  if (!match || !params?.subject) return null;

  const subjectName = decodeURIComponent(params.subject);

  // 科目が存在しない場合はダッシュボードにリダイレクト
  if (!Object.keys(subjectColors).includes(subjectName)) {
    window.location.href = '/';
    return null;
  }

  const subjectColor = subjectColors[subjectName as keyof typeof subjectColors];
  
  // データベースから参考書データの名前だけを最初に取得
  const { textbooks: subjectTextbooks, isLoading, updateSelectedBook } = useTextbooksData(subjectName);

  // UI用の状態変数
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  
  // 選択された参考書の章を取得
  const [chapters, setChapters] = useState<any[]>([]);

  // 参考書選択時に章データを取得するよう修正
  const handleBookSelection = useCallback((bookId: string) => {
    console.log(`参考書${bookId}が選択されました`);
    setSelectedBook(bookId);
    setSelectedChapter(""); // 章の選択をリセット
    
    // 参考書が選択されたら章データをロード
    if (bookId) {
      // カスタムフックの更新関数を使って章データをロード
      updateSelectedBook(bookId);
    } else {
      // 選択解除された場合は章リストをクリア
      setChapters([]);
    }
  }, [updateSelectedBook]);
  
  // 章データが取得されたらステートを更新
  useEffect(() => {
    if (selectedBook) {
      const bookChapters = subjectTextbooks.find((book: any) => book.bookId === selectedBook)?.chapters || [];
      // 章を order でソート
      const sortedChapters = [...bookChapters].sort((a, b) => a.order - b.order);
      setChapters(sortedChapters);
    }
  }, [selectedBook, subjectTextbooks]);

  // テスト開始ステート
  const [isStartingTest, setIsStartingTest] = useState(false);
  // ローディングメッセージステート
  const [loadingMessage, setLoadingMessage] = useState("問題を準備しています...");
  // ローディング完了状態
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  // テスト開始ハンドラー - パフォーマンス最適化版
  const handleStartTest = () => {
    if (selectedBook && selectedChapter) {
      // ローディング状態を有効にして、ユーザーにフィードバック
      setIsStartingTest(true);
      
      // 問題セットのプレフィックスを作成
      const bookId = selectedBook;
      const chapterId = selectedChapter;
      
      // セット番号をランダムに選択（効率化のため事前計算）
      const setNumbers = ["01", "02", "03", "04", "05"];
      const setNum = setNumbers[Math.floor(Math.random() * setNumbers.length)];
      
      console.log("テスト開始:", selectedBook, selectedChapter, setNum);
      
      // 問題ページのURLを事前に準備
      const testPagePath = `/subject/${params.subject}/take-test/${selectedBook}/${selectedChapter}/${setNum}`;
      
      // ローディングメッセージを表示
      const messages = [
        "問題を準備しています...",
        "テスト環境を構築中...",
        "最適な問題を選定中...",
        "完了しました！"
      ];
      
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
        
        // 最後のメッセージ（完了）になったら、すぐにページ遷移
        if (messages[messageIndex] === "完了しました！") {
          // ローディング完了状態をセット
          setLoadingComplete(true);
          // わずかな遅延を設けて、「完了しました！」メッセージを確認できるようにする
          setTimeout(() => {
            clearInterval(messageInterval);
            window.location.href = testPagePath;
          }, 300);
        }
      }, 600);
    } else {
      // 選択されていない場合はアラートを表示
      alert("参考書と章を選択してください");
    }
  };

  return (
    <>
      <Helmet>
        <title>{subjectName}のテスト選択 - Do-Test</title>
        <meta name="description" content={`${subjectName}の知識をテストして、理解度を確認しましょう。`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-gray-700">
            ダッシュボード
          </Link>
          <span className="mx-2">›</span>
          <Link href={`/subject/${subjectName}`} className="hover:text-gray-700">
            {subjectName}
          </Link>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-900">テスト選択</span>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 text-white" style={{ backgroundColor: subjectColor }}>
              <h1 className="text-2xl font-bold mb-2">テストを選択</h1>
              <p>{subjectName}の知識をテストして、理解度を確認しましょう。</p>
            </div>

            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="book">参考書を選択</Label>
                  <Select
                    value={selectedBook}
                    onValueChange={(value) => {
                      // 新しい選択処理関数を使用
                      handleBookSelection(value);
                    }}
                  >
                    <SelectTrigger id="book" className="w-full">
                      <SelectValue placeholder="参考書を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>
                          データを読み込み中...
                        </SelectItem>
                      ) : subjectTextbooks && subjectTextbooks.length > 0 ? (
                        subjectTextbooks.map((book: any) => (
                          <SelectItem key={book.bookId} value={book.bookId}>
                            {book.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          参考書が見つかりません
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBook && (
                  <div className="space-y-2">
                    <Label htmlFor="chapter">章を選択</Label>
                    <Select
                      value={selectedChapter}
                      onValueChange={(value) => {
                        setSelectedChapter(value);
                      }}
                    >
                      <SelectTrigger id="chapter" className="w-full">
                        <SelectValue placeholder="章を選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>
                            データを読み込み中...
                          </SelectItem>
                        ) : chapters && chapters.length > 0 ? (
                          chapters.map((chapter: any) => (
                            <SelectItem key={chapter.chapterId} value={chapter.chapterId}>
                              {chapter.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            章が見つかりません
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                {isStartingTest ? (
                  <div className="bg-white p-8 rounded-xl shadow-md text-center">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-[color:var(--subject-color)] rounded-full animate-spin" 
                          style={{ "--subject-color": subjectColor } as any}></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-checkmark">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill={subjectColor}/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">{loadingMessage}</h3>
                    <p className="text-sm text-gray-500">問題データ読み込み中...</p>
                    <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      {loadingComplete ? (
                        <div className="h-full bg-gradient-to-r from-[color:var(--subject-color)] to-[color:var(--subject-color-light)] rounded-full w-full"
                          style={{ 
                            "--subject-color": subjectColor, 
                            "--subject-color-light": subjectColor 
                          } as any}></div>
                      ) : (
                        <div className="h-full bg-gradient-to-r from-[color:var(--subject-color)] to-[color:var(--subject-color-light)] rounded-full animate-progress"
                          style={{ 
                            "--subject-color": subjectColor, 
                            "--subject-color-light": `${subjectColor}99` 
                          } as any}></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: subjectColor }}
                    onClick={handleStartTest}
                    disabled={!selectedBook || !selectedChapter}
                  >
                    テストを開始する
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TakeTest;