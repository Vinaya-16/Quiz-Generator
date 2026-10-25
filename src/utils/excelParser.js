import * as XLSX from 'xlsx';

/**
 * Normalizes header string for comparison
 */
function normalizeHeader(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[_\-\.\:\(\)\[\]\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts intended option key ('A', 'B', 'C', 'D'...) from a column header name
 * Handles out-of-order column headers like "Option C", "Choice B", "(D)", "1", "2"
 */
export function extractOptionKey(headerName, fallbackIdx = 0) {
  if (!headerName) return String.fromCharCode(65 + fallbackIdx);
  const clean = String(headerName).trim();

  // 1. Matches "Option B", "Opt C", "Choice A", "(B)", "[B]", "B.", "B:", or standalone "B"
  const matchLetter =
    clean.match(/(?:option|opt|choice)?\s*[\(\[]?\s*([a-hA-H])\s*[\)\]\:\.]?$/i) ||
    clean.match(/\b([A-H])\b/i);

  if (matchLetter && matchLetter[1]) {
    return matchLetter[1].toUpperCase();
  }

  // 2. Matches "Option 1", "Opt 2", "Choice 3", "3" -> maps 1->A, 2->B, 3->C
  const matchNum =
    clean.match(/(?:option|opt|choice)?\s*[\(\[]?\s*([1-8])\s*[\)\]\:\.]?$/i) ||
    clean.match(/\b([1-8])\b/);

  if (matchNum && matchNum[1]) {
    const num = parseInt(matchNum[1], 10);
    return String.fromCharCode(64 + num);
  }

  return String.fromCharCode(65 + fallbackIdx);
}

/**
 * Detects the most likely header row index and column mappings
 * Handles cases where options are not in sequential order in the sheet
 */
export function detectColumns(headers) {
  const mapping = {
    questionCol: -1,
    optionCols: [], // array of { index, name, key }
    answerCol: -1,
    explanationCol: -1,
    subjectCol: -1,
    topicCol: -1,
    difficultyCol: -1,
    marksCol: -1,
    srNoCol: -1,
  };

  const specificOptionRegex = /^(?:option|opt|choice)\s*[a-f1-8]/i;

  headers.forEach((h, idx) => {
    const raw = String(h || '').trim();
    const norm = normalizeHeader(raw);
    if (!norm) return;

    // Serial No
    if (/^(sr\s*no|sl\s*no|s\s*no|no|id|#)$/i.test(norm)) {
      if (mapping.srNoCol === -1) mapping.srNoCol = idx;
      return;
    }

    // Correct Answer (check before generic option check)
    if (
      /^(correct\s*(answer|ans|option|choice|opt)|right\s*ans|ans(wer)?\s*key|correct_ans|correct)$/i.test(norm) ||
      (norm.includes('correct') && (norm.includes('ans') || norm.includes('opt') || norm.includes('key')))
    ) {
      if (mapping.answerCol === -1) mapping.answerCol = idx;
      return;
    }

    // Explanation
    if (/^(explanation|explain|solution|rationale|hint|notes)$/i.test(norm)) {
      if (mapping.explanationCol === -1) mapping.explanationCol = idx;
      return;
    }

    // Subject & Topic
    if (/^(subject|course|category)$/i.test(norm)) {
      if (mapping.subjectCol === -1) mapping.subjectCol = idx;
      return;
    }
    if (/^(topic|subtopic|chapter|module|unit|tag)$/i.test(norm)) {
      if (mapping.topicCol === -1) mapping.topicCol = idx;
      return;
    }

    // Difficulty
    if (/^(difficulty|level|grade|type)$/i.test(norm)) {
      if (mapping.difficultyCol === -1) mapping.difficultyCol = idx;
      return;
    }

    // Marks / Points
    if (/^(marks?|points?|score|weightage)$/i.test(norm)) {
      if (mapping.marksCol === -1) mapping.marksCol = idx;
      return;
    }

    // Question
    if (
      /^(question|ques|problem|statement|item|mcq|title)$/i.test(norm) ||
      norm.startsWith('question') ||
      norm.startsWith('problem')
    ) {
      if (mapping.questionCol === -1) mapping.questionCol = idx;
      return;
    }

    // Options (e.g., Option A, Option B, Opt A, A, B, C, D)
    if (specificOptionRegex.test(norm) || /^(option|opt|choice)\s*[a-h1-8]/i.test(norm)) {
      const detectedKey = extractOptionKey(raw, mapping.optionCols.length);
      mapping.optionCols.push({ index: idx, name: raw, key: detectedKey });
      return;
    }
  });

  // If question column wasn't found by explicit name, find column not assigned yet with longest text or keyword
  if (mapping.questionCol === -1) {
    const candidates = headers
      .map((h, i) => ({ h: normalizeHeader(h), i }))
      .filter(
        ({ i }) =>
          i !== mapping.answerCol &&
          i !== mapping.srNoCol &&
          i !== mapping.explanationCol &&
          !mapping.optionCols.some(o => o.index === i)
      );
    const qCandidate = candidates.find(c => c.h.includes('quest') || c.h.includes('prob') || c.h.includes('statement'));
    if (qCandidate) {
      mapping.questionCol = qCandidate.i;
    } else if (candidates.length > 0) {
      mapping.questionCol = candidates[0].i;
    }
  }

  // If options weren't found by "option x", check for single letters A, B, C, D in headers
  if (mapping.optionCols.length < 2) {
    headers.forEach((h, idx) => {
      const raw = String(h || '').trim();
      const norm = normalizeHeader(raw);
      if (idx === mapping.questionCol || idx === mapping.answerCol || idx === mapping.srNoCol) return;
      if (/^[a-h]$/i.test(norm) || /^\([a-h]\)$/i.test(norm) || /^[1-8]$/i.test(norm)) {
        if (!mapping.optionCols.some(o => o.index === idx)) {
          const detectedKey = extractOptionKey(raw, mapping.optionCols.length);
          mapping.optionCols.push({ index: idx, name: raw, key: detectedKey });
        }
      }
    });
  }

  // If answer column wasn't identified yet, check if any unassigned column has 'answer' or 'ans'
  if (mapping.answerCol === -1) {
    headers.forEach((h, idx) => {
      const norm = normalizeHeader(h);
      if (
        idx !== mapping.questionCol &&
        !mapping.optionCols.some(o => o.index === idx) &&
        (norm.includes('ans') || norm.includes('key'))
      ) {
        mapping.answerCol = idx;
      }
    });
  }

  // CRITICAL REQUIREMENT: "options may not be in sequence as sheet"
  // Sort option columns by their detected logical key ('A', 'B', 'C', 'D'...)
  // so regardless of which column Option A/B/C/D appeared in the spreadsheet,
  // they are properly ordered by their intended letter key!
  mapping.optionCols.sort((a, b) => {
    const keyA = a.key || 'Z';
    const keyB = b.key || 'Z';
    if (keyA !== keyB) {
      return keyA.localeCompare(keyB);
    }
    return a.index - b.index;
  });

  return mapping;
}

/**
 * Normalizes an answer value (e.g., 'A', 'Option B', '2', or matching text)
 * to match against the extracted options.
 */
export function resolveCorrectKey(rawAnswer, options) {
  if (rawAnswer === undefined || rawAnswer === null) return '';
  const str = String(rawAnswer).trim();
  if (!str) return '';

  const cleanAns = str.toUpperCase().replace(/[\(\)\[\]\.\:\s]/g, '');

  // 1. Direct letter match: A, B, C, D, E, F
  const letterMatch = cleanAns.match(/^(?:OPTION|OPT|CHOICE)?([A-H])$/);
  if (letterMatch) {
    const letter = letterMatch[1];
    if (options.some(o => o.key === letter)) {
      return letter;
    }
  }

  // 2. Number match: 1, 2, 3, 4 -> maps to option at index (1 -> A, 2 -> B...)
  const numMatch = cleanAns.match(/^(?:OPTION|OPT|CHOICE)?([1-8])$/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num >= 1 && num <= options.length) {
      return options[num - 1].key;
    }
  }

  // 3. Exact or fuzzy text match against option values
  const normalizedAnsText = str.toLowerCase().trim();
  const matchedOption = options.find(opt => {
    const optText = (opt.text || '').toLowerCase().trim();
    if (!optText) return false;
    return (
      optText === normalizedAnsText ||
      optText.replace(/^[a-h1-8][\.\)\:\s]+/i, '').trim() === normalizedAnsText
    );
  });

  if (matchedOption) {
    return matchedOption.key;
  }

  // Fallback: check if the answer string contains a single letter like "Ans: B" or "(C)"
  const looseLetter = str.match(/\b([A-H])\b/i);
  if (looseLetter && options.some(o => o.key === looseLetter[1].toUpperCase())) {
    return looseLetter[1].toUpperCase();
  }

  return '';
}

/**
 * Parses an entire workbook and extracts sheets
 */
export function parseWorkbook(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  return {
    workbook,
    sheetNames: workbook.SheetNames,
  };
}

/**
 * Extracts raw 2D row data from a specific sheet
 */
export function getSheetRawData(workbook, sheetName) {
  const actualSheetName = sheetName || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[actualSheetName];
  if (!worksheet) return { headers: [], rows: [] };

  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    return { headers: [], rows: [] };
  }

  // Find header row: scan first 5 rows to locate the row with most matching keywords
  let headerRowIndex = 0;
  let maxScore = -1;

  for (let r = 0; r < Math.min(5, rawRows.length); r++) {
    const row = rawRows[r] || [];
    let score = 0;
    row.forEach(cell => {
      const norm = normalizeHeader(cell);
      if (/^(question|option|opt|ans|answer|correct|sr\s*no|id)$/i.test(norm)) score += 3;
      else if (norm.includes('question') || norm.includes('option') || norm.includes('answer')) score += 2;
      else if (/^[a-d]$/i.test(norm)) score += 1;
    });
    if (score > maxScore && score > 0) {
      maxScore = score;
      headerRowIndex = r;
    }
  }

  const headers = (rawRows[headerRowIndex] || []).map(c => String(c ?? '').trim());
  const dataRows = rawRows.slice(headerRowIndex + 1);

  return {
    headerRowIndex,
    headers,
    dataRows,
  };
}

