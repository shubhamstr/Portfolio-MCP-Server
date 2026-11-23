export interface SkillItem {
  name: string;
  level: number;
  visible: boolean;
}

export interface ProjectItem {
  title: string;
  description: string;
  image?: string;
  techStacks: string[];
  demoLink?: string;
  githubLink?: string;
  type: string;
}

export interface PortfolioUrls {
  resumeURL?: string;
  githubURL?: string;
  linkedInURL?: string;
  twitterURL?: string;
  codepenURL?: string;
  stackOverFlowURL?: string;
  mediumURL?: string;
  freeCodeCampURL?: string;
  soloLearnURL?: string;
  devToURL?: string;
  leetcodeURL?: string;
  dockerURL?: string;
  hackerEarthURL?: string;
  hackerRankURL?: string;
  bitbucketURL?: string;
  gitlabURL?: string;
  streamlitURL?: string;
  [key: string]: string | undefined;
}

export interface DbData {
  skills: {
    frontend?: SkillItem[];
    backend?: SkillItem[];
    database?: SkillItem[];
    tools?: SkillItem[];
    concepts?: SkillItem[];
    cloud?: SkillItem[];
    [key: string]: SkillItem[] | undefined;
  };
  URLs: PortfolioUrls;
  projects: ProjectItem[];
}
