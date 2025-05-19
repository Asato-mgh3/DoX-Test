import { Link, useLocation } from "wouter";
import {
  Book,
  GraduationCap,
  FileText,
  Brain,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarInset,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CategoryType, SubjectType, getSubjectColor as getCardColor } from "@/components/dashboard/SubjectCard";

// 教科と科目の構造を定義
interface SubjectCategory {
  name: CategoryType;
  icon: React.ReactNode;
  subjects: SubjectType[];
}

const subjectCategories: SubjectCategory[] = [
  {
    name: "英語",
    icon: <Book className="h-4 w-4" />,
    subjects: ["英語", "リーディング", "リスニング", "スピーキング", "ライティング"],
  },
  {
    name: "国語",
    icon: <Book className="h-4 w-4" />,
    subjects: ["現代文", "古文", "漢文", "小論文"],
  },
  {
    name: "数学",
    icon: <Book className="h-4 w-4" />,
    subjects: ["数学", "数学I", "数学A", "数学II", "数学B", "数学III", "数学C"],
  },
  {
    name: "理科",
    icon: <Book className="h-4 w-4" />,
    subjects: ["物理", "化学", "生物", "地学"],
  },
  {
    name: "社会",
    icon: <Book className="h-4 w-4" />,
    subjects: ["世界史", "日本史", "地理", "公民", "倫理", "政治経済"],
  },
  {
    name: "情報",
    icon: <Book className="h-4 w-4" />,
    subjects: ["情報"],
  },
];

// 教科ごとのカラー定義
const getSubjectColor = (category: string): string => {
  switch (category) {
    case "英語":
      return "english";
    case "国語":
      return "japanese";
    case "数学":
      return "math";
    case "理科":
      return "science";
    case "社会":
      return "social";
    case "情報":
      return "info";
    default:
      return "math"; // デフォルト
  }
};

export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-2">
              <GraduationCap className="h-6 w-6 mr-2" />
              <span className="text-lg font-bold">Do-Test</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>メインメニュー</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/">
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start",
                          location === "/" && "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        ダッシュボード
                      </Button>
                    </Link>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <Link href="/test-creation">
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start",
                          location === "/test-creation" && "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        テスト作成
                      </Button>
                    </Link>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <Link href="/ai-coach">
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start",
                          location === "/ai-coach" && "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        AI学習コーチ
                      </Button>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>教科と科目</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {subjectCategories.map((category) => (
                    <SidebarMenuItem key={category.name}>
                      <Collapsible
                        open={expandedCategories.includes(category.name)}
                        onOpenChange={() => toggleCategory(category.name)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className={cn(
                              "w-full justify-between px-2 py-1.5 text-sm",
                              expandedCategories.includes(category.name) && `text-${getSubjectColor(category.name)}`
                            )}
                          >
                            <div className="flex items-center">
                              {category.icon}
                              <span className="ml-2">{category.name}</span>
                            </div>
                            {expandedCategories.includes(category.name) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-6 space-y-1">
                            {category.subjects.map((subject) => (
                              <Link key={subject} href={`/subject/${subject}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start text-sm",
                                    location === `/subject/${subject}` && `text-${getSubjectColor(category.name)} font-medium`
                                  )}
                                >
                                  {subject}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <SidebarRail />
        <SidebarInset className="pb-12">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}