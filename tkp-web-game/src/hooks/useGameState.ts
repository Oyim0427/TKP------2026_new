import { useState, useEffect } from 'react';
import type { PlayerState } from '../types';

const INITIAL_STATE: PlayerState = {
  money: 0,
  stamina: 100,
  knowledge: 0,
  satisfaction: 0,
  reputation: 0,
  currentWeek: 1,
  playerGender: 'man', // default, will be overridden on new game
  activeCases: 0,
  scheduledCases: [],
  collectedCards: [], // Acquired in Intro
  schedule: {},
  gameStage: 'title',
};

const STORAGE_KEY = 'tkp_master_save';

// Global state instance
let globalState = INITIAL_STATE;
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    globalState = { ...JSON.parse(saved), gameStage: 'title' as const };
  }
} catch (e) {}

// Listeners for global state changes
const listeners = new Set<(state: PlayerState) => void>();

// Helper to update global state and notify all listeners
const setGlobalState = (newState: PlayerState) => {
  globalState = newState;
  listeners.forEach(listener => listener(globalState));
  if (globalState.gameStage !== 'title') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  }
};

export function useGameState() {
  const [state, setState] = useState<PlayerState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const hasSave = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.gameStage !== 'title' && parsed.gameStage !== 'intro';
      }
      return false;
    } catch {
      return false;
    }
  })();

  const updateState = (updates: Partial<PlayerState>) => {
    setGlobalState({ ...globalState, ...updates });
  };

  const addCard = (cardId: string) => {
    if (!globalState.collectedCards.includes(cardId)) {
      updateState({ collectedCards: [...globalState.collectedCards, cardId] });
    }
  };

  const continueGame = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setGlobalState(JSON.parse(saved));
      }
    } catch {
      setGlobalState({ ...INITIAL_STATE, gameStage: 'intro' });
    }
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGlobalState(INITIAL_STATE);
  };

  const newGame = (gender: 'man' | 'woman' = 'man') => {
    localStorage.removeItem(STORAGE_KEY);
    setGlobalState({ ...INITIAL_STATE, playerGender: gender, gameStage: 'intro' });
  };

  return { state, updateState, addCard, resetGame, newGame, continueGame, hasSave };
}
