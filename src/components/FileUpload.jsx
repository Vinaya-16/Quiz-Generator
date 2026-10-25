import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Play, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { parseWorkbook, getSheetRawData, detectColumns, processQuestions } from '../utils/excelParser';

export default function FileUpload({ onParsedData, isLoading, setIsLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sheetsList, setSheetsList] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [workbookInstance, setWorkbookInstance] = useState(null);
  const [currentFileName, setCurrentFileName] = useState('');
  const fileInputRef = useRef(null);

  // Read arrayBuffer from file
  const handleBuffer = async (buffer, fileName) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setCurrentFileName(fileName);

      const { workbook, sheetNames } = parseWorkbook(buffer);

      if (!sheetNames || sheetNames.length === 0) {
        throw new Error('The uploaded Excel file contains no worksheets.');
      }

      setWorkbookInstance(workbook);
      setSheetsList(sheetNames);
      const activeSheet = sheetNames[0];
      setSelectedSheet(activeSheet);

      extractAndDeliver(workbook, activeSheet, fileName);
    } catch (err) {
      console.error('Error reading Excel file:', err);
      setErrorMsg(err.message || 'Failed to read Excel file. Please ensure it is a valid .xlsx or .xls file.');
      setIsLoading(false);
    }
  };

  const extractAndDeliver = (workbook, sheetName, fileName) => {
    try {
      const { headers, dataRows } = getSheetRawData(workbook, sheetName);

      if (dataRows.length === 0) {
        throw new Error(`Sheet "${sheetName}" has no data rows.`);
      }

      const detectedMapping = detectColumns(headers);
      const parsedResult = processQuestions(dataRows, headers, detectedMapping);

      onParsedData({
        fileName: fileName || currentFileName,
        sheetNames: workbook.SheetNames,
        selectedSheet: sheetName,
        headers,
        dataRows,
        detectedMapping,
        questions: parsedResult.questions,
        errors: parsedResult.errors,
        stats: parsedResult.stats,
        workbook,
      });
    } catch (err) {
      console.error('Error processing sheet:', err);
      setErrorMsg(err.message || 'Error processing sheet content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetChange = (e) => {
    const newSheet = e.target.value;
    setSelectedSheet(newSheet);
    if (workbookInstance) {
      setIsLoading(true);
      setTimeout(() => {
        extractAndDeliver(workbookInstance, newSheet, currentFileName);
      }, 50);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMsg('Please upload a valid Excel file (.xlsx or .xls).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      handleBuffer(evt.target.result, file.name);
    };
    reader.onerror = () => {
      setErrorMsg('Error reading file from disk.');
      setIsLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  // 1-Click Load Sample File
  const loadSampleFile = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await fetch('/Entrepreneurship_Development_100_MCQs.xlsx');
      if (!res.ok) {
        throw new Error('Sample Excel file could not be loaded.');
      }
      const buffer = await res.arrayBuffer();
      handleBuffer(buffer, 'Entrepreneurship_Development_100_MCQs.xlsx');
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not load sample file: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Excel MCQ Quiz
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Upload any Excel sheet with MCQs or test with the preloaded 100 questions.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Quick Start Button with preloaded 100 MCQs */}
        <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Entrepreneurship Development
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              100 multiple-choice questions ready to start
            </p>
          </div>
          <button
            type="button"
            onClick={loadSampleFile}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start 100 MCQs Quiz</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-400 uppercase">
            OR UPLOAD YOUR OWN EXCEL FILE
          </span>
        </div>

        {/* Upload Box */}
        <form
          onDragEnter={handleDrag}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleChange}
            className="hidden"
            id="excel-file-input"
          />

          <label
            htmlFor="excel-file-input"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' 
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Click to select or drag & drop an Excel file
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports .xlsx and .xls (options can be in any sequence)
            </p>
          </label>
        </form>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-semibold">Unable to read file</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Multiple Sheets Selector */}
        {sheetsList.length > 1 && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">Select Worksheet:</span>
            <select
              value={selectedSheet}
              onChange={handleSheetChange}
              className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium"
            >
              {sheetsList.map(sheet => (
                <option key={sheet} value={sheet}>{sheet}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
