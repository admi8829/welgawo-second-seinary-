export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. መጀመሪያ API መሆኑን ቼክ እናደርጋለን
    if (url.pathname === "/hello") {
      return new Response(JSON.stringify({ message: "Hello from Cloudflare Worker!" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. ተማሪዎችን ለመመዝገብ (Registration)
    if (url.pathname === "/api/register" && request.method === "POST") {
      try {
        const student = await request.json();
        
        // Cloudflare D1 Database code
        // ማሳሰቢያ፡ env.DB በ Cloudflare dashboard ላይ መጠቃት አለበት
        if (env.DB) {
          await env.DB.prepare(
            "INSERT INTO students (name, email, grade, phone) VALUES (?, ?, ?, ?)"
          )
          .bind(student.name, student.email, student.grade, student.phone)
          .run();
        }

        return new Response(JSON.stringify({ success: true, message: "በተሳካ ሁኔታ ተመዝግበዋል!" }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 3. Quiz Data Fetching
    if (url.pathname === "/api/quiz") {
      try {
        if (env.DB) {
          const results = await env.DB.prepare(
            "SELECT * FROM questions ORDER BY RANDOM() LIMIT 5"
          ).all();
          return new Response(JSON.stringify({ success: true, questions: results.results }), {
            headers: { "Content-Type": "application/json" },
          });
        }
        
        // Fallback or Sample for initial setup
        const sampleQuestions = [
          {
            id: 1,
            question: "Which of the following is a scalar quantity?",
            options: JSON.stringify(["Velocity", "Force", "Acceleration", "Mass"]),
            answer: "Mass"
          },
          {
            id: 2,
            question: "I ____ to the library every Wednesday.",
            options: JSON.stringify(["go", "goes", "going", "gone"]),
            answer: "go"
          }
        ];
        return new Response(JSON.stringify({ success: true, questions: sampleQuestions }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 4. Add Question to Database
    if (url.pathname === "/api/questions" && request.method === "POST") {
      try {
        const q = await request.json();
        if (env.DB) {
          await env.DB.prepare(
            "INSERT INTO questions (question, options, answer, subject) VALUES (?, ?, ?, ?)"
          )
          .bind(q.question, q.options, q.answer, q.subject)
          .run();
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 5. Submit Student Feedback
    if (url.pathname === "/api/feedback" && request.method === "POST") {
      try {
        const fb = await request.json();
        if (env.DB) {
          await env.DB.prepare(
            "INSERT INTO feedback (student_name, teacher_subject, comment) VALUES (?, ?, ?)"
          )
          .bind(fb.student_name, fb.teacher_subject, fb.comment)
          .run();
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 6. Fetch Feedback for Admin
    if (url.pathname === "/api/admin/feedback" && request.method === "GET") {
      try {
        if (env.DB) {
          const results = await env.DB.prepare("SELECT * FROM feedback ORDER BY id DESC").all();
          return new Response(JSON.stringify({ success: true, feedback: results.results }), {
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ success: true, feedback: [] }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 7. API ካልሆነ የ index.html ፋይሉን እንዲያሳይ ለ Cloudflare እንነግረዋለን
    // ይህ የሚሰራው በ Cloudflare Pages ላይ ብቻ ነው
    return env.ASSETS.fetch(request);
  },
};
