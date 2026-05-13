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
  const teachers: any[] = [
    { id: 1, name: "Dr. Abebe Kebede", subject: "Physics", photo: null, bio: "Former AAU professor specializing in Quantum Mechanics.", likes: 124, unlikes: 5 },
    { id: 2, name: "Ms. Selamawit Tadesse", subject: "Mathematics", photo: null, bio: "Expert in ESLCE exam preparation with 10 years experience.", likes: 89, unlikes: 2 },
    { id: 3, name: "Mr. Dawit Yilma", subject: "English", photo: null, bio: "Linguistics specialist focused on communicative English.", likes: 56, unlikes: 1 },
    { id: 4, name: "Mr. Tilahun Gessesse", subject: "Biology", photo: null, bio: "Passionate about genetics and ecology with a hands-on approach.", likes: 110, unlikes: 8 },
    { id: 5, name: "Dr. Almaz Bekele", subject: "Chemistry", photo: null, bio: "Makes organic chemistry fun through real-world experiments.", likes: 95, unlikes: 3 },
    { id: 6, name: "Prof. Yosef Getachew", subject: "History", photo: null, bio: "Brings Ethiopian history to life with captivating storytelling.", likes: 150, unlikes: 4 }
  ];
  const teacherFeedback: any[] = [];

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

  app.get("/api/admin/teacher-comments", (req, res) => {
    res.json({ success: true, comments: teacherFeedback });
  });
  
  app.get("/api/teachers", (req, res) => {
    res.json({ success: true, teachers });
  });

  app.post("/api/teachers/:id/like", (req, res) => {
    const teacher = teachers.find(t => t.id == req.params.id);
    if (teacher) teacher.likes++;
    res.json({ success: true });
  });

  app.post("/api/teachers/:id/unlike", (req, res) => {
    const teacher = teachers.find(t => t.id == req.params.id);
    if (teacher) teacher.unlikes++;
    res.json({ success: true });
  });

  app.get("/api/teachers/:id/comments", (req, res) => {
    const comments = teacherFeedback.filter(f => f.teacher_id == req.params.id);
    res.json({ success: true, comments });
  });

  app.post("/api/teachers/:id/comments", (req, res) => {
    const body = req.body;
    body.teacher_id = req.params.id;
    body.created_at = new Date().toISOString();
    teacherFeedback.push(body);
    res.json({ success: true });
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

  app.get("/terms.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "terms.html"));
  });

  app.get("/privacy.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "privacy.html"));
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
