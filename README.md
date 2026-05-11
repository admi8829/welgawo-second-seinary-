# Cloudflare Pages + Functions Example

This is a simple template for a Cloudflare Pages project with Functions.

## GitHub Folder Structure

To host this on Cloudflare Pages, your GitHub repository should look like this:

```text
your-repo/
├── functions/          <-- Cloudflare Functions dir
│   └── hello.js        <-- Endpoint at /hello
└── index.html          <-- Main static file
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
