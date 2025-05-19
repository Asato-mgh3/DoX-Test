import { Link } from "wouter";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Do Test</h3>
            <p className="text-sm text-gray-600 mb-4">
              学習をサポートするテスト作成・受験プラットフォーム
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">コンテンツ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/tests" className="text-gray-600 hover:text-gray-900">
                  テスト一覧
                </Link>
              </li>
              <li>
                <Link href="/test-creation" className="text-gray-600 hover:text-gray-900">
                  テスト作成
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">科目</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/subject/英語" className="text-gray-600 hover:text-gray-900">
                  英語
                </Link>
              </li>
              <li>
                <Link href="/subject/数学" className="text-gray-600 hover:text-gray-900">
                  数学
                </Link>
              </li>
              <li>
                <Link href="/subject/国語" className="text-gray-600 hover:text-gray-900">
                  国語
                </Link>
              </li>
              <li>
                <Link href="/subject/理科" className="text-gray-600 hover:text-gray-900">
                  理科
                </Link>
              </li>
              <li>
                <Link href="/subject/社会" className="text-gray-600 hover:text-gray-900">
                  社会
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">サポート</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  よくある質問
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  お問い合わせ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  利用規約
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© 2025 Do Test. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}