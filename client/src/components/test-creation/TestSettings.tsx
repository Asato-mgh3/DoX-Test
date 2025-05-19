import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Test } from "@/types/index";

interface TestSettingsProps {
  testSettings: Partial<Test>;
  setTestSettings: (settings: Partial<Test>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TestSettings = ({
  testSettings,
  setTestSettings,
  onNext,
  onBack,
}: TestSettingsProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestSettings({ ...testSettings, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setTestSettings({ ...testSettings, [name]: checked });
  };

  const isValid = testSettings.title && testSettings.title.trim() !== "";

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">テスト設定</h2>
      
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">テスト名<span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              value={testSettings.title || ""}
              onChange={handleInputChange}
              placeholder="例: 英語基礎文法テスト"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              value={testSettings.description || ""}
              onChange={handleInputChange}
              placeholder="テストの説明や注意事項などを入力してください"
              rows={3}
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">ヘッダー情報設定</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="studentNameField" className="flex-1">
                  生徒名フィールド
                </Label>
                <Switch
                  id="studentNameField"
                  checked={testSettings.studentNameField !== false}
                  onCheckedChange={(checked) => handleSwitchChange("studentNameField", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="classField" className="flex-1">
                  クラスフィールド
                </Label>
                <Switch
                  id="classField"
                  checked={testSettings.classField !== false}
                  onCheckedChange={(checked) => handleSwitchChange("classField", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="dateField" className="flex-1">
                  日付フィールド
                </Label>
                <Switch
                  id="dateField"
                  checked={testSettings.dateField !== false}
                  onCheckedChange={(checked) => handleSwitchChange("dateField", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="scoreField" className="flex-1">
                  得点フィールド
                </Label>
                <Switch
                  id="scoreField"
                  checked={testSettings.scoreField !== false}
                  onCheckedChange={(checked) => handleSwitchChange("scoreField", checked)}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">オプション設定</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleQuestions" className="flex-1">
                  問題順をシャッフル
                  <span className="block text-xs text-gray-500 dark:text-gray-400">問題の順番をランダムに並べ替えます</span>
                </Label>
                <Switch
                  id="shuffleQuestions"
                  checked={testSettings.shuffleQuestions || false}
                  onCheckedChange={(checked) => handleSwitchChange("shuffleQuestions", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleOptions" className="flex-1">
                  選択肢をシャッフル
                  <span className="block text-xs text-gray-500 dark:text-gray-400">各問題の選択肢の順番をランダムに並べ替えます</span>
                </Label>
                <Switch
                  id="shuffleOptions"
                  checked={testSettings.shuffleOptions || false}
                  onCheckedChange={(checked) => handleSwitchChange("shuffleOptions", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showAnswers" className="flex-1">
                  解答欄を表示
                  <span className="block text-xs text-gray-500 dark:text-gray-400">正解を記入するための解答欄を表示します</span>
                </Label>
                <Switch
                  id="showAnswers"
                  checked={testSettings.showAnswers || false}
                  onCheckedChange={(checked) => handleSwitchChange("showAnswers", checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <Button variant="outline" onClick={onBack}>
          戻る
        </Button>
        <Button 
          className="bg-math hover:bg-math-light"
          disabled={!isValid}
          onClick={onNext}
        >
          次へ進む
        </Button>
      </div>
    </div>
  );
};

export default TestSettings;
