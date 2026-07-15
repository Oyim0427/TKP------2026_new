import { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { motion, AnimatePresence } from 'framer-motion';
import EventModal from '../components/EventModal';
import CardAcquireModal from '../components/CardAcquireModal';
import QuestionModal from '../components/QuestionModal';
import cardsData from '../data/cards.json';

const DAYS = ['月', '火', '水', '木', '金'];
const CHARACTERS: Record<string, { img: string, name: string, stats: any }> = {
  'act_1': { 
    img: '/assets/chars/client/normal-man.png', name: '商談する', 
    stats: { money: 0, stamina: -15, knowledge: 5, reputation: 2 } 
  },
  'act_2': { 
    img: '/assets/chars/client/normal-woman.png', name: '既存顧客をフォロー', 
    stats: { money: 20000, stamina: -10, knowledge: 2, reputation: 1 } 
  },
  'act_3': { 
    img: '/assets/chars/ops/normal.png', name: '施設知識を学ぶ', 
    stats: { money: 0, stamina: -5, knowledge: 10, reputation: 0 } 
  },
  'act_4': { 
    img: '/assets/chars/senpai/normal-woman.png', name: '先輩に相談する', 
    stats: { money: 0, stamina: -5, knowledge: 8, reputation: 3 } 
  },
  'act_5': { 
    img: '/assets/chars/boss/normal-man.png', name: '案件を進める', 
    stats: { money: 100000, stamina: -20, knowledge: 0, reputation: 5 } 
  },
  'act_6': { 
    img: 'player', name: 'Routing 業務', 
    stats: { money: 0, stamina: 20, knowledge: 1, reputation: 0 } 
  },
};

const ACTION_CGS = [
  '/assets/cgs/cg1-man.png',
  '/assets/cgs/cg2-man.png',
  '/assets/cgs/cg3-man.png',
  '/assets/cgs/cg4-man.png',
  '/assets/cgs/cg5-man.png',
];

export default function ExecutionView({ onWeekComplete }: { onWeekComplete: () => void }) {
  const { state, updateState } = useGameState();
  const [dayIndex, setDayIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(false);
  const [pendingCard, setPendingCard] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  useEffect(() => {
    // Process scheduled cases that mature this week
    const casesToActivate = state.scheduledCases.filter(w => w <= state.currentWeek);
    const futureCases = state.scheduledCases.filter(w => w > state.currentWeek);
    if (casesToActivate.length > 0) {
      updateState({ 
        activeCases: state.activeCases + casesToActivate.length,
        scheduledCases: futureCases
      });
    }
  }, []); // Run only once when ExecutionView mounts (at start of the week)

  useEffect(() => {
    if (pendingEvent || pendingCard || pendingQuestion) return;

    let timer: ReturnType<typeof setTimeout>;
    
    if (dayIndex < 5) {
      const charId = state.schedule[dayIndex] || 'act_1';
      const charInfo = CHARACTERS[charId] || CHARACTERS['act_1'];
      const stats = charInfo.stats;

      // Show stats popup halfway through the day
      setTimeout(() => setShowStats(true), 400);
      
      // Update stats and move to next day
      timer = setTimeout(() => {
        let newActiveCases = state.activeCases;
        let newScheduledCases = [...state.scheduledCases];
        let triggeredEvent = false;
        let triggeredQuestion = false;

        if (charId === 'act_1') {
          if (Math.random() < 0.3) {
            newActiveCases += 1;
          }
          if (Math.random() < 0.5) triggeredQuestion = true;
        } else if (charId === 'act_2') {
          if (Math.random() < 0.3) {
            newScheduledCases.push(state.currentWeek + 2);
          }
        } else if (charId === 'act_3') {
          if (Math.random() < 0.5) triggeredQuestion = true;
        } else if (charId === 'act_4') {
          if (Math.random() < 0.5) triggeredQuestion = true;
        } else if (charId === 'act_5') {
          newActiveCases -= 1;
          triggeredEvent = true;
        } else if (charId === 'act_6') {
          if (Math.random() < 0.2) triggeredQuestion = true;
        }

        // We only add money here if it's not act_5, because act_5 money comes from EventModal
        let moneyGained = charId === 'act_5' ? 0 : stats.money;
        
        // Randomize act_2 money to be between 10,000 and 50,000
        if (charId === 'act_2') {
          moneyGained = Math.floor(Math.random() * 40000) + 10000;
        }

        updateState({ 
          money: state.money + moneyGained, 
          stamina: Math.max(0, state.stamina + stats.stamina),
          knowledge: state.knowledge + stats.knowledge,
          satisfaction: state.satisfaction + (stats.satisfaction || 0),
          reputation: state.reputation + stats.reputation,
          activeCases: Math.max(0, newActiveCases),
          scheduledCases: newScheduledCases
        });
        
        let triggeredCard = null;
        if (charId === 'act_3' && Math.random() < 0.3) {
          const unownedCards = cardsData.filter(c => !state.collectedCards.includes(c.id));
          if (unownedCards.length > 0) {
            triggeredCard = unownedCards[Math.floor(Math.random() * unownedCards.length)].id;
          }
        }
        
        if (triggeredEvent) {
          setPendingEvent(true);
        } else if (triggeredQuestion && triggeredCard) {
          setPendingQuestion(charId);
          setPendingCard(triggeredCard);
        } else if (triggeredQuestion) {
          setPendingQuestion(charId);
        } else if (triggeredCard) {
          setPendingCard(triggeredCard);
        } else {
          setDayIndex(prev => prev + 1);
        }
      }, 1200);
    } else {
      onWeekComplete();
    }

    return () => clearTimeout(timer);
  }, [dayIndex, pendingEvent, pendingCard, pendingQuestion, state.schedule, state.money, state.stamina, state.knowledge, state.satisfaction, state.reputation, state.collectedCards, updateState, onWeekComplete]);

  const handleEventComplete = () => {
    setPendingEvent(false);
    setDayIndex(prev => prev + 1);
  };

  const handleQuestionComplete = () => {
    setPendingQuestion(null);
    if (!pendingCard) {
      setDayIndex(prev => prev + 1);
    }
  };

  const handleCardAcquire = () => {
    if (pendingCard && !state.collectedCards.includes(pendingCard)) {
      updateState({ collectedCards: [...state.collectedCards, pendingCard] });
    }
    setPendingCard(null);
    setDayIndex(prev => prev + 1);
  };

  if (dayIndex >= 5) return null;

  const charId = state.schedule[dayIndex] || 'act_1';
  const char = CHARACTERS[charId] || CHARACTERS['act_1'];
  const cgImg = ACTION_CGS[dayIndex % ACTION_CGS.length];
  const stats = char.stats;

  return (
    <div className="absolute inset-0 pt-16 bg-black flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={dayIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <img src={cgImg} className="w-full h-full object-cover opacity-60" />
          
          <div className="absolute top-12 left-12 glass-panel-dark px-8 py-4 rounded-xl text-5xl font-bold text-white tracking-widest">
            {DAYS[dayIndex]}曜日
          </div>

          <motion.div 
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
            className="absolute bottom-[5%] left-[20%] w-[600px] h-[85%] flex items-end justify-center drop-shadow-2xl"
          >
            <img 
              src={char.img === 'player' ? `/assets/chars/player/normal-${state.playerGender}.png` : char.img} 
              alt={char.name} 
              className="max-h-full object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-12 right-12 w-[600px] glass-panel p-8 rounded-3xl"
          >
            <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-md">{char.name}</h3>
            <p className="text-2xl text-gray-300">
              {char.name === '案件を進める' ? '最適な会場を提案して売上を獲得！' : 
               char.name === 'Routing 業務' ? '体力を回復しながら現場を確認。' :
               '業務を遂行中...'}
            </p>
          </motion.div>

          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: 1, y: -100, scale: 1 }}
                exit={{ opacity: 0, y: -200 }}
                transition={{ duration: 0.6 }}
                className="absolute top-1/2 right-[15%] glass-panel-dark px-8 py-6 rounded-2xl flex flex-col gap-3 text-3xl font-bold shadow-2xl shadow-tkp-blue/50"
              >
                {charId === 'act_5' && <span className="text-white">案件進行中...</span>}
                {charId !== 'act_5' && stats.money > 0 && <span className="text-green-400">+¥{stats.money.toLocaleString()}</span>}
                {stats.knowledge > 0 && <span className="text-blue-400">知識 +{stats.knowledge}</span>}
                {stats.stamina > 0 && <span className="text-teal-400">体力 +{stats.stamina}</span>}
                {stats.stamina < 0 && <span className="text-red-400">体力 {stats.stamina}</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {pendingEvent && <EventModal onEventComplete={handleEventComplete} />}
      {!pendingEvent && pendingQuestion && <QuestionModal charId={pendingQuestion} onComplete={handleQuestionComplete} />}
      {!pendingEvent && !pendingQuestion && pendingCard && <CardAcquireModal cardIds={[pendingCard]} onAcquire={handleCardAcquire} />}
    </div>
  );
}
