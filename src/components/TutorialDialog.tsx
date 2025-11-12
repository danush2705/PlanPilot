import { useState, useEffect } from 'react';

interface TutorialDialogProps {
  onClose: () => void;
}

const TutorialDialog = ({ onClose }: TutorialDialogProps) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const tutorialSteps = [
    {
      title: "Welcome to LyzrFlow!",
      content: "Let's plan your project together. I'll guide you through the process.",
      icon: "👋"
    },
    {
      title: "Describe Your Goal",
      content: "Start by describing your goal, like 'I need to build a website in 3 weeks'.",
      icon: "💡"
    },
    {
      title: "Refine Your Plan",
      content: "Feel free to add tasks, change timelines, or correct me. I'll keep track of everything.",
      icon: "✏️"
    },
    {
      title: "Generate Your Dashboard",
      content: "When you're ready, click 'Generate Report' to see the full dashboard with Gantt charts and risk analysis!",
      icon: "🚀"
    }
  ];

  const currentStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        className={`
          relative w-full max-w-md mx-4 p-6 
          bg-white dark:bg-[#0A0028] 
          rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10
          transition-all duration-300 ease-out transform
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Close tutorial"
        >
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="text-5xl mb-4 text-center animate-bounce">
          {currentStep.icon}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {currentStep.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`
                h-2 rounded-full transition-all duration-300
                ${index === step 
                  ? 'w-8 bg-pink-600' 
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
                }
              `}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            {isLastStep ? (
              <>
                <span>Got it!</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Step counter */}
        <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          Step {step + 1} of {tutorialSteps.length}
        </div>
      </div>
    </div>
  );
};

export default TutorialDialog;
