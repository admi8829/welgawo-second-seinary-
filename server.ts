import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

// Initialize SQLite database
const db = new Database("smartx.db");
db.pragma("journal_mode = WAL");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    options TEXT,
    answer TEXT,
    subject TEXT,
    grade TEXT DEFAULT '12'
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT,
    subject TEXT,
    grade TEXT,
    score INTEGER,
    total INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed sample data if empty
try {
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

  app.post("/api/quiz_results", (req, res) => {
    const { name, subject, grade, score, total } = req.body;
    try {
      db.prepare('INSERT INTO quiz_results (user_name, subject, grade, score, total) VALUES (?, ?, ?, ?, ?)').run(name, subject, grade, score, total);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, message: "Failed to save results" });
    }
  });

  app.get("/api/leaderboard", (req, res) => {
    try {
      const results = db.prepare(`
        SELECT user_name as name, SUM(score) as total_score 
        FROM quiz_results 
        GROUP BY user_name 
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
    if (questions.length === 0) {
       res.json({ success: true, questions: [{
         id: 999, question: `What is a key concept in grade ${grade} ${subject}?`, options: JSON.stringify(['Concept A', 'Concept B', 'Concept C', 'Concept D']), answer: 'Concept A'
       }]});
    } else {
       res.json({ success: true, questions });
    }
  });

  // AI Quiz Generation
  app.post("/api/generate_ai_quiz", async (req, res) => {
    const { topic, grade } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ success: false, message: "Gemini API Key is missing. Please set GEMINI_API_KEY." });
      }
      
      const prompt = `Generate exactly 10 multiple choice questions for a Grade ${grade || '12'} student on the topic: "${topic}". 
      Return ONLY a JSON array with objects containing: "question", "options" (array of 4 strings), and "answer" (string matching one of the options). 
      Ensure the difficulty is appropriate for the grade level. Avoid markdown formatting blocks.`;

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite-preview-02-05',
        contents: prompt
      });
      const text = response.text || "[]";
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const questions = JSON.parse(cleaned);
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

  // AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ success: false, message: "Gemini API Key is missing." });
      }
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({ 
        model: 'gemini-2.0-flash-lite-preview-02-05',
        contents: message,
        config: {
          systemInstruction: "You are Smart-X Academy AI, a helpful tutor for Ethiopian high school students. Be encouraging, clear, and focused on educational success. Keep responses relatively concise."
        }
      });
      res.json({ success: true, text: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.get("/quiz.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "quiz.html"));
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

  app.get("/terms.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "terms.html"));
  });

  app.get("/privacy.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "privacy.html"));
  });

  app.get("/books.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "books.html"));
  });

  app.get("/feedback.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "feedback.html"));
  });

  app.get("/profile.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "profile.html"));
  });

  // Handle Clean URLs
  const cleanAssets = ["/about", "/contact", "/quiz", "/terms", "/privacy", "/leaderboard", "/books", "/feedback", "/profile"];
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
