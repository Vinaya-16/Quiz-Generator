import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Bookmark, 
  RotateCcw, 
  Send, 
  Grid, 
  AlertCircle
} from 'lucide-react';
import QuestionCard from './QuestionCard';
import QuestionPalette from './QuestionPalette';
import ConfirmModal from './ConfirmModal';
import { saveQuizSession, clearQuizSession } from '../utils/storage';

export default function QuizPlay({
  quizSession,
  onCompleteQuiz,
  onExitQuiz,
  onUpdateTime
}) {
  const { questions, config, fileName } = quizSession;
  
  const [currentIndex, setCurrentIndex] = useState(quizSession.savedIndex || 0);
  const [userAnswers, setUserAnswers] = useState(quizSession.savedAnswers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState(quizSession.savedFlags || {});
  const [timeRemaining, setTimeRemaining] = useState(
    quizSession.savedTimeRemaining !== undefined ? quizSession.savedTimeRemaining : (config.hasTimer ? config.timerSeconds : null)
  );
  const [timeSpent, setTimeSpent] = useState(quizSession.savedTimeSpent || 0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;

  // Answered, Unanswered, Marked counts
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== null).length;
  const unansweredCount = totalQuestions - answeredCount;
  const markedCount = Object.keys(flaggedQuestions).filter(k => flaggedQuestions[k]).length;

  // Timer countdown effect
  useEffect(() => {
    let timer = null;
    timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);

      if (timeRemaining !== null) {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Sync time remaining to navbar
  useEffect(() => {
    if (onUpdateTime) {
      onUpdateTime({
        timeRemaining,
        currentIndex,
        totalQuestions,
        answeredCount
      });
    }
  }, [timeRemaining, currentIndex, answeredCount, totalQuestions, onUpdateTime]);

  // Auto-save session to localStorage
  useEffect(() => {
    saveQuizSession({
      questions,
      config,
      fileName,
      savedIndex: currentIndex,
      savedAnswers: userAnswers,
      savedFlags: flaggedQuestions,
      savedTimeRemaining: timeRemaining,
      savedTimeSpent: timeSpent,
      timestamp: Date.now(),
    });
  }, [currentIndex, userAnswers, flaggedQuestions, timeRemaining, timeSpent, questions, config, fileName]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();

      // Navigation: Left / Right arrows
      if (e.key === 'ArrowLeft' || key === 'p') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight' || key === 'n') {
        e.preventDefault();
        goToNext();
      }
      // Flag toggle: 'm'
      else if (key === 'm') {
        e.preventDefault();
        handleToggleFlag();
      }
      // Clear answer: 'c'
      else if (key === 'c') {
        e.preventDefault();
        handleClearAnswer();
      }
      // Option keys: 1, 2, 3, 4 or a, b, c, d
      else if (['1', '2', '3', '4', '5', '6'].includes(key)) {
        const optIdx = parseInt(key, 10) - 1;
        if (currentQuestion.options[optIdx]) {
          handleSelectAnswer(currentQuestion.options[optIdx].originalKey);
        }
      } else if (['a', 'b', 'c', 'd', 'e', 'f'].includes(key)) {
        const targetOpt = currentQuestion.options.find(
          o => o.displayKey.toLowerCase() === key || o.originalKey.toLowerCase() === key
        );
        if (targetOpt) {
          handleSelectAnswer(targetOpt.originalKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQuestion]);

  // Option selection
  const handleSelectAnswer = (optionOriginalKey) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionOriginalKey
    }));
  };

  // Clear answer
  const handleClearAnswer = () => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  // Toggle flag
  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  // Navigation handlers
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Last question reached, prompt submit
      setShowConfirmModal(true);
    }
  };

  // Submit handling
  const handleAutoSubmit = () => {
    setIsSubmitting(true);
    clearQuizSession();
    onCompleteQuiz({
      userAnswers,
      flaggedQuestions,
      timeTakenSeconds: timeSpent,
    });
  };

  const handleManualSubmit = () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    clearQuizSession();
    onCompleteQuiz({
      userAnswers,
      flaggedQuestions,
      timeTakenSeconds: timeSpent,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Mobile Bar */}
      <div className="flex sm:hidden items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-4 shadow-sm">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Q {currentIndex + 1} of {totalQuestions}
        </span>
        <button
          type="button"
          onClick={() => setShowMobilePalette(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
        >
          <Grid className="w-4 h-4" />
          <span>Question Palette</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Quiz Area (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <QuestionCard
            question={currentQuestion}
            userAnswerKey={userAnswers[currentQuestion.id] ?? null}
            onSelectAnswer={handleSelectAnswer}
            onClearAnswer={handleClearAnswer}
            isFlagged={!!flaggedQuestions[currentQuestion.id]}
            onToggleFlag={handleToggleFlag}
            quizMode={config.mode}
            showPracticeFeedback={config.mode === 'practice'}
            onRetryPractice={handleClearAnswer}
          />

          {/* Bottom Navigation Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Prev Button */}
            <button
              type="button"
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {/* Quick Status Pill */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>{answeredCount} Answered</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400">{unansweredCount} Left</span>
            </div>

            {/* Right Buttons: Next & Submit */}
            <div className="w-full sm:w-auto flex items-center gap-2.5">
              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={goToNext}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : null}

              {/* Submit Quiz Button */}
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 ${
                  currentIndex === totalQuestions - 1
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                    : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Quiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Question Palette (4 cols on desktop) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
            userAnswers={userAnswers}
            flaggedQuestions={flaggedQuestions}
          />
        </div>
      </div>

      {/* Mobile Question Palette Drawer */}
      {showMobilePalette && (
        <div className="fixed inset-0 z-50 sm:hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-4/5 max-w-sm h-full bg-white dark:bg-slate-900 p-4 shadow-2xl">
            <QuestionPalette
              questions={questions}
              currentIndex={currentIndex}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
              userAnswers={userAnswers}
              flaggedQuestions={flaggedQuestions}
              onCloseMobile={() => setShowMobilePalette(false)}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleManualSubmit}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        markedCount={markedCount}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
