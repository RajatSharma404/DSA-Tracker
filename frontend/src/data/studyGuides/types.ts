export interface StudySection {
  title: string;
  icon: string;
  content: string;
}

export interface StudyGuide {
  topicName: string;
  emoji: string;
  tagline: string;
  prerequisite: string;
  sections: StudySection[];
  patternTriggers: Array<{ trigger: string; pattern: string }>;
  complexityTable: Array<{ operation: string; time: string; space: string }>;
  codeExample: { title: string; code: string; walkthrough: string };
  keyTakeaways: string[];
}
