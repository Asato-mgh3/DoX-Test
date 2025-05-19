import { Link } from "wouter";
import { cn } from "@/lib/utils";

// 教科（大分類）のタイプ
export type CategoryType = "英語" | "国語" | "数学" | "理科" | "社会" | "資格試験";

// 科目（詳細）のタイプ
export type SubjectType = 
  | "英語" | "リーディング" | "リスニング" | "スピーキング" | "ライティング" 
  | "現代文" | "古文" | "漢文" | "小論文" 
  | "数学" | "数学I" | "数学A" | "数学II" | "数学B" | "数学III" | "数学C"
  | "物理" | "化学" | "生物" | "地学" 
  | "世界史" | "日本史" | "地理" | "公民" | "倫理" | "政治経済" | "情報"
  | "資格試験";

// 任意の教科または科目に対応するタイプ
export type AnySubjectType = CategoryType | SubjectType;

// 科目データタイプ
export interface SubjectData {
  name: string;
  id: string;
  progress: number;
  testsCount: number;
  materialCount?: number;
}

interface SubjectCardProps {
  subject: AnySubjectType;
  progress: number;
  testsCount: number;
  materialCount?: number;
  isCategory?: boolean;
}

// 教科（カテゴリ）から科目一覧ページへのリンクパスを取得
export const getCategoryPath = (category: CategoryType): string => {
  return `/subjects/${category}`;
};

// 科目から詳細ページへのリンクパスを取得
export const getSubjectPath = (subject: SubjectType): string => {
  return `/subject/${subject}`;
};

// 教科または科目のカラーテーマを取得
export const getSubjectColor = (subject: AnySubjectType): string => {
  // 教科（大分類）の場合
  if (subject === "英語") return "english";
  if (subject === "国語" || ["現代文", "古文", "漢文", "小論文"].includes(subject as SubjectType)) return "japanese";
  if (subject === "数学" || ["数学I", "数学A", "数学II", "数学B", "数学III", "数学C"].includes(subject as SubjectType)) return "math";
  if (subject === "理科" || ["化学", "物理", "生物", "地学"].includes(subject as SubjectType)) return "science";
  if (subject === "社会" || ["世界史", "日本史", "地理", "公民", "倫理", "政治経済"].includes(subject as SubjectType)) return "social";
  if (subject === "情報") return "info";
  if (subject === "資格試験") return "certification";
  return "math"; // Default
};

// 教科または科目の背景色を取得
export const getBackgroundColor = (subject: AnySubjectType): string => {
  // 教科（大分類）の場合
  if (subject === "英語" || ["リーディング", "リスニング", "スピーキング", "ライティング"].includes(subject as SubjectType)) return "#1A3B3B"; // 深緑色に統一
  if (subject === "国語" || ["現代文", "古文", "漢文", "小論文"].includes(subject as SubjectType)) return "#781D33";
  if (subject === "数学" || ["数学I", "数学A", "数学II", "数学B", "数学III", "数学C"].includes(subject as SubjectType)) return "#142B50";
  if (subject === "理科" || ["化学", "物理", "生物", "地学"].includes(subject as SubjectType)) return "#57386B";
  if (subject === "社会" || ["世界史", "日本史", "地理", "公民", "倫理", "政治経済"].includes(subject as SubjectType)) return "#DE721A";
  if (subject === "情報") return "#2A7847";
  if (subject === "資格試験") return "#37474F"; // より濃い深みのあるスレートブルー
  return "#142B50"; // Default
};

export const SubjectCard = ({ subject, progress, testsCount, materialCount, isCategory = false }: SubjectCardProps) => {
  const backgroundColor = getBackgroundColor(subject);
  
  // リンク先のパスを決定（教科か科目かで分岐）
  const linkPath = isCategory 
    ? `/subjects/${subject}` // 教科→科目選択ページへ
    : `/subject/${subject}`; // 科目→詳細ページへ
  
  return (
    <Link 
      href={linkPath}
      className="block"
    >
      <div 
        className="h-[120px] flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow text-white rounded-xl"
        style={{ backgroundColor }}
      >
        <div className="text-3xl mb-2">
          {subject === "英語" ? (
            // 英語アイコン - ABCを斜めに配置
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <text x="2" y="9" fontSize="11.5" fontWeight="bold" fill="currentColor" stroke="none">A</text>
              <text x="8" y="14" fontSize="11.5" fontWeight="bold" fill="currentColor" stroke="none">B</text>
              <text x="14" y="19" fontSize="11.5" fontWeight="bold" fill="currentColor" stroke="none">C</text>
            </svg>
          ) : subject === "国語" ? (
            // 国語アイコン - 本のみ
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          ) : subject === "数学" ? (
            // 数学アイコン - 非常にシンプルな電卓と数学記号
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* 電卓本体 */}
              <rect x="3" y="2" width="18" height="20" rx="2" />
              {/* 画面部分 */}
              <rect x="5" y="4" width="14" height="5" fill="none" />
              {/* 数学記号：プラス */}
              <line x1="8" y1="14" x2="12" y2="14" strokeWidth="2" />
              <line x1="10" y1="12" x2="10" y2="16" strokeWidth="2" />
              {/* 数学記号：マイナス */}
              <line x1="14" y1="14" x2="18" y2="14" strokeWidth="2" />
              {/* 数学記号：掛け算 */}
              <line x1="7" y1="19" x2="11" y2="19" strokeWidth="2" />
              {/* 数学記号：等号 */}
              <line x1="14" y1="18" x2="18" y2="18" strokeWidth="2" />
              <line x1="14" y1="20" x2="18" y2="20" strokeWidth="2" />
            </svg>
          ) : subject === "理科" ? (
            // 理科アイコン - 三角フラスコ
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
              <path d="M8.5 2h7" />
              <path d="M7 16h10" />
            </svg>
          ) : subject === "社会" ? (
            // 社会アイコン - シンプルな地球
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          ) : subject === "資格試験" ? (
            // 資格試験アイコン - パソコンとメダル
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="5" width="16" height="10" rx="2" />
              <path d="M12 15v2" />
              <path d="M8 19h8" />
              <circle cx="19" cy="5" r="3" />
              <path d="M17 7 19 9 21 7" />
            </svg>
          ) : (
            // デフォルトアイコン
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          )}
        </div>
        <div className="font-medium">{subject}</div>
      </div>
    </Link>
  );
};

export default SubjectCard;
