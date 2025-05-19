import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Book, FileText, Brain, Clock, BarChart, MessageSquare } from "lucide-react";
import { SubjectType, getBackgroundColor, getSubjectColor } from "@/components/dashboard/SubjectCard";

interface SubjectDashboardData {
  subject: SubjectType;
  textbooks: {
    id: number;
    title: string;
    publisher: string;
    progress: number;
  }[];
  recentTests: {
    id: number;
    title: string;
    date: string;
    score: number;
    totalQuestions: number;
  }[];
  recommendedTests: {
    id: number;
    title: string;
    difficulty: number;
    questionCount: number;
  }[];
}

export default function SubjectDashboard() {
  // Extract subject from URL
  const [match, params] = useRoute("/subject/:subject");
  const subject = params?.subject as SubjectType;
  
  // Redirect if no valid subject is found
  useEffect(() => {
    if (!match) {
      window.location.href = '/';
    }
  }, [match]);

  const { data: dashboardData, isLoading } = useQuery<SubjectDashboardData>({
    queryKey: ["/api/subjects", subject],
    enabled: !!subject,
  });
  
  // 安全にデータにアクセスするためのヘルパー変数を定義
  const textbooks = dashboardData?.textbooks || [];
  const recentTests = dashboardData?.recentTests || [];
  const recommendedTests = dashboardData?.recommendedTests || [];

  // ヘルパー関数はSubjectCardコンポーネントからインポート
  const subjectColor = subject ? getSubjectColor(subject) : "math";
  
  // 進捗率の計算
  const progress = textbooks.length 
    ? Math.round(textbooks.reduce((acc, book) => acc + book.progress, 0) / textbooks.length) 
    : 0;

  if (!match || !subject) return null;

  return (
    <>
      <Helmet>
        <title>{subject} ダッシュボード - Do-Test</title>
        <meta name="description" content={`${subject}の教材や進捗状況、テスト結果を確認できます。`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm mb-6 text-gray-500 dark:text-gray-400">
          <Link href="/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300">
            ダッシュボード
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-gray-900 dark:text-white">{subject}</span>
        </div>

        {/* Subject Header */}
        <div className="text-white rounded-xl p-6 mb-8" style={{ backgroundColor: getBackgroundColor(subject as SubjectType) }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">{subject}</h1>
              <p className="mt-2 opacity-90">
                教材やテストの一覧、進捗状況を確認できます。
              </p>
            </div>
          </div>
        </div>

        {/* アクションカードセクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-white mb-4"
                style={{ backgroundColor: getBackgroundColor(subject as SubjectType) }}
              >
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold mb-2">テストを受ける</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {subject}の知識をテストして、理解度を確認しましょう。
              </p>
              <Link href={`/subject/${subject}/take-test`} className="w-full">
                <Button className="w-full" style={{ backgroundColor: getBackgroundColor(subject as SubjectType), color: "white" }}>
                  テストを受ける
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-white mb-4"
                style={{ backgroundColor: getBackgroundColor(subject as SubjectType) }}
              >
                <Book className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold mb-2">教材を見る</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {subject}の教材を探索して、学習を深めましょう。
              </p>
              <Button className="w-full" style={{ backgroundColor: getBackgroundColor(subject as SubjectType), color: "white" }}>
                教材を探す
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-white mb-4"
                style={{ backgroundColor: getBackgroundColor(subject as SubjectType) }}
              >
                <Brain className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold mb-2">AIコーチに質問する</h2>
              <p className="text-sm text-muted-foreground mb-4">{subject}に関する質問にAIコーチが答えます。</p>
              <Button className="w-full" style={{ backgroundColor: getBackgroundColor(subject as SubjectType), color: "white" }}>
                AIコーチに質問する
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* タブナビゲーション */}
        <div className="mb-8">
          <Tabs defaultValue="textbooks">
            <TabsList className="w-full mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="textbooks" className="flex-1">教材一覧</TabsTrigger>
              <TabsTrigger value="tests" className="flex-1">テスト</TabsTrigger>
              <TabsTrigger value="progress" className="flex-1">進捗状況</TabsTrigger>
            </TabsList>
            
            {/* 教材と進捗 */}
            <TabsContent value="textbooks">
              <h2 className="text-lg font-bold mb-4">教材と進捗</h2>
              <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {isLoading ? (
                      Array(2).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-6 w-full bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                        </div>
                      ))
                    ) : textbooks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        教材が登録されていません。
                      </div>
                    ) : (
                      textbooks.map((textbook, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="font-medium">{textbook.title}</span>
                            <span className="text-muted-foreground">{textbook.progress}%</span>
                          </div>
                          <div className="relative">
                            <div className="h-6 w-full bg-slate-100 rounded-md overflow-hidden">
                              <div
                                className="h-full rounded-md"
                                style={{
                                  width: `${textbook.progress}%`,
                                  backgroundColor: getBackgroundColor(subject as SubjectType),
                                }}
                              >
                                <div className="flex h-full">
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="h-full border-r border-white/30 last:border-r-0"
                                      style={{ width: `${100 / 10}%` }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs mt-1 flex justify-between text-muted-foreground">
                              <span>0%</span>
                              <span>{Math.round(textbook.progress / 10)} / 10 章完了</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tests Tab */}
            <TabsContent value="tests">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      最近のテスト結果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse"></div>
                        ))}
                      </div>
                    ) : recentTests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        テスト結果がありません。
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentTests.map((test) => (
                          <div key={test.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{test.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{test.date}</p>
                              </div>
                              <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700">
                                {test.score}/{test.totalQuestions}
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${(test.score / test.totalQuestions) * 100}%`,
                                  backgroundColor: getBackgroundColor(subject as SubjectType)
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">すべての結果を見る</Button>
                  </CardFooter>
                </Card>

                {/* Recommended Tests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      おすすめのテスト
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse"></div>
                        ))}
                      </div>
                    ) : recommendedTests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        おすすめテストがありません。
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recommendedTests.map((test) => (
                          <div key={test.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{test.title}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                  {test.questionCount}問
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                  難易度: {test.difficulty}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end mt-2">
                              <Button 
                                size="sm" 
                                style={{ 
                                  backgroundColor: getBackgroundColor(subject as SubjectType),
                                  color: "white"
                                }}
                              >
                                受験する
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">すべてのテストを見る</Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="flex justify-center mt-8">
                <Button 
                  style={{ 
                    backgroundColor: getBackgroundColor(subject as SubjectType),
                    color: "white"
                  }}
                >
                  新しいテストを作成
                </Button>
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5" />
                    学習進捗の詳細
                  </CardTitle>
                  <CardDescription>
                    各教材の進捗状況と、章ごとの理解度を確認できます。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    学習を開始すると、ここに詳細な進捗が表示されます。
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}