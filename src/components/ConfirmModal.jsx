import React from 'react';
import { AlertCircle, CheckCircle2, Bookmark, HelpCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  unansweredCount,
  markedCount,
  isSubmitting
}) {
  if (!isOpen) return null;

  const hasUnanswered = unansweredCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            hasUnanswered 
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' 
              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {hasUnanswered ? 'Submit Unfinished Quiz?' : 'Ready to Submit Quiz?'}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {hasUnanswered
            ? `You have answered ${answeredCount} of ${totalQuestions} questions. ${unansweredCount} questions remain unanswered.`
            : `You have answered all ${totalQuestions} questions! Are you ready to see your final score and review?`}
        </p>

        {/* Breakdown Card */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-6 text-center">
          <div>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Answered</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{answeredCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Unanswered</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{unansweredCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Marked</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{markedCount}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
          >
            Keep Reviewing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Evaluating...' : 'Yes, Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
