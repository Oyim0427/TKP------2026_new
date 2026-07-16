import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';
import CardAcquireModal from '../components/CardAcquireModal';

interface IntroScene {
  bg: string;
  leftChar: string | null;
  rightChar: string | null;
  speaker: string | null;
  text: string;
  cg?: string | null;
  acquireCards?: string[];
}

const INTRO_SCENES: IntroScene[] = [
  { 
    bg: '/assets/bgimage/office_blue.png', 
    leftChar: 'player', // Changed to use dynamic player
    rightChar: '/assets/chars/senpai/normal-woman.png',
    speaker: '先輩トレーナー',
    text: '「4週間の新人導入編で、日程管理、能力配分、会場カード選定を一通り経験した。」',
    cg: null
  },
  { 
    bg: '/assets/bgimage/office_blue.png', 
    leftChar: 'player', 
    rightChar: '/assets/chars/senpai/normal-woman.png',
    speaker: '先輩トレーナー',
    text: '「ここから3ヶ月Demo本編の大型研修・派遣・九州案件へ進もう。」',
    cg: null
  },
  { 
    bg: '/assets/bgimage/office_blue.png', 
    leftChar: 'player', 
    rightChar: '/assets/chars/senpai/normal-woman.png',
    speaker: '先輩トレーナー',
    text: '「まずは案件だ。『20名程度の役員会議。東京駅から近く、落ち着いた雰囲気で、見学時に高級感も伝えたい』とのこと。さっそく准备を進めよう。」',
    acquireCards: ['tkp_hakata_r', 'tkp_hakata_sr', 'tkp_kyobashi_r', 'tkp_kyobashi_sr', 'tkp_osaka_ssr']
  }
];

export default function IntroView({ onComplete }: { onComplete: () => void }) {
  const { state, updateState } = useGameState();
  const [sceneIndex, setSceneIndex] = useState(0);

  const scene = INTRO_SCENES[sceneIndex];

  const handleNext = () => {
    if ((scene as any).acquireCards) return;
    proceedNext();
  };

  const proceedNext = () => {
    if (sceneIndex < INTRO_SCENES.length - 1) {
      setSceneIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleAcquire = () => {
    if ((scene as any).acquireCards) {
      updateState({ collectedCards: (scene as any).acquireCards });
    }
    proceedNext();
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    const firstAcquireIndex = INTRO_SCENES.findIndex((s, idx) => idx >= sceneIndex && s.acquireCards);
    if (firstAcquireIndex !== -1) {
      setSceneIndex(firstAcquireIndex);
    } else {
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center cursor-pointer overflow-hidden" onClick={handleNext}>
      {/* Background */}
      <img 
        src={scene.bg} 
        alt="Intro Scene" 
        className="w-full h-full object-cover opacity-60 absolute inset-0"
      />
      
      {/* Left Character (Rookie) */}
      {scene.leftChar && (
        <div className="absolute bottom-[10%] left-[5%] h-[75%] flex items-end justify-center drop-shadow-2xl z-10">
          <img 
            src={scene.leftChar === 'player' ? `/assets/chars/player/normal-${state.playerGender}.png` : scene.leftChar} 
            alt="Rookie" 
            className="max-h-full object-contain pointer-events-none" 
            style={scene.leftChar.includes('senpai') ? { transform: 'scaleX(-1)' } : undefined} 
          />
        </div>
      )}

      {/* Right Character (Senior) */}
      {scene.rightChar && (
        <div className="absolute bottom-[10%] right-[5%] h-[80%] flex items-end justify-center drop-shadow-2xl z-10">
          <img src={scene.rightChar} alt="Senior" className="max-h-full object-contain pointer-events-none" />
        </div>
      )}

      {/* Center CG */}
      <AnimatePresence mode="wait">
        {scene.cg && (
          <motion.div
            key={scene.cg}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 h-[55%] z-25 glass-panel p-4 rounded-xl"
          >
            <img src={scene.cg} alt="Event CG" className="h-full object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogue Box */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[80%] z-30">
        <div className="glass-panel-dark p-10 rounded-2xl border-2 border-white/20 relative">
          {scene.speaker && (
            <div className="absolute -top-8 left-8 bg-tkp-blue text-white px-8 py-2 rounded-lg text-3xl font-bold border-2 border-white/20 shadow-lg">
              {scene.speaker}
            </div>
          )}
          {/* Quick text transition to feel responsive and smooth */}
          <motion.p 
            key={sceneIndex}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-4xl text-white whitespace-pre-line leading-relaxed font-bold text-shadow mt-4"
          >
            {scene.text}
          </motion.p>
          <div className="mt-6 text-right text-tkp-gold text-2xl animate-pulse font-bold">
            ▼ クリックして次へ
          </div>
        </div>
      </div>

      <button 
        onClick={handleSkip}
        className="absolute top-8 right-8 px-6 py-2 glass-panel text-white text-xl rounded-full hover:bg-white/20 transition-colors z-40"
      >
        スキップ
      </button>

      {(scene as any).acquireCards && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto" onClick={e => e.stopPropagation()}>
          <CardAcquireModal cardIds={(scene as any).acquireCards} onAcquire={handleAcquire} />
        </div>
      )}
    </div>
  );
}
