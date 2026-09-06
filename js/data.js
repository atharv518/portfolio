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
    items: ["Python", "JavaScript", "C", "HTML", "CSS"]
  },
  {
    category: "Frameworks",
    items: ["React", "Flask"]
  },
  {
    category: "Databases",
    items: ["PostgreSQL", "MongoDB"]
  },
  {
    category: "Tools",
    items: ["Git", "GitHub", "VS Code", "Postman"]
  },
  {
    category: "Core",
    items: ["OOP", "DBMS", "Operating Systems", "Computer Networks"]
  }
];
