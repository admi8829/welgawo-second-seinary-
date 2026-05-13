import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

// Initialize SQLite database
const db = new Database("smartx.db");
db.pragma("journal_mode = WAL");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    phone TEXT,
    gender TEXT,
    age INTEGER,
    grade TEXT,
    schoolName TEXT,
    photo TEXT,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    options TEXT,
    answer TEXT,
    subject TEXT,
    grade TEXT DEFAULT '12'
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    photo TEXT,
    bio TEXT,
    likes INTEGER DEFAULT 0,
    unlikes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    teacher_subject TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT,
    grade TEXT,
    score INTEGER,
    total INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.exec('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0');
} catch (e) {}

try {
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@smartx.com');
  if (!existingAdmin) {
    db.prepare('INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)').run('System Admin', 'admin@smartx.com', 'admin123', 1);
  }
} catch (e) {}

// Try inserting initial sample data if empty
try {
  const tCount = db.prepare('SELECT COUNT(*) as c FROM teachers').get() as { c: number };
  if (tCount.c === 0) {
    const insertTeacher = db.prepare('INSERT INTO teachers (name, subject, photo, bio, likes, unlikes) VALUES (?, ?, ?, ?, ?, ?)');
    insertTeacher.run('Dr. Abebe Kebede', 'Physics', null, 'Former AAU professor specializing in Quantum Mechanics.', 124, 5);
    insertTeacher.run('Ms. Selamawit Tadesse', 'Mathematics', null, 'Expert in ESLCE exam preparation with 10 years experience.', 89, 2);
    insertTeacher.run('Mr. Dawit Yilma', 'English', null, 'Linguistics specialist focused on communicative English.', 56, 1);
  }

  const qCount = db.prepare('SELECT COUNT(*) as c FROM questions').get() as { c: number };
  if (qCount.c === 0) {
    const insertQ = db.prepare('INSERT INTO questions (question, options, answer, subject, grade) VALUES (?, ?, ?, ?, ?)');
    insertQ.run('Which of the following is the capital city of Ethiopia?', '["Nairobi", "Mogadishu", "Addis Ababa", "Asmara"]', 'Addis Ababa', 'Geography', '12');
    insertQ.run('Who was the Emperor of Ethiopia during the Battle of Adwa?', '["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"]', 'Menelik II', 'History', '12');
    insertQ.run('What is the main component of the atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 'Nitrogen', 'Chemistry', '12');
    insertQ.run('If a car travels at 60 km/h, how far will it travel in 2.5 hours?', '["120 km", "150 km", "180 km", "200 km"]', '150 km', 'Physics', '12');
    insertQ.run('Find the value of x in the equation: 3x - 7 = 11.', '["4", "5", "6", "7"]', '6', 'Mathematics', '12');
  }
} catch (e) {
  console.log("DB seeding skipped", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/register", (req, res) => {
    const { name, email, password, gender, age, grade, schoolName, photo } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO users (name, email, password, gender, age, grade, schoolName, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, email, password, gender, age, grade, schoolName, photo);
      res.json({ success: true, user: { id: info.lastInsertRowid, name, email, grade, photo } });
    } catch (e) {
      res.status(400).json({ success: false, message: 'Email maybe already exists' });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, grade: user.grade, photo: user.photo } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ? AND is_admin = 1').get(email, password) as any;
    if (user) {
      res.json({ success: true, admin: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }
  });

  app.post("/api/admin/bulk-questions", (req, res) => {
    const { questions } = req.body;
    try {
      const insert = db.prepare('INSERT INTO questions (question, options, answer, subject, grade) VALUES (?, ?, ?, ?, ?)');
      const insertMany = db.transaction((qs) => {
        for (const q of qs) insert.run(q.question, q.options, q.answer, q.subject, q.grade);
      });
      insertMany(questions);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, message: "Failed to save bulk questions" });
    }
  });

  app.post("/api/quiz_results", (req, res) => {
    const { userId, subject, grade, score, total } = req.body;
    try {
      db.prepare('INSERT INTO quiz_results (user_id, subject, grade, score, total) VALUES (?, ?, ?, ?, ?)').run(userId, subject, grade, score, total);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, message: "Failed to save results" });
    }
  });

  app.get("/api/leaderboard", (req, res) => {
    try {
      const results = db.prepare(`
        SELECT u.name, u.photo, SUM(q.score) as total_score 
        FROM quiz_results q 
        JOIN users u ON q.user_id = u.id 
        GROUP BY u.id 
        ORDER BY total_score DESC LIMIT 10
      `).all();
      res.json({ success: true, leaderboard: results });
    } catch (e) {
      res.status(500).json({ success: false, message: "Failed to load leaderboard" });
    }
  });

  app.get("/api/quiz", (req, res) => {
    const subject = req.query.subject || 'Physics';
    const grade = req.query.grade || '12';
    const questions = db.prepare('SELECT * FROM questions WHERE subject = ? COLLATE NOCASE AND grade = ?').all(subject, grade);
    // If no questions in DB, return 1 dummy
    if (questions.length === 0) {
       res.json({ success: true, questions: [{
         id: 999, question: `What is a key concept in grade ${grade} ${subject}?`, options: JSON.stringify(['Concept A', 'Concept B', 'Concept C', 'Concept D']), answer: 'Concept A'
       }]});
    } else {
       res.json({ success: true, questions });
    }
  });

  app.post("/api/quiz_results", (req, res) => {
    const { userId, subject, grade, score, total } = req.body;
    db.prepare('INSERT INTO quiz_results (user_id, subject, grade, score, total) VALUES (?, ?, ?, ?, ?)').run(userId, subject, grade, score, total);
    res.json({ success: true });
  });

  // AI Quiz Generation
  app.post("/api/generate_ai_quiz", async (req, res) => {
    const { topic, grade } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ success: false, message: "Gemini API Key is missing. Please set GEMINI_API_KEY in Cloudflare Variable Secrets." });
      }
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate 3 multiple-choice questions for grade ${grade} high school students about the topic: "${topic}". 
      Respond ONLY in raw valid JSON format as an array of objects. Each object must have "question" (string), "options" (array of 4 strings), and "answer" (string).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      const text = response.text || "[]";
      // Clean markdown if exists
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const questions = JSON.parse(cleaned);
      
      // format to match our schema
      const formatted = questions.map((q: any, i: number) => ({
        id: 1000 + i,
        question: q.question,
        options: JSON.stringify(q.options),
        answer: q.answer
      }));
      res.json({ success: true, questions: formatted });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ success: false, message: e.message });
    }
  });
  
  app.get("/api/leaderboard", (req, res) => {
    // Basic leaderboard across all users
    const results = db.prepare(`
      SELECT u.name, SUM(q.score) as totalScore, SUM(q.total) as maxScore, u.grade 
      FROM quiz_results q 
      JOIN users u ON q.user_id = u.id 
      GROUP BY q.user_id 
      ORDER BY totalScore DESC 
      LIMIT 10
    `).all();
    res.json({ success: true, leaderboard: results });
  });

  app.get("/api/admin/feedback", (req, res) => {
    const feedback = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
    res.json({ success: true, feedback });
  });
  
  app.get("/api/teachers", (req, res) => {
    const teachers = db.prepare('SELECT * FROM teachers').all();
    res.json({ success: true, teachers });
  });

  app.post("/api/teachers/:id/like", (req, res) => {
    db.prepare('UPDATE teachers SET likes = likes + 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/teachers/:id/unlike", (req, res) => {
    db.prepare('UPDATE teachers SET unlikes = unlikes + 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/questions", (req, res) => {
    const { question, options, answer, subject, grade } = req.body;
    db.prepare('INSERT INTO questions (question, options, answer, subject, grade) VALUES (?, ?, ?, ?, ?)').run(question, options, answer, subject, grade || '12');
    res.json({ success: true });
  });

  app.get("/quiz.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "quiz.html"));
  });

  app.get("/books.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "books.html"));
  });

  app.get("/leaderboard.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "leaderboard.html"));
  });

  app.get("/about.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "about.html"));
  });

  app.get("/contact.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "contact.html"));
  });

  app.get("/add-question.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "add-question.html"));
  });

  app.get("/terms.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "terms.html"));
  });

  app.get("/privacy.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "privacy.html"));
  });

  app.get("/auth.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "auth.html"));
  });

  app.get("/feedback.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "feedback.html"));
  });

  // Serve static files explicitly for simulation

  app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "admin.html"));
  });

  // Handle Clean URLs
  const cleanAssets = ["/auth", "/about", "/contact", "/quiz", "/admin", "/terms", "/privacy", "/profile", "/leaderboard"];
  cleanAssets.forEach(p => {
    app.get(p, (req, res) => {
      res.sendFile(path.join(process.cwd(), p + ".html"));
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
