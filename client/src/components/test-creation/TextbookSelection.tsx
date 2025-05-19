import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import TextbookCard from "./TextbookCard";
import { Textbook, SubjectType } from "@/types/index";

interface TextbookSelectionProps {
  selectedTextbooks: Textbook[];
  setSelectedTextbooks: (textbooks: Textbook[]) => void;
  onNext: () => void;
}

const TextbookSelection = ({
  selectedTextbooks,
  setSelectedTextbooks,
  onNext,
}: TextbookSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<SubjectType | "すべて">("すべて");

  const { data: textbooks = [], isLoading } = useQuery<Textbook[]>({
    queryKey: ["/api/textbooks"],
  });

  const filteredTextbooks = textbooks.filter((textbook) => {
    const matchesSearch =
      textbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      textbook.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = subjectFilter === "すべて" || textbook.subject === subjectFilter;
    
    return matchesSearch && matchesSubject;
  });

  const handleToggleTextbook = (textbook: Textbook) => {
    if (selectedTextbooks.some((t) => t.id === textbook.id)) {
      setSelectedTextbooks(selectedTextbooks.filter((t) => t.id !== textbook.id));
    } else {
      setSelectedTextbooks([...selectedTextbooks, textbook]);
    }
  };

  const handleRemoveSelected = (textbookId: number) => {
    setSelectedTextbooks(selectedTextbooks.filter(t => t.id !== textbookId));
  };

  const allSubjects: (SubjectType | "すべて")[] = [
    "すべて",
    "英語",
    "現代文",
    "古文",
    "漢文",
    "小論文",
    "日本史探求",
    "世界史探求",
    "地理探求",
    "政治経済",
    "倫理公共",
    "情報",
    "数学",
    "化学",
    "物理",
    "生物",
    "地学"
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">教科書選択</h2>
      
      {/* Subject Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allSubjects.map((subject) => (
          <Button
            key={subject}
            variant={subjectFilter === subject ? "default" : "outline"}
            className={subjectFilter === subject ? "bg-math text-white" : ""}
            onClick={() => setSubjectFilter(subject)}
          >
            {subject}
          </Button>
        ))}
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="教科書名や出版社で検索..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Textbook Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-lg h-32 animate-pulse bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredTextbooks.map((textbook) => (
            <TextbookCard
              key={textbook.id}
              textbook={textbook}
              isSelected={selectedTextbooks.some((t) => t.id === textbook.id)}
              onToggle={() => handleToggleTextbook(textbook)}
            />
          ))}
          {filteredTextbooks.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
              検索条件に一致する教科書が見つかりませんでした。
            </div>
          )}
        </div>
      )}
      
      {/* Selected Textbooks */}
      {selectedTextbooks.length > 0 && (
        <div className="mt-8 mb-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            選択された教科書 ({selectedTextbooks.length})
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTextbooks.map((textbook) => {
              const subjectClass = 
                textbook.subject === "英語" ? "bg-english-lighter dark:bg-gray-700 text-english dark:text-english-light" :
                textbook.subject === "数学" ? "bg-math-lighter dark:bg-gray-700 text-math dark:text-math-light" :
                textbook.subject === "現代文" || textbook.subject === "古文" || textbook.subject === "漢文" || textbook.subject === "小論文" ? 
                  "bg-japanese-lighter dark:bg-gray-700 text-japanese dark:text-japanese-light" :
                textbook.subject === "化学" || textbook.subject === "物理" || textbook.subject === "生物" || textbook.subject === "地学" ? 
                  "bg-science-lighter dark:bg-gray-700 text-science dark:text-science-light" :
                "bg-social-lighter dark:bg-gray-700 text-social dark:text-social-light";
              
              return (
                <Badge 
                  key={textbook.id}
                  variant="outline"
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${subjectClass}`}
                >
                  <span>{textbook.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => handleRemoveSelected(textbook.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <Button variant="outline">
          キャンセル
        </Button>
        <Button 
          className="bg-math hover:bg-math-light"
          disabled={selectedTextbooks.length === 0}
          onClick={onNext}
        >
          次へ進む
        </Button>
      </div>
    </div>
  );
};

export default TextbookSelection;
