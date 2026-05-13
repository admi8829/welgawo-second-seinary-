// --- Pure Fetch Helper for Gemini API ---
async function geminiRequest(apiKey, prompt, systemInstruction = "") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  if (systemInstruction) {
    payload.system_instruction = { parts: [{ text: systemInstruction }] };
  }
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.candidates || !data.candidates[0]) throw new Error("No response from AI");
  return data.candidates[0].content.parts[0].text;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // API Routes Handler
    if (path.startsWith("/api/")) {
      const jsonResponse = (data, status = 200) => {
        return new Response(JSON.stringify(data), {
          status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      };

      // Handle Preflight
      if (method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      try {
        // --- 1. Registration ---
        if (path === "/api/register" && method === "POST") {
          const body = await request.json();
          const { name, email, phone, password, gender, age, grade, schoolName, photo } = body;

          if (!email || !password || !name) {
            return jsonResponse({ success: false, message: "Missing required fields." }, 400);
          }

          const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
          if (existing) {
            return jsonResponse({ success: false, message: "Email already registered." }, 400);
          }

          const result = await env.DB.prepare(
            "INSERT INTO users (name, email, phone, password, gender, age, grade, schoolName, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
          )
            .bind(name, email, phone, password, gender, parseInt(age) || 0, grade, schoolName, photo)
            .run();

          if (result.success) {
            const user = await env.DB.prepare("SELECT id, name, email, phone, grade, schoolName, photo, is_admin FROM users WHERE email = ?")
              .bind(email)
              .first();
            return jsonResponse({ success: true, user });
          }
          return jsonResponse({ success: false, message: "Database error during registration." }, 500);
        }

        // --- 2. Login ---
        if (path === "/api/login" && method === "POST") {
          const { email, password } = await request.json();
          const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?")
            .bind(email, password)
            .first();

          if (user) {
            return jsonResponse({
              success: true,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                grade: user.grade,
                schoolName: user.schoolName,
                photo: user.photo,
                isAdmin: !!user.is_admin,
              },
            });
          }
          return jsonResponse({ success: false, message: "Invalid credentials." }, 401);
        }

        // --- 3. AI Chat ---
        if (path === "/api/chat" && method === "POST") {
          if (!env.GEMINI_API_KEY) {
            return jsonResponse({ success: false, message: "GEMINI_API_KEY missing in environment." }, 400);
          }
          const { message } = await request.json();
          const aiText = await geminiRequest(
            env.GEMINI_API_KEY, 
            message, 
            "You are Smart-X Academy AI, a helpful tutor for Ethiopian high school students. Be encouraging, clear, and focused on educational success."
          );
          return jsonResponse({ success: true, text: aiText });
        }

        // --- 4. Quiz Logic ---
        if (path === "/api/quiz" && method === "GET") {
          const subject = url.searchParams.get("subject") || "Physics";
          const grade = url.searchParams.get("grade") || "12";
          const { results } = await env.DB.prepare("SELECT * FROM questions WHERE subject = ? AND grade = ?")
            .bind(subject, grade)
            .all();
          
          if (results.length === 0) {
            return jsonResponse({ 
              success: true, 
              questions: [{
                id: 999, 
                question: `What is a key concept in grade ${grade} ${subject}?`, 
                options: JSON.stringify(['Concept A', 'Concept B', 'Concept C', 'Concept D']), 
                answer: 'Concept A'
              }]
            });
          }
          return jsonResponse({ success: true, questions: results });
        }

        // --- 5. Generate AI Quiz ---
        if (path === "/api/generate_ai_quiz" && method === "POST") {
          if (!env.GEMINI_API_KEY) {
             return jsonResponse({ success: false, message: "GEMINI_API_KEY missing." }, 400);
          }
          const { topic, grade } = await request.json();
          const prompt = `Generate exactly 10 multiple choice questions for a Grade ${grade || '12'} student on the topic: "${topic}". 
          Return ONLY a JSON array with objects containing: "question", "options" (array of 4 strings), and "answer" (string matching one of the options). 
          Avoid markdown formatting blocks.`;

          const aiText = await geminiRequest(env.GEMINI_API_KEY, prompt);
          const cleanText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
          const questions = JSON.parse(cleanText);
          
          const formatted = questions.map((q, i) => ({
            id: 2000 + i,
            question: q.question,
            options: JSON.stringify(q.options),
            answer: q.answer
          }));
          return jsonResponse({ success: true, questions: formatted });
        }

        // --- 6. Quiz Results & Leaderboard ---
        if (path === "/api/quiz_results" && method === "POST") {
          const { userId, subject, grade, score, total } = await request.json();
          await env.DB.prepare("INSERT INTO quiz_results (user_id, subject, grade, score, total) VALUES (?, ?, ?, ?, ?)")
            .bind(userId, subject, grade, score, total)
            .run();
          return jsonResponse({ success: true });
        }

        if (path === "/api/leaderboard" && method === "GET") {
          const { results } = await env.DB.prepare(`
            SELECT u.name, u.photo, SUM(q.score) as total_score 
            FROM quiz_results q 
            JOIN users u ON q.user_id = u.id 
            GROUP BY u.id 
            ORDER BY total_score DESC LIMIT 10
          `).all();
          return jsonResponse({ success: true, leaderboard: results });
        }

        // --- 7. Admin & Teachers ---
        if (path === "/api/admin/students" && method === "GET") {
          const { results } = await env.DB.prepare("SELECT id, name, email, phone, grade, schoolName, created_at FROM users ORDER BY created_at DESC").all();
          return jsonResponse({ success: true, students: results });
        }

        if (path === "/api/teachers" && method === "GET") {
          const { results } = await env.DB.prepare("SELECT * FROM teachers").all();
          return jsonResponse({ success: true, teachers: results });
        }

        // Health check
        if (path === "/api/health") {
          return jsonResponse({ status: "ok", d1: !!env.DB });
        }

      } catch (e) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    // --- Static File Routing for Clean URLs ---
    // Pages environment serves static assets by default if not intercepted.
    // However, for clean URLs (e.g., /auth), we might need to append .html if the file exists.
    
    // Check if the path ends with a file extension
    const hasExtension = path.includes(".");
    
    // If it's a clean URL like /auth or /quiz, try to serve p.html
    const cleanUrls = ["/auth", "/about", "/contact", "/quiz", "/admin", "/leaderboard", "/profile", "/books", "/terms", "/privacy", "/feedback"];
    
    if (!hasExtension && cleanUrls.includes(path)) {
      return env.ASSETS.fetch(new Request(new URL(path + ".html", request.url), request));
    }

    // Default: Fallback to Pages static assets
    return env.ASSETS.fetch(request);
  },
};
