Littera — quick notes
======================

Environment variables
---------------------

This project uses Vite. Client-side environment variables must be prefixed with `VITE_`.

Required variables (set these in Vercel -> Settings -> Environment Variables):

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

If these are missing the app will log an error in the browser console and auth calls will fail.

Local testing
-------------

1. Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Install and run locally:

```
npm install
npm run dev
```

3. To test the production build locally:

```
npm run build
npm run preview
```

Troubleshooting
---------------

- If login/cadastro parecem não fazer nada after deploy, open the browser console and look for messages about missing Supabase env variables or auth errors. The client code now prints helpful console.error messages when config is missing.
