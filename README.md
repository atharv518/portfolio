# Atharv Hadpe — Portfolio

A personal developer portfolio website showcasing my projects, technical skills, certifications, education, and ways to connect with me.

## Overview

This portfolio is built as a lightweight, performant personal website focused on a clean, dark, and minimal interface. It features smooth page-load animations, scroll-triggered reveals, a modular data-driven project showcase, and a responsive two-column contact section.

## Features

- **Responsive Design**: Fluid layout optimized for desktops, tablets, and mobile devices (from 375px to 1440px+).
- **Hero Section**: Personal introduction, portrait presentation, direct social shortcuts, and resume access.
- **About Section**: Personal background, engineering journey, and interests.
- **Technical Skills**: Categorized skills (Languages, Frameworks, Databases, Tools, Core CS) styled with clean hover badges.
- **Featured Projects**: Data-driven cards with real-time status indicators, tech stacks, GitHub links, and live demo buttons.
- **Certifications**: Industry simulation and foundation credentials with direct certificate viewing links.
- **Education**: Academic background in Information Technology.
- **Two-Column Contact Section**: Clean layout featuring a direct message, social links, and an interactive contact form with client-side validation.
- **Animations**: Staggered page-load entrance and scroll-reveal system powered by CSS transitions and the `IntersectionObserver` API.
- **Mobile Navigation**: Glassmorphism navbar with smooth hamburger-to-X menu transitions.

## Tech Stack

- **HTML5**: Semantic markup, accessible headings, and SEO meta tags.
- **CSS3**: Vanilla CSS with modern CSS custom properties (design tokens), CSS Grid, Flexbox, and keyframe animations.
- **JavaScript (ES6+)**: Modular vanilla JavaScript for data configuration, dynamic DOM generation, mobile navigation, and form validation.
- **Typography**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts.
- **Icons**: Handcrafted inline SVG vector icons.

## Project Structure

```text
Portfolio_website/
├── assets/
│   ├── certificates/       # Certificate images (PNG)
│   ├── images/             # Profile photos
│   └── resume/             # Resume PDF document
├── css/
│   ├── about.css           # About section styles
│   ├── animations.css      # Page load & scroll reveal animations
│   ├── base.css            # Base element resets & typography
│   ├── certifications.css  # Certification cards styling
│   ├── components.css      # Reusable buttons, badges, tags, and cards
│   ├── contact.css         # Two-column contact section & form styles
│   ├── education.css       # Education section styles
│   ├── footer.css          # Footer styles
│   ├── hero.css            # Hero layout, portrait frame, & scroll cue
│   ├── layout.css          # Container and grid system
│   ├── navbar.css          # Fixed glassmorphism navbar & mobile menu
│   ├── projects.css        # Project showcase grid & cards
│   ├── skills.css          # Skill category groups & chips
│   └── variables.css       # Design tokens (colors, spacing, typography)
├── js/
│   ├── animations.js       # IntersectionObserver scroll reveal logic
│   ├── data.js             # Central data configuration for projects, skills, & certs
│   ├── main.js             # App initialization, rendering, & form validation
│   └── navbar.js           # Navbar scroll state & mobile drawer toggle
├── index.html              # Main single-page application markup
└── README.md               # Project documentation
```

## Featured Projects

### NovaATS
AI-powered resume analysis platform that evaluates resumes against job descriptions, provides ATS compatibility scoring, identifies skill gaps, and generates actionable feedback.
- **Technologies**: React, Vite, Tailwind CSS, FastAPI, Python, AI
- **GitHub**: [github.com/atharv518/ai-resume-analyzer](https://github.com/atharv518/ai-resume-analyzer)
- **Live Demo**: [ai-resume-analyzer-indol-zeta.vercel.app](https://ai-resume-analyzer-indol-zeta.vercel.app/)

### CDN Network Simulator
A Flask-based CDN simulation that models an origin server and regional edge nodes with intelligent routing, caching, TTL management, health monitoring, and failover.
- **Technologies**: Python, Flask, JavaScript, Networking, Caching
- **GitHub**: [github.com/atharv518/cdn-simulation-intelligent-content-routing](https://github.com/atharv518/cdn-simulation-intelligent-content-routing)

## Certifications

- **JPMorgan Chase & Co.** — *Software Engineering Job Simulation* (Forage)
- **TCS iON** — *Career Edge — AI Foundation*

## Local Development

Because this project is built entirely with standard web technologies (HTML, CSS, JavaScript) without build dependencies, it can be served using any local HTTP server:

Using `npx serve`:
```bash
npx serve -l 3000
```

Or using Python's built-in server (e.g. port 8000 or 3000):
```bash
python -m http.server 8000
```

Once started, open `http://localhost:3000` (or `http://localhost:8000`) in your web browser.

## Deployment

The portfolio can be deployed as a static website to platforms such as:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

Simply connect your repository or publish the root folder containing `index.html`.

## Contact

- **GitHub**: [github.com/atharv518](https://github.com/atharv518)
- **LinkedIn**: [linkedin.com/in/atharv-hadpe-9b8999320](https://www.linkedin.com/in/atharv-hadpe-9b8999320/)
- **Email**: [atharvhadpe18@gmail.com](mailto:atharvhadpe18@gmail.com)
