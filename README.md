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
