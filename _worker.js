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

    // 3. API ካልሆነ የ index.html ፋይሉን እንዲያሳይ ለ Cloudflare እንነግረዋለን
    // ይህ የሚሰራው በ Cloudflare Pages ላይ ብቻ ነው
    return env.ASSETS.fetch(request);
  },
};
