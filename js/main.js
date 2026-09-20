/* ============================================
   MAIN — Initialization & Dynamic Rendering
   ============================================ */

(function() {
  'use strict';

  // ---- SVG Icons ----
  const ICONS = {
    github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    email: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    certificate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
  };

  const TECH_ICONS = {
    python: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#3776AB" d="M11.91 0c-3.14 0-5.07.69-5.07 2.06v1.72h5.16v.69H4.14C1.94 4.47 0 6.07 0 9.17c0 3.09 1.76 4.71 4.14 4.71h1.56v-2.22c0-1.89 1.62-3.41 3.52-3.41h5.14V5.72C14.36 1.94 13.79 0 11.91 0zm-2.09 1.54a.79.79 0 1 1 0 1.58.79.79 0 0 1 0-1.58z"/><path fill="#FFD43B" d="M12.09 24c3.14 0 5.07-.69 5.07-2.06v-1.72h-5.16v-.69h7.86c2.2 0 4.14-1.6 4.14-4.7 0-3.09-1.76-4.71-4.14-4.71h-1.56v2.22c0 1.89-1.62 3.41-3.52 3.41H9.64v2.53C9.64 22.06 10.21 24 12.09 24zm2.09-1.54a.79.79 0 1 1 0-1.58.79.79 0 0 1 0 1.58z"/></svg>`,
    javascript: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#F7DF1E" d="M0 0h24v24H0V0z"/><path fill="#000" d="M12.44 18.06c.45.83 1.13 1.43 2.22 1.43 1.05 0 1.71-.53 1.71-1.26 0-.88-.7-1.22-1.88-1.73l-.64-.27c-1.84-.79-3.07-1.79-3.07-3.9 0-1.95 1.48-3.43 3.8-3.43 1.65 0 2.84.58 3.65 2.01l-1.9 1.22c-.41-.74-.86-1.04-1.75-1.04-.81 0-1.37.52-1.37 1.18 0 .7.51 1.01 1.63 1.49l.64.27c2.18.94 3.37 1.91 3.37 4.17 0 2.39-1.87 3.62-4.27 3.62-2.39 0-3.78-1.12-4.48-2.52l2.33-1.24zm-6.84.34c.36.63.69 1.16 1.49 1.16.77 0 1.27-.31 1.27-1.5v-8.9h2.51v8.94c0 2.45-1.43 3.56-3.47 3.56-1.89 0-3.02-1-3.64-2.31l1.84-.95z"/></svg>`,
    c: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#659AD2" d="M12 0l10.39 6v12L12 24 1.61 18V6L12 0zm0 2.31L3.61 7.15v9.7L12 21.69l8.39-4.84v-9.7L12 2.31zm.4 4.09c2.72 0 4.6 1.72 5.02 4.18h-2.56c-.34-1.14-1.25-1.8-2.46-1.8-1.73 0-2.88 1.34-2.88 3.22s1.15 3.22 2.88 3.22c1.21 0 2.12-.66 2.46-1.8h2.56c-.42 2.46-2.3 4.18-5.02 4.18-3.13 0-5.32-2.3-5.32-5.6s2.19-5.6 5.32-5.6z"/></svg>`,
    html: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#E34F26" d="M1.5 0h21l-1.91 21.5L12 24l-8.59-2.5L1.5 0z"/><path fill="#EF652A" d="M12 22l6.8-1.98 1.64-18.02H12V22z"/><path fill="#ECECEC" d="M12 9.77H8.56l-.24-2.73H12V4.41H5.66l.72 8.1H12V9.77zm0 6.64l-.03.01-2.92-.79-.19-2.09H6.4l.37 4.11 5.23 1.45V16.41z"/><path fill="#FFF" d="M12 9.77h3.44l-.32 3.64-3.12.84v2.73l5.23-1.45.69-7.76H12v2zm0-5.36v2.63h6.05l.23-2.63H12z"/></svg>`,
    css: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#1572B6" d="M1.5 0h21l-1.91 21.5L12 24l-8.59-2.5L1.5 0z"/><path fill="#33A9DC" d="M12 22l6.8-1.98 1.64-18.02H12V22z"/><path fill="#ECECEC" d="M12 9.77H8.56l-.24-2.73H12V4.41H5.66l.72 8.1H12V9.77zm0 6.64l-.03.01-2.92-.79-.19-2.09H6.4l.37 4.11 5.23 1.45V16.41z"/><path fill="#FFF" d="M12 9.77h3.44l-.32 3.64-3.12.84v2.73l5.23-1.45.69-7.76H12v2zm0-5.36v2.63h6.05l.23-2.63H12z"/></svg>`,
    react: `<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="2.2" fill="#61DAFB"/><ellipse cx="12" cy="12" rx="10" ry="3.8" fill="none" stroke="#61DAFB" stroke-width="1.2"/><ellipse cx="12" cy="12" rx="10" ry="3.8" fill="none" stroke="#61DAFB" stroke-width="1.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.8" fill="none" stroke="#61DAFB" stroke-width="1.2" transform="rotate(120 12 12)"/></svg>`,
    flask: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 2v2h1v3.17c-.89.54-3.21 2.22-4.5 4.83C5.11 14.81 5 16.92 5 19c0 2.21 2.24 4 5 4h4c2.76 0 5-1.79 5-4 0-2.08-.11-4.19-1.5-7-.69-1.39-1.89-2.82-3.5-4.83V4h1V2h-5zm1 7.17V4h2v5.17l.42.53c1.38 1.73 2.45 2.99 3.06 4.3 1.05 2.1 1.02 3.73 1.02 5 0 1.1-.9 2-2.5 2H9c-1.6 0-2.5-.9-2.5-2 0-1.27-.03-2.9 1.02-5 .61-1.31 1.68-2.57 3.06-4.3l.42-.53z"/></svg>`,
    postgresql: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#336791" d="M18.8 6.54c-.16-.3-.43-.72-.73-.93-.41-.29-.86-.34-1.24-.34-.58 0-1.17.13-1.63.36-1.07.54-1.56 1.58-2.12 2.62-.23.43-.45.86-.71 1.25-.19.29-.42.54-.69.74-.32.24-.7.39-1.11.45-1.16.16-2.31-.38-3.05-1.23-.74-.85-1.01-2-1.01-3.12 0-.49.07-.98.24-1.44.18-.46.46-.86.82-1.18.73-.64 1.7-.92 2.66-.81 1.05.12 2.01.69 2.68 1.51l1.41-1.15C14.49 2.07 13.22 1.34 11.87 1.18 10.51 1.02 9.15 1.43 8.08 2.32 7.01 3.2 6.32 4.5 6.2 5.89c-.12 1.39.31 2.79 1.18 3.89.87 1.1 2.14 1.8 3.53 1.95.84.09 1.69-.07 2.45-.47.76-.4 1.38-1.01 1.83-1.74.45-.73.76-1.54 1.15-2.3.39-.76.84-1.53 1.52-1.92.35-.2.72-.25 1.06-.18.34.07.63.26.83.52.2.26.31.59.35.91.04.32-.01.66-.14.96-.26.6-.78 1.04-1.34 1.4l1.09 1.48c.84-.54 1.57-1.23 1.97-2.14.4-.91.4-2 .1-2.92z"/><path fill="#336791" d="M12.5 14c-2.48 0-4.5 2.02-4.5 4.5S10.02 23 12.5 23s4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    mongodb: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#47A248" d="M12 0c-.3 0-.6.1-.8.4C9.5 2.5 5 8.9 5 14.5 5 19.2 8.1 23 12 24c3.9-1 7-4.8 7-9.5 0-5.6-4.5-12-6.2-14.1-.2-.3-.5-.4-.8-.4zm-.1 1.7c.9 1.3 5.3 7.8 5.3 12.8 0 3.7-2.3 6.9-5.3 7.9V1.7z"/></svg>`,
    git: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#F05032" d="M23.54 10.93L13.07.46a1.5 1.5 0 0 0-2.13 0L8.8 2.6l3.35 3.35a1.8 1.8 0 0 1 2.27 2.28l3.23 3.23a1.8 1.8 0 1 1-1.07 1.07l-3.02-3.03v5.27a1.8 1.8 0 1 1-1.5 0V9.33a1.8 1.8 0 0 1-.97-2.36L7.75 3.65.46 10.93a1.5 1.5 0 0 0 0 2.13l10.48 10.48c.59.59 1.54.59 2.13 0l10.47-10.48a1.5 1.5 0 0 0 0-2.13z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.8-.26.8-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.2.7.8.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    vscode: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#007ACC" d="M17.58 23.86a1.5 1.5 0 0 0 1.13-.25l4.57-3.53A1.5 1.5 0 0 0 24 18.9V5.1a1.5 1.5 0 0 0-.72-1.18l-4.57-3.53a1.5 1.5 0 0 0-1.89.14L7.54 8.79 3.03 5.37a1 1 0 0 0-1.34.12l-1.4 1.4a1 1 0 0 0 0 1.41L4.5 12 .29 15.7a1 1 0 0 0 0 1.41l1.4 1.4a1 1 0 0 0 1.34.12l4.51-3.42 9.28 8.26c.22.25.5.39.76.39zm.92-16.73L9.67 12l8.83 4.87V7.13z"/></svg>`,
    postman: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#FF6C37" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.66 8.52l-2.42 2.42a.5.5 0 0 1-.71 0l-.88-.88a.5.5 0 0 1 0-.71l2.42-2.42a.5.5 0 0 1 .71 0l.88.88c.2.2.2.51 0 .71zM7.22 15.78a2.5 2.5 0 1 1 3.54-3.54 2.5 2.5 0 0 1-3.54 3.54zm7.62-5.14l-3.8 3.8a4 4 0 0 0-5.18 5.18l-1.08 1.08a.5.5 0 0 1-.71 0l-.71-.71a.5.5 0 0 1 0-.71l1.08-1.08a4 4 0 0 0 5.18-5.18l3.8-3.8a2 2 0 1 1 2.83 2.83l-1.41-1.41z"/></svg>`,
    oop: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    dbms: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    os: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
    networks: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`
  };

  // ---- Render Projects ----
  function renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    container.innerHTML = PROJECTS.map(project => {
      const statusClass = project.status === 'COMPLETED' ? 'badge--completed' : 'badge--working';
      const statusText = project.status === 'COMPLETED' ? 'Completed' : 'Currently Working';

      const liveBtn = project.live 
        ? `<a href="${project.live}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--small btn--icon">
            ${ICONS.externalLink}
            Live Demo
          </a>`
        : '';

      const githubBtn = project.github 
        ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--small btn--icon">
            ${ICONS.github}
            GitHub
          </a>`
        : '';

      const techTags = (project.technologies || []).map(tech => `<span class="tag">${tech}</span>`).join('');

      return `
        <article class="project-card reveal">
          <div class="project-card__status">
            <span class="badge ${statusClass}">
              <span class="badge__dot"></span>
              ${statusText}
            </span>
          </div>
          <h3 class="project-card__title">${project.title}</h3>
          <p class="project-card__description">${project.description || ''}</p>
          ${techTags ? `<div class="project-card__tech">${techTags}</div>` : ''}
          <div class="project-card__actions">
            ${githubBtn}
            ${liveBtn}
          </div>
        </article>
      `;
    }).join('');
  }

  // ---- Render Skills ----
  function renderSkills() {
    const container = document.getElementById('skills-container');
    if (!container) return;

    container.innerHTML = SKILLS.map(category => `
      <div class="skills__category">
        <h4 class="skills__category-label">${category.category}</h4>
        <div class="skills__list">
          ${category.items.map(item => {
            const isObject = typeof item === 'object';
            const name = isObject ? item.name : item;
            const url = isObject ? item.url : '#';
            const iconKey = isObject ? item.icon : '';
            const iconSvg = TECH_ICONS[iconKey] || '';

            return `
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="skills__item" aria-label="${name} official website">
                ${iconSvg ? `<span class="skills__item-icon">${iconSvg}</span>` : ''}
                <span class="skills__item-name">${name}</span>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  // ---- Render Certifications ----
  function renderCertifications() {
    const container = document.getElementById('certifications-grid');
    if (!container) return;

    container.innerHTML = CERTIFICATIONS.map(cert => {
      const platformText = cert.platform ? ` — ${cert.platform}` : '';
      
      return `
        <div class="cert-card-item">
          <div class="cert-card-item__header">
            <div>
              <span class="cert-card-item__org">${cert.org}</span>
              <h4 class="cert-card-item__title">${cert.title}${platformText}</h4>
            </div>
            <a href="${cert.certificateUrl}" target="_blank" rel="noopener noreferrer" class="cert-link" aria-label="View ${cert.title} Certificate">
              View Certificate ↗
            </a>
          </div>
          <div class="cert-card-item__skills">
            ${cert.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // ---- Smooth Scroll for Anchor Links ----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ---- Contact Form Validation & Submission Handler ----
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');
    const formStatus = document.getElementById('form-status');

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function clearErrors() {
      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';
      nameInput.classList.remove('is-invalid');
      emailInput.classList.remove('is-invalid');
      messageInput.classList.remove('is-invalid');
      formStatus.className = 'form-status';
      formStatus.textContent = '';
      formStatus.style.display = 'none';
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      clearErrors();

      let isValid = true;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();

      if (!name) {
        nameError.textContent = 'Please enter your name.';
        nameInput.classList.add('is-invalid');
        isValid = false;
      }

      if (!email) {
        emailError.textContent = 'Please enter your email address.';
        emailInput.classList.add('is-invalid');
        isValid = false;
      } else if (!validateEmail(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        emailInput.classList.add('is-invalid');
        isValid = false;
      }

      if (!message) {
        messageError.textContent = 'Please enter a message.';
        messageInput.classList.add('is-invalid');
        isValid = false;
      } else if (message.length < 10) {
        messageError.textContent = 'Message should be at least 10 characters.';
        messageInput.classList.add('is-invalid');
        isValid = false;
      }

      if (!isValid) return;

      // Status notification (temporary until backend email service is connected)
      formStatus.className = 'form-status form-status--info';
      formStatus.innerHTML = `Thanks for reaching out, <strong>${name}</strong>! Direct form submission will be connected to an email service soon. In the meantime, please feel free to reach me directly at <a href="mailto:atharvhadpe18@gmail.com" style="color: var(--accent); text-decoration: underline;">atharvhadpe18@gmail.com</a>.`;
      formStatus.style.display = 'block';
      form.reset();
    });

    // Realtime error clearing on input
    [nameInput, emailInput, messageInput].forEach(input => {
      input.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          this.classList.remove('is-invalid');
          const errorSpan = document.getElementById(this.name + '-error');
          if (errorSpan) errorSpan.textContent = '';
        }
      });
    });
  }

  // ---- Initialize ----
  function init() {
    renderProjects();
    renderSkills();
    renderCertifications();
    initSmoothScroll();
    initContactForm();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
