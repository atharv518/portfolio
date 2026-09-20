/* ============================================
   DATA — Projects & Certifications
   ============================================ */

const PROJECTS = [
  {
    title: "NovaATS",
    status: "COMPLETED", // "COMPLETED" or "CURRENTLY WORKING"
    description: "AI-powered resume analysis platform that evaluates resumes against job descriptions, provides ATS compatibility scoring, identifies skill gaps, and generates actionable feedback.",
    technologies: ["React", "Vite", "Tailwind CSS", "FastAPI", "Python", "AI"],
    github: "https://github.com/atharv518/ai-resume-analyzer",
    live: "https://ai-resume-analyzer-indol-zeta.vercel.app/"
  },
  {
    title: "CDN Network Simulator",
    status: "CURRENTLY WORKING",
    description: "A Flask-based CDN simulation that models an origin server and regional edge nodes with intelligent routing, caching, TTL management, health monitoring, and failover.",
    technologies: ["Python", "Flask", "JavaScript", "Networking", "Caching"],
    github: "https://github.com/atharv518/cdn-simulation-intelligent-content-routing",
    live: null // Set to live URL when deployed, or null if no live demo yet
  }
  // To add a new project in the future, simply copy the template above and add it here!
];

const CERTIFICATIONS = [
  {
    org: "JPMorgan Chase & Co.",
    title: "Software Engineering Job Simulation",
    platform: "Forage",
    certificateUrl: "assets/certificates/jpmorgan-forage-certificate.png",
    skills: ["Project Setup", "Kafka", "H2 Database", "REST API", "REST Controllers"]
  },
  {
    org: "TCS iON",
    title: "Career Edge — AI Foundation",
    platform: null,
    certificateUrl: "assets/certificates/tcs-ion-ai-certificate.png",
    skills: ["AI Fundamentals", "Generative AI", "Prompt Engineering Basics", "AI Tools", "Responsible AI"]
  }
];

const SKILLS = [
  {
    category: "Languages",
    items: [
      { name: "Python", url: "https://www.python.org/", icon: "python" },
      { name: "JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", icon: "javascript" },
      { name: "C", url: "https://en.cppreference.com/w/c", icon: "c" },
      { name: "HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", icon: "html" },
      { name: "CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS", icon: "css" }
    ]
  },
  {
    category: "Frameworks",
    items: [
      { name: "React", url: "https://react.dev/", icon: "react" },
      { name: "Flask", url: "https://flask.palletsprojects.com/", icon: "flask" }
    ]
  },
  {
    category: "Databases",
    items: [
      { name: "PostgreSQL", url: "https://www.postgresql.org/", icon: "postgresql" },
      { name: "MongoDB", url: "https://www.mongodb.com/", icon: "mongodb" }
    ]
  },
  {
    category: "Tools",
    items: [
      { name: "Git", url: "https://git-scm.com/", icon: "git" },
      { name: "GitHub", url: "https://github.com/", icon: "github" },
      { name: "VS Code", url: "https://code.visualstudio.com/", icon: "vscode" },
      { name: "Postman", url: "https://www.postman.com/", icon: "postman" }
    ]
  },
  {
    category: "Core",
    items: [
      { name: "OOP", url: "https://en.wikipedia.org/wiki/Object-oriented_programming", icon: "oop" },
      { name: "DBMS", url: "https://en.wikipedia.org/wiki/Database#Database_management_system", icon: "dbms" },
      { name: "Operating Systems", url: "https://en.wikipedia.org/wiki/Operating_system", icon: "os" },
      { name: "Computer Networks", url: "https://en.wikipedia.org/wiki/Computer_network", icon: "networks" }
    ]
  }
];
