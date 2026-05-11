export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. መጀመሪያ API መሆኑን ቼክ እናደርጋለን
    if (url.pathname === "/hello") {
      return new Response(JSON.stringify({ message: "Hello from Cloudflare Worker!" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. API ካልሆነ የ index.html ፋይሉን እንዲያሳይ ለ Cloudflare እንነግረዋለን
    // ይህ የሚሰራው በ Cloudflare Pages ላይ ብቻ ነው
    return env.ASSETS.fetch(request);
  },
};
