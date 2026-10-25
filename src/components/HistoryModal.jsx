import React from 'react';
import { History, Trash2, X, Award, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { clearQuizHistory } from '../utils/storage';

export default function HistoryModal({ isOpen, onClose, history, onRefreshHistory }) {
  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your entire quiz history?')) {
      clearQuizHistory();
      onRefreshHistory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Past Quiz Attempts
              </h3>
              <p className="text-xs text-slate-500">Track your score history over time</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {(!history || history.length === 0) ? (
            <div className="text-center py-12 text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No past attempts yet</p>
              <p className="text-xs mt-1">Complete your first quiz to see your score records here!</p>
            </div>
          ) : (
            history.map((entry) => (
              <div 
                key={entry.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {entry.percentage}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      entry.mode === 'exam' 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' 
                        : entry.mode === 'practice'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}>
                      {entry.mode} Mode
                    </span>
                  </div>
                  <p className="text-slate-500 line-clamp-1">{entry.fileName || 'Excel Quiz'}</p>
                  <div className="flex items-center gap-3 text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {entry.correctAnswers}/{entry.totalQuestions} Correct
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.timeTakenFormatted}
                    </span>
                  </div>
                </div>

                <div className="text-slate-400 text-[11px] self-end sm:self-center shrink-0">
                  {new Date(entry.date).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
          {history && history.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
