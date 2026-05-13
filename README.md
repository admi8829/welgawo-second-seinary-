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

## New Features & Admin Tools

- **Student Dashboard**: Accessible at `/admin.html`. Shows all registered students.
- **Question Engine**: Accessible at `/add-question.html`. Use this to add new quiz questions to the database via a form.
- **Sample Questions**: Use the SQL in `questions.sql` to populate your D1 database initially.

## Important Routes

- `/join-free.html` -> Registration Page
- `/admin.html` -> Admin Dashboard (Students)
- `/add-question.html` -> Admin Question Engine
- `/about.html` -> Academy Information
- `/contact.html` -> Contact & Support
- `/quiz.html` -> Daily Quiz Page 

## How it works

1. **index.html**: Main landing page.
2. **_worker.js**: Single worker handling routing and Cloudflare D1 integration.
3. **Local Simulation**: `server.ts` uses Express to mimic the Cloudflare environment for development.

## Deployment

1. Push your code to GitHub.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
3. Select **Workers & Pages** -> **Pages** -> **Connect to Git**.
4. Select your repository.
5. For **Build settings**:
   - If you have no build step (straight HTML), leave everything default.
   - If using Vite, use `npm run build` and `dist` as the output directory.
6. Click **Save and Deploy**.
