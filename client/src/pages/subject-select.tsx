import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SubjectType, getBackgroundColor, getSubjectColor } from "@/components/dashboard/SubjectCard";

interface SubjectData {
  name: string;
  id: string;
  progress: number;
  testsCount: number;
}

// 教科カテゴリごとの科目マッピング
const subjectsByCategory: Record<string, SubjectData[]> = {
  "英語": [
    { name: "英語", id: "英語", progress: 65, testsCount: 4 },
    { name: "リーディング", id: "リーディング", progress: 60, testsCount: 3 },
    { name: "リスニング", id: "リスニング", progress: 45, testsCount: 2 },
    { name: "スピーキング", id: "スピーキング", progress: 30, testsCount: 2 },
    { name: "ライティング", id: "ライティング", progress: 40, testsCount: 2 },
  ],
  "国語": [
    { name: "現代文", id: "現代文", progress: 75, testsCount: 5 },
    { name: "古文", id: "古文", progress: 40, testsCount: 3 },
    { name: "漢文", id: "漢文", progress: 35, testsCount: 2 },
    { name: "小論文", id: "小論文", progress: 25, testsCount: 1 },
  ],
  "数学": [
    { name: "数学I", id: "数学I", progress: 80, testsCount: 6 },
    { name: "数学A", id: "数学A", progress: 70, testsCount: 5 },
    { name: "数学II", id: "数学II", progress: 50, testsCount: 4 },
    { name: "数学B", id: "数学B", progress: 40, testsCount: 3 },
    { name: "数学III", id: "数学III", progress: 30, testsCount: 2 },
    { name: "数学C", id: "数学C", progress: 20, testsCount: 1 },
  ],
  "理科": [
    { name: "物理", id: "物理", progress: 60, testsCount: 4 },
    { name: "化学", id: "化学", progress: 65, testsCount: 5 },
    { name: "生物", id: "生物", progress: 70, testsCount: 6 },
    { name: "地学", id: "地学", progress: 40, testsCount: 3 },
  ],
  "社会": [
    { name: "世界史", id: "世界史", progress: 50, testsCount: 3 },
    { name: "日本史", id: "日本史", progress: 60, testsCount: 4 },
    { name: "地理", id: "地理", progress: 45, testsCount: 3 },
    { name: "公民", id: "公民", progress: 35, testsCount: 2 },
    { name: "倫理", id: "倫理", progress: 25, testsCount: 1 },
    { name: "政治経済", id: "政治経済", progress: 30, testsCount: 2 },
  ],
};

export default function SubjectSelectPage() {
  // 教科名をURLから取得
  const [match, params] = useRoute("/subjects/:category");
  const category = params?.category;
  
  // リダイレクト処理
  useEffect(() => {
    if (!match) {
      window.location.href = '/dashboard';
    }
  }, [match]);

  // 仮のAPIクエリ（実際のAPIがある場合は変更）
  const { data: subjectsData } = useQuery({
    queryKey: ["/api/subjects/category", category],
    enabled: !!category,
  });

  // 現在の教科に属する科目を取得
  const subjects = category ? (subjectsByCategory[category] || []) : [];

  if (!match || !category) return null;

  return (
    <>
      <Helmet>
        <title>{category}の科目一覧 - Do-Test</title>
        <meta name="description" content={`${category}に関連する科目一覧です。科目を選択して学習を始めましょう。`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* パンくずリスト */}
        <div className="flex items-center text-sm mb-6 text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700">
            ダッシュボード
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-gray-900">{category}</span>
        </div>

        {/* 教科ヘッダー */}
        <div 
          className="text-white rounded-xl p-6 mb-8" 
          style={{ backgroundColor: getBackgroundColor(category as any) }}
        >
          <h1 className="text-3xl font-bold">{category}の科目一覧</h1>
          <p className="mt-2 opacity-90">
            学習したい科目を選択して、教材やテストにアクセスしましょう。
          </p>
        </div>

        {/* 科目一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {subjects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              この教科には科目がありません。
            </div>
          ) : (
            subjects.map((subject, index) => (
              <Link key={index} href={`/subject/${subject.id}`}>
                <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full cursor-pointer">
                  <div
                    className="h-2"
                    style={{ backgroundColor: getBackgroundColor(subject.id as any) }}
                  ></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{subject.name}</h3>
                      <span className="text-sm text-gray-500">
                        {subject.testsCount} テスト
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${subject.progress}%`,
                            backgroundColor: getBackgroundColor(subject.id as any),
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>進捗状況</span>
                        <span>{subject.progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}