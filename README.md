# MCQ Quiz Website — Excel Direct Importer

An interactive, responsive MCQ Quiz Web Application that directly reads and converts Excel spreadsheets (`.xlsx`, `.xls`) into quizzes without manual data entry.

**Developed By Vinaya Patole**

---

## 🌟 Key Features

### 1. Robust Excel Parsing (Options May Be in Any Sequence)
- **Automatic Column Detection:** Detects `Question`, `Option A` through `Option F`, and `Correct Answer` columns.
- **Out-of-Order Option Handling:** Options in the spreadsheet do not need to be in sequential order (e.g. Option C can appear before Option A, or in any arbitrary column). The parser detects each option's key and aligns it into standard `A`, `B`, `C`, `D` order.
- **Preloaded 100 MCQs Dataset:** One-click instant start with `Entrepreneurship_Development_100_MCQs.xlsx` (100 questions with verified answer keys).
- **Flexible Answer Keys:** Supports letters (`A`, `B`, `C`, `D`), numeric indices (`1`, `2`, `3`, `4`), and matching option text.

### 2. Simple, Student-Friendly UI
- **Practice Mode:** Instant feedback after answering each question (green for correct, red for incorrect), explanation display, and question retry.
- **Exam Mode:** Timed test with countdown timer and score revealed upon submission.
- **Question Palette:** Clean grid of question numbers (1 to 100) with visual indicators for answered, unanswered, marked, and current questions.
- **Results Dashboard:** Clear score percentage, correct/incorrect counts, time taken, and question-by-question review with filters.
- **Dark / Light Mode:** Clean theme toggle.
- **Attribution:** "Developed By Vinaya Patole" displayed prominently at the bottom of the website and in the header.

---

## 🚀 Running Locally

1. Open a terminal in the project directory:
   ```bash
   cd d:\CO5KA\ENDS\MCQ
   ```

2. Run the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```
