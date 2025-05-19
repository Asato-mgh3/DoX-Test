// Subject constants
export const SUBJECTS = {
  // 英語
  ENGLISH: {
    id: "英語",
    color: "english",
    colorHex: "#1D4A4A"
  },
  // 国語 (現代文、古文、漢文、小論文)
  JAPANESE: {
    id: "現代文",
    color: "japanese",
    colorHex: "#781D33"
  },
  CLASSICAL_JAPANESE: {
    id: "古文",
    color: "japanese", 
    colorHex: "#781D33"
  },
  CHINESE_CLASSICS: {
    id: "漢文",
    color: "japanese",
    colorHex: "#781D33"
  },
  ESSAY: {
    id: "小論文",
    color: "japanese",
    colorHex: "#781D33"
  },
  // 数学
  MATH: {
    id: "数学",
    color: "math",
    colorHex: "#142B50"
  },
  // 理科 (化学、物理、生物、地学)
  CHEMISTRY: {
    id: "化学",
    color: "science",
    colorHex: "#57386B"
  },
  PHYSICS: {
    id: "物理",
    color: "science",
    colorHex: "#57386B"
  },
  BIOLOGY: {
    id: "生物",
    color: "science",
    colorHex: "#57386B"
  },
  EARTH_SCIENCE: {
    id: "地学",
    color: "science",
    colorHex: "#57386B"
  },
  // 社会 (日本史探求、世界史探求、地理探求、政治経済、倫理公共、情報)
  JAPANESE_HISTORY: {
    id: "日本史探求",
    color: "social",
    colorHex: "#DE721A"
  },
  WORLD_HISTORY: {
    id: "世界史探求",
    color: "social",
    colorHex: "#DE721A"
  },
  GEOGRAPHY: {
    id: "地理探求",
    color: "social",
    colorHex: "#DE721A"
  },
  POLITICS_ECONOMICS: {
    id: "政治経済",
    color: "social",
    colorHex: "#DE721A"
  },
  ETHICS_CIVICS: {
    id: "倫理公共",
    color: "social",
    colorHex: "#DE721A"
  },
  INFORMATION: {
    id: "情報",
    color: "social",
    colorHex: "#DE721A"
  }
};

// Subject groupings for filtering
export const SUBJECT_GROUPS = {
  ALL: "すべて",
  ENGLISH: "英語",
  JAPANESE: "国語",
  MATH: "数学",
  SCIENCE: "理科",
  SOCIAL: "社会"
};

// Difficulty levels
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5];

// Test creation steps
export const TEST_CREATION_STEPS = [
  {
    id: 1,
    title: "教科書選択",
    description: "テストに使用する教科書を選択します"
  },
  {
    id: 2,
    title: "章の選択",
    description: "テストに含める章を選択します"
  },
  {
    id: 3,
    title: "問題選択",
    description: "テストに含める問題を選択します"
  },
  {
    id: 4,
    title: "テスト設定",
    description: "テストのタイトルやオプションを設定します"
  },
  {
    id: 5,
    title: "プレビュー",
    description: "作成したテストをプレビューしてダウンロードします"
  }
];

// File export formats
export const EXPORT_FORMATS = {
  DOCX: "docx",
  PDF: "pdf"
};

// API endpoints
export const API_ENDPOINTS = {
  SUBJECTS: "/api/subjects",
  TEXTBOOKS: "/api/textbooks",
  CHAPTERS: "/api/chapters",
  QUESTIONS: "/api/questions",
  TESTS: "/api/tests",
  TEST_RESULTS: "/api/test-results",
  DOWNLOAD: "/api/tests/download"
};
