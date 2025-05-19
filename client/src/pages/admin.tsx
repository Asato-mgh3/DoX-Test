import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Database, 
  Upload, 
  BarChart, 
  FileText, 
  AlertCircle, 
  List,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Book,
  Bookmark,
  FilePlus,
  Loader,
  FileText as FileTextIcon,
  MessageSquare,
  Check,
  X,
  Clock
} from 'lucide-react';

// フィードバック管理コンポーネント
const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);  // 空の配列で初期化
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, resolved
  
  // ローカルストレージからフィードバックデータを取得
  useEffect(() => {
    setFeedbackLoading(true);
    
    try {
      // ローカルストレージからフィードバックデータを取得
      const storedFeedbackJSON = localStorage.getItem('userFeedback');
      
      const storedFeedback = JSON.parse(storedFeedbackJSON || '[]');
      
      // ストレージからのデータにステータスを追加
      const processedFeedback = storedFeedback.map((item: any) => ({
        ...item,
        status: item.status || '未対応'  // ステータスがない場合は「未対応」
      }));
      
      setFeedbacks(processedFeedback);
    } catch (error) {
      console.error('フィードバック取得エラー:', error);
      setFeedbacks([]);
    } finally {
      setFeedbackLoading(false);
    }
  }, []);
  
  // フィードバックのステータスを更新
  const updateFeedbackStatus = (id: number, newStatus: string) => {
    try {
      // ローカルストレージのデータを更新
      const storedFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      const updatedFeedback = storedFeedback.map((item: any) => 
        item.id === id ? { ...item, status: newStatus } : item
      );
      
      localStorage.setItem('userFeedback', JSON.stringify(updatedFeedback));
      
      // 状態を更新
      setFeedbacks(updatedFeedback);
    } catch (error) {
      console.error('フィードバック更新エラー:', error);
    }
  };
  
  // フィルタリングされたフィードバック
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'all') return true;
    if (filter === 'pending') return feedback.status === '未対応';
    if (filter === 'inProgress') return feedback.status === '対応中';
    if (filter === 'resolved') return feedback.status === '対応済み';
    return true;
  });
  
  // フィードバックの種類に応じたバッジの色を返す関数
  const getFeedbackTypeBadgeColor = (type: string) => {
    switch (type) {
      case '問題に対するフィードバック':
        return 'bg-blue-100 text-blue-800';
      case 'テスト結果に対するフィードバック':
        return 'bg-purple-100 text-purple-800';
      case '参考書表示に対するフィードバック':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // ステータスに応じたバッジの色とアイコンを返す関数
  const getStatusBadge = (status: string) => {
    switch (status) {
      case '対応済み':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <Check className="w-3 h-3 mr-1" />
        };
      case '対応中':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case '未対応':
      default:
        return {
          color: 'bg-red-100 text-red-800',
          icon: <X className="w-3 h-3 mr-1" />
        };
    }
  };
  
  if (feedbackLoading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">フィードバックデータを読み込んでいます...</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* フィルターボタン */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">フィルター:</div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            未対応
          </button>
          <button
            onClick={() => setFilter('inProgress')}
            className={`px-4 py-2 rounded-md ${filter === 'inProgress' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            対応中
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-md ${filter === 'resolved' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            対応済み
          </button>
        </div>
      </div>
      
      {/* フィードバック一覧 */}
      {filteredFeedbacks.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">フィードバックはありません</h3>
          <p className="text-gray-600">
            {filter !== 'all' 
              ? `${filter === 'pending' ? '未対応' : '対応済み'}のフィードバックはありません。` 
              : 'ユーザーからのフィードバックはまだ届いていません。'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeBadgeColor(feedback.type)}`}>
                      {feedback.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.date).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(feedback.status).color}`}>
                    {getStatusBadge(feedback.status).icon}
                    {feedback.status}
                  </div>
                </div>
                
                {feedback.bookId && (
                  <div className="mb-2 text-xs text-gray-600">
                    <span className="font-medium">参考書ID:</span> {feedback.bookId}
                    {feedback.chapterId && ` / 章ID: ${feedback.chapterId}`}
                    {feedback.questionSetId && ` / 問題セットID: ${feedback.questionSetId}`}
                  </div>
                )}
                
                {feedback.categories && feedback.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {feedback.categories.map((category: string, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                
                {feedback.content && (
                  <div className="bg-gray-50 p-3 rounded mt-2 text-sm whitespace-pre-wrap">
                    {feedback.content}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 flex justify-end gap-2">
                <button
                  className={`px-3 py-1 rounded text-xs font-medium ${feedback.status === '対応済み' ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white'}`}
                  onClick={() => updateFeedbackStatus(feedback.id, '対応済み')}
                  disabled={feedback.status === '対応済み'}
                >
                  <Check className="w-3 h-3 inline mr-1" />
                  対応済みにする
                </button>
                <button
                  className={`px-3 py-1 rounded text-xs font-medium ${feedback.status === '対応中' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-600 text-white'}`}
                  onClick={() => updateFeedbackStatus(feedback.id, '対応中')}
                  disabled={feedback.status === '対応中'}
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  対応中にする
                </button>
                <button
                  className={`px-3 py-1 rounded text-xs font-medium ${feedback.status === '未対応' ? 'bg-gray-200 text-gray-700' : 'bg-red-600 text-white'}`}
                  onClick={() => updateFeedbackStatus(feedback.id, '未対応')}
                  disabled={feedback.status === '未対応'}
                >
                  <X className="w-3 h-3 inline mr-1" />
                  未対応に戻す
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 章アイテムコンポーネント
interface ChapterItemProps {
  itemId: string;
  chapterId: string;
  title: string;
}

const ChapterItem: React.FC<ChapterItemProps> = ({ itemId, chapterId, title }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<any | null>(null);

  const fetchItemContent = async () => {
    if (item) return; // 既にコンテンツを取得済みの場合はスキップ
    
    setLoading(true);
    try {
      // 実際のデータをAPIから取得
      const response = await axios.get(`/api/chapter-items/${itemId}`);
      setItem(response.data);
    } catch (err) {
      console.error('アイテムコンテンツ取得エラー:', err);
      
      // APIエラー時にダミーデータを表示（実際のデータがない場合のフォールバック）
      setItem({
        itemId,
        chapterId,
        title,
        fullText: `これは ${chapterId} の ${itemId} のデモコンテンツです。データベースから正しいコンテンツが取得できませんでした。`,
        keyPoints: "項目の重要ポイント（データがありません）",
        pageReference: "p.XX-XX（データがありません）"
      });
    } finally {
      setLoading(false);
    }
  };

  // アイテムをクリックして開閉
  const toggleExpand = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    if (newExpandedState) {
      fetchItemContent();
    }
  };

  return (
    <div className="bg-white rounded border overflow-hidden">
      <div 
        className={`flex items-center p-2 cursor-pointer ${expanded ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
        onClick={toggleExpand}
      >
        {expanded ? 
          <ChevronDown className="w-3 h-3 text-gray-600 mr-2" /> : 
          <ChevronRight className="w-3 h-3 text-gray-600 mr-2" />
        }
        <div className="text-gray-700 font-medium text-sm mr-2">{itemId}</div>
        <div className="text-sm">{title}</div>
      </div>

      {expanded && (
        <div className="border-t p-3">
          {loading ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-600">読み込み中...</p>
            </div>
          ) : item ? (
            <div className="text-sm space-y-3">
              {item.keyPoints && (
                <div>
                  <div className="font-medium mb-1">重要ポイント:</div>
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200">{item.keyPoints}</div>
                </div>
              )}
              
              {item.fullText && (
                <div>
                  <div className="font-medium mb-1">詳細テキスト:</div>
                  <div className="bg-white p-4 rounded border whitespace-pre-line">{item.fullText?.replace(/\\n/g, '\n')}</div>
                </div>
              )}
              
              {item.pageReference && (
                <div>
                  <div className="font-medium mb-1">参照ページ:</div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-200 inline-block">{item.pageReference}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">コンテンツがありません</div>
          )}
        </div>
      )}
    </div>
  );
};

// 問題セットコンポーネント
interface QuestionSetProps {
  setIndex: number;
  questions: any[];
}

const QuestionSet: React.FC<QuestionSetProps> = ({ setIndex, questions }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-md overflow-hidden">
      <div 
        className={`flex items-center p-3 ${expanded ? 'bg-blue-50' : 'bg-gray-50'} cursor-pointer hover:bg-blue-50`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center flex-1">
          {expanded ? 
            <ChevronDown className="w-4 h-4 text-blue-600 mr-2" /> : 
            <ChevronRight className="w-4 h-4 text-gray-600 mr-2" />
          }
          <div>
            <span className="font-medium">問題セット {setIndex}</span>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="bg-white p-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {questions.map((question, index) => (
              <div key={question.questionId} className="border rounded-md p-3 hover:bg-gray-50">
                <div className="font-medium flex justify-between">
                  <span>{(setIndex-1)*10 + index + 1}. {question.questionText}</span>
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                    難易度: {question.difficulty}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded text-sm ${question.correctAnswer === 'A' ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border'}`}>
                    A: {question.optionA}
                  </div>
                  <div className={`p-2 rounded text-sm ${question.correctAnswer === 'B' ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border'}`}>
                    B: {question.optionB}
                  </div>
                  <div className={`p-2 rounded text-sm ${question.correctAnswer === 'C' ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border'}`}>
                    C: {question.optionC}
                  </div>
                  <div className={`p-2 rounded text-sm ${question.correctAnswer === 'D' ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border'}`}>
                    D: {question.optionD}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">正解:</span> {question.correctAnswer}
                  {question.explanation && (
                    <div className="mt-1">
                      <span className="font-medium">解説:</span> {question.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 参考書の詳細表示コンポーネント
interface BookDetailsProps {
  book: any;
  onDelete: (bookId: string) => void;
  loading: boolean;
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, onDelete, loading }) => {
  const [expanded, setExpanded] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [chapterItems, setChapterItems] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingChapterItems, setLoadingChapterItems] = useState(false);

  // 参考書を展開したときに章データを取得
  const fetchChapters = async () => {
    if (chapters.length > 0) return; // 既に取得済みならスキップ
    
    setLoadingChapters(true);
    try {
      const response = await axios.get(`/api/chapters?textbookIds=${book.bookId}`);
      
      // 章をorder（順番）でソート
      const sortedChapters = [...response.data].sort((a, b) => {
        // orderプロパティがある場合はそれでソート
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        
        // orderがない場合は章IDから数字を抽出してソート
        const getChapterNumber = (id: string) => {
          const match = id.match(/ch(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        
        return getChapterNumber(a.chapterId) - getChapterNumber(b.chapterId);
      });
      
      setChapters(sortedChapters);
    } catch (err) {
      console.error('章データ取得エラー:', err);
    } finally {
      setLoadingChapters(false);
    }
  };

  // 章を選択したときに問題データを取得
  const fetchQuestions = async (chapterId: string) => {
    setLoadingQuestions(true);
    try {
      const response = await axios.get(`/api/questions?chapterIds=${chapterId}`);
      setQuestions(response.data);
    } catch (err) {
      console.error('問題データ取得エラー:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  // 章を選択したときに章アイテムを取得
  const fetchChapterItems = async (chapterId: string) => {
    setLoadingChapterItems(true);
    try {
      const response = await axios.get(`/api/chapter-items?chapterId=${chapterId}`);
      setChapterItems(response.data);
    } catch (err) {
      console.error('章アイテム取得エラー:', err);
    } finally {
      setLoadingChapterItems(false);
    }
  };

  // 参考書をクリックして展開/折りたたみ
  const toggleExpand = () => {
    const newExpandState = !expanded;
    setExpanded(newExpandState);
    
    if (newExpandState) {
      fetchChapters();
    } else {
      // 折りたたむ時は選択された章をリセット
      setSelectedChapter(null);
    }
  };

  // 章を選択
  const selectChapter = (chapterId: string) => {
    if (selectedChapter === chapterId) {
      setSelectedChapter(null); // 同じ章をクリックしたら閉じる
      setChapterItems([]);
    } else {
      setSelectedChapter(chapterId);
      fetchQuestions(chapterId);
      fetchChapterItems(chapterId);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {/* 参考書ヘッダー */}
      <div 
        className={`flex items-center justify-between p-4 ${expanded ? 'bg-blue-50' : 'bg-white'} cursor-pointer hover:bg-blue-50`}
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3">
          {expanded ? 
            <ChevronDown className="w-4 h-4 text-blue-600" /> : 
            <ChevronRight className="w-4 h-4 text-gray-600" />
          }
          <BookOpen className="w-5 h-5 text-blue-700" />
          <div>
            <div className="font-medium">{book.title}</div>
            <div className="text-sm text-gray-600">
              ID: {book.bookId} | 科目: {book.subject} | 章数: {book.chapterCount} | 問題数: {book.questionCount}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // クリックイベントの伝播を止める
              onDelete(book.bookId);
            }}
            className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-50"
            disabled={loading}
          >
            削除
          </button>
        </div>
      </div>
      
      {/* 展開時の詳細表示 */}
      {expanded && (
        <div className="px-6 pb-4 pt-2 bg-white">
          {/* 章リスト */}
          {loadingChapters ? (
            <div className="text-center py-4">
              <p className="text-gray-600">章データを読み込み中...</p>
            </div>
          ) : chapters.length > 0 ? (
            <div className="mt-2 space-y-2">
              <h4 className="font-medium text-gray-700 flex items-center">
                <Book className="w-4 h-4 mr-1" /> 章一覧
              </h4>
              <div className="ml-4 space-y-2">
                {chapters.map((chapter) => (
                  <div key={chapter.chapterId}>
                    <div 
                      className={`flex items-center p-2 rounded cursor-pointer ${selectedChapter === chapter.chapterId ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => selectChapter(chapter.chapterId)}
                    >
                      {selectedChapter === chapter.chapterId ? 
                        <ChevronDown className="w-3 h-3 text-gray-600 mr-2" /> : 
                        <ChevronRight className="w-3 h-3 text-gray-600 mr-2" />
                      }
                      <div className="text-blue-700 font-bold text-sm min-w-14 mr-1">
                        {(() => {
                          // 章IDから章番号を抽出
                          const match = chapter.chapterId.match(/ch(\d+)/);
                          const chNum = match ? match[1] : "";
                          return `ch${chNum}`;
                        })()}
                      </div>
                      <div>
                        <span>{chapter.title}</span>
                        <span className="text-xs text-gray-500 ml-2">（問題数: {chapter.questionCount || 0}）</span>
                      </div>
                    </div>
                    
                    {/* 章の詳細情報 */}
                    {selectedChapter === chapter.chapterId && (
                      <div className="ml-7 mt-2 border-l-2 border-gray-200 pl-4">
                        {loadingQuestions ? (
                          <div className="text-gray-600 p-2">章データを読み込み中...</div>
                        ) : (
                          <div className="space-y-4">
                            {/* 参考書アイテム一覧 */}
                            <div className="bg-gray-50 p-3 rounded-md">
                              <h5 className="font-medium text-gray-700 flex items-center mb-2">
                                <Book className="w-4 h-4 mr-1" /> 参考書アイテム一覧
                              </h5>
                              <div className="space-y-2">
                                {/* 実際の章アイテムデータを取得して表示 */}
                                {loadingChapterItems ? (
                                  <div className="text-gray-600 p-2">アイテムを読み込み中...</div>
                                ) : chapterItems.length > 0 ? (
                                  chapterItems.map((item) => (
                                    <ChapterItem 
                                      key={item.itemId} 
                                      itemId={item.itemId} 
                                      chapterId={chapter.chapterId}
                                      title={item.title}
                                    />
                                  ))
                                ) : (
                                  <div className="text-gray-600 p-2">アイテムが見つかりません</div>
                                )}
                              </div>
                            </div>
                            
                            {/* 問題セット一覧 */}
                            {questions.length > 0 ? (
                              <div>
                                <h5 className="font-medium text-gray-700 flex items-center mb-2">
                                  <FileTextIcon className="w-4 h-4 mr-1" /> 問題セット一覧（全{questions.length}問）
                                </h5>
                                
                                {/* 問題をセットに分割して表示 */}
                                {(() => {
                                  // 問題をセットに分割（各セット10問まで）
                                  const questionSets: any[] = [];
                                  for (let i = 0; i < questions.length; i += 10) {
                                    questionSets.push(questions.slice(i, i + 10));
                                  }
                                  
                                  return (
                                    <div className="space-y-2">
                                      {questionSets.map((set, setIndex) => (
                                        <QuestionSet 
                                          key={setIndex} 
                                          setIndex={setIndex + 1} 
                                          questions={set} 
                                        />
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div className="text-gray-500 p-2">この章に登録されている問題はありません</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 py-4">
              章データが登録されていません
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userStats, setUserStats] = useState<any>(null);
  const [csvType, setCsvType] = useState<'textbooks' | 'questions' | 'chapterItems' | 'unified'>('unified');
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ユーザー統計を取得する
  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/admin/user-stats');
      setUserStats(response.data);
    } catch (err: any) {
      console.error('User stats fetch error:', err);
      setError(err.response?.data?.message || 'ユーザー統計情報の取得中にエラーが発生しました');
    }
  };

  // コンポーネントマウント時にユーザー統計を取得
  // データを取得する関数
  const fetchData = async () => {
    if (activeTab === 'dashboard') {
      fetchUserStats();
    } else if (activeTab === 'data-browse') {
      // データ閲覧タブが選択されたらデータを取得
      fetchTextbooks();
    }
  };

  // 教科書データを取得する関数
  const fetchTextbooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/textbooks');
      setTextbooks(response.data);
    } catch (err: any) {
      console.error('Textbooks fetch error:', err);
      setError(err.response?.data?.message || '教科書データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // データインポート（既存の関数）
  const handleImportTextbooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/import/textbooks');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '教科書データのインポート中にエラーが発生しました');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/import/questions');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '問題データのインポート中にエラーが発生しました');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 参考書データを削除する関数
  const handleDeleteTextbook = async (bookId: string) => {
    if (!window.confirm(`参考書ID「${bookId}」と関連するすべてのデータを削除します。この操作は元に戻せません。よろしいですか？`)) {
      return; // キャンセルされた場合
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/admin/textbooks/${bookId}`);
      setResult(response.data);
      
      // UIからデータをすぐに削除（最適化）
      setTextbooks(prevTextbooks => prevTextbooks.filter(book => book.bookId !== bookId));
      
      // UI削除後、バックグラウンドでデータを再取得してDB状態と同期
      setTimeout(() => {
        fetchTextbooks();
      }, 500);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'データの削除中にエラーが発生しました');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitDatabase = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/init-database');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'データベース初期化中にエラーが発生しました');
      console.error('Database init error:', err);
    } finally {
      setLoading(false);
    }
  };

  // CSV ファイルアップロード関連の関数
  const handleCsvTypeChange = (type: 'textbooks' | 'questions' | 'chapterItems' | 'unified') => {
    setCsvType(type);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`/api/admin/upload/${csvType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'CSVアップロード中にエラーが発生しました');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
      // ファイル選択をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>管理者ページ | Do-Test</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">管理者ページ</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full bg-white p-1 border rounded-lg">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            <span>ダッシュボード</span>
          </TabsTrigger>
          <TabsTrigger value="data-browse" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span>データ閲覧</span>
          </TabsTrigger>
          <TabsTrigger value="csv-upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>CSVアップロード</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>フィードバック</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-blue-800">総ユーザー数</h3>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-700">
                {userStats ? userStats.totalUsers : '-'}
              </p>
              <p className="text-sm text-blue-600 mt-2">登録ユーザーの総数</p>
            </Card>
            
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-green-800">アクティブユーザー</h3>
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-700">
                {userStats ? userStats.activeUsers : '-'}
              </p>
              <p className="text-sm text-green-600 mt-2">最近ログインしたユーザー</p>
            </Card>
            
            <Card className="p-6 bg-purple-50 border-purple-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-purple-800">本日の新規ユーザー</h3>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-700">
                {userStats ? userStats.newUsersToday : '-'}
              </p>
              <p className="text-sm text-purple-600 mt-2">今日登録したユーザー数</p>
            </Card>
          </div>
          
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">ユーザー分析</h2>
            <p className="text-gray-600">
              実際のアプリケーションでは、ここにユーザーの活動分析グラフやトレンドが表示されます。
            </p>
          </Card>
        </TabsContent>
        
        <TabsContent value="data-browse" className="mt-0">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">インポートデータ</h2>
              <p className="text-gray-600">インポートされたデータを閲覧します。参考書をクリックすると詳細が表示されます。</p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">データを読み込み中...</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-3">インポートデータ一覧（全{textbooks.length}件）</h3>
                
                {textbooks.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 border rounded-lg">
                    インポートされたデータがありません。CSVアップロードからデータをインポートしてください。
                  </div>
                ) : (
                  <div className="space-y-4">
                    {textbooks.map((book) => (
                      <BookDetails 
                        key={book.bookId} 
                        book={book} 
                        onDelete={handleDeleteTextbook} 
                        loading={loading} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="csv-upload" className="mt-0">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">CSVアップロード</h2>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">アップロードするCSVの種類を選択:</p>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => handleCsvTypeChange('unified')}
                  className={`px-4 py-2 rounded-md ${csvType === 'unified' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  参考書データ
                </button>
                <button
                  onClick={() => handleCsvTypeChange('questions')}
                  className={`px-4 py-2 rounded-md ${csvType === 'questions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  問題データ
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                  
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                      // アップロード処理を実行
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      setLoading(true);
                      setError(null);
                      
                      axios.post(`/api/admin/upload/${csvType}`, formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data'
                        }
                      })
                      .then(response => {
                        setResult(response.data);
                      })
                      .catch(err => {
                        setError(err.response?.data?.message || 'CSVアップロード中にエラーが発生しました');
                        console.error('Upload error:', err);
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                    } else {
                      setError('CSVファイル形式のみアップロードできます');
                    }
                  }
                }}
                onClick={triggerFileInput}
              >
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 mb-4">
                  {csvType === 'textbooks' 
                    ? '参考書データ' 
                    : csvType === 'questions' 
                      ? '問題データ' 
                      : csvType === 'unified'
                        ? '参考書データ'
                        : '参考書アイテムデータ'
                  }のCSVファイルをアップロード
                </p>
                <div className="flex flex-col items-center space-y-2">
                  <button
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    CSVファイルを選択
                  </button>
                  <span className="text-gray-500">または</span>
                  <p className="text-sm text-blue-600 font-medium">ファイルをここにドラッグ&ドロップ</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <p className="text-xs text-gray-500 mt-4">
                  CSVファイル形式のみ対応しています
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* フィードバック管理タブ */}
        <TabsContent value="feedback" className="mt-0">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              フィードバック管理
            </h2>
            <p className="text-gray-600 mb-6">
              ユーザーから寄せられたフィードバックを確認・管理できます。状態を更新して対応状況を記録しましょう。
            </p>
            
            {/* フィードバック管理コンポーネント */}
            <FeedbackManagement />
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* ローディングインジケーター */}
      {loading && (
        <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-md">
          <div className="flex items-center mb-2">
            <Loader className="w-5 h-5 animate-spin mr-2" />
            <h3 className="font-medium">データ処理中...</h3>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 mt-2 overflow-hidden">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-sm mt-2 text-blue-600">
            大きなファイルの場合は処理に数分かかることがあります。しばらくお待ちください。
          </p>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">エラーが発生しました</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* 成功メッセージ */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
          <h3 className="font-medium mb-2">処理結果</h3>
          <pre className="text-sm bg-white p-3 rounded border border-green-200 overflow-auto max-h-48">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminPage;