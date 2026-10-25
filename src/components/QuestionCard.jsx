import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  RotateCcw, 
  HelpCircle,
  Lightbulb,
  Sparkles,
  Info
} from 'lucide-react';

export default function QuestionCard({
  question,
  userAnswerKey,
  onSelectAnswer,
  onClearAnswer,
  isFlagged,
  onToggleFlag,
  quizMode,
  showPracticeFeedback,
  onRetryPractice
}) {
  const {
    id,
    displayNumber,
    question: questionText,
    options,
    explanation,
    subject,
    topic,
    difficulty,
    marks,
    correctKey,
    correctAnswerText
  } = question;

  const isAnswered = userAnswerKey !== null && userAnswerKey !== undefined;
  const isPractice = quizMode === 'practice';
  const hasFeedback = isPractice && isAnswered;

  // Evaluation for practice mode
  const selectedOption = options.find(o => o.originalKey === userAnswerKey);
  const isCorrect = selectedOption?.isCorrect ?? false;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200">
      
      {/* Question Header & Meta Tags */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm">
            Question {displayNumber}
          </span>
          {marks > 1 && (
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              {marks} Marks
            </span>
          )}
          {subject && (
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-200 dark:border-indigo-800">
              {subject}
            </span>
          )}
          {difficulty && (
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
              difficulty.toLowerCase().includes('easy') 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : difficulty.toLowerCase().includes('hard')
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
            }`}>
              {difficulty}
            </span>
          )}
        </div>

        {/* Flag / Mark for Review Button */}
        <button
          type="button"
          onClick={onToggleFlag}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
            isFlagged
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
              : 'text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Mark this question to review later (Shortcut: M)"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-purple-600 text-purple-600 dark:fill-purple-400 dark:text-purple-400' : ''}`} />
          <span>{isFlagged ? 'Marked for Review' : 'Mark for Review'}</span>
        </button>
      </div>

      {/* Main Question Text */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
        {questionText}
      </h2>

      {/* Answer Options Grid / Cards */}
      <div className="space-y-3 mb-6" role="radiogroup" aria-label="Answer options">
        {options.map((opt, optIdx) => {
          const isSelected = userAnswerKey === opt.originalKey;
          
          let cardStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-800 dark:text-slate-200 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20';
          let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

          if (hasFeedback) {
            // In Practice Mode with answer submitted
            if (opt.isCorrect) {
              cardStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold shadow-xs ring-1 ring-emerald-500';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
            } else if (isSelected && !opt.isCorrect) {
              cardStyle = 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 font-semibold ring-1 ring-rose-400';
              badgeStyle = 'bg-rose-600 text-white border-rose-600';
            } else {
              cardStyle = 'opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500';
            }
          } else if (isSelected) {
            // Selected in Exam or Quick Quiz mode
            cardStyle = 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 font-semibold shadow-sm ring-2 ring-indigo-500/30';
            badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
          }

          return (
            <div
              key={opt.originalKey}
              onClick={() => onSelectAnswer(opt.originalKey)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onSelectAnswer(opt.originalKey);
                }
              }}
              className={`group flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${cardStyle}`}
            >
              {/* Option Key Badge [A, B, C, D] */}
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border transition ${badgeStyle}`}>
                {opt.displayKey}
              </div>

              {/* Option Text */}
              <div className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">
                {opt.text}
              </div>

              {/* Status Icons */}
              {hasFeedback ? (
                opt.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : isSelected ? (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                ) : null
              ) : (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-600' 
                    : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Practice Mode Feedback Banner & Explanation */}
      {hasFeedback && (
        <div className={`p-5 rounded-2xl border mb-6 animate-fade-in ${
          isCorrect 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200' 
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
        }`}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Correct! Well done! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span>Incorrect. The correct answer is Option {correctKey}.</span>
                </>
              )}
            </div>

            {/* Retry button in practice mode */}
            <button
              type="button"
              onClick={onRetryPractice}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Question</span>
            </button>
          </div>

          {!isCorrect && (
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
              Correct Option ({correctKey}): <span className="font-semibold">{correctAnswerText}</span>
            </p>
          )}

          {/* Explanation if available in Excel */}
          {explanation && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-start gap-2 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Explanation: </span>
                <span className="text-slate-700 dark:text-slate-300">{explanation}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Actions: Clear Answer */}
      {isAnswered && !hasFeedback && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClearAnswer}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Answer</span>
          </button>
        </div>
      )}
    </div>
  );
}
