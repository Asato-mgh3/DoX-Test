"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock, HelpCircle, XCircle, Flag, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

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

// 問題データ（実際のアプリではAPIから取得）
const questionData = {
  "eng-01": {
    ch00: {
      "E01-C00-01": [
        {
          id: "E01-C00-01-001",
          text: "英文法の学習において、最初に理解しておくべき最も基本的な4つの品詞の組み合わせとして正しいものはどれですか？",
          options: [
            { id: "A", text: "名詞、動詞、形容詞、前置詞" },
            { id: "B", text: "名詞、動詞、形容詞、副詞" },
            { id: "C", text: "名詞、代名詞、動詞、接続詞" },
            { id: "D", text: "動詞、形容詞、副詞、冠詞" },
          ],
          correctAnswer: "B",
          explanation:
            "本文P14で解説されている通り、英文法の基本となる4つの品詞は名詞、動詞、形容詞、副詞です。これらは文の主要な構成要素となります。復習はP14、P19を参照してください。",
        },
        {
          id: "E01-C00-01-002",
          text: "「人やモノや事柄などの名前を表す言葉」と定義される品詞は何ですか？",
          options: [
            { id: "A", text: "名詞" },
            { id: "B", text: "動詞" },
            { id: "C", text: "形容詞" },
            { id: "D", text: "副詞" },
          ],
          correctAnswer: "A",
          explanation:
            "名詞は、人(Michael)、モノ(desk)、事柄(idea)などの名前を表す言葉です。復習はP15を参照してください。",
        },
        {
          id: "E01-C00-01-003",
          text: "英語の名詞において、日本語と大きく異なり、特に意識する必要があると述べられている点は何ですか？",
          options: [
            { id: "A", text: "発音の仕方" },
            { id: "B", text: "数えられるか数えられないか" },
            { id: "C", text: "男性名詞か女性名詞か" },
            { id: "D", text: "単語の長さ" },
          ],
          correctAnswer: "B",
          explanation:
            "英語の名詞は「数えられる名詞」と「数えられない名詞」に分けられ、これを意識することが重要です。数えられる名詞には単数形と複数形があります。復習はP15を参照してください。",
        },
        {
          id: "E01-C00-01-004",
          text: "数えられる名詞と数えられない名詞を見分ける方法として、本文で紹介されている考え方はどれですか？",
          options: [
            { id: "A", text: "具体的な形があるかどうか" },
            { id: "B", text: "辞書に載っているかどうか" },
            { id: "C", text: "破片にしたときに名前が変わるかどうか" },
            { id: "D", text: "外来語かどうか" },
          ],
          correctAnswer: "C",
          explanation:
            "「破片にしたときに名前が変わってしまう名詞」は数えられる名詞、「破片にしても名前が変わらない名詞」は数えられない名詞と説明されています (例: pencil vs chalk)。復習はP15-P16を参照してください。",
        },
        {
          id: "E01-C00-01-005",
          text: '単語 "run" (走る) の品詞は動詞です。なぜこれが動詞であると言えるのか、その理由を最もよく説明しているものはどれですか？',
          options: [
            { id: "A", text: "移動を表す言葉だから。" },
            { id: "B", text: "主語 (例: He runs) の動きを表す言葉だから。" },
            { id: "C", text: "名詞 (例: a long run) を修飾する言葉だから。" },
            { id: "D", text: "文頭で使われることが多いから。" },
          ],
          correctAnswer: "B",
          explanation:
            '動詞の定義は「主語の動きや状態を表す言葉」です(P16)。"run" は主語の「走る」という動きを表すため動詞です。選択肢Aは意味の説明、Cは名詞としての用法、Dは文法的な役割とは直接関係ありません。復習はP16-P17を参照してください。',
        },
        {
          id: "E01-C00-01-006",
          text: "「名詞を飾る(説明する)言葉」と定義される品詞は何ですか？",
          options: [
            { id: "A", text: "名詞" },
            { id: "B", text: "動詞" },
            { id: "C", text: "形容詞" },
            { id: "D", text: "副詞" },
          ],
          correctAnswer: "C",
          explanation:
            "形容詞は、名詞がどのようなものかを説明する役割を持ちます (例: large planet)。復習はP17-P18を参照してください。",
        },
        {
          id: "E01-C00-01-007",
          text: 'a beautiful flower という表現で、"beautiful" はどの品詞に分類されますか？',
          options: [
            { id: "A", text: "名詞" },
            { id: "B", text: "動詞" },
            { id: "C", text: "形容詞" },
            { id: "D", text: "副詞" },
          ],
          correctAnswer: "C",
          explanation:
            'beautiful は名詞 "flower" を「どのような花か」を説明(修飾)しているので、形容詞です。復習はP17-P18を参照してください。',
        },
        {
          id: "E01-C00-01-008",
          text: "「名詞以外を飾る(説明する)言葉」と定義される品詞は何ですか？",
          options: [
            { id: "A", text: "名詞" },
            { id: "B", text: "動詞" },
            { id: "C", text: "形容詞" },
            { id: "D", text: "副詞" },
          ],
          correctAnswer: "D",
          explanation:
            "副詞は、動詞、形容詞、他の副詞、文全体など、名詞以外の要素を説明(修飾)します (例: very beautiful)。復習はP18-P19を参照してください。",
        },
        {
          id: "E01-C00-01-009",
          text: 'He runs fast. という文で、"fast" はどの品詞に分類されますか？',
          options: [
            { id: "A", text: "名詞" },
            { id: "B", text: "動詞" },
            { id: "C", text: "形容詞" },
            { id: "D", text: "副詞" },
          ],
          correctAnswer: "D",
          explanation:
            'fast は動詞 "runs" を「どのように走るか」を説明(修飾)しているので、副詞です。復習はP18-P19を参照してください。',
        },
        {
          id: "E01-C00-01-010",
          text: "次の単語のうち、副詞に分類されるものはどれですか？",
          options: [
            { id: "A", text: "happy" },
            { id: "B", text: "quickly" },
            { id: "C", text: "student" },
            { id: "D", text: "play" },
          ],
          correctAnswer: "B",
          explanation:
            'quickly (速く) は動詞を修飾することが多い副詞です。"happy" は形容詞、"student" は名詞、"play" は動詞です。復習はP18-P19を参照してください。',
        },
      ],
      "E01-C00-02": [
        {
          id: "E01-C00-02-001",
          text: "次の名詞のうち、「数えられない名詞」はどれですか？",
          options: [
            { id: "A", text: "dog" },
            { id: "B", text: "desk" },
            { id: "C", text: "water" },
            { id: "D", text: "pencil" },
          ],
          correctAnswer: "C",
          explanation:
            "water (水) は、少量にしても名前が変わらない物質名詞であり、数えられない名詞です。他は数えられます。復習はP15-P16, P21を参照してください。",
        },
        {
          id: "E01-C00-02-002",
          text: "次の名詞のうち、「数えられる名詞」はどれですか？",
          options: [
            { id: "A", text: "money" },
            { id: "B", text: "information" },
            { id: "C", text: "chalk" },
            { id: "D", text: "banana" },
          ],
          correctAnswer: "D",
          explanation:
            "banana (バナナ) は1本、2本と数えることができ、破片にすると名前が変わるため、数えられる名詞です。他は数えられません。復習はP15-P16, P21を参照してください。",
        },
        {
          id: "E01-C00-02-003",
          text: "数えられる名詞が複数の場合、一般的にどのような形になりますか？",
          options: [
            { id: "A", text: "語尾に -ing が付く" },
            { id: "B", text: "語尾に -s または -es が付く" },
            { id: "C", text: "語頭に a や an が付く" },
            { id: "D", text: "形は変わらない" },
          ],
          correctAnswer: "B",
          explanation:
            "数えられる名詞の複数形は、通常、語尾に -s や -es を付けて作られます (例: dog → dogs)。復習はP15を参照してください。",
        },
        {
          id: "E01-C00-02-004",
          text: "「主語の動きや状態を表す言葉」と定義される品詞は何ですか？",
          options: [
            { id: "A", text: "名詞" },
            { id: "B", text: "動詞" },
            { id: "C", text: "形容詞" },
            { id: "D", text: "副詞" },
          ],
          correctAnswer: "B",
          explanation:
            "動詞は、文の主語が何をするか、どのような状態にあるかを示します (例: Mop played)。復習はP16を参照してください。",
        },
        {
          id: "E01-C00-02-005",
          text: '単語 "important" の品詞は形容詞です。なぜこれが形容詞であると言えるのか、その理由を最もよく説明しているものはどれですか？',
          options: [
            { id: "A", text: "「重要」という意味を持つから。" },
            { id: "B", text: "動詞を修飾することがあるから。" },
            { id: "C", text: "important document のように名詞を修飾(説明)する働きがあるから。" },
            { id: "D", text: "文末で使われることが多いから。" },
          ],
          correctAnswer: "C",
          explanation:
            '形容詞の定義は「名詞を飾る(説明する)言葉」です(P17)。"important" は "document" (名詞) の性質を説明するため形容詞です。選択肢Aは意味の説明、Bは副詞の働き、Dは文法的役割とは直接関係ありません。復習はP17-P18, P21を参照してください。',
        },
        {
          id: "E01-C00-02-006",
          text: 'very large house という表現で、"very" はどの品詞に分類されますか？',
          options: [
            { id: "A", text: "名詞" },
            { id: "B", text: "動詞" },
            { id: "C", text: "形容詞" },
            { id: "D", text: "副詞" },
          ],
          correctAnswer: "D",
          explanation:
            'very は形容詞 "large" を「どの程度大きいか」を説明(修飾)しています。名詞以外(ここでは形容詞)を修飾するので副詞です。復習はP18-P19を参照してください。',
        },
        {
          id: "E01-C00-02-007",
          text: "次の単語のうち、形容詞に分類されるものはどれですか？",
          options: [
            { id: "A", text: "act" },
            { id: "B", text: "small" },
            { id: "C", text: "often" },
            { id: "D", text: "idea" },
          ],
          correctAnswer: "B",
          explanation:
            'small (小さい) は名詞を修飾する形容詞です (例: small dog)。"act" は動詞、"often" は副詞、"idea" は名詞です。復習はP17-P18を参照してください。',
        },
        {
          id: "E01-C00-02-008",
          text: "次の単語のうち、動詞に分類されるものはどれですか？",
          options: [
            { id: "A", text: "sleep" },
            { id: "B", text: "happy" },
            { id: "C", text: "mountain" },
            { id: "D", text: "always" },
          ],
          correctAnswer: "A",
          explanation:
            'sleep (眠る) は主語の状態や動きを表す動詞です。"happy" は形容詞、"mountain" は名詞、"always" は副詞です。復習はP16-P17を参照してください。',
        },
        {
          id: "E01-C00-02-009",
          text: "次の単語のうち、名詞に分類されるものはどれですか？",
          options: [
            { id: "A", text: "beautiful" },
            { id: "B", text: "live" },
            { id: "C", text: "fire" },
            { id: "D", text: "fast" },
          ],
          correctAnswer: "C",
          explanation:
            'fire (炎) はモノの名前を表す名詞です。"beautiful" は形容詞、"live" は動詞、"fast" は形容詞または副詞です。復習はP15を参照してください。',
        },
        {
          id: "E01-C00-02-010",
          text: "基本4品詞 (名詞・動詞・形容詞・副詞) 以外に、本文で例として挙げられている品詞はどれですか？",
          options: [
            { id: "A", text: "冠詞" },
            { id: "B", text: "助動詞" },
            { id: "C", text: "接続詞" },
            { id: "D", text: "上記すべて" },
          ],
          correctAnswer: "D",
          explanation:
            "本文P19では、代名詞、冠詞、前置詞、助動詞、接続詞、疑問詞がその他の品詞として挙げられています。復習はP19を参照してください。",
        },
      ],
    },
    ch01: {
      "E01-C01-01": [
        {
          id: "E01-C01-01-001",
          text: "be動詞の役割として最も適切なものはどれですか？",
          options: [
            { id: "A", text: "主語の動きを表す" },
            { id: "B", text: "主語と補語のイコール関係や主語の存在を表す" },
            { id: "C", text: "文の時制のみを表す" },
            { id: "D", text: "主語の所有関係を表す" },
          ],
          correctAnswer: "B",
          explanation:
            "be動詞は主語と補語（名詞や形容詞）のイコール関係を表したり、主語の存在を表したりします。復習はP22-P23を参照してください。",
        },
        {
          id: "E01-C01-01-002",
          text: "「I am a high school student.」という文において、be動詞はどのような関係を表していますか？",
          options: [
            { id: "A", text: "主語の動作" },
            { id: "B", text: "主語の状態変化" },
            { id: "C", text: "主語と補語のイコール関係" },
            { id: "D", text: "主語の位置関係" },
          ],
          correctAnswer: "C",
          explanation:
            "この文では、be動詞「am」が「I（私）= a high school student（高校生）」というイコール関係を表しています。復習はP22-P23を参照してください。",
        },
        {
          id: "E01-C01-01-003",
          text: "英語の動詞は、大きく分けて何と何に分類されますか？",
          options: [
            { id: "A", text: "be動詞と助動詞" },
            { id: "B", text: "be動詞と一般動詞" },
            { id: "C", text: "一般動詞と助動詞" },
            { id: "D", text: "自動詞と他動詞" },
          ],
          correctAnswer: "B",
          explanation: "本文P22で、動詞は大きくbe動詞と一般動詞の2つに分けることができると説明されています。",
        },
        {
          id: "E01-C01-01-004",
          text: "次のうち、be動詞に含まれないものはどれですか？",
          options: [
            { id: "A", text: "am" },
            { id: "B", text: "is" },
            { id: "C", text: "are" },
            { id: "D", text: "run" },
          ],
          correctAnswer: "D",
          explanation:
            "run は「走る」という意味の一般動詞です。am, is, are はbe動詞です。復習はP22, P24を参照してください。",
        },
        {
          id: "E01-C01-01-005",
          text: 'Her school is near the station. という文で、be動詞 "is" はどのような働きをしていますか？',
          options: [
            { id: "A", text: "主語と後ろの語句のイコール関係を示している" },
            { id: "B", text: "主語の存在 (場所) を示している" },
            { id: "C", text: "主語の動作を示している" },
            { id: "D", text: "文の時制を示している" },
          ],
          correctAnswer: "B",
          explanation:
            "本文P23で、「学校」と「駅の近く(位置)」はイコールではないため、この場合のbe動詞は主語の存在「(〜に)ある」を表すと説明されています。",
        },
        {
          id: "E01-C01-01-006",
          text: '一般動詞 "jump" はbe動詞ではありません。なぜこれが一般動詞であると言えるのか、その理由を最もよく説明しているものはどれですか？',
          options: [
            { id: "A", text: "動きを表す言葉だから。" },
            { id: "B", text: "be動詞 (am, is, are, was, wereなど) 以外の動詞だから。" },
            { id: "C", text: "主語を必要とするから。" },
            { id: "D", text: "文頭で使われることがあるから。" },
          ],
          correctAnswer: "B",
          explanation:
            "一般動詞の定義は「be動詞以外の動詞のこと」です(P24)。選択肢Aも動詞の特徴ですが、be動詞以外の動詞であることが一般動詞の定義です。CやDは動詞一般に当てはまる場合もありますが、一般動詞の定義ではありません。復習はP24を参照してください。",
        },
        {
          id: "E01-C01-01-007",
          text: "1つの英文には、原則として動詞はいくつ使えますか？",
          options: [
            { id: "A", text: "1つ" },
            { id: "B", text: "2つ" },
            { id: "C", text: "3つ" },
            { id: "D", text: "制限なし" },
          ],
          correctAnswer: "A",
          explanation: "本文P24で「1つの文に動詞は1つしか使えない」と述べられています。",
        },
        {
          id: "E01-C01-01-008",
          text: "一般動詞に「3単現のs」が付くのは、主語がどのような条件を満たすときですか？",
          options: [
            { id: "A", text: "主語が複数で、現在の話" },
            { id: "B", text: "主語がIまたはyouで、現在の話" },
            { id: "C", text: "主語が3人称・単数で、現在の話" },
            { id: "D", text: "主語が3人称・単数で、過去の話" },
          ],
          correctAnswer: "C",
          explanation:
            "本文P25で、主語が①3人称、②単数、③現在の話、という3つの条件をすべて満たすときに一般動詞にsが付くと説明されています。",
        },
        {
          id: "E01-C01-01-009",
          text: "次の主語のうち、現在の文で一般動詞に「s」が付くものはどれですか？",
          options: [
            { id: "A", text: "I" },
            { id: "B", text: "You" },
            { id: "C", text: "We" },
            { id: "D", text: "He" },
          ],
          correctAnswer: "D",
          explanation:
            "He は3人称・単数なので、現在の文では一般動詞にsが付きます (例: He runs.)。I, You, We は3人称・単数ではありません。復習はP25を参照してください。",
        },
        {
          id: "E01-C01-01-010",
          text: '一般動詞の語尾に "ed" が付いている形は何と呼ばれ、どのような時を表しますか？',
          options: [
            { id: "A", text: "現在分詞、進行中の動作" },
            { id: "B", text: "過去分詞、完了した動作" },
            { id: "C", text: "過去形、過去の事柄" },
            { id: "D", text: "不定詞、未来の事柄" },
          ],
          correctAnswer: "C",
          explanation:
            '本文P25で、一般動詞が "ed" で終わる形を過去形といい、過去の事柄を表すときに使うと説明されています。',
        },
      ],
    },
  },
}