/**
 * Processes parsed raw rows with given column mapping into standardized quiz questions
 * Safely handles non-sequential option columns from Excel
 */
export function processQuestions(dataRows, headers, mapping) {
  const questions = [];
  const errors = [];
  const questionTextsSeen = new Set();
  let duplicateCount = 0;

  const qCol = mapping.questionCol;
  
  // Normalize option column definitions with keys
  const optionColDefs = (mapping.optionCols || []).map((col, idx) => {
    if (typeof col === 'object') {
      const key = col.key || extractOptionKey(col.name, idx);
      return { index: col.index, key, name: col.name };
    }
    const headerName = headers[col] || '';
    const key = extractOptionKey(headerName, idx);
    return { index: col, key, name: headerName };
  });

  // Sort option column definitions by key ('A', 'B', 'C', 'D'...)
  optionColDefs.sort((a, b) => a.key.localeCompare(b.key));

  const ansCol = mapping.answerCol;

  dataRows.forEach((row, rowIdx) => {
    const excelRowNum = rowIdx + 2;
    if (!row || !Array.isArray(row)) return;

    // Check if entire row is empty
    const hasAnyContent = row.some(cell => String(cell || '').trim() !== '');
    if (!hasAnyContent) return;

    const rawQuestion = row[qCol];
    const questionText = String(rawQuestion || '').trim();

    // 1. Validate Question presence
    if (!questionText) {
      errors.push({
        rowNumber: excelRowNum,
        type: 'MISSING_QUESTION',
        message: `Row ${excelRowNum}: Question text is missing.`,
        rawData: row,
      });
      return;
    }

    // 2. Extract options based on sorted option column definitions
    const options = [];
    const defaultKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    optionColDefs.forEach((colDef, idx) => {
      const optVal = row[colDef.index];
      const optText = String(optVal !== undefined && optVal !== null ? optVal : '').trim();
      
      if (optText !== '') {
        // If option text itself begins with e.g. "B) text", ensure clean alignment
        const textKeyMatch = optText.match(/^[\(\[]?([A-H])[\)\]\:\.]\s+(.*)$/i);
        let finalKey = colDef.key || defaultKeys[idx] || String.fromCharCode(65 + idx);
        let displayText = optText;

        if (textKeyMatch) {
          // If option text has embedded letter prefix like "C) Option Text", preserve key and clean text
          finalKey = textKeyMatch[1].toUpperCase();
          displayText = textKeyMatch[2].trim();
        }

        options.push({
          key: finalKey,
          text: displayText,
          rawText: optText,
          isCorrect: false,
        });
      }
    });

    // Ensure options are sorted by key (A, B, C, D...)
    options.sort((a, b) => a.key.localeCompare(b.key));

    if (options.length < 2) {
      errors.push({
        rowNumber: excelRowNum,
        type: 'INSUFFICIENT_OPTIONS',
        message: `Row ${excelRowNum}: At least 2 options required, found ${options.length}.`,
        rawData: row,
      });
      return;
    }

    // 3. Resolve Correct Answer
    const rawAnswer = ansCol >= 0 ? row[ansCol] : '';
    const resolvedKey = resolveCorrectKey(rawAnswer, options);

    if (!resolvedKey) {
      errors.push({
        rowNumber: excelRowNum,
        type: 'INVALID_ANSWER',
        message: `Row ${excelRowNum}: Could not determine correct answer from value "${String(rawAnswer)}".`,
        rawData: row,
      });
      return;
    }

    // Mark correct option
    options.forEach(opt => {
      opt.isCorrect = opt.key === resolvedKey;
    });

    // 4. Duplicate Check
    const cleanLowerQ = questionText.toLowerCase().replace(/\s+/g, ' ');
    const isDuplicate = questionTextsSeen.has(cleanLowerQ);
    if (isDuplicate) {
      duplicateCount++;
    } else {
      questionTextsSeen.add(cleanLowerQ);
    }

    // Optional fields
    const srNo = mapping.srNoCol >= 0 ? String(row[mapping.srNoCol] || '').trim() : String(questions.length + 1);
    const explanation = mapping.explanationCol >= 0 ? String(row[mapping.explanationCol] || '').trim() : '';
    const subject = mapping.subjectCol >= 0 ? String(row[mapping.subjectCol] || '').trim() : '';
    const topic = mapping.topicCol >= 0 ? String(row[mapping.topicCol] || '').trim() : '';
    const difficulty = mapping.difficultyCol >= 0 ? String(row[mapping.difficultyCol] || '').trim() : '';
    const marksRaw = mapping.marksCol >= 0 ? parseFloat(row[mapping.marksCol]) : 1;
    const marks = isNaN(marksRaw) || marksRaw <= 0 ? 1 : marksRaw;

    const correctOption = options.find(o => o.key === resolvedKey);

    questions.push({
      id: questions.length + 1,
      rowNumber: excelRowNum,
      srNo: srNo || String(questions.length + 1),
      question: questionText,
      options,
      correctKey: resolvedKey,
      correctAnswerText: correctOption ? correctOption.text : '',
      explanation,
      subject,
      topic,
      difficulty,
      marks,
      isDuplicate,
    });
  });

  return {
    questions,
    errors,
    stats: {
      totalRowsProcessed: dataRows.length,
      validCount: questions.length,
      errorCount: errors.length,
      duplicateCount,
    },
  };
}
