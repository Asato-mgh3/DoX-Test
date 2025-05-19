import React from "react";
import { AnySubjectType, getBackgroundColor } from "@/components/dashboard/SubjectCard";

interface TestLoadingAnimationProps {
  subject: AnySubjectType;
  message: string;
  isComplete: boolean;
  loadingProgress?: number; // オプションのプログレスバー用
}

/**
 * 共通のテスト読み込みアニメーションコンポーネント
 * 全ての科目で同じクオリティのローディングアニメーションを表示
 */
export const TestLoadingAnimation: React.FC<TestLoadingAnimationProps> = ({ 
  subject,
  message,
  isComplete,
  loadingProgress = 0
}) => {
  const subjectColor = getBackgroundColor(subject);
  
  return (
    <div className="bg-white p-8 rounded-xl shadow-md text-center">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div 
            className="w-16 h-16 border-4 border-gray-200 border-t-[color:var(--subject-color)] rounded-full animate-spin" 
            style={{ "--subject-color": subjectColor } as any}
          />
          <div className="absolute inset-0 flex items-center justify-center animate-checkmark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill={subjectColor}/>
            </svg>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-800 mb-2">{message}</h3>
      <p className="text-sm text-gray-500">問題データ読み込み中...</p>
      
      {/* オプショナルなプログレスバー */}
      {loadingProgress > 0 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[color:var(--subject-color)] h-2 rounded-full transition-all duration-300"
            style={{ 
              "--subject-color": subjectColor,
              width: `${loadingProgress}%` 
            } as any}
          />
        </div>
      )}
    </div>
  );
};

export default TestLoadingAnimation;