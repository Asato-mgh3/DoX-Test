"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 科目ごとの色を定義
const subjectColors = {
  英語: "#1D4A4A",
  国語: "#781D33",
  数学: "#142B50",
  理科: "#57386B",
  社会: "#DE721A",
}

// 参考書データ
const textbookData = {
  英語: [
    {
      id: "eng-01",
      title: "大岩のいちばんはじめの英文法",
      chapters: [
        {
          id: "ch00",
          title: "品詞 ~基本4品詞 (名詞・動詞・形容詞・副詞) ~",
          sets: ["E01-C00-01", "E01-C00-02", "E01-C00-03", "E01-C00-04"],
        },
        { id: "ch01", title: "動詞 ① ~be 動詞と一般動詞の区別~", sets: ["E01-C01-01", "E01-C01-02"] },
      ],
    },
    {
      id: "eng-02",
      title: "英単語ターゲット1900",
      chapters: [
        { id: "ch01", title: "基礎レベル 1-100", sets: ["E02-C01-01", "E02-C01-02"] },
        { id: "ch02", title: "基礎レベル 101-200", sets: ["E02-C02-01", "E02-C02-02"] },
      ],
    },
  ],
  国語: [
    {
      id: "jpn-01",
      title: "入試漢字マスター1800",
      chapters: [
        { id: "ch01", title: "常用漢字 基礎編", sets: ["J01-C01-01", "J01-C01-02"] },
        { id: "ch02", title: "常用漢字 応用編", sets: ["J01-C02-01", "J01-C02-02"] },
      ],
    },
  ],
  数学: [
    {
      id: "math-01",
      title: "基礎からの数学I・A",
      chapters: [
        { id: "ch01", title: "数と式", sets: ["M01-C01-01", "M01-C01-02"] },
        { id: "ch02", title: "2次関数", sets: ["M01-C02-01", "M01-C02-02"] },
      ],
    },
  ],
  理科: [
    {
      id: "sci-01",
      title: "化学の新研究",
      chapters: [
        { id: "ch01", title: "物質の構成", sets: ["S01-C01-01", "S01-C01-02"] },
        { id: "ch02", title: "化学反応", sets: ["S01-C02-01", "S01-C02-02"] },
      ],
    },
  ],
  社会: [
    {
      id: "soc-01",
      title: "日本史B講義の実況中継",
      chapters: [
        { id: "ch01", title: "原始・古代", sets: ["H01-C01-01", "H01-C01-02"] },
        { id: "ch02", title: "中世", sets: ["H01-C02-01", "H01-C02-02"] },
      ],
    },
  ],
}

export default function TakeTestPage({ params }: { params: { subject: string } }) {
  const router = useRouter()
  const subjectName = decodeURIComponent(params.subject)

  // 科目が存在しない場合はダッシュボードにリダイレクト
  if (!Object.keys(subjectColors).includes(subjectName)) {
    router.push("/dashboard")
    return null
  }

  const subjectColor = subjectColors[subjectName as keyof typeof subjectColors]
  const subjectTextbooks = textbookData[subjectName as keyof typeof textbookData] || []

  const [selectedBook, setSelectedBook] = useState<string>("")
  const [selectedChapter, setSelectedChapter] = useState<string>("")

  // 選択された参考書の章を取得
  const [chapters, setChapters] = useState<any[]>([])

  const updateChapters = useCallback(() => {
    setChapters(selectedBook ? subjectTextbooks.find((book) => book.id === selectedBook)?.chapters || [] : [])
  }, [selectedBook, subjectTextbooks])

  useEffect(() => {
    updateChapters()
  }, [updateChapters])

  // テスト開始ハンドラー
  const handleStartTest = () => {
    if (selectedBook && selectedChapter) {
      // 選択された章の問題セットをランダムに選択
      const book = subjectTextbooks.find((b) => b.id === selectedBook)
      const chapter = book?.chapters.find((c) => c.id === selectedChapter)

      if (book && chapter && chapter.sets.length > 0) {
        // ランダムに問題セットを選択
        const randomSetIndex = Math.floor(Math.random() * chapter.sets.length)
        const randomSet = chapter.sets[randomSetIndex]

        router.push(`/dashboard/${params.subject}/take-test/${selectedBook}/${selectedChapter}/${randomSet}`)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/dashboard/${params.subject}`}
        className="text-sm text-muted-foreground hover:text-black flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {subjectName}に戻る
      </Link>

      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 text-white" style={{ backgroundColor: subjectColor }}>
            <h1 className="text-2xl font-bold mb-2">テストを選択</h1>
            <p>{subjectName}の知識をテストして、理解度を確認しましょう。</p>
          </div>

          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="book">参考書を選択</Label>
                <Select
                  value={selectedBook}
                  onValueChange={(value) => {
                    setSelectedBook(value)
                    setSelectedChapter("")
                  }}
                >
                  <SelectTrigger id="book" className="w-full">
                    <SelectValue placeholder="参考書を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectTextbooks.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBook && (
                <div className="space-y-2">
                  <Label htmlFor="chapter">章を選択</Label>
                  <Select
                    value={selectedChapter}
                    onValueChange={(value) => {
                      setSelectedChapter(value)
                    }}
                  >
                    <SelectTrigger id="chapter" className="w-full">
                      <SelectValue placeholder="章を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <Button
                className="w-full text-white"
                style={{ backgroundColor: subjectColor }}
                onClick={handleStartTest}
                disabled={!selectedBook || !selectedChapter}
              >
                テストを開始する
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
