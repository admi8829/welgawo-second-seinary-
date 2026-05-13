# Smart-X Academy Documentation

## Database Setup Details (SQLite)

This project uses an embedded SQLite database (`database.sqlite`) via `better-sqlite3` to store information. The tables are automatically created when the `server.ts` starts.

### 1. `users` Table
Stores student registration and profile details.
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  grade TEXT,
  schoolName TEXT,
  photo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `quiz_results` Table
Stores the score and performance of students after completing a quiz. Used to generate the leaderboard.
```sql
CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT,
  grade TEXT,
  score INTEGER,
  total INTEGER,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### 3. `questions` Table
Stores preset questions for quizzes.
```sql
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT,
  grade TEXT,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  answer TEXT NOT NULL
);
```

### 4. `teachers` Table
Stores information about teachers at the academy, including a bio and upvotes/downvotes.
```sql
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  photo TEXT,
  bio TEXT,
  likes INTEGER DEFAULT 0,
  unlikes INTEGER DEFAULT 0
);
```

### 5. `feedback` Table
General student feedback on the academy and specific subjects.
```sql
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_name TEXT NOT NULL,
  teacher_subject TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## How It Works

1. **Registration**: When a user creates an account, a `POST` request is sent to `/api/register`. The server inserts this data into the `users` table and immediately logs the user in.
2. **Quiz Page**: After successful registration, the app redirects the user to `/quiz.html`.
3. **Fetching Quizzes**: The app makes a `GET` request to `/api/quiz` (or generates an AI quiz via `/api/generate_ai_quiz`). It fetches matching questions from the `questions` table.
4. **Saving Scores**: At the end of the quiz, `POST /api/quiz_results` is called. It saves the student's score in the `quiz_results` table.
5. **Leaderboard**: The `/leaderboard.html` page uses `GET /api/leaderboard` to aggregate `quiz_results.score` for each user and ranks them.

---

## Folder Structure for GitHub

```text
your-repo/
├── server.ts           <-- Backend Server (Logic & API via Express/SQLite)
├── index.html          <-- Home & Dashboard (UI)
└── ...
```

## New Features & Admin Tools

- **Student Dashboard**: Accessible at `/admin`. Sign in with `admin@smartx.com` and `SmartX2026`.
- **Question Engine**: Accessible within the `/admin` dashboard under "Add Quiz Question".
- **AI Chat**: Integrated in the student portal for real-time tutoring using Gemini 1.5 Flash.
- **Sample Data**: Use `questions.sql` for initial population of students, questions, and teachers.
- **Visual Portraits**: High-performance photo upload system for student profiles.

## Important Routes

- `/auth` -> Authentication (Login & Register)
- `/admin` -> Admin HUB (Manage Students, Questions)
- `/quiz` -> Quiz Engine (Manual & AI Powered)
- `/leaderboard` -> Top Scoring Students
- `/about` -> Our Vision
- `/contact` -> Support

## How to use AI Chat
The AI Chat on the home page uses the Gemini API. Ensure `GEMINI_API_KEY` is set in your environment.

## Ethiopia Specifics
The content is tailored for the Ethiopian grade system (G9-G12) and supports ESLCE (Grade 12 Entrance) preparation topics.

## How it works

1. **index.html**: Main landing page.
2. **server.ts**: Uses an embedded SQLite database (`better-sqlite3`) to handle API endpoints for the Quiz, Authentication, Leaderboard, and Feedback pages.
3. **AI Generation**: Integrates the `@google/genai` package for generating quizzes dynamically based on topic and grade.

## Deployment

1. Push your code to GitHub.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
3. Select **Workers & Pages** -> **Pages** -> **Connect to Git**.
4. Select your repository.
5. For **Build settings**:
   - If you have no build step (straight HTML), leave everything default.
   - If using Vite, use `npm run build` and `dist` as the output directory.
6. Click **Save and Deploy**.
