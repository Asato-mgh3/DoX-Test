import { useState } from "react";
import TextbookSelection from "./TextbookSelection";
import ChapterSelection from "./ChapterSelection";
import ProblemSelection from "./ProblemSelection";
import TestSettings from "./TestSettings";
import TestPreview from "./TestPreview";
import WizardSteps from "./WizardSteps";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Textbook, Chapter, Question, Test } from "@/types/index";

const TestCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTextbooks, setSelectedTextbooks] = useState<Textbook[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [testSettings, setTestSettings] = useState<Partial<Test>>({
    title: "",
    description: "",
    studentNameField: true,
    classField: true,
    dateField: true,
    scoreField: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    showAnswers: false
  });

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TextbookSelection 
            selectedTextbooks={selectedTextbooks} 
            setSelectedTextbooks={setSelectedTextbooks} 
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <ChapterSelection 
            selectedTextbooks={selectedTextbooks}
            selectedChapters={selectedChapters}
            setSelectedChapters={setSelectedChapters}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return (
          <ProblemSelection 
            selectedTextbooks={selectedTextbooks}
            selectedChapters={selectedChapters}
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 4:
        return (
          <TestSettings 
            testSettings={testSettings}
            setTestSettings={setTestSettings}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 5:
        return (
          <TestPreview 
            selectedTextbooks={selectedTextbooks}
            selectedChapters={selectedChapters}
            selectedQuestions={selectedQuestions}
            testSettings={testSettings}
            onBack={handlePreviousStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="flex items-center text-sm mb-6 text-gray-500 dark:text-gray-400">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <a className="hover:text-gray-700 dark:hover:text-gray-300">ホーム</a>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <span className="font-medium text-gray-900 dark:text-white">テスト作成</span>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Test Creation Wizard */}
      <Card className="mb-8">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-2xl">テスト作成</CardTitle>
          <CardDescription>
            ステップに沿って作成することで、教科書から簡単にテストを作成できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <WizardSteps currentStep={currentStep} />
          <div className="mt-8">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestCreationWizard;
