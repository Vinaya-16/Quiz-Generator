import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  Clock, 
  Play, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export default function QuizSetup({ 
  totalImportedQuestions, 
  fileName, 
  onStartQuiz, 
  onBackToMapping 
}) {
  const [selectedMode, setSelectedMode] = useState('practice'); // 'practice' | 'exam'
  const [useAllQuestions, setUseAllQuestions] = useState(true);
  const [questionCount, setQuestionCount] = useState(Math.min(totalImportedQuestions, 25));
  const [timerMinutes, setTimerMinutes] = useState(Math.max(15, Math.ceil(totalImportedQuestions * 1)));

  const handleStart = () => {
    const finalCount = useAllQuestions ? totalImportedQuestions : questionCount;
    onStartQuiz({
      mode: selectedMode,
      questionCount: finalCount,
      shuffleQuestions: false,
      shuffleOptions: false,
      hasTimer: selectedMode === 'exam',
      timerSeconds: timerMinutes * 60,
    });
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      
      {/* Back button */}
      <button
        type="button"
        onClick={onBackToMapping}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Quiz Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {totalImportedQuestions} questions available
          </p>
        </div>

        {/* Mode Selector: Practice vs Exam */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Select Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMode('practice')}
              className={`p-4 rounded-xl border-2 text-left transition ${
                selectedMode === 'practice'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Practice Mode</span>
              </div>
              <p className="text-xs text-slate-500">
                Instant answers & explanations after each question.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('exam')}
              className={`p-4 rounded-xl border-2 text-left transition ${
                selectedMode === 'exam'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Exam Mode</span>
              </div>
              <p className="text-xs text-slate-500">
                Timed test. Score and answers shown after submitting.
              </p>
            </button>
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Number of Questions
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setUseAllQuestions(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                useAllQuestions
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              All {totalImportedQuestions} Questions
            </button>

            {[20, 50].map(count => {
              if (count >= totalImportedQuestions) return null;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setUseAllQuestions(false);
                    setQuestionCount(count);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    !useAllQuestions && questionCount === count
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {count} Questions
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer Config if Exam Mode */}
        {selectedMode === 'exam' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Time Limit: {timerMinutes} Minutes
            </label>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}

        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Quiz Now</span>
        </button>
      </div>
    </div>
  );
}
