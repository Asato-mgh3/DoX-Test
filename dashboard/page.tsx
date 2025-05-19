import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">おかえりなさい、ユキさん！</h1>
          <p className="text-muted-foreground">学習を続けましょう</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          新しいテストを作成
        </Button>
      </div>

      <h2 className="text-xl font-bold mb-4">テスト受験/テスト作成/AI学習コーチ</h2>

      {/* 科目カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Link href="/dashboard/英語">
          <Card className="h-[120px] flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow bg-[#1D4A4A] text-white rounded-xl">
            <div className="text-3xl mb-2">
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
            </div>
            <div className="font-medium">英語</div>
          </Card>
        </Link>

        <Link href="/dashboard/国語">
          <Card className="h-[120px] flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow bg-[#781D33] text-white rounded-xl">
            <div className="text-3xl mb-2">
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
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
              </svg>
            </div>
            <div className="font-medium">国語</div>
          </Card>
        </Link>

        <Link href="/dashboard/数学">
          <Card className="h-[120px] flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow bg-[#142B50] text-white rounded-xl">
            <div className="text-3xl mb-2">
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
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h10" />
                <path d="M7 12h10" />
                <path d="M7 17h10" />
              </svg>
            </div>
            <div className="font-medium">数学</div>
          </Card>
        </Link>

        <Link href="/dashboard/理科">
          <Card className="h-[120px] flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow bg-[#57386B] text-white rounded-xl">
            <div className="text-3xl mb-2">
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
                <path d="M15 3h.01" />
                <path d="M4 15h.01" />
                <path d="M20 15h.01" />
                <path d="M8.5 9h.01" />
                <path d="M12 13.5h.01" />
                <path d="M16 9.5h.01" />
                <path d="M4 22a5 5 0 0 1 5-5" />
                <path d="M19.7 6.6C20.4 7.3 21 8.1 21 9c0 2.8-4 3-4 6" />
                <path d="M9 11.5c0 1.7 1.3 3 3 3 .8 0 1.5-.3 2.1-.8" />
                <path d="M13.2 7.2C12.5 6.4 11.7 6 11 6c-2.8 0-3 4-6 4" />
              </svg>
            </div>
            <div className="font-medium">理科</div>
          </Card>
        </Link>

        <Link href="/dashboard/社会">
          <Card className="h-[120px] flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow bg-[#DE721A] text-white rounded-xl">
            <div className="text-3xl mb-2">
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
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div className="font-medium">社会</div>
          </Card>
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">学習進捗</h2>

      {/* 学習進捗 */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="space-y-6">
          {/* 英語 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#1D4A4A]"></div>
              <span className="font-medium">英語</span>
              <span className="ml-auto">75%</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">大岩のいちばんはじめの英文法</div>
            <div className="relative h-6 w-full bg-gray-100 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-[#1D4A4A] rounded-full" style={{ width: "75%" }}></div>
              <div className="absolute top-0 left-0 h-full w-full flex">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-full flex-1 border-r border-gray-200 last:border-r-0"></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>9/12 章完了</span>
              <span>100%</span>
            </div>
          </div>

          {/* 国語 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#781D33]"></div>
              <span className="font-medium">国語</span>
              <span className="ml-auto">90%</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">入試漢字マスター1800</div>
            <div className="relative h-6 w-full bg-gray-100 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-[#781D33] rounded-full" style={{ width: "90%" }}></div>
              <div className="absolute top-0 left-0 h-full w-full flex">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-full flex-1 border-r border-gray-200 last:border-r-0"></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>9/10 章完了</span>
              <span>100%</span>
            </div>
          </div>

          {/* 数学 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#142B50]"></div>
              <span className="font-medium">数学</span>
              <span className="ml-auto">45%</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">基礎からの数学I・A</div>
            <div className="relative h-6 w-full bg-gray-100 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-[#142B50] rounded-full" style={{ width: "45%" }}></div>
              <div className="absolute top-0 left-0 h-full w-full flex">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-full flex-1 border-r border-gray-200 last:border-r-0"></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>7/15 章完了</span>
              <span>100%</span>
            </div>
          </div>

          {/* 理科 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#57386B]"></div>
              <span className="font-medium">理科</span>
              <span className="ml-auto">68%</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">化学の新研究</div>
            <div className="relative h-6 w-full bg-gray-100 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-[#57386B] rounded-full" style={{ width: "68%" }}></div>
              <div className="absolute top-0 left-0 h-full w-full flex">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-full flex-1 border-r border-gray-200 last:border-r-0"></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>14/20 章完了</span>
              <span>100%</span>
            </div>
          </div>

          {/* 社会 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#DE721A]"></div>
              <span className="font-medium">社会</span>
              <span className="ml-auto">60%</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">日本史B講義の実況中継</div>
            <div className="relative h-6 w-full bg-gray-100 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-[#DE721A] rounded-full" style={{ width: "60%" }}></div>
              <div className="absolute top-0 left-0 h-full w-full flex">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-full flex-1 border-r border-gray-200 last:border-r-0"></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>11/18 章完了</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
