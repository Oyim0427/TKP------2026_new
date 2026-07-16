import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import eventsData from '../data/events.json';
import cardsData from '../data/cards.json';
import { motion } from 'framer-motion';

export default function EventModal({ onEventComplete }: { onEventComplete: (weekComplete: boolean) => void }) {
  const { state, updateState } = useGameState();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGivenUp, setIsGivenUp] = useState(false);
  const [eventIndex] = useState(() => Math.floor(Math.random() * eventsData.weeklyEvents.length));

  // Pick a random event
  const event = eventsData.weeklyEvents[eventIndex];

  const hasAnyOwnedCard = event.options.some(option => state.collectedCards.includes(option.cardId));

  const handleSelect = (index: number) => {
    setSelectedOption(index);
    setShowResult(true);
  };

  const handleGiveUp = () => {
    setIsGivenUp(true);
    setShowResult(true);
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      const option = event.options[selectedOption];
      updateState({
        money: state.money + (option.reward.money || 0),
        stamina: Math.max(0, state.stamina + (option.reward.stamina || 0)),
        knowledge: state.knowledge + (option.reward.knowledge || 0),
        satisfaction: state.satisfaction + (option.reward.satisfaction || 0),
        reputation: state.reputation + (option.reward.reputation || 0)
      });
      onEventComplete(true);
    }
  };

  return (
    <div className="absolute inset-0 pt-16 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-3/4 h-[80%] rounded-3xl p-12 flex flex-col border-4 border-tkp-blue/50"
      >
        <h2 className="text-6xl font-bold text-white mb-6 drop-shadow-md border-b-2 border-white/20 pb-4">
          週末イベント: {event.title}
        </h2>
        
        <p className="text-3xl text-gray-200 mb-12 leading-relaxed h-32">
          {event.description}
        </p>

        {!showResult ? (
          <div className="flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-12 mb-8">
              {event.options.map((option, idx) => {
                const card = cardsData.find(c => c.id === option.cardId);
                if (!card) return null;
                
                const isOwned = state.collectedCards.includes(card.id);

                return (
                  <button
                    key={idx}
                    onClick={() => isOwned && handleSelect(idx)}
                    disabled={!isOwned}
                    className={`relative flex flex-col items-center glass-panel-dark rounded-2xl p-6 transition-all border-2 ${
                      isOwned ? 'border-transparent hover:border-tkp-gold hover:-translate-y-2' : 'border-gray-700 opacity-50 cursor-not-allowed'
                    } focus:outline-none overflow-hidden`}
                  >
                    <img src={card.image} alt={card.name} className={`h-64 object-contain mb-6 drop-shadow-2xl rounded-xl ${!isOwned && 'grayscale'}`} />
                    <div className="text-3xl font-bold text-white mb-2">{card.name}</div>
                    <div className={`px-4 py-1 rounded-full font-bold text-xl ${card.rarity === 'SSR' ? 'bg-yellow-500 text-yellow-900' : card.rarity === 'SR' ? 'bg-blue-400 text-blue-900' : 'bg-gray-300 text-gray-800'}`}>
                      {card.rarity}
                    </div>
                    
                    {!isOwned && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                        <span className="text-4xl font-bold text-red-500 border-4 border-red-500 px-6 py-2 rounded-xl transform -rotate-12 bg-black/40">
                          未所持
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {!hasAnyOwnedCard && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleGiveUp}
                  className="px-16 py-5 bg-tkp-red text-white text-3xl font-bold rounded-full hover:bg-tkp-red-dark transition-colors shadow-lg hover:scale-105"
                >
                  提案を辞退する
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {isGivenUp ? (
              <>
                <div className="text-5xl font-bold mb-8 text-tkp-red">
                  辞退
                </div>
                <p className="text-4xl text-white text-center mb-16 leading-relaxed">
                  提案できる会場カードがないため、今回の案件を見送りました。
                </p>
                <button
                  onClick={() => onEventComplete(true)}
                  className="px-16 py-6 bg-tkp-blue text-white text-3xl font-bold rounded-full hover:bg-tkp-blue/80 transition-colors shadow-lg hover:scale-105"
                >
                  次週へ
                </button>
              </>
            ) : (
              <>
                <div className={`text-5xl font-bold mb-8 ${event.options[selectedOption!].success ? 'text-green-400' : 'text-tkp-red'}`}>
                  {event.options[selectedOption!].success ? '成功！' : '失敗...'}
                </div>
                <p className="text-4xl text-white text-center mb-16 leading-relaxed">
                  {event.options[selectedOption!].feedback}
                </p>
                <div className="flex gap-8 mb-16">
                  <div className="glass-panel p-6 rounded-xl text-3xl font-bold flex gap-4 items-center">
                    <span className="text-gray-300">売上変動:</span> 
                    <span className={event.options[selectedOption!].reward.money >= 0 ? "text-green-400" : "text-tkp-red"}>
                      {event.options[selectedOption!].reward.money >= 0 ? '+' : ''}¥{event.options[selectedOption!].reward.money.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="px-16 py-6 bg-tkp-blue text-white text-3xl font-bold rounded-full hover:bg-tkp-blue/80 transition-colors shadow-lg hover:scale-105"
                >
                  次週へ
                </button>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
