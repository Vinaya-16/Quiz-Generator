import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Bookmark, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  X
} from 'lucide-react';

export default function QuestionPalette({
  questions,
  currentIndex,
  onSelectIndex,
  userAnswers,
  flaggedQuestions,
  onCloseMobile
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'answered' | 'unanswered' | 'marked'

  const total = questions.length;
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== null).length;
  const markedCount = Object.keys(flaggedQuestions).filter(k => flaggedQuestions[k]).length;
  const unansweredCount = total - answeredCount;
  const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  // Filter questions for the grid
  const filteredQuestions = questions.map((q, idx) => {
    const isAnswered = userAnswers[q.id] !== null && userAnswers[q.id] !== undefined;
    const isMarked = !!flaggedQuestions[q.id];
    return {
      ...q,
      originalIndex: idx,
      isAnswered,
      isMarked,
    };
  }).filter(item => {
    if (filter === 'answered') return item.isAnswered;
    if (filter === 'unanswered') return !item.isAnswered;
    if (filter === 'marked') return item.isMarked;
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
      
      {/* Palette Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Question Palette
          </h3>
          <p className="text-xs text-slate-500">
            {answeredCount} of {total} Answered ({progressPercent}%)
          </p>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Status Legend */}
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="text-slate-600 dark:text-slate-300">Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-300 dark:border-slate-600"></span>
          <span className="text-slate-600 dark:text-slate-300">Unanswered ({unansweredCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></span>
          <span className="text-slate-600 dark:text-slate-300">Marked ({markedCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full ring-2 ring-indigo-500 bg-white dark:bg-slate-900 shrink-0"></span>
          <span className="text-slate-600 dark:text-slate-300">Current Q</span>
        </div>
      </div>

      {/* Palette Filter Tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({total})
        </button>
        <button
          type="button"
          onClick={() => setFilter('answered')}
          className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
            filter === 'answered'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Answered ({answeredCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unanswered')}
          className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
            filter === 'unanswered'
              ? 'bg-slate-700 text-white dark:bg-slate-600'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unanswered ({unansweredCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('marked')}
          className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
            filter === 'marked'
              ? 'bg-purple-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Marked ({markedCount})
        </button>
      </div>

      {/* Question Number Tiles Grid */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1">
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
          {filteredQuestions.map((q) => {
            const isCurrent = q.originalIndex === currentIndex;
            
            let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';

            if (q.isAnswered && q.isMarked) {
              // Answered & Marked
              btnClass = 'bg-purple-600 text-white font-bold ring-2 ring-emerald-400';
            } else if (q.isMarked) {
              // Marked only
              btnClass = 'bg-purple-500 text-white font-bold';
            } else if (q.isAnswered) {
              // Answered
              btnClass = 'bg-emerald-500 text-white font-bold';
            }

            if (isCurrent) {
              btnClass += ' ring-2 ring-offset-2 ring-indigo-600 dark:ring-indigo-400 font-extrabold scale-105';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  onSelectIndex(q.originalIndex);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`h-9 w-full rounded-xl text-xs flex items-center justify-center transition-all duration-150 active:scale-95 shadow-xs relative ${btnClass}`}
                title={`Question ${q.displayNumber}${q.isMarked ? ' (Marked for review)' : ''}${q.isAnswered ? ' (Answered)' : ''}`}
              >
                <span>{q.displayNumber}</span>
                {q.isMarked && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