// デフォルトの問題データを設定する関数
const setDefaultQuestions = () => {
  // 基本的な問題テンプレートを作成
  const defaultQuestions = Array(5)
    .fill(null)
    .map((_, index) => ({
      id: `default-${index}`,
      text: `このセット（${params.set}）の問題データはまだ準備されていません。これはサンプル問題 ${index + 1} です。`,
      options: [
        { id: "A", text: "選択肢 A" },
        { id: "B", text: "選択肢 B" },
        { id: "C", text: "選択肢 C" },
        { id: "D", text: "選択肢 D" },
      ],
      correctAnswer: "A",
      explanation: "これはサンプル問題です。実際の問題データは今後追加される予定です。",
    }))

  setShuffledQuestions(defaultQuestions)
  setLimitedQuestions(defaultQuestions)
}

// CSVデータをインポートして問題データを動的に生成する関数を追加します
// この関数は実際のアプリではAPIから取得するデータを模擬しています

// CSVデータをパースして問題データに変換する関数
const parseCSVToQuestionData = () => {
  // 実際のアプリではここでAPIからデータを取得します
  // 今回はハードコードされたデータを使用します

  // 既存のquestionDataを返します（実際のアプリではAPIからのデータを返します）
  return questionData
}

// 配列をシャッフルする関数
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// テストセットのタイトルを生成する関数
const getTestSetTitle = (bookId: string, chapterId: string, setId: string, subjectName: string) => {
  const subjectBooks = textbookData[subjectName as keyof typeof textbookData] || []
  const book = subjectBooks.find((b) => b.id === bookId)
  if (!book) return "テスト"

  const chapter = book.chapters.find((c) => c.id === chapterId)
  if (!chapter) return `${book.title}のテスト`

  return `${book.title} - ${chapter.title}`
}

