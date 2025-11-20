import { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import GanttWrapper from "../components/GanttWrapper";
import TutorialDialog from "../components/TutorialDialog";

interface GanttTask {
  id: number;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  owner: string;
}

interface GanttLink {
  id: number;
  source: number;
  target: number;
  type: string;
}

interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

interface TechnologyStack {
  component: string;
  technology: string;
  rationale: string;
}

interface PlanData {
  projectName: string;
  executiveSummary: string;
  keyMilestones: string[];
  technologyStack: TechnologyStack[];
  resourceSuggestions: string[];
  ganttData: GanttData;
}

interface Message {
  role: string;
  content: string;
}

// Use environment variable for backend URL, fallback to localhost for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const Index = () => {
  const [view, setView] = useState('home');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [showTutorial, setShowTutorial] = useState(
    localStorage.getItem('planpilot_tutorial_seen') !== 'true'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const suggestionChips = [
    "Plan a mobile app launch in 3 months",
    "Create a Q4 marketing campaign",
    "Build a personal portfolio website",
    "Organize a product launch event in 6 weeks"
  ];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNewProject = () => {
    // Reset state
    setPlanData(null);
    setInputValue('');
    setIsLoading(false);
    
    // Go to input view
    setView('input');
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Call generate-plan endpoint directly with user's input
      const response = await axios.post(`${BACKEND_URL}/generate-plan`, {
        messages: [{ role: 'user', content: inputValue }]
      });
      
      // Success! Show dashboard
      setPlanData(response.data);
      setView('dashboard');
    } catch (error: unknown) {
      console.error("Failed to generate report:", error);
      const errorMsg = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unknown server error occurred.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion);
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Call generate-plan endpoint directly with suggestion
      const response = await axios.post(`${BACKEND_URL}/generate-plan`, {
        messages: [{ role: 'user', content: suggestion }]
      });
      
      // Success! Show dashboard
      setPlanData(response.data);
      setView('dashboard');
    } catch (error: unknown) {
      console.error("Failed to generate report:", error);
      const errorMsg = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unknown server error occurred.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };



  const handleDownloadPDF = async () => {
    if (!planData) return;
    
    try {
      // 1. Make the API call
      const response = await axios.post(
        `${BACKEND_URL}/generate-pdf`,
        planData,
        { responseType: 'blob' }
      );
      
      // 2. Create dynamic file name from project name
      const safeName = planData.projectName
        .replace(/[^a-zA-Z0-9 ]/g, '') // Remove special chars
        .replace(/ /g, '_') // Replace spaces with underscores
        || 'PlanPilot_Plan'; // Fallback name
      const fileName = `${safeName}.pdf`;
      
      // 3. Save the file with dynamic name
      saveAs(new Blob([response.data], { type: 'application/pdf' }), fileName);
    } catch (error: unknown) {
      // 4. Handle errors from the backend
      console.error('Failed to download PDF:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'The server failed to generate the document.';
      alert('Error downloading PDF: ' + errorMessage);
    }
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className="hidden md:flex w-48 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 lg:p-6 flex-col flex-shrink-0">
      <div className="flex items-center gap-2 lg:gap-3 mb-6 lg:mb-8">
        <svg className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" viewBox="0 0 80 80" fill="none">
          <path d="M20 15 L35 40 L20 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M40 15 L55 40 L40 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">PlanPilot</span>
      </div>

      <button
        onClick={handleNewProject}
        className="w-full px-3 lg:px-4 py-2 lg:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 mb-4 lg:mb-6 text-sm lg:text-base"
      >
        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Project</span>
      </button>

      <div className="mt-auto">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full p-2 lg:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center gap-2 lg:gap-3 text-sm lg:text-base"
        >
          {isDarkMode ? (
            <>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-gray-300">Light Mode</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="text-gray-700">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Home View - Professional Dashboard
  if (view === 'home') {
    return (
      <div className="h-screen w-screen flex bg-white dark:bg-gray-900 transition-colors overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column - Context */}
          <div className="flex-1 lg:w-3/5 flex items-center px-6 sm:px-8 md:px-10 lg:px-12 py-6 overflow-y-auto">
            <div className="w-full max-w-3xl mx-auto space-y-4 lg:space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3 leading-tight">
                  PlanPilot AI Project Planner
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
                  Transform conversations into structured project plans
                </p>
              </div>

              <div className="space-y-3 lg:space-y-4 text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                <p>
                  PlanPilot revolutionizes project planning by converting natural conversations into comprehensive, 
                  industry-standard project documentation. Our AI-powered system guides you through an intelligent 
                  dialogue, extracting key project details and automatically generating professional Gantt charts.
                </p>
                <p>
                  Simply describe your goals, timeline, and team structure—our AI handles the 
                  complexity of structuring tasks, identifying dependencies, and creating realistic schedules.
                </p>
                <p>
                  Export professional PDF reports with a single click.
                </p>
              </div>

              <div className="space-y-2 lg:space-y-3">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Key Benefits</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300"><strong>Error-Free Planning:</strong> AI-validated task dependencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300"><strong>Industry-Standard Reporting:</strong> Professional Gantt charts and PDF exports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300"><strong>Intelligent Guidance:</strong> Conversational AI that asks the right questions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Action & Visual */}
          <div className="flex-1 lg:w-2/5 flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-6 sm:px-8 py-6">
            <div className="text-center space-y-4 lg:space-y-6 max-w-sm">
              {/* Abstract Visual */}
              <div>
                <svg className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 mx-auto" viewBox="0 0 200 200" fill="none">
                  {/* Abstract flowchart representation */}
                  <circle cx="100" cy="40" r="15" className="fill-blue-600" />
                  <rect x="70" y="80" width="60" height="30" rx="4" className="fill-blue-500" />
                  <rect x="30" y="140" width="50" height="30" rx="4" className="fill-blue-400" />
                  <rect x="120" y="140" width="50" height="30" rx="4" className="fill-blue-400" />
                  
                  {/* Connecting lines */}
                  <line x1="100" y1="55" x2="100" y2="80" className="stroke-blue-600" strokeWidth="2" />
                  <line x1="100" y1="110" x2="55" y2="140" className="stroke-blue-500" strokeWidth="2" />
                  <line x1="100" y1="110" x2="145" y2="140" className="stroke-blue-500" strokeWidth="2" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">
                  Ready to Start?
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 lg:mb-6">
                  Begin your project planning journey with AI-powered assistance
                </p>
              </div>

              <button
                onClick={() => setView('input')}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold text-base sm:text-lg flex items-center gap-2 mx-auto shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Start New Project</span>
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                No signup required • Free to use • Export to PDF
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View - NEW FULL PAGE VIEW WITH LOADING GUARD
  if (view === 'dashboard') {
    // CRITICAL LOADING GUARD: Prevent crash if planData is not loaded yet
    if (!planData) {
      return (
        <div className="h-screen w-screen flex bg-white dark:bg-gray-900 transition-colors">
          <Sidebar />
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Generating Report...</h2>
              <p className="text-gray-600 dark:text-gray-300">Please wait, this may take a moment.</p>
            </div>
          </div>
        </div>
      );
    }

    // If we reach here, planData is loaded and safe to use
    return (
      <div className="h-screen w-screen flex bg-white dark:bg-gray-900 transition-colors">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dashboard Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('input')}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                aria-label="Back to input"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{planData.projectName}</h1>
            </div>
            
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Download PDF</span>
            </button>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-800">
            {/* Executive Summary Section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-blue-600 mb-4">Executive Summary</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{planData.executiveSummary}</p>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Milestones */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-bold text-blue-600 mb-4">Key Milestones</h2>
                <ul className="space-y-3">
                  {planData.keyMilestones.map((milestone, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{milestone}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technology Stack */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-bold text-blue-600 mb-4">Technology Stack</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10">
                        <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Component</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Technology</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planData.technologyStack.map((tech, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{tech.component}</td>
                          <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-semibold">{tech.technology}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{tech.rationale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resource Suggestions */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-bold text-blue-600 mb-4">Resource Requirements</h2>
                <ul className="space-y-2">
                  {planData.resourceSuggestions.map((resource, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gantt Chart Section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-blue-600 mb-4">Project Timeline</h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <GanttWrapper ganttData={planData.ganttData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Input View - Simplified Single-Shot Input
  return (
    <div className="h-screen w-screen flex bg-white dark:bg-gray-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        {/* Tutorial Dialog */}
        {showTutorial && (
          <TutorialDialog 
            onClose={() => {
              setShowTutorial(false);
              localStorage.setItem('planpilot_tutorial_seen', 'true');
            }} 
          />
        )}

        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setView('home')}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">New Project</h1>
          </div>
        </header>

        <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-3xl space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Describe Your Project
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Provide a comprehensive description of your project in one go. Include goals, timeline, features, and team size for the best results.
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {suggestionChips.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-red-900 dark:text-red-200">
                    <p className="font-semibold mb-1">Invalid Input</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Example: Build a mobile app for fitness tracking in 3 months with a team of 4 developers. Key features include workout logging, progress charts, and social sharing..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
              />
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-full px-6 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating Professional Report...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-semibold mb-1">Pro Tip:</p>
                  <p>The more details you provide, the better your project plan will be. Include specific timelines, team composition, and key features for optimal results.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
