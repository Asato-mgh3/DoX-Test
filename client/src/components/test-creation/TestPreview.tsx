import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FileDown,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textbook, Chapter, Question, Test } from "@/types/index";
import { format } from "date-fns";

interface TestPreviewProps {
  selectedTextbooks: Textbook[];
  selectedChapters: Chapter[];
  selectedQuestions: Question[];
  testSettings: Partial<Test>;
  onBack: () => void;
}

const TestPreview = ({
  selectedTextbooks,
  selectedChapters,
  selectedQuestions,
  testSettings,
  onBack,
}: TestPreviewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const { toast } = useToast();

  const downloadDocxMutation = useMutation({
    mutationFn: () => 
      apiRequest("POST", "/api/tests/download", {
        testSettings,
        questions: selectedQuestions,
        format: "docx"
      }),
    onSuccess: async (response) => {
      try {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${testSettings.title || "test"}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast({
          title: "ダウンロード完了",
          description: "Word形式でテストがダウンロードされました。",
        });
      } catch (error) {
        console.error("Download error:", error);
        setDialogType("error");
        setDialogMessage("ダウンロード中にエラーが発生しました。もう一度お試しください。");
        setDialogOpen(true);
      }
    },
    onError: (error) => {
      console.error("API error:", error);
      setDialogType("error");
      setDialogMessage("サーバーとの通信中にエラーが発生しました。もう一度お試しください。");
      setDialogOpen(true);
    }
  });

  const downloadPdfMutation = useMutation({
    mutationFn: () => 
      apiRequest("POST", "/api/tests/download", {
        testSettings,
        questions: selectedQuestions,
        format: "pdf"
      }),
    onSuccess: async (response) => {
      try {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${testSettings.title || "test"}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast({
          title: "ダウンロード完了",
          description: "PDF形式でテストがダウンロードされました。",
        });
      } catch (error) {
        console.error("Download error:", error);
        setDialogType("error");
        setDialogMessage("ダウンロード中にエラーが発生しました。もう一度お試しください。");
        setDialogOpen(true);
      }
    },
    onError: (error) => {
      console.error("API error:", error);
      setDialogType("error");
      setDialogMessage("サーバーとの通信中にエラーが発生しました。もう一度お試しください。");
      setDialogOpen(true);
    }
  });

  const saveTestMutation = useMutation({
    mutationFn: () => 
      apiRequest("POST", "/api/tests", {
        title: testSettings.title,
        description: testSettings.description,
        bookIds: selectedTextbooks.map(t => t.bookId),
        chapterIds: selectedChapters.map(c => c.chapterId),
        questionIds: selectedQuestions.map(q => q.questionId),
        studentNameField: testSettings.studentNameField,
        classField: testSettings.classField,
        dateField: testSettings.dateField,
        scoreField: testSettings.scoreField,
        shuffleQuestions: testSettings.shuffleQuestions,
        shuffleOptions: testSettings.shuffleOptions,
        showAnswers: testSettings.showAnswers
      }),
    onSuccess: () => {
      setDialogType("success");
      setDialogMessage("テストが正常に保存されました。「マイテスト」から確認できます。");
      setDialogOpen(true);
    },
    onError: (error) => {
      console.error("API error:", error);
      setDialogType("error");
      setDialogMessage("テストの保存中にエラーが発生しました。もう一度お試しください。");
      setDialogOpen(true);
    }
  });

  const handleSaveTest = () => {
    saveTestMutation.mutate();
  };

  const handleDownloadDocx = () => {
    downloadDocxMutation.mutate();
  };

  const handleDownloadPdf = () => {
    downloadPdfMutation.mutate();
  };

  const currentDate = format(new Date(), "yyyy年MM月dd日");

  // Sample preview of the test
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">プレビュー</h2>
      
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        {/* Test Header */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold mb-2">{testSettings.title}</h3>
          {testSettings.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{testSettings.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-sm">
            <div className="text-left">
              <p><span className="font-medium">教科書:</span> {selectedTextbooks.map(t => t.title).join(", ")}</p>
              <p><span className="font-medium">章:</span> {selectedChapters.map(c => c.title).join(", ")}</p>
              <p><span className="font-medium">問題数:</span> {selectedQuestions.length}問</p>
            </div>
            <div className="text-left">
              {testSettings.studentNameField && <p><span className="font-medium">名前:</span> ___________________</p>}
              {testSettings.classField && <p><span className="font-medium">クラス:</span> ___________________</p>}
              {testSettings.dateField && <p><span className="font-medium">日付:</span> {currentDate}</p>}
              {testSettings.scoreField && <p><span className="font-medium">得点:</span> _____ / {selectedQuestions.length}</p>}
            </div>
          </div>
        </div>

        {/* Test Questions Preview (first 2 questions) */}
        <div className="space-y-6">
          {selectedQuestions.slice(0, 2).map((question, index) => (
            <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="font-medium mb-2">問題 {index + 1}</div>
              <p className="mb-3">{question.questionText}</p>
              <div className="space-y-2 ml-6">
                <div className="flex items-start">
                  <div className="w-6 text-right mr-2">A.</div>
                  <div>{question.optionA}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 text-right mr-2">B.</div>
                  <div>{question.optionB}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 text-right mr-2">C.</div>
                  <div>{question.optionC}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 text-right mr-2">D.</div>
                  <div>{question.optionD}</div>
                </div>
              </div>
            </div>
          ))}
          
          {selectedQuestions.length > 2 && (
            <div className="text-center text-gray-500 dark:text-gray-400 italic py-4">
              残り {selectedQuestions.length - 2} 問は省略されています...
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center mb-10">
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={handleDownloadDocx}
          disabled={downloadDocxMutation.isPending}
        >
          <FileText className="mr-2 h-4 w-4 text-blue-500" />
          Word形式でダウンロード (.docx)
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={handleDownloadPdf}
          disabled={downloadPdfMutation.isPending}
        >
          <FileDown className="mr-2 h-4 w-4 text-red-500" />
          PDF形式でダウンロード
        </Button>
        <Button 
          className="bg-math hover:bg-math-light"
          onClick={handleSaveTest}
          disabled={saveTestMutation.isPending}
        >
          テストを保存する
        </Button>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          戻る
        </Button>
      </div>
      
      {/* Result Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {dialogType === "success" ? (
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              )}
              {dialogType === "success" ? "完了" : "エラー"}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestPreview;
