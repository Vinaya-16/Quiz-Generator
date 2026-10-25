import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Download,
  Zap,
  Home,
  Check,
  X,
  Lightbulb
} from 'lucide-react';
import { formatTime } from '../utils/quizEngine';

export default function QuizResults({
  results,
  quizSession,
  onRetryFull,
  onRetryIncorrect,
  onNewQuiz
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'unanswered'

  const {
    totalQuestions,
    questionsAttempted,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    totalScore,
    maxScore,
    percentage,
    accuracyRate,
    timeTakenFormatted,
    questionDetails,
  } = results;

  // Trigger celebration confetti on mount if passed (>= 50%)
  useEffect(() => {
    if (percentage >= 50) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [percentage]);

  // Export JSON Report
  const handleExportJSON = () => {
    const reportData = {
      quizTitle: quizSession.fileName || 'Excel Quiz',
      date: new Date().toISOString(),
      mode: quizSession.config.mode,
      summary: {
        totalQuestions,
        questionsAttempted,
        correctAnswers,
        incorrectAnswers,
        unansweredQuestions,
        totalScore,
        maxScore,
        percentage: `${percentage}%`,
        accuracyRate: `${accuracyRate}%`,
        timeTaken: timeTakenFormatted,
      },
      questionReview: questionDetails.map(q => ({
        id: q.id,
        question: q.question,
        userAnswer: q.userAnswerText,
        userKey: q.userAnswerKey,
        correctAnswer: q.correctAnswerText,
        correctKey: q.correctKey,
        isCorrect: q.isCorrect,
        explanation: q.explanation || '',
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quiz_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered questions
  const filtered = questionDetails.filter(q => {
    if (filter === 'incorrect') return q.isAttempted && !q.isCorrect;
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'unanswered') return !q.isAttempted;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Score Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center mb-8">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Quiz Completed</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {percentage}%
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {correctAnswers} of {totalQuestions} Correct Answers
        </p>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 max-w-xl mx-auto">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Attempted</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">{questionsAttempted}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Correct</span>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{correctAnswers}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Incorrect</span>
            <p className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5">{incorrectAnswers}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Time</span>
            <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">{timeTakenFormatted}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onRetryFull}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Quiz</span>
          </button>

          {incorrectAnswers > 0 && onRetryIncorrect && (
            <button
              type="button"
              onClick={onRetryIncorrect}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Practice Missed ({incorrectAnswers})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            type="button"
            onClick={onNewQuiz}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Question Review
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filter === 'incorrect'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Incorrect ({incorrectAnswers})
            </button>
            <button
              type="button"
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Correct ({correctAnswers})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filtered.map(q => {
            return (
              <div 
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-500">
                    Question {q.displayNumber}
                  </span>
                  {q.isAttempted ? (
                    q.isCorrect ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      Unanswered
                    </span>
                  )}
                </div>

                <p className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                  {q.question}
                </p>

                {/* Options */}
                <div className="space-y-1.5 text-xs">
                  {q.options.map(opt => {
                    const isUserChoice = q.userAnswerKey === opt.originalKey;
                    const isRightAnswer = opt.isCorrect;

                    let rowStyle = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                    if (isRightAnswer) {
                      rowStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-semibold';
                    } else if (isUserChoice && !isRightAnswer) {
                      rowStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-100 font-semibold';
                    }

                    return (
                      <div 
                        key={opt.originalKey}
                        className={`p-2.5 rounded-lg border flex items-center gap-2 ${rowStyle}`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isRightAnswer 
                            ? 'bg-emerald-600 text-white' 
                            : isUserChoice 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {opt.displayKey}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isRightAnswer && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Correct Answer</span>}
                        {isUserChoice && !isRightAnswer && <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">✗ Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong className="font-semibold">Explanation:</strong> {q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
