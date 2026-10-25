import React from 'react';
import { 
  BookOpen, 
  Moon, 
  Sun, 
  Clock, 
  Home,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/quizEngine';

export default function Navbar({ 
  currentScreen, 
  quizMode, 
  timeRemaining, 
  onExitQuiz,
  currentQuestionIndex,
  totalQuestions,
  answeredCount
}) {
  const { theme, toggleTheme, isDark } = useTheme();

  const isLowTime = timeRemaining !== null && timeRemaining <= 120 && timeRemaining > 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={currentScreen === 'quiz' ? onExitQuiz : undefined}
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
              MCQ Quiz
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Developed By Vinaya Patole
            </p>
          </div>
        </div>

        {/* In-Quiz Mid-Bar info */}
        {currentScreen === 'quiz' && (
          <div className="flex items-center gap-3">
            {/* Question Counter */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span className="text-slate-400">|</span>
              <span className="text-indigo-600 dark:text-indigo-400">{answeredCount} Answered</span>
            </div>

            {/* Timer if in Exam Mode */}
            {timeRemaining !== null && (
              <div 
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border transition ${
                  isLowTime
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Exit Quiz Button if in quiz */}
          {currentScreen === 'quiz' && (
            <button
              type="button"
              onClick={onExitQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
