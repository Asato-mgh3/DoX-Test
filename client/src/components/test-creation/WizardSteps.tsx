interface WizardStepsProps {
  currentStep: number;
}

const WizardSteps = ({ currentStep }: WizardStepsProps) => {
  const steps = [
    { number: 1, label: "教科書選択" },
    { number: 2, label: "章の選択" },
    { number: 3, label: "問題選択" },
    { number: 4, label: "テスト設定" },
    { number: 5, label: "プレビュー" },
  ];

  return (
    <div className="flex justify-between mb-8 relative">
      {steps.map((step) => (
        <div 
          key={step.number}
          className={`flex flex-col items-center text-center z-10 w-1/5 ${
            step.number < currentStep ? "step-connector" : ""
          }`}
        >
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              step.number === currentStep 
                ? "bg-math text-white"
                : step.number < currentStep
                ? "bg-math-light text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <span className="font-medium">{step.number}</span>
          </div>
          <span 
            className={`text-xs md:text-sm font-medium ${
              step.number === currentStep 
                ? "text-math"
                : step.number < currentStep
                ? "text-math-light"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
      
      {/* Progress Bar Background */}
      <div className="absolute top-5 left-0 h-1 bg-gray-200 dark:bg-gray-700 w-full" aria-hidden="true" />
      
      {/* Progress Bar Filled */}
      <div 
        className="absolute top-5 left-0 h-1 bg-math" 
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        aria-hidden="true" 
      />
    </div>
  );
};

export default WizardSteps;
