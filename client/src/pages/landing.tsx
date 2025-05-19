import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="font-bold text-xl">Do Test</div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-sm text-gray-700 hover:text-black">ホーム</a>
              <a href="#features" className="text-sm text-gray-700 hover:text-black">機能</a>
              <a href="#pricing" className="text-sm text-gray-700 hover:text-black">料金プラン</a>
              <a href="#faq" className="text-sm text-gray-700 hover:text-black">よくある質問</a>
              <a href="#contact" className="text-sm text-gray-700 hover:text-black">お問い合わせ</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">ログイン</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-black text-white hover:bg-gray-800" size="sm">ダッシュボード</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50">管理者</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section id="home" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                参考書から簡単に<br />テストを作成できる<br />学習支援プラットフォーム
              </h1>
              <p className="text-xl text-gray-600">
                Do Testは、教師と学習者のための総合的な学習プラットフォームです。参考書からテストを作成し、学習進捗を管理して、AIコーチによる学習支援を受けられます。
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard">
                  <Button className="bg-black text-white hover:bg-gray-800" size="lg">
                    無料で始める
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg">
                    詳しく見る
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
                <div className="text-center px-6">
                  <h3 className="text-2xl font-bold mb-2">学習管理ダッシュボード</h3>
                  <p className="text-gray-600">テストの作成から結果分析まで、簡単に学習を管理できます</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-16">Do Testの主な機能</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 機能1: テスト作成 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-[#1D4A4A] flex items-center justify-center rounded-full mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">テスト作成機能</h3>
              <p className="text-gray-600">
                参考書から問題を選択して、オリジナルのテストを簡単に作成できます。テストはPDFやDocument形式でダウンロード可能です。
              </p>
            </div>
            
            {/* 機能2: テスト受験 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-[#781D33] flex items-center justify-center rounded-full mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">テスト受験機能</h3>
              <p className="text-gray-600">
                オンラインでテストを受験し、即時フィードバックを受け取れます。間違えた問題を重点的に復習することで、効率的に学習できます。
              </p>
            </div>
            
            {/* 機能3: AI学習コーチ */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-[#142B50] flex items-center justify-center rounded-full mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">AI学習コーチ</h3>
              <p className="text-gray-600">
                参考書に特化したAIコーチが、学習のサポートをします。わからない問題や概念について質問すると、わかりやすく解説してくれます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">シンプルな料金プラン</h2>
          <p className="text-xl text-gray-600 text-center mb-16">あなたのニーズに合わせたプランをご用意しています</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 無料プラン */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2">無料プラン</h3>
              <p className="text-gray-600 mb-6">基本的な学習機能を試すのに最適</p>
              <div className="text-4xl font-bold mb-6">¥0<span className="text-lg font-normal text-gray-600">/月</span></div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>英語の2つの参考書のみ</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>2つのAI学習コーチ</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>テスト結果60日間保存</span>
                </li>
              </ul>
              
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  無料ではじめる
                </Button>
              </Link>
            </div>
            
            {/* スタンダードプラン */}
            <div className="bg-white p-8 rounded-xl border-2 border-black relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-sm font-bold">
                人気
              </div>
              <h3 className="text-xl font-bold mb-2">スタンダードプラン</h3>
              <p className="text-gray-600 mb-6">1科目ごとに選択可能な柔軟なプラン</p>
              <div className="text-4xl font-bold mb-6">¥300<span className="text-lg font-normal text-gray-600">/月（1科目）</span></div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>選択した科目の全機能使用可能</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>+¥1,980でAI学習コーチ使い放題</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>テスト結果1年間保存</span>
                </li>
              </ul>
              
              <Link href="/dashboard?plan=standard">
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  スタンダードプランに登録
                </Button>
              </Link>
            </div>
            
            {/* プレミアムプラン */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2">プレミアムプラン</h3>
              <p className="text-gray-600 mb-6">全科目対応の総合的な学習プラン</p>
              <div className="text-4xl font-bold mb-6">¥2,980<span className="text-lg font-normal text-gray-600">/月</span></div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>全科目・全機能使用可能</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>AI学習コーチ使い放題</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>テスト結果無期限保存</span>
                </li>
              </ul>
              
              <Link href="/dashboard?plan=premium">
                <Button variant="outline" className="w-full">
                  プレミアムプランに登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* よくある質問セクション */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16">よくある質問</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Do Testはどのような人に向いていますか？</h3>
              <p className="text-gray-600">
                Do Testは主に中学生・高校生・大学受験生、および教師や塾講師の方々に向いています。テスト作成や学習管理の効率化を図りたい方に最適です。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">支払い方法は何がありますか？</h3>
              <p className="text-gray-600">
                クレジットカード（Visa、Mastercard、American Express、JCB）、PayPay、LINE Payに対応しています。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">キャンセルはいつでもできますか？</h3>
              <p className="text-gray-600">
                はい、いつでもキャンセル可能です。キャンセル後も、サブスクリプション期間終了までサービスをご利用いただけます。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">対応している教科・科目は何ですか？</h3>
              <p className="text-gray-600">
                現在、英語、数学、国語、理科（物理・化学・生物）、社会（日本史・世界史・地理・政治経済）に対応しています。今後もさらに拡大予定です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* お問い合わせセクション */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">お問い合わせ</h2>
          <p className="text-xl text-gray-600 mb-8">
            ご質問やご不明点がございましたら、お気軽にお問い合わせください。
          </p>
          <Link href="mailto:info@dotest.jp">
            <Button className="bg-black text-white hover:bg-gray-800" size="lg">
              メールでのお問い合わせ
            </Button>
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-xl mb-4">Do Test</div>
              <p className="text-gray-400">
                参考書からテストを作成できる<br />総合学習プラットフォーム
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">サービス</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">機能</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">料金プラン</a></li>
                <li><a href="/dashboard" className="text-gray-400 hover:text-white">ダッシュボード</a></li>
                <li><a href="/admin" className="text-gray-400 hover:text-white">管理者ページ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">会社情報</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">運営会社</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">プライバシーポリシー</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">利用規約</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">お問い合わせ</h3>
              <ul className="space-y-2">
                <li><a href="mailto:info@dotest.jp" className="text-gray-400 hover:text-white">info@dotest.jp</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">お問い合わせフォーム</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Do Test All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}