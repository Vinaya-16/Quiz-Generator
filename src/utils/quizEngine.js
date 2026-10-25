/**
 * Quiz Engine Utilities: Shuffling, Evaluation, Scoring, Formatting
 */

/**
 * Fisher-Yates array shuffle (creates a new shuffled copy)
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Prepares questions for a quiz session based on user configuration
 * @param {Array} rawQuestions - Parsed questions
 * @param {Object} config - { mode, questionCount, shuffleQuestions, shuffleOptions }
 */
export function prepareQuizQuestions(rawQuestions, config = {}) {
  let list = [...rawQuestions];

  // 1. Filter count (for Quick Quiz mode or custom count)
  if (config.questionCount && config.questionCount > 0 && config.questionCount < list.length) {
    // If not already shuffled, shuffle first so random subset is chosen
    if (config.shuffleQuestions) {
      list = shuffleArray(list).slice(0, config.questionCount);
    } else {
      list = list.slice(0, config.questionCount);
    }
  } else if (config.shuffleQuestions) {
    list = shuffleArray(list);
  }

  // 2. Process questions and optionally shuffle their options
  const prepared = list.map((q, idx) => {
    let options = q.options.map(opt => ({ ...opt }));

    if (config.shuffleOptions) {
      options = shuffleArray(options);
    }

    // Keep display letters (A, B, C, D) mapped to their visual display position
    // while preserving their internal original `key` and `isCorrect` flag!
    const displayOptions = options.map((opt, optIdx) => ({
      ...opt,
      displayKey: String.fromCharCode(65 + optIdx), // Visual label A, B, C, D...
      originalKey: opt.key,
      isCorrect: opt.isCorrect,
    }));

    return {
      ...q,
      displayNumber: idx + 1,
      options: displayOptions,
    };
  });

  return prepared;
}

/**
 * Calculates full quiz results and performance analytics
 */
export function calculateQuizResults(questions, userAnswers, flaggedQuestions, timeTakenSeconds) {
  const totalQuestions = questions.length;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;
  let totalScore = 0;
  let maxScore = 0;

  const questionDetails = questions.map(q => {
    const userSelectedKey = userAnswers[q.id] || null;
    const isAttempted = userSelectedKey !== null;
    const isMarked = !!flaggedQuestions[q.id];
    const marks = q.marks || 1;
    maxScore += marks;

    let isCorrect = false;
    let selectedOption = null;

    if (isAttempted) {
      // Find the selected option by originalKey
      selectedOption = q.options.find(opt => opt.originalKey === userSelectedKey);
      if (selectedOption && selectedOption.isCorrect) {
        isCorrect = true;
        correctAnswers++;
        totalScore += marks;
      } else {
        incorrectAnswers++;
      }
    } else {
      unansweredQuestions++;
    }

    const correctOption = q.options.find(opt => opt.isCorrect);

    return {
      ...q,
      userAnswerKey: userSelectedKey,
      userAnswerText: selectedOption ? selectedOption.text : null,
      correctKey: q.correctKey,
      correctAnswerText: correctOption ? correctOption.text : q.correctAnswerText,
      isAttempted,
      isCorrect,
      isMarked,
    };
  });

  const attemptedCount = correctAnswers + incorrectAnswers;
  // Official formula: Percentage = (Correct Answers / Total Questions) × 100
  const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const accuracyRate = attemptedCount > 0 ? (correctAnswers / attemptedCount) * 100 : 0;

  return {
    totalQuestions,
    questionsAttempted: attemptedCount,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    totalScore,
    maxScore,
    percentage: parseFloat(percentage.toFixed(1)),
    accuracyRate: parseFloat(accuracyRate.toFixed(1)),
    timeTakenSeconds,
    timeTakenFormatted: formatTime(timeTakenSeconds),
    questionDetails,
  };
}

/**
 * Formats seconds into mm:ss or hh:mm:ss
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = n => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
