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

      return `
        <article class="project-card reveal">
          <div class="project-card__status">
            <span class="badge ${statusClass}">
              <span class="badge__dot"></span>
              ${statusText}
            </span>
          </div>
          <h3 class="project-card__title">${project.title}</h3>
          <p class="project-card__description">${project.description}</p>
          <div class="project-card__tech">
            ${project.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
          </div>
          <div class="project-card__actions">
            <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--small btn--icon">
              ${ICONS.github}
              GitHub
            </a>
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
      <div class="skills__category reveal">
        <h3 class="skills__category-label">${category.category}</h3>
        <div class="skills__list">
          ${category.items.map(item => `<span class="skills__item">${item}</span>`).join('')}
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
        <div class="cert-card reveal">
          <span class="cert-card__org">${cert.org}</span>
          <div class="cert-card__header">
            <h3 class="cert-card__title">${cert.title}${platformText}</h3>
            <a href="${cert.certificateUrl}" target="_blank" rel="noopener noreferrer" class="cert-link">
              View Certificate ↗
            </a>
          </div>
          <div>
            <span class="cert-card__skills-label">Relevant Skills</span>
            <div class="cert-card__skills">
              ${cert.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
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

  // ---- Initialize ----
  function init() {
    renderProjects();
    renderSkills();
    renderCertifications();
    initSmoothScroll();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
