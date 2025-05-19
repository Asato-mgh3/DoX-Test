import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectType, getBackgroundColor } from "@/components/dashboard/SubjectCard";

interface SubjectGroup {
  category: string;
  subjects: {
    name: string;
    progress: number;
    testsCount: number;
  }[];
}

// 教科グループの定義
const SUBJECT_GROUPS = {
  language: "言語",
  math: "数学",
  science: "理科",
  society: "社会",
  other: "その他",
};

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const { data: subjects, isLoading } = useQuery<any[]>({
    queryKey: ["/api/subjects"],
  });

  // サブジェクトを教科ごとにグループ化する関数
  const groupSubjectsByCategory = (subjects: any[] | undefined): SubjectGroup[] => {
    if (!subjects) return [];
    
    // 科目を教科ごとにマッピング
    const subjectMapping: Record<string, SubjectType[]> = {
      language: ["英語", "国語", "現代文", "古文", "漢文", "小論文"],
      math: ["数学", "数学I", "数学A", "数学II", "数学B", "数学III", "数学C"],
      science: ["理科", "物理", "化学", "生物", "地学"],
      society: ["社会", "世界史", "日本史", "地理", "公民", "倫理", "政治経済"],
      other: [],
    };
    
    // 教科ごとにグループ化
    const result: SubjectGroup[] = Object.entries(SUBJECT_GROUPS).map(([key, categoryName]) => {
      const mappedSubjects = subjectMapping[key] || [];
      const filteredSubjects = subjects.filter(subject => 
        mappedSubjects.includes(subject.subject as SubjectType)
      );
      
      return {
        category: categoryName,
        subjects: filteredSubjects.map(s => ({
          name: s.subject,
          progress: s.progress,
          testsCount: s.testsCount,
        })),
      };
    });
    
    return result;
  };

  const subjectGroups = groupSubjectsByCategory(subjects);
  
  // タブでフィルタリングするために、全教科を取得
  const allSubjects = subjects || [];
  
  // カテゴリでフィルタリングされたサブジェクト
  const filteredSubjects = activeCategory === "all" 
    ? allSubjects 
    : allSubjects.filter(subject => {
        const categoryMapping: Record<string, SubjectType[]> = {
          language: ["英語", "国語", "現代文", "古文", "漢文", "小論文"],
          math: ["数学", "数学I", "数学A", "数学II", "数学B", "数学III", "数学C"],
          science: ["理科", "物理", "化学", "生物", "地学"],
          society: ["社会", "世界史", "日本史", "地理", "公民", "倫理", "政治経済"],
          other: [],
        };
        return categoryMapping[activeCategory]?.includes(subject.subject as SubjectType);
      });

  return (
    <>
      <Helmet>
        <title>Do-Test - 学習支援アプリ</title>
        <meta name="description" content="テスト作成・受験・学習支援のためのアプリケーション" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* ヒーローセクション */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 mb-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              学習をもっと効率的に
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Do-Testは、テスト作成・受験をサポートし、効率的な学習を実現するプラットフォームです。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/test-creation">
                <a className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                  テストを作成する
                </a>
              </Link>
              <button className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
                サービスについて
              </button>
            </div>
          </div>
        </div>

        {/* 教科選択セクション */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">教科を選択</h2>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
            <TabsList className="w-full bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6 flex flex-wrap">
              <TabsTrigger value="all" className="flex-1">全て</TabsTrigger>
              <TabsTrigger value="language" className="flex-1">言語</TabsTrigger>
              <TabsTrigger value="math" className="flex-1">数学</TabsTrigger>
              <TabsTrigger value="science" className="flex-1">理科</TabsTrigger>
              <TabsTrigger value="society" className="flex-1">社会</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredSubjects.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    該当する教科がありません。
                  </div>
                ) : (
                  filteredSubjects.map((subject, index) => (
                    <Link key={index} href={`/subject-select/${subject.subject}`}>
                      <a className="block">
                        <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                          <div
                            className="h-2"
                            style={{ backgroundColor: getBackgroundColor(subject.subject as SubjectType) }}
                          ></div>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold">{subject.subject}</h3>
                              <span className="text-sm text-gray-500">
                                {subject.testsCount} テスト
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full"
                                  style={{
                                    width: `${subject.progress}%`,
                                    backgroundColor: getBackgroundColor(subject.subject as SubjectType),
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
                      </a>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>
            
            {/* 各カテゴリーのタブコンテンツ */}
            {Object.entries(SUBJECT_GROUPS).map(([key, categoryName]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredSubjects.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      該当する教科がありません。
                    </div>
                  ) : (
                    filteredSubjects.map((subject, index) => (
                      <Link key={index} href={`/subject-select/${subject.subject}`}>
                        <a className="block">
                          <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                            <div
                              className="h-2"
                              style={{ backgroundColor: getBackgroundColor(subject.subject as SubjectType) }}
                            ></div>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">{subject.subject}</h3>
                                <span className="text-sm text-gray-500">
                                  {subject.testsCount} テスト
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div
                                    className="h-2.5 rounded-full"
                                    style={{
                                      width: `${subject.progress}%`,
                                      backgroundColor: getBackgroundColor(subject.subject as SubjectType),
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
                        </a>
                      </Link>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  );
}