# AI Assistant website

Russian marketing website and account pages for AI Assistant for Windows.

Static HTML, CSS and JavaScript. Open `index.html` with a local HTTP server or deploy the repository root on a static host. No build step is required.

- `index.html`: landing page
- `account.html`: email/password registration and sign-in
- `account.js`: Supabase Auth integration using the project public publishable key
- `assets/`: logo and application screenshots

Supabase must have the deployed account URL configured in Authentication → URL Configuration, and custom SMTP configured for email delivery to public users. Never add a Supabase secret/service-role key to this repository. Website navigation reads the saved browser session; the account page verifies it with Supabase Auth. Windows app sign-in is performed separately with the same account.

Live site: https://ai-assistant-your-helper.ellehelly-by.chatgpt.site/
Application: https://github.com/hpt1mee/AI-assistant-Your-Helper

## Railway

The repository includes a dependency-free Node HTTP server and a Dockerfile. Railway detects the Dockerfile; the server listens on `0.0.0.0:$PORT` and exposes `/health` for the configured health check.

1. In Railway, create a project from the GitHub repository `hpt1mee/AI-assistant-site`, branch `main`.
2. Wait for the deployment to succeed, then generate a domain in Settings → Networking.
3. Add `https://YOUR-RAILWAY-DOMAIN/account.html` to the Supabase project's Authentication → URL Configuration → Redirect URLs. Keep the existing URL while migrating. Existing accounts remain in the same Supabase project; users sign in again on the new domain.

No Supabase secret/service-role key, SMTP password or model API key belongs in the website. The existing publishable Supabase key is public by design.

For a local check, run `npm start` with Node 22 or newer. Only the public HTML, styles, scripts and assets are served; repository files and server configuration are not exposed.
