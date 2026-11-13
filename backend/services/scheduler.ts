import {
  fsrs,
  Rating,
  State,
  Card,
  RecordLogItem,
  createEmptyCard,
} from "ts-fsrs";
import { ReviewState } from "@prisma/client";

export { Rating, State } from "ts-fsrs";

export interface FsrsCardInput {
  due?: Date;
  stability?: number | null;
  difficulty?: number | null;
  scheduled_days?: number;
  reps?: number;
  lapses?: number;
  state?: ReviewState | State;
  last_review?: Date | null;
}

const fsrsInstance = fsrs();

export function toFsrsState(state?: ReviewState | State | string): State {
  if (typeof state === "number") return state;
  switch (state) {
    case "NEW":
      return State.New;
    case "LEARNING":
      return State.Learning;
    case "REVIEW":
      return State.Review;
    case "RELEARNING":
      return State.Relearning;
    default:
      return State.New;
  }
}

export function fromFsrsState(state: State): ReviewState {
  switch (state) {
    case State.New:
      return "NEW";
    case State.Learning:
      return "LEARNING";
    case State.Review:
      return "REVIEW";
    case State.Relearning:
      return "RELEARNING";
    default:
      return "REVIEW";
  }
}

/**
 * Maps incoming grades / ratings to FSRS Rating enum.
 * Accepts:
 * - Legacy 0-5 SM-2 grade: 0-2 -> Again (1), 3 -> Hard (2), 4 -> Good (3), 5 -> Easy (4)
 * - FSRS 1-4 Rating numbers
 * - String rating labels: "AGAIN", "HARD", "GOOD", "EASY"
 */
export function mapGradeToRating(gradeOrRating: number | string): Rating {
  if (typeof gradeOrRating === "string") {
    const normalized = gradeOrRating.trim().toUpperCase();
    if (normalized === "AGAIN") return Rating.Again;
    if (normalized === "HARD") return Rating.Hard;
    if (normalized === "GOOD") return Rating.Good;
    if (normalized === "EASY") return Rating.Easy;
  }

  const num = Number(gradeOrRating);
  if (Number.isNaN(num)) return Rating.Good;

  // Legacy 0-5 grade mapping
  if (num <= 2) return Rating.Again; // 0, 1, 2 -> Again
  if (num === 3) return Rating.Hard;
  if (num === 4) return Rating.Good;
  if (num >= 5) return Rating.Easy;

  return Rating.Good;
}

/**
 * Pure schedule function wrapping ts-fsrs.
 */
export function schedule(
  cardInput: FsrsCardInput,
  ratingInput: Rating | number | string,
  now = new Date(),
): RecordLogItem {
  const rating: 1 | 2 | 3 | 4 =
    typeof ratingInput === "number" && ratingInput >= 1 && ratingInput <= 4
      ? (ratingInput as 1 | 2 | 3 | 4)
      : (mapGradeToRating(ratingInput) as 1 | 2 | 3 | 4);

  const card: Card = {
    due: cardInput.due || now,
    stability: cardInput.stability && cardInput.stability > 0 ? cardInput.stability : 0,
    difficulty: cardInput.difficulty && cardInput.difficulty > 0 ? cardInput.difficulty : 0,
    scheduled_days: cardInput.scheduled_days || 0,
    reps: cardInput.reps || 0,
    lapses: cardInput.lapses || 0,
    learning_steps: 0,
    state: cardInput.state !== undefined ? toFsrsState(cardInput.state) : State.New,
    last_review: cardInput.last_review || undefined,
  };

  return fsrsInstance.next(card, now, rating);
}

/**
 * Compute retrievability probability (0.0 - 1.0) for a card at a given time.
 */
export function calculateRetrievability(
  cardInput: FsrsCardInput,
  now = new Date(),
): number {
  if (!cardInput.stability || cardInput.stability <= 0) {
    return 1.0;
  }

  const card: Card = {
    due: cardInput.due || now,
    stability: cardInput.stability,
    difficulty: cardInput.difficulty || 5,
    scheduled_days: cardInput.scheduled_days || 0,
    reps: cardInput.reps || 1,
    lapses: cardInput.lapses || 0,
    learning_steps: 0,
    state: cardInput.state !== undefined ? toFsrsState(cardInput.state) : State.Review,
    last_review: cardInput.last_review || undefined,
  };

  try {
    return Math.max(0, Math.min(1, fsrsInstance.retrievability(card, now)));
  } catch {
    return 0.9;
  }
}

