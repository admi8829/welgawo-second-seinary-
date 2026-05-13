export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Helper for JSON responses
    const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });

    try {
      if (url.pathname === "/api/health") {
        return jsonResponse({ status: "ok", provider: "Cloudflare" });
      }

      // REGISTER
      if (url.pathname === "/api/register" && request.method === "POST") {
        const body = await request.json();
        if (env.DB) {
          try {
            const result = await env.DB.prepare(
              "INSERT INTO users (name, email, password, gender, age, grade, schoolName, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            ).bind(body.name, body.email, body.password, body.gender, body.age, body.grade, body.schoolName, body.photo || null).run();
            
            return jsonResponse({ success: true, user: { id: result.meta.last_row_id, name: body.name, email: body.email, grade: body.grade } });
          } catch (e) {
            return jsonResponse({ success: false, message: 'Email already exists or DB error' }, 400);
          }
        }
        return jsonResponse({ success: false, message: "DB not connected" }, 500);
      }

      // LOGIN
      if (url.pathname === "/api/login" && request.method === "POST") {
        const body = await request.json();
        if (env.DB) {
          const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?").bind(body.email, body.password).first();
          if (user) {
            return jsonResponse({ success: true, user: { id: user.id, name: user.name, email: user.email, grade: user.grade } });
          }
          return jsonResponse({ success: false, message: "Invalid email or password" }, 401);
        }
        return jsonResponse({ success: false, message: "DB not connected" }, 500);
      }

      // ADMIN LOGIN
      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        const { email, password } = await request.json();
        if (env.DB) {
          const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ? AND is_admin = 1").bind(email, password).first();
          if (user) {
            return jsonResponse({ success: true, admin: { id: user.id, name: user.name, email: user.email } });
          }
          return jsonResponse({ success: false, message: "Invalid admin credentials" }, 401);
        }
      }

      // ADMIN STUDENTS
      if (url.pathname === "/api/admin/students" && request.method === "GET") {
        if (env.DB) {
          const { results } = await env.DB.prepare("SELECT id, name, email, grade, schoolName, created_at, photo FROM users WHERE is_admin = 0 OR is_admin IS NULL ORDER BY created_at DESC").all();
          return jsonResponse({ success: true, students: results });
        }
        return jsonResponse({ success: true, students: [] });
      }

      // GENERATE AI QUIZ
      if (url.pathname === "/api/generate_ai_quiz" && request.method === "POST") {
        if (!env.GEMINI_API_KEY) {
          return jsonResponse({ success: false, message: "Gemini API Key is missing. Please set GEMINI_API_KEY in Cloudflare Variable Secrets." }, 400);
        }
        const { topic, grade } = await request.json();
        const prompt = `Generate 3 multiple-choice questions for grade ${grade} high school students about the topic: "${topic}". Respond ONLY in raw valid JSON format as an array of objects. Each object must have "question" (string), "options" (array of 4 strings), and "answer" (string).`;
        
        const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + env.GEMINI_API_KEY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        if (!geminiRes.ok) throw new Error("Failed to contact Gemini API");
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(cleaned);
        const formatted = questions.map((q, i) => ({
          id: 1000 + i,
          question: q.question,
          options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
          answer: q.answer
        }));
        return jsonResponse({ success: true, questions: formatted });
      }

      // GET QUIZ
      if (url.pathname === "/api/quiz" && request.method === "GET") {
        const subject = url.searchParams.get('subject') || 'Physics';
        const grade = url.searchParams.get('grade') || '12';
        if (env.DB) {
          const { results } = await env.DB.prepare("SELECT * FROM questions WHERE subject = ? AND grade = ? ORDER BY RANDOM() LIMIT 5").bind(subject, grade).all();
          return jsonResponse({ success: true, questions: results });
        }
        return jsonResponse({ success: true, questions: [] });
      }

      // SUBMIT QUIZ RESULTS
      if (url.pathname === "/api/quiz_results" && request.method === "POST") {
        const { userId, subject, grade, score, total } = await request.json();
        if (env.DB) {
          await env.DB.prepare("INSERT INTO quiz_results (user_id, subject, grade, score, total) VALUES (?, ?, ?, ?, ?)").bind(userId, subject, grade, score, total).run();
        }
        return jsonResponse({ success: true });
      }

      // LEADERBOARD
      if (url.pathname === "/api/leaderboard" && request.method === "GET") {
        if (env.DB) {
          const { results } = await env.DB.prepare(`
            SELECT u.name, u.photo, SUM(q.score) as total_score 
            FROM quiz_results q 
            JOIN users u ON q.user_id = u.id 
            GROUP BY u.id 
            ORDER BY total_score DESC LIMIT 10
          `).all();
          return jsonResponse({ success: true, leaderboard: results });
        }
        return jsonResponse({ success: true, leaderboard: [] });
      }

      // Handle Clean URLs
      const assets = ["/auth", "/about", "/contact", "/quiz", "/admin", "/terms", "/privacy", "/profile"];
      const path = url.pathname;
      if (assets.includes(path)) {
        const resourcePath = path + ".html";
        return env.ASSETS.fetch(new URL(resourcePath + url.search, request.url));
      }

      return env.ASSETS.fetch(request);
      
    } catch (err) {
      return jsonResponse({ success: false, message: err.message }, 500);
    }
  },
};
