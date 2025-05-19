import { Checkbox } from "@/components/ui/checkbox";
import { Textbook } from "@/types/index";
import { Book, FileText } from "lucide-react";

interface TextbookCardProps {
  textbook: Textbook;
  isSelected: boolean;
  onToggle: () => void;
}

const TextbookCard = ({ textbook, isSelected, onToggle }: TextbookCardProps) => {
  // Get appropriate color based on subject
  const getSubjectClass = (subject: string) => {
    if (subject === "英語") return "english";
    if (["現代文", "古文", "漢文", "小論文"].includes(subject)) return "japanese";
    if (subject === "数学") return "math";
    if (["化学", "物理", "生物", "地学"].includes(subject)) return "science";
    return "social"; // Default for social studies subjects
  };

  const subjectColor = getSubjectClass(textbook.subject);

  return (
    <div 
      className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-${subjectColor} cursor-pointer transition-colors`}
      onClick={onToggle}
    >
      <div className={`h-2 bg-${subjectColor}`} />
      <div className="p-4">
        <div className="flex items-start mb-3">
          <Checkbox
            id={`book-${textbook.id}`}
            checked={isSelected}
            onCheckedChange={onToggle}
            className={`h-4 w-4 text-${subjectColor} rounded border-gray-300 focus:ring-${subjectColor} dark:border-gray-600 dark:bg-gray-800 mt-1`}
            onClick={(e) => e.stopPropagation()}
          />
          <label htmlFor={`book-${textbook.id}`} className="ml-2 block">
            <span className={`text-xs font-medium text-${subjectColor}`}>{textbook.subject}</span>
            <div className="font-medium text-gray-900 dark:text-white">{textbook.title}</div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{textbook.publisher}</span>
          </label>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center">
            <Book className="h-3 w-3 mr-1" />
            <span>{textbook.chapterCount} チャプター</span>
          </span>
          <span className="inline-flex items-center ml-3">
            <FileText className="h-3 w-3 mr-1" />
            <span>{textbook.questionCount} 問題</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TextbookCard;
