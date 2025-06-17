import { Flashcard, PracticeGrade } from '../types/card';

export const sm2 = (card: Flashcard, grade: PracticeGrade): Flashcard => {
  if (grade < 0 || grade > 5) {
    throw new Error('Grade must be between 0 and 5.');
  }

  let { repetitions, efactor, interval } = card;

  if (grade < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
  }

  efactor += 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  if (efactor < 1.3) {
    efactor = 1.3;
  }

  const today = new Date();
  const nextDueDate = new Date(today.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    ...card,
    repetitions,
    efactor,
    interval,
    dueDate: nextDueDate.toISOString(),
    nextReviewDate: nextDueDate,
  };
};