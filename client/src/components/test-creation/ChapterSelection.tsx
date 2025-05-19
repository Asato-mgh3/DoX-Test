import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, ChevronRight, Book, FileText } from "lucide-react";
import { Textbook, Chapter } from "@/types/index";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ChapterSelectionProps {
  selectedTextbooks: Textbook[];
  selectedChapters: Chapter[];
  setSelectedChapters: (chapters: Chapter[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ChapterSelection = ({
  selectedTextbooks,
  selectedChapters,
  setSelectedChapters,
  onNext,
  onBack,
}: ChapterSelectionProps) => {
  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters", selectedTextbooks.map(t => t.id).join(",")],
    enabled: selectedTextbooks.length > 0,
  });

  const chaptersByBook: Record<number, Chapter[]> = {};
  
  chapters.forEach((chapter) => {
    const bookId = chapter.bookId;
    if (!chaptersByBook[bookId]) {
      chaptersByBook[bookId] = [];
    }
    chaptersByBook[bookId].push(chapter);
  });

  const handleToggleChapter = (chapter: Chapter) => {
    if (selectedChapters.some((c) => c.id === chapter.id)) {
      setSelectedChapters(selectedChapters.filter((c) => c.id !== chapter.id));
    } else {
      setSelectedChapters([...selectedChapters, chapter]);
    }
  };

  const handleSelectAllChapters = (bookId: number, isSelected: boolean) => {
    if (isSelected) {
      // Remove all chapters from this book
      setSelectedChapters(selectedChapters.filter(c => c.bookId !== bookId));
    } else {
      // Add all chapters from this book
      const chaptersToAdd = chapters.filter(
        c => c.bookId === bookId && !selectedChapters.some(sc => sc.id === c.id)
      );
      setSelectedChapters([...selectedChapters, ...chaptersToAdd]);
    }
  };

  const handleRemoveSelected = (chapterId: number) => {
    setSelectedChapters(selectedChapters.filter(c => c.id !== chapterId));
  };

  const getTextbookById = (id: number) => {
    return selectedTextbooks.find(t => t.id === id);
  };

  const getSubjectClass = (subject: string) => {
    if (subject === "英語") return "bg-english text-white";
    if (["現代文", "古文", "漢文", "小論文"].includes(subject)) return "bg-japanese text-white";
    if (subject === "数学") return "bg-math text-white";
    if (["化学", "物理", "生物", "地学"].includes(subject)) return "bg-science text-white";
    return "bg-social text-white";
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">章の選択</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-32 bg-gray-100 dark:bg-gray-800"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {selectedTextbooks.map((textbook) => {
            const bookChapters = chaptersByBook[textbook.id] || [];
            const allChaptersSelected = bookChapters.length > 0 && 
              bookChapters.every(c => selectedChapters.some(sc => sc.id === c.id));
            
            return (
              <Accordion 
                key={textbook.id} 
                type="single" 
                collapsible 
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <AccordionItem value={`item-${textbook.id}`} className="border-0">
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className={`w-2 h-10 mr-4 rounded-sm ${getSubjectClass(textbook.subject)}`}></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{textbook.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{textbook.publisher}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Book className="h-4 w-4 mr-1" />
                          <span>{bookChapters.length} チャプター</span>
                        </div>
                        <Checkbox 
                          id={`select-all-${textbook.id}`}
                          checked={allChaptersSelected}
                          onCheckedChange={() => handleSelectAllChapters(textbook.id, allChaptersSelected)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-2 mt-2">
                      {bookChapters.map((chapter) => (
                        <div key={chapter.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <div className="flex items-center">
                            <Checkbox 
                              id={`chapter-${chapter.id}`}
                              checked={selectedChapters.some(c => c.id === chapter.id)}
                              onCheckedChange={() => handleToggleChapter(chapter)}
                              className="mr-3"
                            />
                            <Label 
                              htmlFor={`chapter-${chapter.id}`}
                              className="cursor-pointer text-gray-900 dark:text-white"
                            >
                              {chapter.title}
                            </Label>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{chapter.questionCount} 問題</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}
        </div>
      )}
      
      {/* Selected Chapters */}
      {selectedChapters.length > 0 && (
        <div className="mt-8 mb-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            選択された章 ({selectedChapters.length})
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedChapters.map((chapter) => {
              const textbook = getTextbookById(chapter.bookId);
              if (!textbook) return null;
              
              let badgeClass = "";
              if (textbook.subject === "英語") badgeClass = "bg-english-lighter dark:bg-gray-700 text-english dark:text-english-light";
              else if (textbook.subject === "数学") badgeClass = "bg-math-lighter dark:bg-gray-700 text-math dark:text-math-light";
              else if (["現代文", "古文", "漢文", "小論文"].includes(textbook.subject)) {
                badgeClass = "bg-japanese-lighter dark:bg-gray-700 text-japanese dark:text-japanese-light";
              } else if (["化学", "物理", "生物", "地学"].includes(textbook.subject)) {
                badgeClass = "bg-science-lighter dark:bg-gray-700 text-science dark:text-science-light";
              } else {
                badgeClass = "bg-social-lighter dark:bg-gray-700 text-social dark:text-social-light";
              }
              
              return (
                <Badge 
                  key={chapter.id}
                  variant="outline"
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${badgeClass}`}
                >
                  <span>{textbook.title}: {chapter.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => handleRemoveSelected(chapter.id)}
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
        <Button variant="outline" onClick={onBack}>
          戻る
        </Button>
        <Button 
          className="bg-math hover:bg-math-light"
          disabled={selectedChapters.length === 0}
          onClick={onNext}
        >
          次へ進む
        </Button>
      </div>
    </div>
  );
};

export default ChapterSelection;