export default function TestPage({
  params,
}: {
  params: { subject: string; book: string; chapter: string; set: string }
}) {
  const router = useRouter()
  const { subject, book, chapter } = params
  const set = params.set
  const subjectName = decodeURIComponent(subject)

  // 科目が存在しない場合はダッシュボードにリダイレクト
  if (!Object.keys(subjectColors).includes(subjectName)) {
    router.push("/dashboard")
    return null
  }

  const subjectColor = subjectColors[subjectName as keyof typeof subjectColors]

  // テストのタイトルを取得
  const testTitle = getTestSetTitle(book, chapter, set, subjectName)

  // 問題データを取得してシャッフル
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([])
  const [limitedQuestions, setLimitedQuestions] = useState<any[]>([])

  const [currentStep, setCurrentStep] = useState<"intro" | "test" | "result">("intro")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([])
  const [testCompleted, setTestCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15分（秒単位）
  const [showFeedback, setShowFeedback] = useState<{
    show: boolean
    isCorrect: boolean
    explanation: string
  }>({ show: false, isCorrect: false, explanation: "" })
  const timeLeftRef = useRef(timeLeft)

  useEffect(() => {
    // 問題データを取得（実際のアプリではAPIから取得）
    const allQuestionData = parseCSVToQuestionData()
    const bookData = allQuestionData[book]

    if (!bookData) {
      console.error(`Book data not found for: ${book}`)
      // デフォルトの問題データを設定
      setDefaultQuestions()
      return
    }

    const chapterData = bookData[chapter]
    if (!chapterData) {
      console.error(`Chapter data not found for: ${chapter} in book ${book}`)
      // デフォルトの問題データを設定
      setDefaultQuestions()
      return
    }

    const setData = chapterData[set]
    if (!setData || !Array.isArray(setData) || setData.length === 0) {
      console.error(`Set data not found or empty for: ${set} in chapter ${chapter}, book ${book}`)
      // デフォルトの問題データを設定
      setDefaultQuestions()
      return
    }

    // 問題をシャッフル
    const questions = shuffleArray(setData).map((question) => {
      // 各問題の選択肢もシャッフル
      const shuffledOptions = shuffleArray(question.options)
      return { ...question, options: shuffledOptions }
    })

    setShuffledQuestions(questions)

    // 問題数を10問に制限（問題が10問未満の場合はそのまま）
    setLimitedQuestions(questions.slice(0, 10))
  }, [book, chapter, set, params.set])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const tick = () => {
      if (currentStep === "test" && timeLeftRef.current > 0 && !testCompleted) {
        setTimeLeft((prevTime) => prevTime - 1)
      } else if (timeLeftRef === 0 && !testCompleted) {
        setTestCompleted(true)
        setCurrentStep("result")
      }
    }

    if (currentStep === "test" && timeLeftRef.current > 0 && !testCompleted) {
      intervalId = setInterval(tick, 1000)
    }

    return () => clearInterval(intervalId)
  }, [currentStep, testCompleted])

  // 進捗率を計算
  const progress = limitedQuestions.length > 0 ? (Object.keys(answers).length / limitedQuestions.length) * 100 : 0

  // 現在の問題
  const currentQuestion = limitedQuestions[currentQuestionIndex]

  // 問題に回答する
  const answerQuestion = (questionId: string, answerId: string) => {
    // 既に回答済みの場合は何もしない
    if (answers[questionId]) return

    // 回答を記録
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))

    // 正解かどうかをチェック
    const isCorrect = answerId === currentQuestion.correctAnswer

    // フィードバックを表示
    setShowFeedback({
      show: true,
      isCorrect,
      explanation: currentQuestion.explanation,
    })

    // 自動遷移を削除し、フィードバックのみ表示
  }

  // 2. 次の問題へ進むための関数を追加
  const goToNextQuestion = () => {
    setShowFeedback({ show: false, isCorrect: false, explanation: "" })

    // 最後の問題の場合はテスト結果画面に移動
    if (currentQuestionIndex === limitedQuestions.length - 1) {
      setTestCompleted(true)
      setCurrentStep("result")
    } else {
      // 次の問題へ
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  // 3. キーボードイベントハンドラを追加
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && currentStep === "test" && answers[currentQuestion?.id]) {
        goToNextQuestion()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentStep, currentQuestion, answers])

  // 問題をフラグする/解除する
  const toggleFlagQuestion = (questionId: string) => {
    if (flaggedQuestions.includes(questionId)) {
      setFlaggedQuestions((prev) => prev.filter((id) => id !== questionId))
    } else {
      setFlaggedQuestions((prev) => [...prev, questionId])
    }
  }

  // テストを開始
  const startTest = () => {
    setCurrentStep("test")
    setCurrentQuestionIndex(0)
    setAnswers({})
    setFlaggedQuestions([])
    setTimeLeft(15 * 60) // 15分
    setTestCompleted(false)
    setShowFeedback({ show: false, isCorrect: false, explanation: "" })
  }

  // 時間を分:秒形式で表示
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  // 次のテストを受ける（同じ章の別の問題セット）
  const takeNextTest = () => {
    const bookData = textbookData[subjectName as keyof typeof textbookData]
    if (!bookData) return

    const book = bookData.find((b) => b.id === params.book)
    if (!book) return

    const chapter = book.chapters.find((c) => c.id === params.chapter)
    if (!chapter) return

    if (chapter.sets.length > 0) {
      // 現在のセットのインデックスを取得
      const currentSetIndex = chapter.sets.findIndex((s) => s === params.set)

      // 次のセットを選択（循環させる）
      const nextSetIndex = (currentSetIndex + 1) % chapter.sets.length
      const nextSet = chapter.sets[nextSetIndex]

      // 次のテストに移動
      router.push(`/dashboard/${params.subject}/take-test/${params.book}/${params.chapter}/${nextSet}`)

      // ステートをリセット
      setCurrentStep("intro")
    }
  }

  // イントロ画面
  if (currentStep === "intro") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/dashboard/${subject}/take-test`}
          className="text-sm text-muted-foreground hover:text-black flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          テスト選択に戻る
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 text-white" style={{ backgroundColor: subjectColor }}>
              <h1 className="text-2xl font-bold mb-2">{testTitle}</h1>
              <p>このテストでは{subjectName}の知識を確認します。</p>
            </div>

            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-muted-foreground" />
                  <span>
                    参考書:{" "}
                    {textbookData[subjectName as keyof typeof textbookData]?.find((b) => b.id === book)?.title ||
                      "不明な参考書"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>制限時間: 15分</span>
                </div>

                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span>問題数: 10問</span>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>テストを開始すると、制限時間内にすべての問題に回答する必要があります。</p>
                  <p>各問題には1つの正解があります。</p>
                  <p>回答すると即座に正誤がわかり、自動的に次の問題に進みます。</p>
                  <p>問題と選択肢はランダムに表示されます。</p>
                </div>

                <Button className="w-full text-white" style={{ backgroundColor: subjectColor }} onClick={startTest}>
                  テストを開始する
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // テスト画面
  if (currentStep === "test" && currentQuestion) {
    const handleEndTest = () => {
      router.push(`/dashboard/${subject}/take-test`)
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-black flex items-center gap-1"
                onClick={() => {
                  if (confirm("テストを終了しますか？進捗は保存されません。")) {
                    handleEndTest()
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                テストを終了
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* 進捗バー */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>
                進捗: {Object.keys(answers).length}/{limitedQuestions.length}問
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 問題カード */}
          <Card className="rounded-2xl shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">
                  問題 {currentQuestionIndex + 1}/{limitedQuestions.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    flaggedQuestions.includes(currentQuestion.id) ? "text-yellow-500" : "text-muted-foreground"
                  }`}
                  onClick={() => toggleFlagQuestion(currentQuestion.id)}
                >
                  <Flag className="h-4 w-4" />
                  {flaggedQuestions.includes(currentQuestion.id) ? "フラグ解除" : "フラグを立てる"}
                </Button>
              </div>

              <h2 className="text-xl font-medium mb-6">{currentQuestion.text}</h2>

              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => answerQuestion(currentQuestion.id, value)}
                className="space-y-4"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-start space-x-2 rounded-md border p-3 hover:bg-slate-50">
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* 即時フィードバック */}
              {showFeedback.show && (
                <div
                  className={`mt-6 p-4 rounded-md ${
                    showFeedback.isCorrect ? "bg-green-100 border-green-200" : "bg-red-100 border-red-200"
                  } border`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {showFeedback.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">{showFeedback.isCorrect ? "正解です！" : "不正解です。"}</span>
                  </div>
                  <p className="text-sm">{showFeedback.explanation}</p>
                </div>
              )}
              {answers[currentQuestion.id] && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={goToNextQuestion} className="text-white" style={{ backgroundColor: subjectColor }}>
                    次へ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 結果画面
  if (currentStep === "result") {
    // 正解数を計算
    const correctCount = Object.entries(answers).filter(([questionId, answerId]) => {
      const question = limitedQuestions.find((q) => q.id === questionId)
      return question && question.correctAnswer === answerId
    }).length

    const score = {
      correct: correctCount,
      total: limitedQuestions.length,
      percentage: limitedQuestions.length ? Math.round((correctCount / limitedQuestions.length) * 100) : 0,
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/dashboard/${subject}`}
          className="text-sm text-muted-foreground hover:text-black flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {subjectName}に戻る
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 text-white" style={{ backgroundColor: subjectColor }}>
              <h1 className="text-2xl font-bold mb-2">テスト結果</h1>
              <p>{testTitle}</p>
            </div>

            <CardContent className="p-6">
              <div className="text-center py-6">
                <div className="text-5xl font-bold mb-2">{score.percentage}%</div>
                <p className="text-muted-foreground">
                  {score.correct}/{score.total}問正解
                </p>
              </div>

              <Separator className="my-6" />

              {/* 問題一覧（コンパクト表示） */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">問題一覧</h2>
                <div className="grid grid-cols-5 gap-2">
                  {limitedQuestions.map((question, index) => {
                    const userAnswer = answers[question.id]
                    const isCorrect = userAnswer === question.correctAnswer

                    return (
                      <a
                        key={question.id}
                        href={`#question-${index}`}
                        className={`flex items-center justify-center p-3 rounded-md cursor-pointer border ${
                          userAnswer
                            ? isCorrect
                              ? "bg-green-100 border-green-300 text-green-800"
                              : "bg-red-100 border-red-300 text-red-800"
                            : "bg-yellow-50 border-yellow-300 text-yellow-800"
                        }`}
                      >
                        {index + 1}
                      </a>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-8 relative">
                <h2 className="text-lg font-medium">結果の詳細</h2>

                {/* 上に戻るボタン */}
                <div className="fixed bottom-6 right-6 z-10">
                  <Button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: subjectColor }}
                  >
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
                      className="text-white"
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </Button>
                </div>

                {limitedQuestions.map((question, index) => {
                  const userAnswer = answers[question.id]
                  const isCorrect = userAnswer === question.correctAnswer

                  return (
                    <div key={question.id} id={`question-${index}`} className="rounded-md border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">問題 {index + 1}</span>
                        {userAnswer ? (
                          <span className={isCorrect ? "text-green-500" : "text-red-500"}>
                            {isCorrect ? "正解" : "不正解"}
                          </span>
                        ) : (
                          <span className="text-yellow-500">未回答</span>
                        )}
                      </div>

                      <p className="mb-4">{question.text}</p>

                      <div className="space-y-2 mb-4">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`p-2 rounded-md ${
                              option.id === question.correctAnswer
                                ? "bg-green-100 border-green-200 border"
                                : option.id === userAnswer && option.id !== question.correctAnswer
                                  ? "bg-red-100 border-red-200 border"
                                  : "bg-slate-50"
                            }`}
                          >
                            {option.text}
                            {option.id === question.correctAnswer && (
                              <span className="ml-2 text-green-600 text-sm">（正解）</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="text-sm bg-blue-50 p-3 rounded-md">
                          <span className="font-medium">解説:</span> {question.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => router.push(`/dashboard/${subject}/take-test`)}>
                  別のテストを選択
                </Button>

                <Button className="text-white" style={{ backgroundColor: subjectColor }} onClick={takeNextTest}>
                  次のテストに進む
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
      <p className="text-muted-foreground">テストデータを読み込んでいます...</p>
      <p className="text-sm text-muted-foreground mt-2">
        {book}/{chapter}/{set}
      </p>
      <p className="text-sm text-muted-foreground mt-4 max-w-md text-center">
        データの読み込みに時間がかかる場合は、別のテストセットを選択してください。
      </p>
    </div>
  )
}
