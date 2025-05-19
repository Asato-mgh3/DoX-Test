import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, BookOpenIcon, BrainIcon } from "lucide-react";
import SubjectCard, { 
  CategoryType, 
  getBackgroundColor 
} from "@/components/dashboard/SubjectCard";

// 固定の教科データ
const CATEGORIES: { name: CategoryType; progress: number; testsCount: number }[] = [
  { name: "英語", progress: 65, testsCount: 7 },
  { name: "国語", progress: 70, testsCount: 11 },
  { name: "数学", progress: 75, testsCount: 21 },
  { name: "理科", progress: 60, testsCount: 18 },
  { name: "社会", progress: 55, testsCount: 12 },
  { name: "資格試験", progress: 35, testsCount: 5 },
];

export default function DashboardPage() {
  // APIがある場合はそちらを使用
  const { data: apiSubjects, isLoading } = useQuery<any[]>({
    queryKey: ["/api/subjects"],
    enabled: false, // 一時的に無効化（固定データを使用）
  });

  // 最近のテスト結果を取得（実際のAPIがある場合はそちらを使用）
  const recentTests: any[] = [];

  return (
    <>
      <Helmet>
        <title>ダッシュボード - Do-Test</title>
        <meta name="description" content="各教科の学習状況や最近のテスト結果を確認できます。" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-gray-600 mb-8">各教科の学習状況や最近のテスト結果を確認できます。</p>

        {/* クイックアクションセクション */}
        <div className="mb-10">
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>よく使う機能にすぐにアクセスできます</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-dashed hover:border-gray-400 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                  <div className="rounded-full bg-blue-100 p-3 mb-4">
                    <PlusIcon className="h-6 w-6 text-blue-700" />
                  </div>
                  <h3 className="font-medium mb-1">新しいテストを作成</h3>
                  <p className="text-sm text-gray-500">教材書から問題を選んでテストを作成</p>
                </CardContent>
              </Card>

              <Card className="border border-dashed hover:border-gray-400 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                  <div className="rounded-full bg-purple-100 p-3 mb-4">
                    <BookOpenIcon className="h-6 w-6 text-purple-700" />
                  </div>
                  <h3 className="font-medium mb-1">保存済みテストを表示</h3>
                  <p className="text-sm text-gray-500">以前作成したテストを確認・編集</p>
                </CardContent>
              </Card>

              <Card className="border border-dashed hover:border-gray-400 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                  <div className="rounded-full bg-green-100 p-3 mb-4">
                    <BrainIcon className="h-6 w-6 text-green-700" />
                  </div>
                  <h3 className="font-medium mb-1">AIコーチに質問</h3>
                  <p className="text-sm text-gray-500">教材内容について質問・解説</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* 教科セクション */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">テストを受ける/作成する/AI学習コーチに質問する</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              CATEGORIES.map((category, index) => (
                <div key={index} className="h-full">
                  <SubjectCard
                    subject={category.name}
                    progress={category.progress}
                    testsCount={category.testsCount}
                    isCategory={true}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* 最近のテスト結果セクション */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">最近のテスト結果</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              {recentTests && recentTests.length > 0 ? (
                <div className="space-y-4">
                  {/* テスト結果表示 */}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">まだテスト結果がありません。テストを受験して結果を確認しましょう。</p>
                  <Button>テストを受験する</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 学習の進捗セクション */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">学習の進捗</h2>
            <Button variant="outline" size="sm">すべての進捗を見る</Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">学習を始めると、ここに進捗が表示されます。</p>
                <Button>教材を閲覧する</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}