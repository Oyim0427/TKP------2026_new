import { motion } from 'framer-motion';
import { useState } from 'react';
import cardsData from '../data/cards.json';
import ImageZoomModal from './ImageZoomModal';

interface CardAcquireModalProps {
  cardIds: string[];
  onAcquire: () => void;
}

export default function CardAcquireModal({ cardIds, onAcquire }: CardAcquireModalProps) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const cards = cardsData.filter(c => cardIds.includes(c.id));

  if (cards.length === 0) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -50 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="glass-panel-dark p-6 md:p-12 rounded-3xl flex flex-col items-center border-4 border-tkp-gold/50 shadow-[0_0_50px_rgba(255,215,0,0.3)] w-[95%] max-w-[1200px] h-[90%] max-h-[900px]"
      >
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-tkp-gold mb-8 drop-shadow-lg"
        >
          {cards.length > 1 ? '初期カードを獲得！' : '新しいカードを発見！'}
        </motion.h2>

        <div className="flex-1 overflow-y-auto min-h-0 w-full mb-6 md:mb-12 pr-2 flex justify-center">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-full">
            {cards.map((card, idx) => (
              <motion.div 
                key={card.id}
                className="relative shrink-0 w-[calc(50%-0.5rem)] md:w-[256px] aspect-[2.5/4] rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-pointer hover:border-tkp-gold transition-colors group"
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ delay: 0.3 + idx * 0.1, type: "spring", stiffness: 100 }}
                onClick={() => setZoomedImage(card.image)}
              >
                <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/60 px-2 md:px-4 py-1 rounded-full text-white font-bold text-sm md:text-lg border border-white/30 backdrop-blur-md z-10">
                  {card.rarity}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-10">
                  <h3 className="text-md md:text-xl font-bold text-white mb-1 md:mb-2 leading-tight">{card.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: cards.length > 1 ? 1.5 : 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAcquire}
          className="px-12 md:px-16 py-4 md:py-5 bg-tkp-gold text-black text-2xl md:text-3xl font-bold rounded-full hover:bg-yellow-400 transition-all shadow-lg shrink-0"
        >
          獲得する
        </motion.button>
      </motion.div>

      <ImageZoomModal 
        imageUrl={zoomedImage} 
        onClose={() => setZoomedImage(null)} 
      />
    </div>
  );
}
