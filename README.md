# Smart-X Academy Documentation

## Database Setup Details (SQLite)

The project uses an embedded SQLite database (`smartx.db`) via `better-sqlite3`. Tables are initialized on server start.

### 1. `questions` Table
Stores curriculum questions.
```sql
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  answer TEXT NOT NULL,
  subject TEXT,
  grade TEXT DEFAULT '12'
);
```

### 2. `quiz_results` Table
Stores session performance for the global leaderboard.
```sql
CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT,
  subject TEXT,
  grade TEXT,
  score INTEGER,
  total INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## How It Works

1. **Academic Entrance**: Scholars access the `quiz.html` terminal without authentication barriers.
2. **Assessment Engine**: Quizzes are deployed from the verified archive or synthesized in real-time via Gemini AI.
3. **Score Propagation**: Final scores are transmitted to the `quiz_results` ledger for ranking.
4. **Global Leaderboard**: Ranks scholars based on cumulative performance.

## Folder Structure

- `index.html`: Home & Dashboard
- `quiz.html`: Assessment Terminal
- `leaderboard.html`: Global Leaderboard
- `about.html`: Our Vision
- `contact.html`: Support Hub
- `privacy.html`: Privacy Policy
- `terms.html`: Terms of Service
- `books.html`: Resource Library
- `feedback.html`: Student Feedback
- `profile.html`: Scholar Profile

## New Features

- **AI Hub**: AI-powered tutoring and quiz generation.
- **Academic UI**: Clean, professional, and accessible design.
- **Zero-Barrier Access**: Immediate deployment without registration protocols.
