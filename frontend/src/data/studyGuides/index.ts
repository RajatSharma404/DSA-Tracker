import { StudyGuide } from './types';
import { jsBasicsGuide } from './jsBasics';
import { arraysGuide } from './arrays';
import { hashingGuide } from './hashing';
import { twoPointersGuide } from './twoPointers';
import { slidingWindowGuide } from './slidingWindow';
import { stackGuide } from './stack';
import { binarySearchGuide } from './binarySearch';
import { linkedListGuide } from './linkedList';
import { treesGuide } from './trees';
import { graphsGuide } from './graphs';
import { dpGuide } from './dp';
import { backtrackingGuide } from './backtracking';
import { heapsGuide } from './heaps';
import { triesGuide, bitManipulationGuide } from './triesAndBits';

const allGuides: StudyGuide[] = [
  jsBasicsGuide,
  arraysGuide,
  hashingGuide,
  twoPointersGuide,
  slidingWindowGuide,
  stackGuide,
  binarySearchGuide,
  linkedListGuide,
  treesGuide,
  graphsGuide,
  dpGuide,
  backtrackingGuide,
  heapsGuide,
  triesGuide,
  bitManipulationGuide,
];

// Lookup by topic name (case-insensitive)
export const studyGuideLookup: Record<string, StudyGuide> = {};
allGuides.forEach(g => {
  studyGuideLookup[g.topicName.toLowerCase()] = g;
});

export function getStudyGuide(topicName: string): StudyGuide | null {
  return studyGuideLookup[topicName.toLowerCase()] || null;
}

export type { StudyGuide } from './types';
