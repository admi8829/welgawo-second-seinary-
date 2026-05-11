# Cloudflare Pages + Functions Example

This is a simple template for a Cloudflare Pages project with Functions.

## Cloudflare D1 Database Setup (REQUIRED for Registration)

The registration form uses Cloudflare D1. To make it work in production:

1. Create a D1 database in Cloudflare:
   ```bash
   npx wrangler d1 create smart-x-db
   ```
2. Create the `students` table:
   ```sql
   CREATE TABLE students (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     grade TEXT NOT NULL,
     phone TEXT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Create the `questions` table (Optional for Quiz):
   ```sql
   CREATE TABLE questions (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     question TEXT NOT NULL,
     options TEXT NOT NULL, -- JSON string like '["Opt1", "Opt2"]'
     answer TEXT NOT NULL,
     subject TEXT
   );
   ```

4. Bind the database to your Pages project in `wrangler.toml` or the Cloudflare Dashboard:
   - Go to **Pages** -> **Your Project** -> **Settings** -> **Functions** -> **D1 database bindings**.
   - Bind `DB` to your `smart-x-db`.

## Folder Structure for GitHub

```text
your-repo/
├── _worker.js          <-- Cloudflare Worker (Logic & API)
├── index.html          <-- Home & Dashboard (UI)
└── ...
```

## How it works

1. **index.html**: Contains your frontend UI. It uses a `fetch('/hello')` call to talk to the backend.
2. **functions/hello.js**: A Cloudflare Pages Function. Any file in the `/functions` directory automatically becomes an API endpoint.
   - `/functions/hello.js` -> `your-site.pages.dev/hello`
   - `/functions/api/data.js` -> `your-site.pages.dev/api/data`

## Deployment

1. Push your code to GitHub.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
3. Select **Workers & Pages** -> **Pages** -> **Connect to Git**.
4. Select your repository.
5. For **Build settings**:
   - If you have no build step (straight HTML), leave everything default.
   - If using Vite, use `npm run build` and `dist` as the output directory.
6. Click **Save and Deploy**.
