import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Local simulation of DB
  const students: any[] = [];
  const quizQuestions: any[] = [];
  const feedback: any[] = [];

  // Local simulation of _worker.js
  app.get("/hello", (req, res) => {
    res.json({ message: "Hello from local simulation!" });
  });

  app.post("/api/register", (req, res) => {
    const student = req.body;
    student.created_at = new Date().toISOString();
    students.push(student);
    res.json({ success: true, message: "በተሳካ ሁኔታ ተመዝግበዋል! (Local Simulation)" });
  });

  app.get("/api/admin/students", (req, res) => {
    res.json({ success: true, students });
  });

  app.post("/api/feedback", (req, res) => {
    const fb = req.body;
    fb.created_at = new Date().toISOString();
    feedback.push(fb);
    res.json({ success: true });
  });

  app.get("/api/admin/feedback", (req, res) => {
    res.json({ success: true, feedback });
  });

  app.get("/api/quiz", (req, res) => {
    // Return both sample and any added questions during simulation
    res.json({ success: true, questions: [
      {
        id: 1,
        question: "Which of the following is a scalar quantity?",
        options: JSON.stringify(["Velocity", "Force", "Acceleration", "Mass"]),
        answer: "Mass"
      },
      ...quizQuestions
    ] });
  });

  app.post("/api/questions", (req, res) => {
    const q = req.body;
    quizQuestions.push(q);
    res.json({ success: true });
  });

  app.get("/quiz.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "quiz.html"));
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

  app.get("/feedback.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "feedback.html"));
  });

  // Serve static files explicitly for simulation
  app.get("/join-free.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "join-free.html"));
  });

  app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "admin.html"));
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
