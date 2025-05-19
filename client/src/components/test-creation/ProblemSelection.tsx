import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { X, Search, Eye } from "lucide-react";
import { Textbook, Chapter, Question } from "@/types/index";

interface ProblemSelectionProps {
  selectedTextbooks: Textbook[];
  selectedChapters: Chapter[];
  selectedQuestions: Question[];
  setSelectedQuestions: (questions: Question[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ProblemSelection = ({
  selectedTextbooks,
  selectedChapters,
  selectedQuestions,
  setSelectedQuestions,
  onNext,
  onBack,
}: ProblemSelectionProps) => {
  const [selectionMode, setSelectionMode] = useState<"auto" | "manual">("auto");
  const [searchTerm, setSearchTerm] = useState("");
  const [problemCount, setProblemCount] = useState(10);
  const [difficulty, setDifficulty] = useState(3);
  const [isRandom, setIsRandom] = useState(true);
  const [filteredDifficulty, setFilteredDifficulty] = useState<number | null>(null);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", selectedChapters.map(c => c.id).join(",")],
    enabled: selectedChapters.length > 0,
  });

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filteredDifficulty === null || question.difficulty === filteredDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleToggleQuestion = (question: Question) => {
    if (selectedQuestions.some((q) => q.id === question.id)) {
      setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleAutoSelect = () => {
    let availableQuestions = [...questions];
    
    // Filter by difficulty
    availableQuestions = availableQuestions.filter(q => q.difficulty <= difficulty);
    
    // Sort by difficulty or randomly
    if (isRandom) {
      availableQuestions = availableQuestions.sort(() => Math.random() - 0.5);
    } else {
      availableQuestions = availableQuestions.sort((a, b) => a.difficulty - b.difficulty);
    }
    
    // Select the first N questions
    const autoSelectedQuestions = availableQuestions.slice(0, problemCount);
    setSelectedQuestions(autoSelectedQuestions);
  };

  const handleRemoveSelected = (questionId: number) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionId));
  };

  const getChapterById = (id: string) => {
    return selectedChapters.find(c => c.chapterId === id);
  };

  const getTextbookById = (id: string) => {
    return selectedTextbooks.find(t => t.bookId === id);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">問題選択</h2>

      <Tabs defaultValue="auto" onValueChange={(value) => setSelectionMode(value as "auto" | "manual")}>
        <TabsList className="mb-6">
          <TabsTrigger value="auto" className="flex-1">自動選択</TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">手動選択</TabsTrigger>
        </TabsList>

        <TabsContent value="auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">自動選択設定</CardTitle>
              <CardDescription>
                問題数や難易度を指定すると、条件に合った問題が自動的に選択されます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="problemCount">問題数: {problemCount}問</Label>
                <Slider
                  id="problemCount"
                  min={5}
                  max={20}
                  step={1}
                  value={[problemCount]}
                  onValueChange={(value) => setProblemCount(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">難易度: レベル{difficulty}</Label>
                <Slider
                  id="difficulty"
                  min={1}
                  max={5}
                  step={1}
                  value={[difficulty]}
                  onValueChange={(value) => setDifficulty(value[0])}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="selectionMode"
                  checked={isRandom}
                  onCheckedChange={setIsRandom}
                />
                <Label htmlFor="selectionMode">
                  {isRandom ? "ランダム選択" : "順番選択 (難易度順)"}
                </Label>
              </div>

              <Button 
                className="bg-math hover:bg-math-light w-full"
                onClick={handleAutoSelect}
              >
                条件に合った問題を選択する
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">手動選択</CardTitle>
              <CardDescription>
                問題を個別に選択して、カスタマイズされたテストを作成します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Search className="w-4 h-4 mr-2 text-gray-400" />
                <Input
                  placeholder="問題内容で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <div className="ml-2 flex space-x-2">
                  {[null, 1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level === null ? "all" : level}
                      variant={filteredDifficulty === level ? "default" : "outline"}
                      size="sm"
                      className={filteredDifficulty === level ? "bg-math" : ""}
                      onClick={() => setFilteredDifficulty(level)}
                    >
                      {level === null ? "全て" : `レベル${level}`}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div 
                      key={i} 
                      className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-md h-24"
                    />
                  ))
                ) : filteredQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    条件に一致する問題が見つかりませんでした。
                  </div>
                ) : (
                  filteredQuestions.map((question) => {
                    const chapter = getChapterById(question.chapterId);
                    const textbook = chapter ? getTextbookById(chapter.bookId) : null;
                    
                    return (
                      <div 
                        key={question.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-start mb-2">
                          <Checkbox
                            id={`question-${question.id}`}
                            checked={selectedQuestions.some(q => q.id === question.id)}
                            onCheckedChange={() => handleToggleQuestion(question)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                {textbook && (
                                  <Badge variant="outline" className="mr-2 text-xs">
                                    {textbook.subject}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  難易度: {question.difficulty}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Eye className="h-3 w-3 mr-1" />
                                <span className="text-xs">プレビュー</span>
                              </Button>
                            </div>
                            <p className="text-gray-900 dark:text-white line-clamp-2">
                              {question.questionText}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Questions */}
      {selectedQuestions.length > 0 && (
        <div className="mt-8 mb-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            選択された問題 ({selectedQuestions.length})
          </Label>
          <div className="flex flex-col gap-2 mt-2">
            {selectedQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
              >
                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1 flex-1">
                  {question.questionText}
                </p>
                <Badge variant="outline" className="mr-2 text-xs">
                  難易度: {question.difficulty}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveSelected(question.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <Button variant="outline" onClick={onBack}>
          戻る
        </Button>
        <Button 
          className="bg-math hover:bg-math-light"
          disabled={selectedQuestions.length === 0}
          onClick={onNext}
        >
          次へ進む
        </Button>
      </div>
    </div>
  );
};

export default ProblemSelection;
