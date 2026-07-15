import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';

export default function AwardView({ onComplete }: { onComplete: () => void }) {
  const { state } = useGameState();
  const [showResult, setShowResult] = useState(false);

  // Criteria
  const targetSales = 1000000;
  const targetKnowledge = 150;
  const targetCards = 15;

  const passedSales = state.money >= targetSales;
  const passedKnowledge = state.knowledge >= targetKnowledge;
  const passedCards = state.collectedCards.length >= targetCards;

  const isAwardWinner = passedSales && passedKnowledge && passedCards;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResult(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-12 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black" />

      <motion.h1 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-6xl font-bold text-white mb-12 z-10"
      >
        新人賞 最終選考
      </motion.h1>

      <div className="grid grid-cols-3 gap-8 w-4/5 max-w-[1200px] mb-12 z-10">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`glass-panel p-8 rounded-xl text-center border-2 ${passedSales ? 'border-green-500' : 'border-red-500'}`}
        >
          <div className="text-gray-400 text-2xl mb-4">売上実績</div>
          <div className="text-4xl font-bold text-white mb-2">¥{state.money.toLocaleString()}</div>
          <div className="text-xl text-gray-500">目標: ¥{targetSales.toLocaleString()}</div>
          <div className={`mt-4 text-2xl font-bold ${passedSales ? 'text-green-400' : 'text-red-400'}`}>
            {passedSales ? 'CLEAR!' : 'FAILED'}
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`glass-panel p-8 rounded-xl text-center border-2 ${passedKnowledge ? 'border-blue-500' : 'border-red-500'}`}
        >
          <div className="text-gray-400 text-2xl mb-4">施設知識</div>
          <div className="text-4xl font-bold text-white mb-2">{state.knowledge} pt</div>
          <div className="text-xl text-gray-500">目標: {targetKnowledge} pt</div>
          <div className={`mt-4 text-2xl font-bold ${passedKnowledge ? 'text-blue-400' : 'text-red-400'}`}>
            {passedKnowledge ? 'CLEAR!' : 'FAILED'}
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className={`glass-panel p-8 rounded-xl text-center border-2 ${passedCards ? 'border-tkp-gold' : 'border-red-500'}`}
        >
          <div className="text-gray-400 text-2xl mb-4">獲得カード</div>
          <div className="text-4xl font-bold text-white mb-2">{state.collectedCards.length} 枚</div>
          <div className="text-xl text-gray-500">目標: {targetCards} 枚</div>
          <div className={`mt-4 text-2xl font-bold ${passedCards ? 'text-tkp-gold' : 'text-red-400'}`}>
            {passedCards ? 'CLEAR!' : 'FAILED'}
          </div>
        </motion.div>
      </div>

      {showResult && (
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="z-20 flex flex-col items-center"
        >
          {isAwardWinner ? (
            <div className="text-center">
              <h2 className="text-8xl font-bold text-tkp-gold mb-6 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
                🎊 新人賞 獲得！ 🎊
              </h2>
              <p className="text-3xl text-white">素晴らしい成果です！次世代のエースとして期待されています！</p>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-7xl font-bold text-gray-400 mb-6">
                新人賞 逃す...
              </h2>
              <p className="text-3xl text-white">惜しかったです。この経験をバネに、さらなる成長を期待しています！</p>
            </div>
          )}

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onComplete}
            className="mt-12 px-12 py-4 bg-tkp-blue text-white text-3xl font-bold rounded-full hover:bg-tkp-blue-dark transition-colors shadow-lg shadow-tkp-blue/50"
          >
            最終テストへ
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
