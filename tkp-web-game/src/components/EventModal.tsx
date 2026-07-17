import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import eventsData from '../data/events.json';
import cardsData from '../data/cards.json';
import { motion } from 'framer-motion';
import type { Card } from '../types';

export default function EventModal({ onEventComplete }: { onEventComplete: (weekComplete: boolean) => void }) {
  const { state, updateState } = useGameState();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGivenUp, setIsGivenUp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [eventIndex] = useState(() => Math.floor(Math.random() * eventsData.weeklyEvents.length));

  const event = eventsData.weeklyEvents[eventIndex];

  // Get details of cards owned by the player
  const ownedCards = (cardsData as Card[]).filter(c => state.collectedCards.includes(c.id));

  // Determine if player has any card that can be proposed
  const hasAnyCard = ownedCards.length > 0;

  const handlePropose = () => {
    if (!selectedCardId) return;
    const card = ownedCards.find(c => c.id === selectedCardId);
    if (!card) return;

    const reqs = event.requirements;
    // Location check (matches location name or is in keywords)
    const locMatch = card.location.toLowerCase() === reqs.location.toLowerCase() ||
                     card.keywords.includes(reqs.location);
    // Capacity check (has enough capacity)
    const capMatch = card.capacity >= reqs.minCapacity;
    // Keywords check (all required keywords are in card keywords)
    const kwMatch = reqs.keywords.every((kw: string) => card.keywords.includes(kw));

    const success = locMatch && capMatch && kwMatch;
    setIsSuccess(success);
    setShowResult(true);
  };

  const handleGiveUp = () => {
    setIsGivenUp(true);
    setShowResult(true);
  };

  const handleNext = () => {
    const reward = (isSuccess ? event.successReward : event.failureReward) as any;
    updateState({
      money: state.money + (reward.money || 0),
      stamina: Math.max(0, state.stamina + (reward.stamina || 0)),
      knowledge: state.knowledge + (reward.knowledge || 0),
      satisfaction: state.satisfaction + (reward.satisfaction || 0),
      reputation: state.reputation + (reward.reputation || 0)
    });
    onEventComplete(true);
  };

  return (
    <div className="absolute inset-0 pt-16 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-[95%] max-w-[1100px] h-[90%] max-h-[900px] rounded-3xl p-6 md:p-12 flex flex-col border-4 border-tkp-blue/50 justify-between text-shadow"
      >
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md border-b border-white/20 pb-4">
            週末イベント: {event.title}
          </h2>
          
          <p className="text-lg md:text-2xl text-gray-200 mb-4 md:mb-8 leading-relaxed max-h-[150px] overflow-y-auto pr-2">
            {event.description}
          </p>
        </div>

        {!showResult ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0">
            <h3 className="text-md md:text-xl font-bold text-gray-400 mb-3">提案する会場カードを所持カードから選択してください：</h3>
            
            {hasAnyCard ? (
              <div className="flex-1 overflow-y-auto pr-2 mb-4 md:mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {ownedCards.map((card) => {
                  const isSelected = selectedCardId === card.id;
                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`relative flex flex-col items-center glass-panel-dark rounded-xl p-4 transition-all border-2 cursor-pointer ${
                        isSelected 
                          ? 'border-tkp-gold shadow-lg shadow-tkp-gold/30 scale-95' 
                          : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
                      }`}
                    >
                      <img src={card.image} alt={card.name} className="h-32 object-contain mb-3 drop-shadow-md rounded-lg" />
                      <div className="text-lg font-bold text-white text-center leading-tight mb-2 min-h-10 flex items-center justify-center">
                        {card.name}
                      </div>
                      <div className="flex justify-between w-full text-sm text-gray-400 font-bold border-t border-white/5 pt-2">
                        <span>収容: {card.capacity}名</span>
                        <span>{card.location}</span>
                      </div>
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-black border ${
                        card.rarity === 'SSR' 
                          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' 
                          : card.rarity === 'SR' 
                          ? 'bg-blue-500/20 border-blue-400 text-blue-400' 
                          : 'bg-gray-500/20 border-gray-400 text-gray-400'
                      }`}>
                        {card.rarity}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center mb-6">
                <p className="text-2xl text-red-400 font-bold">提案可能な会場カードを所持していません！</p>
              </div>
            )}

            <div className="flex justify-center gap-4 md:gap-8 pt-4 border-t border-white/10 shrink-0">
              <button
                onClick={handleGiveUp}
                className="px-6 md:px-12 py-3 md:py-4 bg-tkp-red text-white text-lg md:text-2xl font-bold rounded-full hover:bg-tkp-red-dark transition-colors shadow-lg hover:scale-105"
              >
                提案を辞退する
              </button>
              
              <button
                disabled={!selectedCardId}
                onClick={handlePropose}
                className={`px-8 md:px-16 py-3 md:py-4 text-lg md:text-2xl font-bold rounded-full transition-all shadow-lg ${
                  selectedCardId 
                    ? 'bg-tkp-blue text-white hover:bg-tkp-blue/80 hover:scale-105 active:scale-95' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                この会場を提案する
              </button>
            </div>
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
                  案件辞退
                </div>
                <p className="text-3xl text-white text-center mb-12 leading-relaxed">
                  顧客要件を満たす提案が困難なため、今回の案件を見送りました。
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
                <div className={`text-5xl font-bold mb-8 ${isSuccess ? 'text-green-400' : 'text-tkp-red'}`}>
                  {isSuccess ? '大成功！' : '不採択...'}
                </div>
                <p className="text-3xl text-white text-center mb-12 leading-relaxed max-w-[800px]">
                  {isSuccess ? event.successFeedback : event.failureFeedback}
                </p>
                
                {/* Rewards Grid */}
                <div className="grid grid-cols-3 gap-6 mb-12 w-[600px]">
                  {(() => {
                    const r = (isSuccess ? event.successReward : event.failureReward) as any;
                    return (
                      <>
                        {r.money !== undefined && (
                          <div className="glass-panel p-4 rounded-xl text-center">
                            <span className="text-gray-400 text-lg block mb-1">売上</span>
                            <span className={`text-2xl font-bold ${r.money >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {r.money >= 0 ? '+' : ''}¥{r.money.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {r.stamina !== undefined && (
                          <div className="glass-panel p-4 rounded-xl text-center">
                            <span className="text-gray-400 text-lg block mb-1">体力</span>
                            <span className={`text-2xl font-bold ${r.stamina >= 0 ? "text-teal-400" : "text-red-400"}`}>
                              {r.stamina >= 0 ? '+' : ''}{r.stamina}
                            </span>
                          </div>
                        )}
                        {r.knowledge !== undefined && (
                          <div className="glass-panel p-4 rounded-xl text-center">
                            <span className="text-gray-400 text-lg block mb-1">知識</span>
                            <span className="text-blue-400 text-2xl font-bold">
                              +{r.knowledge}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
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
