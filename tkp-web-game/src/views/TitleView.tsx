import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cardsData from '../data/cards.json';
import ImageZoomModal from '../components/ImageZoomModal';

interface TitleViewProps {
  onNewGame: (gender?: 'man' | 'woman') => void;
  onContinue: () => void;
  hasSave: boolean;
  collectedCards: string[];
}

const CHARS = [
  { img: '/assets/chars/player/normal-man.png', delay: 0.2, left: '0%' },
  { img: '/assets/chars/client/normal-woman.png', delay: 0.4, left: '25%' },
  { img: '/assets/chars/senpai/normal-woman.png', delay: 0.3, left: '52%' },
  { img: '/assets/chars/boss/normal-man.png', delay: 0.5, left: '75%' },
];

export default function TitleView({ onNewGame, onContinue, hasSave, collectedCards }: TitleViewProps) {
  const [showCards, setShowCards] = useState(false);
  const [showGenderSelect, setShowGenderSelect] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}assets/bgimage/title_bg.png')` }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
      
      {/* Characters */}
      <div className="absolute inset-0 pointer-events-none">
        {CHARS.map((char, idx) => (
          <motion.img 
            key={idx}
            src={char.img} 
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ delay: char.delay, duration: 0.8, type: 'spring' }}
            className="absolute bottom-0 h-[45%] md:h-[75%] object-contain drop-shadow-2xl"
            style={{ left: char.left }}
          />
        ))}
      </div>
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="relative z-10 flex flex-col items-center max-md:mt-[-50px]"
        style={{ marginTop: '-100px' }}
      >
        <h1 className="text-6xl md:text-[90px] font-bold text-white drop-shadow-2xl mb-4 tracking-widest text-shadow-glow leading-none text-center">
          TKP会場マスター
        </h1>
        <div className="text-5xl md:text-[72px] font-bold text-tkp-red drop-shadow-2xl tracking-widest text-shadow-glow mb-2">
          2026
        </div>
      </motion.div>
      
      {/* Menu Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="relative z-20 flex flex-col items-center gap-4 md:gap-6 w-full"
      >
        {/* New Game */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenderSelect(true)}
          className="w-[85%] max-w-[400px] py-4 md:py-5 bg-tkp-red text-white text-2xl md:text-4xl font-bold rounded-2xl shadow-2xl hover:bg-tkp-red-dark transition-all border-2 border-white/20"
        >
          はじめから
        </motion.button>

        {/* Continue */}
        <motion.button
          whileHover={hasSave ? { scale: 1.05 } : {}}
          whileTap={hasSave ? { scale: 0.95 } : {}}
          onClick={() => hasSave && onContinue()}
          className={`w-[85%] max-w-[400px] py-4 md:py-5 text-2xl md:text-4xl font-bold rounded-2xl shadow-2xl transition-all border-2 ${
            hasSave 
              ? 'bg-tkp-blue text-white hover:bg-blue-800 border-white/20 cursor-pointer' 
              : 'bg-gray-700/50 text-gray-500 border-gray-600/30 cursor-not-allowed'
          }`}
        >
          つづきから
        </motion.button>

        {/* Card Collection */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCards(true)}
          className="w-[85%] max-w-[400px] py-4 md:py-5 bg-white/10 backdrop-blur text-white text-2xl md:text-4xl font-bold rounded-2xl shadow-2xl hover:bg-white/20 transition-all border-2 border-tkp-gold/50"
        >
          カードコレクション
        </motion.button>
      </motion.div>

      {/* Gender Selection Modal */}
      <AnimatePresence>
        {showGenderSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center"
            onClick={() => setShowGenderSelect(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[95%] max-w-[800px] glass-panel-dark rounded-3xl p-6 md:p-12 flex flex-col items-center"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 md:mb-12 tracking-widest border-b-2 border-white/20 pb-4 text-center">
                主人公の性別を選択
              </h2>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-8 md:mb-12 w-full justify-center">
                <button 
                  onClick={() => onNewGame('man')}
                  className="flex flex-col items-center gap-4 md:gap-6 p-4 md:p-8 rounded-2xl border-4 border-transparent hover:border-tkp-blue hover:bg-tkp-blue/20 transition-all group w-full md:w-auto"
                >
                  <img src="/assets/chars/player/normal-man.png" className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-xl group-hover:scale-110 transition-transform" />
                  <span className="text-2xl md:text-3xl font-bold text-white">男性</span>
                </button>
                <button 
                  onClick={() => onNewGame('woman')}
                  className="flex flex-col items-center gap-4 md:gap-6 p-4 md:p-8 rounded-2xl border-4 border-transparent hover:border-pink-500 hover:bg-pink-500/20 transition-all group w-full md:w-auto"
                >
                  <img src="/assets/chars/player/normal-woman.png" className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-xl group-hover:scale-110 transition-transform" />
                  <span className="text-2xl md:text-3xl font-bold text-white">女性</span>
                </button>
              </div>

              <button
                onClick={() => setShowGenderSelect(false)}
                className="px-12 py-4 bg-gray-600 text-white text-2xl font-bold rounded-full hover:bg-gray-700 transition-all"
              >
                キャンセル
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Collection Modal */}
      <AnimatePresence>
        {showCards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center"
            onClick={() => setShowCards(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[95%] max-w-[1400px] h-[85%] max-h-[800px] glass-panel-dark rounded-3xl p-6 md:p-12 flex flex-col"
            >
              <h2 className="text-2xl md:text-5xl font-bold text-tkp-gold mb-6 md:mb-8 text-center tracking-widest shrink-0">
                カードコレクション ({collectedCards.length} / {cardsData.length})
              </h2>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 overflow-y-auto pr-2 min-h-0">
                {cardsData.map((card) => {
                  const owned = collectedCards.includes(card.id);
                  return (
                    <div 
                      key={card.id}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        owned 
                          ? 'border-tkp-gold/60 shadow-lg shadow-tkp-gold/20 cursor-pointer hover:-translate-y-2 hover:shadow-2xl' 
                          : 'border-gray-700 opacity-40 grayscale'
                      }`}
                      onClick={() => owned && setZoomedImage(card.image)}
                    >
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        className="w-full h-full object-cover"
                      />
                      {/* Rarity Badge */}
                      <div className={`absolute top-2 right-2 px-3 py-1 rounded-lg text-xl font-bold ${
                        card.rarity === 'SSR' ? 'bg-tkp-gold text-black' :
                        card.rarity === 'SR' ? 'bg-purple-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {card.rarity}
                      </div>
                      {/* Card Name */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                        <p className="text-xl text-white font-bold text-center truncate">{card.name}</p>
                      </div>
                      {/* Lock */}
                      {!owned && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl">🔒</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowCards(false)}
                className="mt-8 mx-auto px-12 py-4 bg-tkp-red text-white text-3xl font-bold rounded-full hover:bg-tkp-red-dark transition-all"
              >
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageZoomModal 
        imageUrl={zoomedImage} 
        onClose={() => setZoomedImage(null)} 
      />
    </div>
  );
}
