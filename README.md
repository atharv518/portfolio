# Atharv Hadpe — Developer Portfolio

[![Live Portfolio](https://img.shields.io/badge/Live%20Portfolio-portfolio--ah--5572.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio-ah-5572.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-atharv518-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/atharv518)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Atharv%20Hadpe-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/atharv-hadpe-9b8999320/)

> 🌐 **Live Demo:** [portfolio-ah-5572.vercel.app](https://portfolio-ah-5572.vercel.app/)  
> 📦 **GitHub Repository:** [github.com/atharv518/portfolio](https://github.com/atharv518/portfolio)

A modern, high-performance personal developer portfolio showcasing software engineering projects, technical skills, certifications, and an integrated, secure contact system. Built with a sleek dark aesthetic, responsive design, and a full-stack serverless contact workflow.

---

## 🌟 Key Features

- **Working Contact Form**: Interactive form with real-time client-side validation, server-side sanitization, and IP rate limiting.
- **Vercel Serverless API**: Robust backend endpoint (`api/contact.js`) deployed as a serverless function to handle contact requests securely without server management.
- **Supabase Message Storage with RLS**: Submissions are persistently stored in a Supabase PostgreSQL database protected by strict Row Level Security (RLS) default-deny policies, accessible only via service role.
- **Resend Email Notifications**: Instant transactional email dispatch to notify the owner upon new message submissions.
- **Featured Projects**: Data-driven cards with status badges, architectural details, tech stack tags, live demos, and GitHub links.
- **Dynamic Animations**: Smooth entrance animations and scroll-triggered reveals powered by the `IntersectionObserver` API and CSS transitions.
- **Responsive Layout**: Designed for optimal viewing across mobile, tablet, and desktop devices (375px to 1440px+).

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design Tokens, Grid, Flexbox), Vanilla JavaScript (ES6+)
- **Hosting & Serverless Functions**: [Vercel](https://vercel.com/)
- **Database & Security**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Email Delivery**: [Resend](https://resend.com/) API
- **Typography & Icons**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts, Custom inline SVG icons

---

## 📁 Project Structure

```text
Portfolio_website/
├── .env.example            # Example template for environment variables
├── .gitignore              # Git ignore rules for node_modules, .env, and build files
├── index.html              # Main single-page application entry point
├── package.json            # Node.js project manifest & dependencies (@supabase/supabase-js, resend)
├── README.md               # Project documentation
├── api/
│   └── contact.js          # Vercel serverless contact handler (rate limiting, Supabase, Resend)
├── assets/
│   ├── certificates/       # Certificate images
│   ├── images/             # Profile photos and avatars
│   └── resume/             # PDF resume document
├── css/
│   ├── about.css           # About section styles
│   ├── animations.css      # Page load and scroll animations
│   ├── base.css            # CSS resets and base typography
│   ├── certifications.css  # Certification cards styling
│   ├── components.css      # Buttons, badges, tags, and card components
│   ├── contact.css         # Two-column contact layout and form styles
│   ├── education.css       # Education timeline styles
│   ├── footer.css          # Footer styles
│   ├── hero.css            # Hero section, portrait frame, and CTAs
│   ├── layout.css          # Container and grid system
│   ├── navbar.css          # Glassmorphic header and mobile drawer
│   ├── projects.css        # Projects grid and cards
│   ├── skills.css          # Categorized skill badges
│   └── variables.css       # Design tokens (colors, spacing, shadows)
├── js/
│   ├── animations.js       # IntersectionObserver scroll reveal system
│   ├── data.js             # Central data configuration (projects, skills, certs)
│   ├── main.js             # UI initialization, rendering, and form submission
│   └── navbar.js           # Navbar scroll state & mobile drawer toggle
└── supabase/
    └── schema.sql          # Database schema and Row Level Security (RLS) setup
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Vercel CLI](https://vercel.com/cli) (recommended for running serverless functions locally)

### 2. Clone Repository
```bash
git clone https://github.com/atharv518/portfolio.git
cd portfolio
```

### 3. Install Dependencies
Install the required serverless function packages:
```bash
npm install
```

### 4. Configure Environment Variables
Create your local environment file from the template:
```bash
cp .env.example .env.local
```

Populate the required environment variables in `.env.local`:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL (`https://<project-id>.supabase.co`) |
| `SUPABASE_SECRET_KEY` | Supabase Service Role / Secret Key (starts with `sb_secret_...`) |
| `RESEND_API_KEY` | Resend API key for outbound notification emails (`re_...`) |
| `NOTIFICATION_EMAIL` | Destination inbox where contact notifications should be delivered |

> 🔒 **Security Notice**: Never commit `.env` or `.env.local` to version control. These keys should only reside locally or inside your deployment platform's secret manager.

### 5. Setup Supabase Database
Run the script in [supabase/schema.sql](file:///d:/Portfolio_website/supabase/schema.sql) in your **Supabase SQL Editor**:
- Creates the `public.contacts` table.
- Enables **Row Level Security (RLS)** with a default-deny policy (blocking anonymous and unauthorized reads/writes).
- Grants full read/write permissions strictly to the `service_role`.

### 6. Run Locally

#### Running Full-Stack (Frontend + Serverless API):
```bash
vercel dev
```
Open `http://localhost:3000` in your browser.

#### Running Frontend Only (Static preview without contact API):
```bash
npx serve -l 3000
# or
python -m http.server 3000
```

---

## ☁️ Vercel Deployment

1. **Push Code to GitHub**: Ensure all changes are committed and pushed to your GitHub repository.
2. **Import Project into Vercel**:
   - Navigate to [vercel.com](https://vercel.com/) and click **Add New... > Project**.
   - Select your `portfolio` repository.
3. **Configure Environment Variables**:
   - In the project settings under **Environment Variables**, add the four required keys:
     - `SUPABASE_URL`
     - `SUPABASE_SECRET_KEY`
     - `RESEND_API_KEY`
     - `NOTIFICATION_EMAIL`
4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend assets and deploy `api/contact.js` as a live serverless function.

---

## 💼 Featured Projects

### NovaATS
AI-powered resume analysis platform that evaluates resumes against job descriptions, provides ATS compatibility scoring, identifies skill gaps, and generates actionable feedback.
- **Technologies**: React, Vite, Tailwind CSS, FastAPI, Python, AI
- **GitHub**: [github.com/atharv518/ai-resume-analyzer](https://github.com/atharv518/ai-resume-analyzer)
- **Live Demo**: [ai-resume-analyzer-indol-zeta.vercel.app](https://ai-resume-analyzer-indol-zeta.vercel.app/)

### CDN Network Simulator
A Flask-based CDN simulation that models an origin server and regional edge nodes with intelligent routing, caching, TTL management, health monitoring, and failover.
- **Technologies**: Python, Flask, JavaScript, Networking, Caching
- **GitHub**: [github.com/atharv518/cdn-simulation-intelligent-content-routing](https://github.com/atharv518/cdn-simulation-intelligent-content-routing)

---

## 📜 Certifications

- **JPMorgan Chase & Co.** — *Software Engineering Job Simulation* (Forage)
- **TCS iON** — *Career Edge — AI Foundation*

---

## 📬 Contact & Connect

- **Live Portfolio**: [portfolio-ah-5572.vercel.app](https://portfolio-ah-5572.vercel.app/)
- **GitHub**: [github.com/atharv518](https://github.com/atharv518)
- **LinkedIn**: [linkedin.com/in/atharv-hadpe-9b8999320](https://www.linkedin.com/in/atharv-hadpe-9b8999320/)
- **Email**: [atharvhadpe18@gmail.com](mailto:atharvhadpe18@gmail.com)
