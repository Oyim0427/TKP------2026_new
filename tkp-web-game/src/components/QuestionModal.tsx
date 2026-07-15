import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import questionsData from '../data/questions.json';
import { motion } from 'framer-motion';

export default function QuestionModal({ charId, onComplete }: { charId: string, onComplete: () => void }) {
  const { state, updateState } = useGameState();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Parse questions for this specific charId
  const questions = (questionsData as Record<string, any>)[charId];
  const [questionIndex] = useState(() => {
    if (!questions || questions.length === 0) return 0;
    return Math.floor(Math.random() * questions.length);
  });

  if (!questions || questions.length === 0) {
    onComplete();
    return null;
  }

  const question = questions[questionIndex];

  const handleSelect = (index: number) => {
    setSelectedOption(index);
    setShowResult(true);
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      const isCorrect = selectedOption === question.correctIndex;
      const reward = isCorrect ? question.successReward : question.failureReward;
      
      updateState({
        money: state.money + (reward.money || 0),
        stamina: Math.max(0, state.stamina + (reward.stamina || 0)),
        knowledge: state.knowledge + (reward.knowledge || 0),
        satisfaction: state.satisfaction + (reward.satisfaction || 0),
        reputation: state.reputation + (reward.reputation || 0)
      });
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 pt-16 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-3/4 max-w-4xl rounded-3xl p-12 flex flex-col border-4 border-tkp-blue/50"
      >
        <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-md border-b-2 border-white/20 pb-4">
          日常イベント
        </h2>
        
        <p className="text-3xl text-gray-200 mb-12 leading-relaxed font-bold">
          {question.text}
        </p>

        {!showResult ? (
          <div className="flex flex-col gap-6">
            {question.options.map((optText: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="w-full text-left px-8 py-6 rounded-2xl bg-white/10 hover:bg-tkp-blue/60 border-2 border-transparent hover:border-tkp-blue text-2xl text-white font-bold transition-all"
              >
                {optText}
              </button>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            {selectedOption === question.correctIndex ? (
              <div className="text-6xl text-green-400 font-bold mb-8">
                ✨ 大正解！ ✨
              </div>
            ) : (
              <div className="text-6xl text-red-500 font-bold mb-8">
                ❌ 不正解... ❌
              </div>
            )}
            
            <div className="text-2xl text-gray-300 mb-12 bg-black/40 px-8 py-6 rounded-2xl">
              正解は：<span className="text-tkp-gold font-bold">{question.options[question.correctIndex]}</span>
            </div>

            <button
              onClick={handleNext}
              className="px-16 py-6 bg-tkp-blue text-white text-3xl font-bold rounded-full hover:bg-tkp-blue-dark transition-all shadow-[0_0_30px_rgba(30,58,138,0.5)]"
            >
              次へ
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
