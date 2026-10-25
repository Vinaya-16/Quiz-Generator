import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import QuizSetup from './components/QuizSetup';
import QuizPlay from './components/QuizPlay';
import QuizResults from './components/QuizResults';
import HelpModal from './components/HelpModal';
import HistoryModal from './components/HistoryModal';
import { 
  loadQuizSession, 
  clearQuizSession, 
  saveQuizHistory, 
  loadQuizHistory 
} from './utils/storage';
import { prepareQuizQuestions, calculateQuizResults } from './utils/quizEngine';
import { Play, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  // Screen state: 'upload' | 'mapping' | 'setup' | 'quiz' | 'results'
  const [currentScreen, setCurrentScreen] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [parsedData, setParsedData] = useState(null);
  const [confirmedQuestions, setConfirmedQuestions] = useState([]);
  const [quizSession, setQuizSession] = useState(null);
  const [quizResults, setQuizResults] = useState(null);

  // In-progress restored session notice
  const [savedSessionNotice, setSavedSessionNotice] = useState(null);

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Active quiz runtime metrics for Navbar
  const [navbarQuizInfo, setNavbarQuizInfo] = useState({
    timeRemaining: null,
    currentIndex: 0,
    totalQuestions: 0,
    answeredCount: 0,
  });

  // Check for saved session and history on mount
  useEffect(() => {
    setHistoryList(loadQuizHistory());

    const saved = loadQuizSession();
    if (saved && saved.questions && saved.questions.length > 0) {
      setSavedSessionNotice(saved);
    }
  }, []);

  // 1. Data parsed from Excel file
  const handleParsedData = (data) => {
    setParsedData(data);
    setConfirmedQuestions(data.questions);
    setCurrentScreen('mapping');
  };

  // 2. Confirmed column mapping & validated questions
  const handleConfirmMapping = ({ questions, stats, finalMapping }) => {
    setConfirmedQuestions(questions);
    setCurrentScreen('setup');
  };

  // 3. User configured quiz settings and clicked Start
  const handleStartQuiz = (config) => {
    clearQuizSession(); // fresh session
    setSavedSessionNotice(null);

    const sessionQuestions = prepareQuizQuestions(confirmedQuestions, config);

    const session = {
      questions: sessionQuestions,
      config,
      fileName: parsedData?.fileName || 'Excel Quiz',
      startTime: Date.now(),
    };

    setQuizSession(session);
    setCurrentScreen('quiz');
  };

  // Resume saved session
  const handleResumeSavedSession = () => {
    if (savedSessionNotice) {
      setQuizSession(savedSessionNotice);
      setSavedSessionNotice(null);
      setCurrentScreen('quiz');
    }
  };

  // Discard saved session
  const handleDiscardSavedSession = () => {
    clearQuizSession();
    setSavedSessionNotice(null);
  };

  // 4. Complete quiz and calculate results
  const handleCompleteQuiz = ({ userAnswers, flaggedQuestions, timeTakenSeconds }) => {
    setIsLoading(true);

    setTimeout(() => {
      const results = calculateQuizResults(
        quizSession.questions,
        userAnswers,
        flaggedQuestions,
        timeTakenSeconds
      );

      // Save to history
      const updatedHistory = saveQuizHistory({
        fileName: quizSession.fileName,
        mode: quizSession.config.mode,
        percentage: results.percentage,
        totalScore: results.totalScore,
        maxScore: results.maxScore,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        incorrectAnswers: results.incorrectAnswers,
        timeTakenSeconds: results.timeTakenSeconds,
        timeTakenFormatted: results.timeTakenFormatted,
      });

      setHistoryList(updatedHistory);
      setQuizResults(results);
      setIsLoading(false);
      setCurrentScreen('results');
    }, 150);
  };

  // Retry full quiz with same questions and settings
  const handleRetryFull = () => {
    if (quizSession) {
      handleStartQuiz(quizSession.config);
    }
  };

  // Retry only missed questions
  const handleRetryIncorrect = () => {
    if (!quizResults) return;
    const incorrectOnly = quizResults.questionDetails.filter(q => q.isAttempted && !q.isCorrect);
    if (incorrectOnly.length === 0) return;

    // Reset user answers and prepare session
    const resetQuestions = incorrectOnly.map(q => ({
      ...q,
      options: q.options.map(opt => ({ ...opt, isCorrect: opt.isCorrect }))
    }));

    const session = {
      questions: resetQuestions,
      config: {
        ...quizSession.config,
        mode: 'practice', // default to practice for review
      },
      fileName: `${quizSession.fileName} (Missed Questions Drill)`,
      startTime: Date.now(),
    };

    clearQuizSession();
    setQuizSession(session);
    setCurrentScreen('quiz');
  };

  // Start new quiz / go back to upload
  const handleNewQuiz = () => {
    clearQuizSession();
    setSavedSessionNotice(null);
    setQuizSession(null);
    setQuizResults(null);
    setCurrentScreen('upload');
  };

  // Exit quiz with confirmation
  const handleExitQuiz = () => {
    if (window.confirm('Are you sure you want to exit? Your current quiz progress will be saved in your browser.')) {
      setCurrentScreen('upload');
      setSavedSessionNotice(loadQuizSession());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        currentScreen={currentScreen}
        quizMode={quizSession?.config?.mode}
        timeRemaining={quizSession?.config?.hasTimer ? navbarQuizInfo.timeRemaining : null}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onExitQuiz={handleExitQuiz}
        currentQuestionIndex={navbarQuizInfo.currentIndex}
        totalQuestions={navbarQuizInfo.totalQuestions}
        answeredCount={navbarQuizInfo.answeredCount}
      />

      {/* Main Container */}
      <main className="flex-1 w-full pb-16">
        
        {/* Saved In-Progress Session Notification Banner */}
        {savedSessionNotice && currentScreen === 'upload' && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Unfinished Quiz in Progress
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    File: <span className="font-semibold">{savedSessionNotice.fileName}</span> (Q {savedSessionNotice.savedIndex + 1} of {savedSessionNotice.questions.length})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={handleDiscardSavedSession}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleResumeSavedSession}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Quiz</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                Processing Excel Content...
              </span>
            </div>
          </div>
        )}

        {/* Screen 1: File Upload */}
        {currentScreen === 'upload' && (
          <FileUpload
            onParsedData={handleParsedData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {/* Screen 2: Column Mapping & Live Preview */}
        {currentScreen === 'mapping' && parsedData && (
          <ColumnMapper
            parsedData={parsedData}
            onConfirmMapping={handleConfirmMapping}
            onBackToUpload={() => setCurrentScreen('upload')}
          />
        )}

        {/* Screen 3: Quiz Setup & Configuration */}
        {currentScreen === 'setup' && (
          <QuizSetup
            totalImportedQuestions={confirmedQuestions.length}
            fileName={parsedData?.fileName || 'Spreadsheet'}
            onStartQuiz={handleStartQuiz}
            onBackToMapping={() => setCurrentScreen('mapping')}
          />
        )}

        {/* Screen 4: Active Interactive Quiz View */}
        {currentScreen === 'quiz' && quizSession && (
          <QuizPlay
            quizSession={quizSession}
            onCompleteQuiz={handleCompleteQuiz}
            onExitQuiz={handleExitQuiz}
            onUpdateTime={setNavbarQuizInfo}
          />
        )}

        {/* Screen 5: Quiz Results Dashboard & Review */}
        {currentScreen === 'results' && quizResults && quizSession && (
          <QuizResults
            results={quizResults}
            quizSession={quizSession}
            onRetryFull={handleRetryFull}
            onRetryIncorrect={quizResults.incorrectAnswers > 0 ? handleRetryIncorrect : null}
            onNewQuiz={handleNewQuiz}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center gap-1.5">
          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
            Developed By <span className="text-indigo-600 dark:text-indigo-400">Vinaya Patole</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MCQ Quiz Website • Direct Excel (.xlsx / .xls) Importer
          </p>
        </div>
      </footer>

      {/* Help Modal (Keyboard Shortcuts) */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyList}
        onRefreshHistory={() => setHistoryList(loadQuizHistory())}
      />
    </div>
  );
}
