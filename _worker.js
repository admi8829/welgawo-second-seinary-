// --- Pure Fetch Helper for Gemini API ---
async function geminiRequest(apiKey, prompt, systemInstruction = "") {
  // Use v1beta for better model compatibility and experimental features
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  
  if (systemInstruction) {
    // system_instruction must be a Content object (role is often optional in REST)
    payload.system_instruction = {
      parts: [{ text: systemInstruction }]
    };
  }
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  if (data.error) {
    console.error("Gemini API Error:", data.error);
    throw new Error(data.error.message);
  }
  if (!data.candidates || !data.candidates[0]) throw new Error("Neural response was intercepted or empty.");
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
          const { name, email, password, gender, age, grade, schoolName, photo = null } = body;

          const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
          if (existing) {
            return jsonResponse({ success: false, message: "Identification already exists." }, 400);
          }

          const result = await env.DB.prepare(
            "INSERT INTO users (name, email, password, gender, age, grade, schoolName, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
          )
            .bind(name, email, password, gender, parseInt(age) || 0, grade, schoolName, photo)
            .run();

          if (result.success) {
            const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
            return jsonResponse({ success: true, user });
          }
          return jsonResponse({ success: false, message: "Database refusal." }, 500);
        }

        // --- 2. Login ---
        if (path === "/api/login" && method === "POST") {
          const { email, password } = await request.json();
          const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?")
            .bind(email, password)
            .first();

          if (user) {
             return jsonResponse({ success: true, user: { ...user, isAdmin: !!user.is_admin } });
          }
          return jsonResponse({ success: false, message: "Invalid credentials." }, 401);
        }

        // --- 3. AI Chat ---
        if (path === "/api/chat" && method === "POST") {
          const { message } = await request.json();
          const aiText = await geminiRequest(env.GEMINI_API_KEY, message, "You are Smart-X Academy AI Tutor.");
          return jsonResponse({ success: true, text: aiText });
        }

        // --- 4. Quiz Logic ---
        if (path === "/api/quiz" && method === "GET") {
          const subject = url.searchParams.get("subject");
          const grade = url.searchParams.get("grade");
          const { results } = await env.DB.prepare("SELECT * FROM questions WHERE subject = ? AND grade = ? LIMIT 10")
            .bind(subject, grade)
            .all();
          return jsonResponse({ success: true, questions: results });
        }

        // --- 5. AI Quiz Generation ---
        if (path === "/api/generate_ai_quiz" && method === "POST") {
          const { topic, grade } = await request.json();
          const prompt = `Create 10 Grade ${grade || '12'} MCQs on "${topic}". 
          Format as JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "correct_option_string"}]. 
          No markdown blocks. Avoid difficult language.`;

          const aiText = await geminiRequest(env.GEMINI_API_KEY, prompt);
          
          // Robust JSON extraction
          let jsonStr = aiText;
          const jsonMatch = aiText.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) jsonStr = jsonMatch[0];
          else jsonStr = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
          
          const questions = JSON.parse(jsonStr);
          
          const formatted = questions.map((q, i) => ({
            id: 2000 + i,
            question: q.question,
            options: JSON.stringify(q.options),
            answer: q.answer
          }));
          return jsonResponse({ success: true, questions: formatted });
        }

        // --- 6. Results & Leaderboard ---
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

        if (path === "/api/teachers" && method === "GET") {
          const { results } = await env.DB.prepare("SELECT * FROM teachers").all();
          return jsonResponse({ success: true, teachers: results });
        }

      } catch (e) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    // --- Neural Static Routing ---
    // Handles clean URLs like /auth or /quiz by serving the corresponding .html file
    if (method === "GET" && !path.includes(".")) {
      const targetPath = path === "/" ? "/index.html" : path + ".html";
      const assetResponse = await env.ASSETS.fetch(new Request(new URL(targetPath, request.url), request));
      if (assetResponse.status === 200) return assetResponse;
    }

    // Default: Fallback to Pages static assets
    return env.ASSETS.fetch(request);
  }
};
