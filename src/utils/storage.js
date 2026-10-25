/**
 * LocalStorage utilities for quiz state persistence & attempt history
 */

const CURRENT_QUIZ_KEY = 'mcq_quiz_current_session';
const QUIZ_HISTORY_KEY = 'mcq_quiz_history';
const THEME_KEY = 'mcq_quiz_theme';

export function saveQuizSession(sessionData) {
  try {
    localStorage.setItem(CURRENT_QUIZ_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.error('Failed to save quiz session to localStorage', e);
  }
}

export function loadQuizSession() {
  try {
    const raw = localStorage.getItem(CURRENT_QUIZ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to load quiz session from localStorage', e);
    return null;
  }
}

export function clearQuizSession() {
  try {
    localStorage.removeItem(CURRENT_QUIZ_KEY);
  } catch (e) {
    console.error('Failed to clear quiz session from localStorage', e);
  }
}

export function saveQuizHistory(resultEntry) {
  try {
    const history = loadQuizHistory();
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...resultEntry,
    };
    const updated = [entry, ...history].slice(0, 50); // keep last 50 attempts
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save quiz history', e);
    return [];
  }
}

export function loadQuizHistory() {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load quiz history', e);
    return [];
  }
}

export function clearQuizHistory() {
  try {
    localStorage.removeItem(QUIZ_HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear quiz history', e);
  }
}

export function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch {
    return 'light';
  }
}

export function setSavedTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to set theme in storage', e);
  }
}
