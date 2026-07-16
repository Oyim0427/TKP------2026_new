export interface CardStats {
  knowledge?: number;
  satisfaction?: number;
  sales?: number;
  proposal?: number;
}

export interface Card {
  id: string;
  name: string;
  rarity: 'R' | 'SR' | 'SSR';
  type: string;
  capacity: number;
  location: string;
  image: string;
  stats: CardStats;
  keywords: string[];
}

export interface PlayerState {
  money: number;
  stamina: number;
  knowledge: number;
  satisfaction: number;
  reputation: number;
  currentWeek: number;
  playerGender: 'man' | 'woman';
  activeCases: number;
  scheduledCases: number[];
  collectedCards: string[]; // Array of card IDs
  schedule: Record<number, string>; // dayIndex (0-4) -> charId
  gameStage: 'title' | 'intro' | 'schedule' | 'execution' | 'event' | 'quiz' | 'summary' | 'award' | 'end' | 'special_event';
}

export interface Option {
  cardId: string;
  success: boolean;
  feedback: string;
  reward: { 
    money: number; 
    stamina?: number; 
    knowledge?: number; 
    satisfaction?: number; 
    reputation?: number; 
  };
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  options: Option[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}
