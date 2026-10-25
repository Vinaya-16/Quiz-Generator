import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Bookmark, 
  Lightbulb, 
  Filter,
  Check,
  X
} from 'lucide-react';

export default function QuestionReview({ questionDetails }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'unanswered' | 'marked'

  const counts = {
    all: questionDetails.length,
    incorrect: questionDetails.filter(q => q.isAttempted && !q.isCorrect).length,
    correct: questionDetails.filter(q => q.isCorrect).length,
    unanswered: questionDetails.filter(q => !q.isAttempted).length,
    marked: questionDetails.filter(q => q.isMarked).length,
  };

  const filtered = questionDetails.filter(q => {
    if (activeFilter === 'incorrect') return q.isAttempted && !q.isCorrect;
    if (activeFilter === 'correct') return q.isCorrect;
    if (activeFilter === 'unanswered') return !q.isAttempted;
    if (activeFilter === 'marked') return q.isMarked;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Review Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Questions ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('incorrect')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'incorrect'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Incorrect ({counts.incorrect})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('correct')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'correct'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Correct ({counts.correct})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('unanswered')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'unanswered'
              ? 'bg-slate-700 text-white dark:bg-slate-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unanswered ({counts.unanswered})
        </button>

        {counts.marked > 0 && (
          <button
            type="button"
            onClick={() => setActiveFilter('marked')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeFilter === 'marked'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Marked for Review ({counts.marked})
          </button>
        )}
      </div>

      {/* Review Questions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-70" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No questions match this filter</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isAnswered = item.isAttempted;
            const isCorrect = item.isCorrect;

            return (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold">
                      Q{item.displayNumber}
                    </span>
                    {item.isMarked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 text-[11px] font-semibold">
                        <Bookmark className="w-3 h-3 fill-current" />
                        Marked
                      </span>
                    )}
                  </div>

                  {/* Status Tag */}
                  <div>
                    {!isAnswered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Unanswered
                      </span>
                    ) : isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct (+{item.marks || 1} mark)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Statement */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
                  {item.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2 mb-4">
                  {item.options.map(opt => {
                    const isUserChoice = item.userAnswerKey === opt.originalKey;
                    const isRightAnswer = opt.isCorrect;

                    let optBg = 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                    let keyBadge = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

                    if (isRightAnswer) {
                      optBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-semibold';
                      keyBadge = 'bg-emerald-600 text-white';
                    } else if (isUserChoice && !isRightAnswer) {
                      optBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 font-semibold';
                      keyBadge = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={opt.originalKey}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs transition ${optBg}`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${keyBadge}`}>
                          {opt.displayKey}
                        </span>

                        <span className="flex-1 leading-relaxed pt-0.5">{opt.text}</span>

                        {isRightAnswer && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            Correct Answer
                          </span>
                        )}

                        {isUserChoice && !isRightAnswer && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0">
                            <X className="w-3.5 h-3.5" />
                            Your Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Explanation: </span>
                      <span>{item.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
