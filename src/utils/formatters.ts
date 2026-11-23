import { DbData, SkillItem } from '../types/index.js';

export function formatProfile(data: DbData): string {
  const urls = data.URLs;
  return [
    '# Shubham Sutar - Full Stack Developer',
    '> A Full Stack Developer with 5+ years of experience specializing in React.js, Node.js, Express.js, and MongoDB.',
    '',
    '## Summary',
    "I build fast, scalable, and user-centric web applications using modern technologies like JavaScript, TypeScript, Next.js, Python, Docker, and CI/CD pipelines. Passionate about clean code, performance optimization, and turning ideas into impactful digital products, AI-powered tools, and open-source packages.",
    '',
    '## Quick Links',
    urls.resumeURL ? `- **Resume:** [View Resume](${urls.resumeURL})` : '',
    urls.githubURL ? `- **GitHub:** ${urls.githubURL}` : '',
    urls.linkedInURL ? `- **LinkedIn:** ${urls.linkedInURL}` : '',
    urls.twitterURL ? `- **Twitter / X:** ${urls.twitterURL}` : '',
    urls.dockerURL ? `- **Docker Hub:** ${urls.dockerURL}` : '',
    urls.leetcodeURL ? `- **LeetCode:** ${urls.leetcodeURL}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatSkills(data: DbData, category?: string): string {
  const skillsObj = data.skills;
  const cat = category?.toLowerCase();

  const renderCategory = (title: string, list?: SkillItem[]) => {
    if (!list || list.length === 0) return '';
    const visibleSkills = list.filter((s) => s.visible !== false);
    return [
      `### ${title}`,
      ...visibleSkills.map((s) => `- **${s.name}** (Proficiency: ${s.level}%)`),
    ].join('\n');
  };

  if (cat && cat !== 'all') {
    switch (cat) {
      case 'frontend':
        return renderCategory('Frontend Skills', skillsObj.frontend) || 'No frontend skills found.';
      case 'backend':
        return renderCategory('Backend Skills', skillsObj.backend) || 'No backend skills found.';
      case 'database':
      case 'databases':
        return renderCategory('Database Skills', skillsObj.database) || 'No database skills found.';
      case 'tools':
        return renderCategory('Developer Tools & Environments', skillsObj.tools) || 'No tools found.';
      case 'concepts':
        return renderCategory('Architecture & Core Concepts', skillsObj.concepts) || 'No concepts found.';
      case 'cloud':
        return renderCategory('Cloud Platforms & DevOps', skillsObj.cloud) || 'No cloud skills found.';
      default:
        break;
    }
  }

  const sections = [
    '# Technical Skills',
    renderCategory('Frontend', skillsObj.frontend),
    renderCategory('Backend', skillsObj.backend),
    renderCategory('Databases', skillsObj.database),
    renderCategory('Cloud & Infrastructure', skillsObj.cloud),
    renderCategory('Developer Tools', skillsObj.tools),
    renderCategory('Architectural Concepts & Methodologies', skillsObj.concepts),
  ].filter(Boolean);

  return sections.join('\n\n');
}

export function formatProjects(data: DbData, typeFilter?: string, techFilter?: string): string {
  let list = data.projects || [];

  if (typeFilter && typeFilter.toLowerCase() !== 'all') {
    const t = typeFilter.toLowerCase();
    list = list.filter((p) => p.type.toLowerCase().includes(t));
  }

  if (techFilter) {
    const q = techFilter.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStacks.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (list.length === 0) {
    return 'No projects found matching the specified criteria.';
  }

  return [
    `# Projects (${list.length} displayed)`,
    '',
    ...list.map((project) =>
      [
        `### ${project.title} [Type: ${project.type.toUpperCase()}]`,
        `**Description:** ${project.description}`,
        `**Tech Stack:** ${project.techStacks.join(', ')}`,
        project.demoLink ? `**Live Demo / Package:** [${project.demoLink}](${project.demoLink})` : '',
        project.githubLink ? `**Repository / Source:** [${project.githubLink}](${project.githubLink})` : '',
        project.image ? `**Cover Image:** ${project.image}` : '',
        '---',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  ].join('\n');
}

export function formatContact(data: DbData): string {
  const u = data.URLs;
  return [
    '# Contact & Profiles — Shubham Sutar',
    '',
    u.resumeURL ? `- **Resume:** [View Resume Google Doc](${u.resumeURL})` : '',
    u.githubURL ? `- **GitHub:** ${u.githubURL}` : '',
    u.linkedInURL ? `- **LinkedIn:** ${u.linkedInURL}` : '',
    u.twitterURL ? `- **Twitter / X:** ${u.twitterURL}` : '',
    u.dockerURL ? `- **Docker Hub:** ${u.dockerURL}` : '',
    u.leetcodeURL ? `- **LeetCode:** ${u.leetcodeURL}` : '',
    u.stackOverFlowURL ? `- **Stack Overflow:** ${u.stackOverFlowURL}` : '',
    u.devToURL ? `- **Dev.to:** ${u.devToURL}` : '',
    u.mediumURL ? `- **Medium:** ${u.mediumURL}` : '',
    u.freeCodeCampURL ? `- **freeCodeCamp:** ${u.freeCodeCampURL}` : '',
    u.codepenURL ? `- **CodePen:** ${u.codepenURL}` : '',
    u.bitbucketURL ? `- **Bitbucket:** ${u.bitbucketURL}` : '',
    u.gitlabURL ? `- **GitLab:** ${u.gitlabURL}` : '',
    u.streamlitURL ? `- **Streamlit:** ${u.streamlitURL}` : '',
    u.soloLearnURL ? `- **SoloLearn:** ${u.soloLearnURL}` : '',
    u.hackerRankURL ? `- **HackerRank:** ${u.hackerRankURL}` : '',
    u.hackerEarthURL ? `- **HackerEarth:** ${u.hackerEarthURL}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatExperience(data: DbData): string {
  const urls = data.URLs;
  return [
    '# Professional Experience & Career Overview',
    '',
    '### Senior Full Stack Developer (5+ Years Experience)',
    '- **Core Stack:** React.js, Next.js, Node.js, Express.js, TypeScript, Python, MongoDB, MySQL, Docker, AWS, GCP.',
    '- **Key Focus:** Fast, responsive, accessible frontends, high-throughput microservices, robust REST/WebSocket APIs, AI-powered developer utilities, and CI/CD pipelines.',
    '',
    '### Key Milestones & Engineered Solutions',
    '- **Real-Time Distributed Systems:** Built Realtime Chat App utilizing WebSockets, React.js, and Node.js for low-latency messaging.',
    '- **AI & Agentic Developer Tools:** Created Bitbucket PR Review Tool powered by Google Gemini AI and Docker for automated code reviews; developed ChatGPT Vault extension.',
    '- **Open Source & Developer Tooling:** Published npm packages (@shubhamstr/boilerplate-generator, @shubhamstr/form-builder) and VS Code Extensions (Project Rules Checker, Project Companion).',
    '- **Cloud & Infrastructure:** Hands-on deployments across AWS EC2, S3, RDS, ECR, GCP Cloud Run, and Azure Virtual Machines.',
    '',
    urls.resumeURL ? `For complete chronological company details, refer to: [Full Resume](${urls.resumeURL})` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
