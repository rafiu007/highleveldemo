export enum DefaultQuality {
  KIND = 'Kind',
  INTELLIGENT = 'Intelligent',
  CONFIDENT = 'Confident',
  HARD_WORKING = 'Hard-Working',
  FUN_LOVING = 'Fun-Loving',
  HONEST = 'Honest',
  CREATIVE = 'Creative',
  WISE = 'Wise',
  PRACTICAL = 'Practical',
  CLASSY = 'Classy',
  ORGANIZED = 'Organized',
  WARM = 'Warm',
  RATIONAL = 'Rational',
  BOLD = 'Bold',
  DETERMINED = 'Determined',
  CHARMING = 'Charming',
  PURE_HEARTED = 'Pure-Hearted',
  ARTISTIC = 'Artistic',
  HUMBLE = 'Humble',
  RESOURCEFUL = 'Resourceful',
  GRACEFUL = 'Graceful',
  RELIABLE = 'Reliable',
}

export enum QualityCategory {
  WISDOM = '☯️',
  PRACTICAL = '🔧',
  INTELLECTUAL = '🧠',
  EMOTIONAL = '💛',
  CONFIDENCE = '💯',
  PLAYFUL = '😉',
  DRIVEN = '🎯',
  ELEGANT = '🦩',
  ORGANIZED = '📐',
  CREATIVE = '🌈',
  PURE = '🤍',
}

export enum SubQuality {
  // Wisdom qualities
  CALM = 'Calm',
  OPEN_MINDED = 'Open-Minded',
  FREETHINKER = 'Freethinker',
  PERCEPTIVE = 'Perceptive',
  DIGNIFIED = 'Dignified',
  EQUANIMOUS = 'Equanimous',
  BALANCED = 'Balanced',
  MEDITATIVE = 'Meditative',
  SELF_AWARE = 'Self-Aware',
  PATIENT = 'Patient',
  INSIGHTFUL = 'Insightful',
  REFLECTIVE = 'Reflective',
  MATURE = 'Mature',

  // Grammar correctors
  MENTOR = 'A Mentor',
  COACH = 'A Coach',
  GUIDE = 'A Guide',
  POLYMATH = 'A Polymath',
  FREETHINKER_ROLE = 'A Freethinker',
  INDEPENDENT_THINKER = 'An Independent Thinker',
  GOOD_LISTENER = 'A Good Listener',
  RISK_TAKER = 'A Risk Taker',
  LEADER = 'A Leader',
  PERFECTIONIST = 'A Perfectionist',
  HIGH_ACHIEVER = 'A High-Achiever',
  GO_GETTER = 'A Go-Getter',

  // Additional sub-qualities from each category...
  // Add more as needed
}

export interface QualityWithMetadata {
  value: DefaultQuality | SubQuality;
  category?: QualityCategory;
  isDefault: boolean;
  isGrammarCorrected?: boolean;
  usedSearch?: boolean;
}

// Type to use in the database
export type Quality = {
  qualities: QualityWithMetadata[];
};

// // Example usage:
// const exampleQuality: QualityWithMetadata = {
//   value: DefaultQuality.KIND,
//   category: QualityCategory.EMOTIONAL,
//   isDefault: true,
// };

// const exampleGrammarCorrectedQuality: QualityWithMetadata = {
//   value: SubQuality.MENTOR,
//   category: QualityCategory.WISDOM,
//   isDefault: false,
//   isGrammarCorrected: true,
// };

export enum LikeActionType {
  LIKE = 'LIKE',
  UNLIKE = 'UNLIKE',
  ENDORSE = 'ENDORSE',
  UNENDORSE = 'UNENDORSE',
}
