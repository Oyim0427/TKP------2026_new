import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import eventsData from '../data/events.json';
import cardsData from '../data/cards.json';
import { motion } from 'framer-motion';
import type { Card } from '../types';
import { getAssetUrl } from '../utils/assets';

export default function EventModal({ onEventComplete }: { onEventComplete: (weekComplete: boolean) => void }) {
  const { state, updateState } = useGameState();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGivenUp, setIsGivenUp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [eventIndex] = useState(() => Math.floor(Math.random() * eventsData.weeklyEvents.length));

  const event = eventsData.weeklyEvents[eventIndex] as any;
  const reqs = event.requirements;

  // Get details of cards owned by the player
  const ownedCards = (cardsData as Card[]).filter(c => state.collectedCards.includes(c.id));

  // Determine if player has any card that can be proposed
  const hasAnyCard = ownedCards.length > 0;

  const handlePropose = () => {
    if (!selectedCardId) {
      setIsSuccess(false);
      setShowResult(true);
      return;
    }
    const card = ownedCards.find(c => c.id === selectedCardId);
    if (!card) return;

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

  const handleProposeClick = () => {
    if (!selectedCardId) {
      setShowWarning(true);
    } else {
      handlePropose();
    }
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
        className="relative glass-panel w-[95%] max-w-[1100px] h-[90%] max-h-[900px] rounded-3xl p-6 md:p-10 flex flex-col border-4 border-tkp-blue/50 justify-between text-shadow"
      >
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 drop-shadow-md border-b border-white/20 pb-3 flex items-center justify-between">
            <span>週末イベント: {event.title}</span>
            <span className="text-sm font-normal px-3 py-1 bg-tkp-blue/40 border border-tkp-blue rounded-full text-blue-200">案件提案依頼</span>
          </h2>
          
          <p className="text-base md:text-xl text-gray-200 mb-6 leading-relaxed max-h-[140px] overflow-y-auto pr-2">
            {event.description}
          </p>
        </div>

        {!showResult ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0">
            <h3 className="text-sm md:text-base font-bold text-gray-300 mb-2">提案する会場カードを所持カードから選択してください：</h3>
            
            {hasAnyCard ? (
              <div className="flex-1 overflow-y-auto pr-2 mb-3 md:mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {ownedCards.map((card) => {
                  const isSelected = selectedCardId === card.id;

                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`relative flex flex-col justify-between items-center glass-panel-dark rounded-xl p-3 transition-all border-2 cursor-pointer overflow-hidden ${
                        isSelected 
                          ? 'border-tkp-gold shadow-lg shadow-tkp-gold/40 scale-95 ring-2 ring-tkp-gold' 
                          : 'border-white/15 hover:border-white/40 hover:scale-[1.02]'
                      }`}
                    >
                      <div className="w-full flex-1 flex items-center justify-center my-1 overflow-hidden min-h-[160px]">
                        <img src={getAssetUrl(card.image)} alt={card.name} className="w-full h-full max-h-[220px] object-contain drop-shadow-md transition-transform hover:scale-105" />
                      </div>
                      <div className="text-sm md:text-base font-bold text-white text-center leading-tight pt-2 mt-auto border-t border-white/10 w-full flex items-center justify-center min-h-10">
                        {card.name}
                      </div>

                      <div className={`absolute top-2 left-2 px-2.5 py-0.5 rounded text-xs font-black border shadow-md backdrop-blur-md z-10 ${
                        card.rarity === 'SSR' 
                          ? 'bg-yellow-500/80 border-yellow-300 text-white' 
                          : card.rarity === 'SR' 
                          ? 'bg-blue-600/80 border-blue-300 text-white' 
                          : 'bg-gray-700/80 border-gray-400 text-white'
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
                onClick={handleProposeClick}
                className="px-8 md:px-16 py-3 md:py-4 text-lg md:text-2xl font-bold rounded-full transition-all shadow-lg bg-tkp-blue text-white hover:bg-tkp-blue/80 hover:scale-105 active:scale-95"
              >
                {selectedCardId ? 'この会場を提案する' : 'カードを選ばずに提案する'}
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

        {/* No-selection Warning Overlay */}
        {showWarning && (
          <div className="absolute inset-0 bg-black/95 rounded-3xl flex flex-col items-center justify-center p-8 z-[60] backdrop-blur-md">
            <div className="text-4xl font-bold text-yellow-400 mb-6 text-center">
              ⚠️ 注意
            </div>
            <p className="text-2xl md:text-3xl text-white text-center mb-12 max-w-[700px] leading-relaxed">
              会場カードが選択されていません。<br />
              カードを選ばないと提案は失敗してしまいますが、よろしいですか？
            </p>
            <div className="flex gap-8 justify-center">
              <button
                onClick={() => setShowWarning(false)}
                className="px-10 py-4 md:px-12 md:py-5 bg-gray-600 hover:bg-gray-700 text-white text-xl md:text-2xl font-bold rounded-full transition-all shadow-lg hover:scale-105"
              >
                戻る
              </button>
              <button
                onClick={() => {
                  setShowWarning(false);
                  handlePropose();
                }}
                className="px-10 py-4 md:px-12 md:py-5 bg-tkp-red hover:bg-tkp-red-dark text-white text-xl md:text-2xl font-bold rounded-full transition-all shadow-lg hover:scale-105"
              >
                提案を続ける
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
