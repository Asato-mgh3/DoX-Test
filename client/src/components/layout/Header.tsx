import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Home, FileText, BarChart2, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl">
            Do Test
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm flex items-center gap-1 text-gray-700 hover:text-black"
            >
              <Home className="h-4 w-4" />
              ダッシュボード
            </Link>
            <Link
              href="/tests"
              className="text-sm flex items-center gap-1 text-gray-700 hover:text-black"
            >
              <FileText className="h-4 w-4" />
              テスト一覧
            </Link>
            <Link
              href="/history"
              className="text-sm flex items-center gap-1 text-gray-700 hover:text-black"
            >
              <BarChart2 className="h-4 w-4" />
              履歴
            </Link>
            <Link
              href="/analytics"
              className="text-sm flex items-center gap-1 text-gray-700 hover:text-black"
            >
              <BarChart2 className="h-4 w-4" />
              分析
            </Link>
            <Link
              href="/settings"
              className="text-sm flex items-center gap-1 text-gray-700 hover:text-black"
            >
              <Settings className="h-4 w-4" />
              設定
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-2">
            <div className="font-medium text-sm">田中 ユキ</div>
            <div className="text-xs text-muted-foreground">無料プラン</div>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}