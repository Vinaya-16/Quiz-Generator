import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Settings2, 
  ArrowRight, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { processQuestions } from '../utils/excelParser';

export default function ColumnMapper({ 
  parsedData, 
  onConfirmMapping, 
  onBackToUpload 
}) {
  const { headers, dataRows, detectedMapping, fileName } = parsedData;

  const [questionCol, setQuestionCol] = useState(detectedMapping.questionCol);
  const [optionCols, setOptionCols] = useState(() => 
    (detectedMapping.optionCols || []).map(o => (typeof o === 'object' ? o.index : o))
  );
  const [answerCol, setAnswerCol] = useState(detectedMapping.answerCol);
  const [showSettings, setShowSettings] = useState(false);

  // Re-process questions dynamically
  const processed = useMemo(() => {
    const currentMapping = {
      questionCol,
      optionCols,
      answerCol,
      explanationCol: detectedMapping.explanationCol ?? -1,
      srNoCol: detectedMapping.srNoCol ?? -1,
      subjectCol: detectedMapping.subjectCol ?? -1,
    };
    return processQuestions(dataRows, headers, currentMapping);
  }, [dataRows, headers, questionCol, optionCols, answerCol, detectedMapping]);

  const handleConfirm = () => {
    if (processed.questions.length === 0) {
      alert('No valid questions found.');
      return;
    }
    onConfirmMapping({
      questions: processed.questions,
      stats: processed.stats,
      finalMapping: { questionCol, optionCols, answerCol }
    });
  };

  const sampleQ = processed.questions[0];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      
      {/* Top back link */}
      <button
        type="button"
        onClick={onBackToUpload}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Upload Different File</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Ready to Start
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source: <span className="font-semibold text-slate-700 dark:text-slate-300">{fileName}</span>
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            {processed.questions.length} Questions Ready
          </span>
        </div>

        {/* Preview of Question 1 */}
        {sampleQ && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
              Sample Preview (Question 1)
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              {sampleQ.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {sampleQ.options.map(opt => (
                <div 
                  key={opt.key}
                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                    opt.isCorrect 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-semibold' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {opt.key}
                  </span>
                  <span className="truncate flex-1">{opt.text}</span>
                  {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Column Settings Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showSettings ? 'Hide Column Settings' : 'Customize Column Mapping (Optional)'}</span>
            {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSettings && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Column:
                </label>
                <select
                  value={questionCol}
                  onChange={(e) => setQuestionCol(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i}>Column {i + 1}: {h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correct Answer Column:
                </label>
                <select
                  value={answerCol}
                  onChange={(e) => setAnswerCol(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i}>Column {i + 1}: {h}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Proceed Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={processed.questions.length === 0}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Proceed to Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
