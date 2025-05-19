// テスト用のフィードバックデータを作成
const sampleFeedback = [
  {
    id: 1,
    type: '問題に対するフィードバック',
    date: new Date('2025-05-15T10:30:00').toISOString(),
    bookId: 'book-123',
    chapterId: 'chapter-456',
    questionSetId: 'question-789',
    categories: ['問題文が不明瞭', '選択肢に誤りがある'],
    content: '問題12の選択肢Bに誤字があります。「逓増」が「低増」になっています。',
    status: '未対応'
  },
  {
    id: 2,
    type: 'テスト結果に対するフィードバック',
    date: new Date('2025-05-16T14:20:00').toISOString(),
    bookId: 'book-345',
    questionSetId: 'question-567',
    categories: ['正解の表示に誤りがある'],
    content: 'テスト結果画面の問題5で、選択肢Aが正解と表示されていますが、実際は選択肢Cが正解だと思います。',
    status: '対応中'
  },
  {
    id: 3,
    type: '参考書表示に対するフィードバック',
    date: new Date('2025-05-17T09:45:00').toISOString(),
    bookId: 'book-789',
    categories: ['ページが正しく表示されない'],
    content: '参考書「経済学の基本」の12ページ目が表示されず、「ページが見つかりません」というエラーが表示されます。',
    status: '対応済み'
  },
  {
    id: 4,
    type: '問題に対するフィードバック', 
    date: new Date('2025-05-18T11:15:00').toISOString(),
    bookId: 'book-456',
    chapterId: 'chapter-789',
    questionSetId: 'question-012',
    categories: ['解説が不十分'],
    content: '問題23の解説がとても短く、理解しづらいです。もう少し詳しい解説があるとありがたいです。',
    status: '未対応'
  },
  {
    id: 5,
    type: '問題に対するフィードバック', 
    date: new Date('2025-05-19T11:15:00').toISOString(),
    bookId: 'eng-01',
    chapterId: 'ch01',
    questionSetId: 'q-set-03',
    categories: ['問題の内容が不明瞭', '解説が不十分'],
    content: 'うんこ',
    status: '対応中'
  }
];

// ローカルストレージにサンプルデータを保存するコード
localStorage.setItem('userFeedback', JSON.stringify(sampleFeedback));
console.log('テスト用フィードバックデータを作成しました。');
