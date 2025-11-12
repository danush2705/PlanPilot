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

const BACKEND_URL = "http://127.0.0.1:8000";

const Index = () => {
  const [view, setView] = useState('home');
  const [chatKey, setChatKey] = useState(0);
  const initialMessages: Message[] = [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [showTutorial, setShowTutorial] = useState(
    localStorage.getItem('lyzrflow_tutorial_seen') !== 'true'
  );
  const [isReportReady, setIsReportReady] = useState(false);
  const [chatProgress, setChatProgress] = useState(0);
  const [showReportReadyMessage, setShowReportReadyMessage] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

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
    // Increment the key to force React to destroy the old chat component
    // and mount a brand new one (mimicking a browser reload).
    setChatKey(prevKey => prevKey + 1);
    
    // Reset all state manually as well for safety
    setMessages([]);
    setPlanData(null);
    setIsReportReady(false);
    setChatProgress(0);
    setShowReportReadyMessage(false);
    setInputValue('');
    setEditingMessageIndex(null);
    setEditedContent('');
    setIsChatLoading(false);
    
    // Go to chat view
    setView('chat');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Create user message
    const userMessage = { role: 'user', content: inputValue };
    const updatedMessages = [...messages, userMessage];
    
    // Update UI immediately
    setMessages(updatedMessages);
    setInputValue('');
    setIsChatLoading(true);

    try {
      // Call intelligent chat endpoint
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        messages: updatedMessages
      });

      const { assistantReply, progress, isSufficient } = response.data;

      // CRITICAL: Update button state based on isSufficient (bidirectional)
      if (isSufficient) {
        setIsReportReady(true);
        setShowReportReadyMessage(true);
      } else {
        setIsReportReady(false);
        setShowReportReadyMessage(false);
      }
      
      setChatProgress(progress);

      // Add empty assistant message bubble
      const emptyAssistantMsg = { role: 'assistant', content: '' };
      setMessages(currentMsgs => [...currentMsgs, emptyAssistantMsg]);

      // Stream the text word by word for ChatGPT-like effect
      const words = assistantReply.split(' ');
      let currentContent = '';
      
      for (const word of words) {
        currentContent += word + ' ';
        setMessages(currentMsgs => {
          const allExceptLast = currentMsgs.slice(0, -1);
          const lastMsg = { ...currentMsgs[currentMsgs.length - 1], content: currentContent.trim() };
          return [...allExceptLast, lastMsg];
        });
        // Wait 50ms before adding next word
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error("Error in chat:", error);
      // Fallback response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, I encountered an error. Could you please try again?'
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const userMessage = { role: 'user', content: suggestion };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        messages: updatedMessages
      });

      const { assistantReply, progress, isSufficient } = response.data;

      // Update button state (bidirectional)
      if (isSufficient) {
        setIsReportReady(true);
        setShowReportReadyMessage(true);
      } else {
        setIsReportReady(false);
        setShowReportReadyMessage(false);
      }
      
      setChatProgress(progress);

      // Add empty assistant message bubble
      const emptyAssistantMsg = { role: 'assistant', content: '' };
      setMessages(currentMsgs => [...currentMsgs, emptyAssistantMsg]);

      // Stream the text word by word for ChatGPT-like effect
      const words = assistantReply.split(' ');
      let currentContent = '';
      
      for (const word of words) {
        currentContent += word + ' ';
        setMessages(currentMsgs => {
          const allExceptLast = currentMsgs.slice(0, -1);
          const lastMsg = { ...currentMsgs[currentMsgs.length - 1], content: currentContent.trim() };
          return [...allExceptLast, lastMsg];
        });
        // Wait 50ms before adding next word
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Great! I can help you plan that. Please provide any additional details.'
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleEditMessage = (index: number) => {
    setEditingMessageIndex(index);
    setEditedContent(messages[index].content);
  };

  const handleSaveEdit = () => {
    if (editingMessageIndex !== null) {
      const updatedMessages = [...messages];
      updatedMessages[editingMessageIndex].content = editedContent;
      setMessages(updatedMessages);
      setEditingMessageIndex(null);
      setEditedContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageIndex(null);
    setEditedContent('');
  };

  const handleGenerateReport = async () => {
    // Hide ready message and show loading
    setIsLoading(true);
    setShowReportReadyMessage(false);
    setIsReportReady(false); // Disable button immediately
    
    try {
      const response = await axios.post(`${BACKEND_URL}/generate-plan`, {
        messages: messages
      });
      
      // CRITICAL: Check for error key from two-stage validator
      if (response.data.error) {
        // LLM validation failed
        alert("Report Generation Failed: " + response.data.error);
      } else {
        // Success! Show dashboard
        setPlanData(response.data);
        setView('dashboard');
      }
    } catch (error: unknown) {
      // Handle network/server errors
      console.error("Failed to generate report:", error);
      const errorMsg = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unknown server error occurred.";
      alert("Report Failed: " + errorMsg);
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
        || 'LyzrFlow_Plan'; // Fallback name
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
        <span className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">LyzrFlow</span>
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
                  LyzrFlow AI Project Planner
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
                  Transform conversations into structured project plans
                </p>
              </div>

              <div className="space-y-3 lg:space-y-4 text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                <p>
                  LyzrFlow revolutionizes project planning by converting natural conversations into comprehensive, 
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
                onClick={() => setView('chat')}
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
                onClick={() => setView('chat')}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                aria-label="Back to chat"
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

  // Chat View
  return (
    <div className="h-screen w-screen flex bg-white dark:bg-gray-900 transition-colors">
      <Sidebar />
      <div key={chatKey} className="flex-1 flex flex-col relative">
        {/* Tutorial Dialog */}
        {showTutorial && (
          <TutorialDialog 
            onClose={() => {
              setShowTutorial(false);
              localStorage.setItem('lyzrflow_tutorial_seen', 'true');
            }} 
          />
        )}

        {/* Floating Progress Card */}
        {chatProgress > 0 && chatProgress < 100 && (
          <div className="fixed bottom-24 left-6 z-50 px-4 py-3 rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-blue-500/50 dark:border-blue-500/30 animate-pulse">
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Planning Progress</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{chatProgress}%</span>
            </div>
          </div>
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

        <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 px-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Start Your Project</h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Choose a suggestion or describe your project</p>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center max-w-2xl">
                {suggestionChips.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && messages.length <= 2 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                }`}
              >
                {editingMessageIndex === index ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-sm rounded bg-gray-600 text-white hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="flex-1">{message.content}</span>
                    {message.role === 'user' && (
                      <button
                        onClick={() => handleEditMessage(index)}
                        className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
                        aria-label="Edit message"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative">
          {/* Report Ready Message */}
          {showReportReadyMessage && isReportReady && !isLoading && (
            <div className="absolute -top-12 right-4 flex flex-col items-center animate-bounce">
              <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-md shadow-lg">
                Report is Ready!
              </span>
              <span className="text-green-500 text-2xl">↓</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your project..."
              className="flex-grow px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isChatLoading}
              className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={!isReportReady || isLoading}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ${
                isReportReady && !isLoading
                  ? 'bg-pink-600 text-white hover:bg-pink-700 cursor-pointer animate-pulse'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Index;
