import { X } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import cardsData from '../data/cards.json';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ImageZoomModal from './ImageZoomModal';

export default function MenuView({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { state } = useGameState();
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="w-[1000px] max-h-[90vh] glass-panel-dark border border-white/20 flex flex-col shadow-2xl rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-tkp-blue/30">
              <h2 className="text-4xl font-bold text-white tracking-widest">ステータス</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
                <X size={40} />
              </button>
        </div>

        <div className="p-12 overflow-y-auto flex-1">
          {/* Stats Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-300 mb-8 border-l-4 border-tkp-red pl-4">プレイヤー情報</h3>
            <div className="flex flex-col gap-6 text-3xl">
              <div className="flex justify-between items-center glass-panel p-6 rounded-xl">
                <span className="text-gray-400">現在</span>
                <span className="font-bold text-white">第 {state.currentWeek} 週目</span>
              </div>
              <div className="flex justify-between items-center glass-panel p-6 rounded-xl">
                <span className="text-gray-400">体力</span>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-6 bg-gray-700 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className={`h-full ${state.stamina > 50 ? 'bg-green-500' : state.stamina > 20 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-500`}
                      style={{ width: `${state.stamina}%` }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{state.stamina}</span>
                </div>
              </div>
              <div className="flex justify-between items-center glass-panel p-6 rounded-xl">
                <span className="text-gray-400">売上</span>
                <span className="font-bold text-tkp-gold">¥{state.money.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div>
            <h3 className="text-3xl font-bold text-gray-300 mb-8 border-l-4 border-tkp-red pl-4 flex justify-between items-end">
              <span>収集済みカード</span>
              <span className="text-xl text-gray-500 font-normal">{state.collectedCards.length} / {cardsData.length}</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-8">
              {cardsData.map((card) => {
                const isCollected = state.collectedCards.includes(card.id);
                return (
                  <div 
                    key={card.id} 
                    className={`relative rounded-xl overflow-hidden ${!isCollected ? 'opacity-30 grayscale' : 'hover:-translate-y-2 hover:shadow-xl hover:shadow-tkp-blue/50 cursor-pointer'} transition-all duration-300 border-2 border-white/10`}
                    onClick={() => isCollected && setZoomedImage(card.image)}
                  >
                    <img src={card.image} alt={card.name} className="w-full h-auto" />
                    {!isCollected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white drop-shadow-md bg-black/50 px-4 py-2 rounded-lg">未取得</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </motion.div>
      </motion.div>
      )}

      <ImageZoomModal 
        imageUrl={zoomedImage} 
        onClose={() => setZoomedImage(null)} 
      />
    </AnimatePresence>
  );
}
