import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { subjectColors } from "@/lib/colors";
import { CheckCircle, XCircle, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// テストセッションページ
// 解説テキストからページ番号を抽出する関数
const extractPageNumbers = (explanation: string) => {
  // カンマ区切りのページ参照（P131, P134）を個別のページ参照に分割する
  const pageRefPattern = /P\d+(-P\d+)?/g;
  const pageRefs = explanation.match(pageRefPattern) || [];
  
  // 重複を削除して配列として返す
  return [...new Set(pageRefs)];
};

// 参考書ページの内容を取得する関数
const fetchPageContent = async (pageRef: string, bookId: string) => {
  try {
    // 参考書のIDをクエリパラメータに追加
    const url = `/api/textbook-pages?pageRef=${encodeURIComponent(pageRef)}&bookId=${encodeURIComponent(bookId)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('参考書ページの取得に失敗しました');
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('参考書ページ取得エラー:', error);
    return `<p class="text-red-500">参考書ページの取得中にエラーが発生しました。</p>`;
  }
};

// テキスト内の参照ページ番号を検出してリンクに置き換える関数
const highlightPageReferences = (text: string, onPageClick: (page: string) => void) => {
  if (!text) return text;
  
  // P12, P16-P18などのページ参照を検出して置き換える
  return text.replace(/P\d+(-P\d+)?/g, (match) => {
    return `<button class="text-blue-600 font-medium hover:underline" data-page="${match}">${match}</button>`;
  });
};

const TestSession = () => {
  // URLから科目、参考書ID、章ID、セットIDを取得
  const [match, params] = useRoute("/subject/:subject/take-test/:bookId/:chapterId/:setId");
  
  // 問題データのステート
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; userAnswer: string; isCorrect: boolean }[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  // 参考書確認のステート
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPageRef, setCurrentPageRef] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  
  // フィードバックのステート
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>("問題に対するフィードバック");
  const [feedbackIssues, setFeedbackIssues] = useState<string[]>([]);
  const [feedbackContent, setFeedbackContent] = useState<string>("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // 科目が存在しない場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (!match) {
      window.location.href = '/dashboard';
    }
  }, [match]);

  if (!match || !params?.subject || !params?.bookId || !params?.chapterId || !params?.setId) return null;

  const subjectName = decodeURIComponent(params.subject);
  const bookId = params.bookId;
  const chapterId = params.chapterId;
  const setId = params.setId;

  // 科目の色を取得
  const subjectColor = subjectColors[subjectName as keyof typeof subjectColors] || "#374151";

  // URLのセットIDをデータベースのセットID形式に変換
  const convertSetId = (urlSetId: string, bookId: string, chapterId: string): string => {
    // セット番号（01など）のみが渡された場合
    if (!urlSetId.includes('-')) {
      // 英語のセットならE01、数学ならM01のようにする
      let prefix = 'E';
      if (bookId.startsWith('math')) {
        prefix = 'M';
      } else if (bookId.startsWith('sci')) {
        prefix = 'S';
      }
      
      // 参考書番号を抽出（eng-01 -> 01）
      const bookNumber = bookId.split('-').pop() || '01';
      
      // 章番号をフォーマット（ch00 -> 00）
      const chapterNumber = chapterId.replace('ch', '');
      
      // データベース形式の完全なセットID (E01-C00-01)
      return `${prefix}${bookNumber}-C${chapterNumber}-${urlSetId}`;
    }
    
    // 既にフォーマットされている（eng-CH00-01）場合、データベース形式に変換
    if (urlSetId.includes('-')) {
      const parts = urlSetId.split('-');
      if (parts.length >= 3) {
        // 最初の部分が科目コード
        let prefix = 'E'; // デフォルト英語
        if (parts[0] === 'math') {
          prefix = 'M';
        } else if (parts[0] === 'sci') {
          prefix = 'S';
        }
        
        // 参考書番号を抽出
        const bookNumber = bookId.split('-').pop() || '01';
        
        // 章番号を抽出して形式変換 (CH00 -> C00)
        const chapterCode = parts[1].replace('CH', 'C');
        
        // 最後の部分がセット番号
        const setNumber = parts[2];
        
        return `${prefix}${bookNumber}-${chapterCode}-${setNumber}`;
      }
    }
    
    // 変換できない場合は元のまま返す
    return urlSetId;
  };
  
  // データベース形式のセットID
  const dbSetId = setId ? convertSetId(setId, bookId, chapterId) : '';
  console.log(`URL形式のセットID: ${setId} → DB形式のセットID: ${dbSetId}`);

  // 章IDとセットIDに基づいて問題を取得 - 最適化されたAPIを使用
  const { data: allQuestions, isLoading } = useQuery({
    queryKey: ['test-questions', bookId, chapterId, dbSetId],
    queryFn: async () => {
      console.log(`テスト問題データを取得中: bookId=${bookId}, chapterId=${chapterId}, setId=${dbSetId}`);
      
      // 新しいテスト問題専用APIを使用
      let url = `/api/test-questions?bookId=${bookId}&chapterId=${chapterId}`;
      if (dbSetId) {
        url += `&setId=${dbSetId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('テスト問題の取得に失敗しました');
      }
      
      const data = await response.json();
      console.log(`テスト問題データを取得: ${data.length}件`);
      
      if (data.length === 0) {
        console.warn('章に問題が見つかりませんでした:', chapterId);
        throw new Error('問題が見つかりませんでした。別の章を選択してください。');
      }
      
      return data; // サーバー側ですでに処理済み（シャッフル、最大10問選択など）
    }
  });
  
  // 参考書と章の情報を取得
  const { data: textbookData } = useQuery({
    queryKey: ['textbook', bookId],
    queryFn: async () => {
      const response = await fetch(`/api/textbooks`);
      if (!response.ok) {
        throw new Error('参考書データの取得に失敗しました');
      }
      
      const data = await response.json();
      return data.find((t: any) => t.bookId === bookId);
    }
  });
  
  const { data: chapterData } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: async () => {
      const response = await fetch(`/api/chapters?textbookIds=${bookId}`);
      if (!response.ok) {
        throw new Error('章データの取得に失敗しました');
      }
      
      const data = await response.json();
      return data.find((c: any) => c.chapterId === chapterId);
    }
  });

  // データが読み込まれたら問題を設定
  useEffect(() => {
    if (allQuestions && allQuestions.length > 0) {
      console.log('APIから取得した問題:', allQuestions);
      
      // サーバー側で既にシャッフルと選択が完了している
      // 必要に応じて追加の処理を行う
      const processedQuestions = allQuestions.map(q => {
        // デバッグ情報を表示
        console.log('問題ID:', q.questionId);
        console.log('質問テキスト:', q.questionText);
        console.log('正解ラベル:', q.correctAnswer);
        
        // 正解の選択肢の内容を確認
        const choices = {
          'A': q.optionA,
          'B': q.optionB,
          'C': q.optionC,
          'D': q.optionD
        };
        
        console.log('選択肢マップ:', choices);
        
        // そのまま返す（shuffledChoicesはサーバーから提供される）
        return {
          ...q
        };
      });
      
      setQuestions(processedQuestions);
      setScore({ correct: 0, total: processedQuestions.length });
    }
  }, [allQuestions]);

  // 現在の問題を取得
  const currentQuestion = questions[currentQuestionIndex];

  // correctOptionContentをステート変数として追加
  const [correctOptionContent, setCorrectOptionContent] = useState<string | null>(null);

  // 正解の選択肢を設定する関数
  const initializeCorrectAnswer = (question: any) => {
    if (!question) return;
    
    // サーバー側で提供される元の正解情報を使用
    if (question.originalCorrectText) {
      console.log('問題ID', question.questionId);
      console.log('サーバーから送信された元の正解内容:', question.originalCorrectText);
      return;
    }
    
    // バックアップ: 選択肢のインデックスと正解のマッピング
    const correctAnswerMap: { [key: string]: string } = {
      'A': question.option_a,
      'B': question.option_b,
      'C': question.option_c,
      'D': question.option_d
    };
    
    // 正解の選択肢の内容
    const correctLabel = question.correct_answer || question.correctAnswer;
    
    console.log('問題ID:', question.question_id || question.questionId);
    console.log('質問テキスト:', question.questionText);
    console.log('正解ラベル:', correctLabel);
    
    // 正解ラベルが存在しない場合、デフォルトでAを使用
    if (!correctLabel) {
      console.warn('正解ラベルが指定されていません。デフォルトでAを使用します。');
      const defaultContent = correctAnswerMap['A'];
      setCorrectOptionContent(defaultContent);
      return;
    }
    
    const correctContent = correctAnswerMap[correctLabel];
    console.log('正解内容:', correctContent);
    console.log('選択肢マップ:', correctAnswerMap);
    
    if (correctContent) {
      setCorrectOptionContent(correctContent);
      
      // グローバル変数として保存して、どこからでも参照できるようにする
      (window as any).testDebugInfo = {
        ...(window as any).testDebugInfo || {},
        [question.question_id || question.questionId]: {
          correctLabel,
          correctContent,
          options: correctAnswerMap
        }
      };
    } else {
      console.error('正解の選択肢が見つかりませんでした。', correctLabel, correctAnswerMap);
    }
  };

  // 問題が変わるたびに初期化
  useEffect(() => {
    if (currentQuestion) {
      initializeCorrectAnswer(currentQuestion);
    }
  }, [currentQuestion, currentQuestionIndex]);

  // 回答選択ハンドラ
  const handleSelectAnswer = (answer: string) => {
    if (showResult) return; // 既に結果表示中なら何もしない
    
    setSelectedAnswer(answer);
    
    // 元の選択肢のマッピング
    const originalOptions = {
      'A': currentQuestion.optionA || currentQuestion.option_a,
      'B': currentQuestion.optionB || currentQuestion.option_b,
      'C': currentQuestion.optionC || currentQuestion.option_c,
      'D': currentQuestion.optionD || currentQuestion.option_d
    };
    
    // 正解のラベル（A, B, C, D）を取得
    const correctLabel = currentQuestion.correct_answer || currentQuestion.correctAnswer;
    
    if (!correctLabel) {
      console.error('正解ラベルが見つかりません:', currentQuestion);
      return;
    }
    
    // サーバーが提供する元の正解情報を使用（サーバー側でシャッフル処理済み）
    let correctContent = "";
    let isCorrectAnswer = false;
    
    if (currentQuestion.originalCorrectText) {
      // サーバー側で処理された正解の内容を使用（推奨）
      correctContent = currentQuestion.originalCorrectText;
      isCorrectAnswer = answer === correctContent;
      
      console.log('サーバー提供の正解内容:', correctContent);
    } else {
      // バックアップ: 元の選択肢から正解を取得
      const correctKey = correctLabel as keyof typeof originalOptions;
      correctContent = originalOptions[correctKey];
      isCorrectAnswer = answer === correctContent;
      
      console.log('選択肢マップから取得した正解内容:', correctContent);
    }
    
    console.log('ユーザー回答:', answer);
    console.log('正解判定:', isCorrectAnswer);
    
    // 状態を更新
    setIsCorrect(isCorrectAnswer);
    setCorrectOptionContent(correctContent);
    setShowResult(true);
    
    // ユーザーの回答を記録
    setUserAnswers([...userAnswers, {
      questionId: currentQuestion.questionId || currentQuestion.question_id,
      userAnswer: answer,
      isCorrect: isCorrectAnswer
    }]);
    
    // 正解数を更新
    if (isCorrectAnswer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
  };

  // 次の問題へ進むハンドラ
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // テスト完了
      setTestCompleted(true);
    }
  };

  // テスト結果ページに戻るハンドラ
  const handleBackToResults = () => {
    window.location.href = `/subject/${params.subject}/take-test`;
  };

  // 再テスト
  const handleRetakeTest = () => {
    // 同じ章の別のセットで再テスト
    window.location.reload();
  };
  
  // 参考書ページ参照をクリックしたときの処理
  const handlePageClick = async (pageRef: string) => {
    setCurrentPageRef(pageRef);
    setPageContent('<p class="text-gray-500">読み込み中...</p>');
    setDialogOpen(true);
    
    // 実際のデータベースからページ内容を取得
    const content = await fetchPageContent(pageRef, bookId);
    setPageContent(content);
  };
  
  // 問題の解説から参考書の複数ページを参照するための処理
  const handleViewReference = async (bookId: string, pageRefs: string[]) => {
    if (!pageRefs || pageRefs.length === 0) return;
    
    // 読み込み中の表示
    setCurrentPageRef(pageRefs.join(", "));
    setPageContent('<p class="text-gray-500">読み込み中...</p>');
    setDialogOpen(true);
    
    try {
      // 複数のページを順番に取得して内容を連結
      let combinedContent = '';
      
      for (const pageRef of pageRefs) {
        const content = await fetchPageContent(pageRef, bookId);
        // ページごとに区切り線を追加（最初のページ以外）
        if (combinedContent) {
          combinedContent += '<hr class="my-4 border-gray-300" />';
        }
        combinedContent += content;
      }
      
      setPageContent(combinedContent);
    } catch (error) {
      console.error('参考書ページ取得エラー:', error);
      setPageContent('<p class="text-red-500">参考書ページの取得中にエラーが発生しました。</p>');
    }
  };

  // 読み込み中の表示
  if (isLoading || !textbookData || !chapterData) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-[50px] w-full mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // テスト完了時の結果表示


  if (testCompleted) {
    const correctPercentage = Math.round((score.correct / score.total) * 100);
    
    return (
      <div className="container mx-auto px-4 py-8">
        {/* 参考書ページダイアログ */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                参考書ページ {currentPageRef}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-white rounded-lg">
              <div 
                dangerouslySetInnerHTML={{ __html: pageContent }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </DialogContent>
        </Dialog>
        
        {/* フィードバックダイアログ */}
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                フィードバックを送信
              </DialogTitle>
              <DialogDescription>
                このテストや問題に関するご意見をお聞かせください。
              </DialogDescription>
            </DialogHeader>
            
            {feedbackSubmitted ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">ありがとうございます</h3>
                <p className="text-center text-sm text-gray-500 mb-4">
                  フィードバックを受け取りました。<br />ご協力いただきありがとうございます。
                </p>
                <Button variant="outline" onClick={() => {
                  setFeedbackDialogOpen(false);
                  // ダイアログを閉じた後、少し時間をおいてからリセット
                  setTimeout(() => setFeedbackSubmitted(false), 500);
                }}>
                  閉じる
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-type">フィードバックの種類</Label>
                  <Select value={feedbackType} onValueChange={setFeedbackType}>
                    <SelectTrigger id="feedback-type">
                      <SelectValue placeholder="フィードバックの種類を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="問題に対するフィードバック">問題に対するフィードバック</SelectItem>
                      <SelectItem value="テスト結果に対するフィードバック">テスト結果に対するフィードバック</SelectItem>
                      <SelectItem value="参考書表示に対するフィードバック">参考書表示に対するフィードバック</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedback-issues">問題のカテゴリ（複数選択可）</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['正解が間違っている', '解説が不十分', '問題の内容が不明確', 'ページ参照が間違っている', 'システムの動作が遅い'].map((issue) => (
                      <div key={issue} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`issue-${issue}`} 
                          checked={feedbackIssues.includes(issue)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFeedbackIssues([...feedbackIssues, issue]);
                            } else {
                              setFeedbackIssues(feedbackIssues.filter(i => i !== issue));
                            }
                          }}
                        />
                        <label
                          htmlFor={`issue-${issue}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {issue}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedback-content">詳細なフィードバック</Label>
                  <Textarea
                    id="feedback-content"
                    placeholder="詳細をご記入ください..."
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={feedbackSubmitting}
                    onClick={() => {
                      setFeedbackSubmitting(true);
                      
                      // フィードバックデータをコンソールに出力（この部分は開発段階）
                      console.log('送信されたフィードバック:', {
                        feedbackType,
                        feedbackCategories: feedbackIssues,
                        feedbackContent,
                        bookId: params?.bookId,
                        chapterId: params?.chapterId,
                        questionId: testCompleted ? null : questions[currentQuestionIndex]?.questionId
                      });
                      
                      // 実際のAPIが実装されるまで、フロントエンドでの動作をシミュレート
                      setTimeout(() => {
                        setFeedbackSubmitting(false);
                        setFeedbackSubmitted(true);
                        
                        // フォームをリセット
                        setFeedbackContent("");
                        setFeedbackIssues([]);
                        
                        // ローカルストレージに保存（開発用）
                        try {
                          const storedFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
                          storedFeedback.push({
                            id: Date.now(),
                            date: new Date().toISOString(),
                            type: feedbackType,
                            categories: feedbackIssues,
                            content: feedbackContent,
                            bookId: params?.bookId,
                            chapterId: params?.chapterId,
                            questionSetId: params?.setId
                          });
                          localStorage.setItem('userFeedback', JSON.stringify(storedFeedback));
                        } catch (e) {
                          console.error('フィードバックのローカル保存エラー:', e);
                        }
                      }, 1000);
                    }}
                  >
                    {feedbackSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        送信中...
                      </>
                    ) : "送信する"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-gray-700">
            ダッシュボード
          </Link>
          <span className="mx-2">›</span>
          <Link href={`/subject/${subjectName}`} className="hover:text-gray-700">
            {subjectName}
          </Link>
          <span className="mx-2">›</span>
          <Link href={`/subject/${subjectName}/take-test`} className="hover:text-gray-700">
            テスト選択
          </Link>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-900">テスト結果</span>
        </div>
      
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader style={{ backgroundColor: subjectColor }} className="text-white">
            <CardTitle>テスト結果</CardTitle>
            <CardDescription className="text-white opacity-90">
              {textbookData.title} - {chapterData.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-lg font-bold">得点: {score.correct}/{score.total}</p>
                <p className="text-sm text-gray-500">正答率: {correctPercentage}%</p>
              </div>
              <div className="text-2xl font-bold" style={{ color: correctPercentage >= 70 ? 'green' : 'red' }}>
                {correctPercentage >= 70 ? '合格' : '不合格'}
              </div>
            </div>
            
            {/* フィードバックボタンを追加 */}
            <div className="mb-6 mt-4 border rounded-lg p-4 bg-gray-50">
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setFeedbackDialogOpen(true)}
              >
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  フィードバックを送信する
                </span>
              </Button>
            </div>
            
            <h3 className="font-bold text-lg mb-4">問題解答</h3>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const answer = userAnswers.find(a => a.questionId === (question.questionId || question.question_id));
                
                return (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 font-medium flex justify-between">
                      <span>問題 {index + 1}</span>
                      {answer && (
                        <span className={answer.isCorrect ? 'bg-green-100 text-green-800 font-medium px-2 py-1 rounded flex items-center' : 'bg-red-100 text-red-800 font-medium px-2 py-1 rounded flex items-center'}>
                          {answer.isCorrect ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              正解
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              不正解
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="mb-3">{question.questionText}</p>
                      
                      {answer && (
                        <>
                          <p className="text-sm bg-gray-50 p-2 rounded mt-2 mb-2">
                            <span className="font-medium">あなたの回答: </span>
                            <span className={answer.isCorrect 
                              ? 'bg-green-100 text-green-800 font-medium px-2 py-1 rounded' 
                              : 'bg-red-100 text-red-800 font-medium px-2 py-1 rounded'
                            }>
                              {answer.userAnswer}
                            </span>
                          </p>
                          {!answer.isCorrect && (
                            <>
                              <p className="text-sm bg-gray-50 p-2 rounded mb-2">
                                <span className="font-medium">正解: </span>
                                <span className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded">
                                  {(() => {
                                    try {
                                      // 解説から正解だけを表示するのではなく、正しい選択肢の内容を表示
                                      
                                      // サーバー側から取得した正解選択肢のラベル（A, B, C, D）
                                      const correctLabel = question.correctAnswer;
                                      if (!correctLabel) return "不明";
                                      
                                      console.log('問題ID', question.questionId);
                                      console.log('正解ラベル', correctLabel);
                                      
                                      // 元の選択肢オブジェクト
                                      const originalOptions = {
                                        'A': question.optionA,
                                        'B': question.optionB,
                                        'C': question.optionC,
                                        'D': question.optionD
                                      };
                                      
                                      // サーバーから受け取った元の正解内容を使用
                                      if (question.originalCorrectText) {
                                        console.log('サーバーから送信された元の正解内容:', question.originalCorrectText);
                                        return question.originalCorrectText;
                                      }
                                      
                                      // 元データがなければ従来の方法で取得
                                      console.log('正解ラベル:', correctLabel);
                                      
                                      // それ以外はデータベースの元の選択肢から正解を取得
                                      const correctContent = originalOptions[correctLabel as keyof typeof originalOptions];
                                      console.log('元の選択肢から正解内容を取得:', correctContent);
                                      return correctContent;
                                    } catch (error) {
                                      console.error('正解表示でエラーが発生しました:', error);
                                      return "表示エラー";
                                    }
                                  })()}
                                </span>
                              </p>
                              {question?.explanation && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                                  <p className="font-medium mb-1">解説:</p>
                                  <p className="mb-2">{question.explanation}</p>
                                  
                                  {/* ページ参照があるかチェック */}
                                  {extractPageNumbers(question.explanation).length > 0 && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="mt-2 flex items-center gap-1"
                                      onClick={() => {
                                        // 解説から全てのページ番号を抽出
                                        const pageRefs = extractPageNumbers(question.explanation);
                                        if (pageRefs.length === 0) return;
                                        
                                        // 複数ページの参照処理を実行
                                        handleViewReference(question.bookId, pageRefs);
                                      }}
                                    >
                                      <BookOpen className="h-4 w-4" />
                                      参考書を確認 ({extractPageNumbers(question.explanation).join(", ")})
                                    </Button>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 justify-end bg-gray-50 p-4">
            <Button variant="outline" onClick={handleBackToResults}>
              テスト選択に戻る
            </Button>
            <Button onClick={handleRetakeTest}>
              もう一度テストする
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
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
        <Link href={`/subject/${subjectName}/take-test`} className="hover:text-gray-700">
          テスト選択
        </Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-gray-900">テスト問題</span>
      </div>
    
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader style={{ backgroundColor: subjectColor }} className="text-white">
          <CardTitle>{textbookData.title}</CardTitle>
          <CardDescription className="text-white opacity-90">
            {chapterData.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 grid grid-cols-[1fr_auto] gap-2 items-center">
            <div>
              <p className="text-sm font-medium">
                問題 {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="text-sm font-medium text-right">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
            <Progress
              value={((currentQuestionIndex + 1) / questions.length) * 100}
              className="col-span-2"
            />
          </div>
          
          {currentQuestion && (
            <div className="space-y-6">
              <p className="text-lg">{currentQuestion.questionText}</p>
              
              <div className="space-y-3">
                {/* 選択肢をシャッフルして表示 */}
                {(currentQuestion.shuffledChoices || []).map((choice, index) => (
                  <Button
                    key={index}
                    className={`w-full text-left justify-start p-4 h-auto ${
                      showResult
                        ? selectedAnswer === choice
                          ? isCorrect
                            ? "bg-green-50 border-green-300 hover:bg-green-100"
                            : "bg-red-50 border-red-300 hover:bg-red-100"
                          : ""
                        : ""
                    }`}
                    variant={selectedAnswer === choice ? "default" : "outline"}
                    onClick={() => handleSelectAnswer(choice)}
                    disabled={showResult}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          selectedAnswer === choice
                            ? isCorrect
                              ? "bg-green-500 text-white"
                              : showResult
                              ? "bg-red-500 text-white"
                              : "bg-primary text-white"
                            : "border border-muted"
                        }`}
                      >
                        {/* アルファベットではなく選択肢のインデックスを表示 */}
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-gray-900 font-medium">{choice}</div>
                    </div>
                  </Button>
                ))}
              </div>
              
              {showResult && (
                <div className="mt-6 border-t pt-4">
                  <div className={isCorrect ? "text-green-600" : "text-red-600"}>
                    <p className="font-bold flex items-center">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          正解です！
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-5 w-5" />
                          不正解です
                        </>
                      )}
                    </p>
                    {!isCorrect && correctOptionContent && (
                      <p className="mt-2">
                        正解: <span className="font-medium">{correctOptionContent}</span>
                      </p>
                    )}
                    {!isCorrect && currentQuestion.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="font-medium">解説:</p>
                        <p>{currentQuestion.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 p-4">
          <Button
            variant="outline"
            onClick={handleBackToResults}
          >
            テスト選択に戻る
          </Button>
          {showResult && (
            <Button
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex < questions.length - 1 ? "次の問題" : "結果を見る"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestSession;