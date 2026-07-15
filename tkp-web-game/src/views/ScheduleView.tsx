import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Briefcase, Plus, X } from 'lucide-react';

const CHARACTERS = [
  { id: 'act_1', name: '商談する', img: '/assets/chars/client/normal-man.png', color: 'bg-blue-500', stamina: -15 },
  { id: 'act_2', name: '既存顧客をフォロー', img: '/assets/chars/client/normal-woman.png', color: 'bg-green-500', stamina: -10 },
  { id: 'act_3', name: '施設知識を学ぶ', img: '/assets/chars/ops/normal.png', color: 'bg-purple-500', stamina: -5 },
  { id: 'act_4', name: '先輩に相談する', img: '/assets/chars/senpai/normal-woman.png', color: 'bg-pink-500', stamina: -5 },
  { id: 'act_5', name: '案件を進める', img: '/assets/chars/boss/normal-man.png', color: 'bg-red-500', stamina: -20 },
  { id: 'act_6', name: 'Routing 業務', img: 'player', color: 'bg-teal-500', stamina: 20 },
];

const DAYS = ['月', '火', '水', '木', '金'];

export default function ScheduleView({ onExecute }: { onExecute: () => void }) {
  const { state, updateState } = useGameState();
  const [localSchedule, setLocalSchedule] = useState<Record<number, string>>(state.schedule || {});
  
  // Track which day is currently being edited (null if no day is selected)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Dynamically calculate dates based on current week (Week 1 starts at 10th)
  const baseDate = 10;
  const weekOffset = (state.currentWeek - 1) * 7;
  const currentDates = Array.from({length: 5}, (_, i) => (baseDate + weekOffset + i).toString());

  const handleStartWeek = () => {
    updateState({ schedule: localSchedule });
    onExecute();
  };

  const assignCharacter = (charId: string) => {
    if (selectedDay !== null) {
      setLocalSchedule(prev => ({ ...prev, [selectedDay]: charId }));
      setSelectedDay(null);
    }
  };

  const isScheduleFull = Object.keys(localSchedule).length === 5;

  return (
    <div className="absolute inset-0 pt-16 bg-[#1e1e1e] flex flex-col text-gray-200 font-sans">
      
      {/* Header (Teams Style) */}
      <header className="h-20 bg-[#2d2d2d] border-b border-gray-700 flex items-center justify-between px-8 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#444791] rounded-xl text-white shadow-lg">
            <Calendar size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">予定表</h1>
            <p className="text-gray-400 text-sm">第 {state.currentWeek} 週のスケジュールを編成</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleStartWeek}
            disabled={!isScheduleFull}
            className={`px-8 py-3 text-xl font-bold rounded-lg transition-all flex items-center gap-2 ${
              isScheduleFull 
                ? 'bg-[#5b5fc7] text-white hover:bg-[#4f52b2] shadow-md hover:shadow-lg' 
                : 'bg-[#3b3b3b] text-gray-500 cursor-not-allowed'
            }`}
          >
            <Briefcase size={24} />
            業務を開始する
          </button>
        </div>
      </header>

      {/* Main Calendar Grid */}
      <div className="flex-1 flex overflow-hidden p-6 bg-[#141414]">
        
        {/* Time Column (Left Sidebar) */}
        <div className="w-24 flex flex-col pt-20 border-r border-gray-800 text-gray-500 text-lg">
          <div className="h-48 flex items-start justify-center pt-2">09:00</div>
          <div className="h-48 flex items-start justify-center pt-2">13:00</div>
          <div className="h-48 flex items-start justify-center pt-2">17:00</div>
        </div>

        {/* Days Grid */}
        <div className="flex-1 flex border-l border-gray-800">
          {DAYS.map((day, index) => {
            const charId = localSchedule[index];
            const char = CHARACTERS.find(c => c.id === charId);
            const isSelected = selectedDay === index;
            
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col border-r border-gray-800 relative group"
              >
                {/* Day Header */}
                <div className="h-20 flex flex-col items-center justify-center border-b border-gray-800 bg-[#1e1e1e]">
                  <span className="text-gray-400 font-medium mb-1">{day}</span>
                  <span className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full ${index === 0 ? 'bg-[#5b5fc7] text-white' : 'text-gray-200'}`}>
                    {currentDates[index]}
                  </span>
                </div>
                
                {/* Day Content Area */}
                <div 
                  className={`flex-1 relative cursor-pointer transition-colors p-2 ${
                    isSelected ? 'bg-[#2a2a35]' : 'hover:bg-[#202020]'
                  }`}
                  onClick={() => setSelectedDay(index)}
                >
                  {/* Grid Lines */}
                  <div className="absolute top-48 left-0 right-0 border-t border-gray-800/50"></div>
                  <div className="absolute top-96 left-0 right-0 border-t border-gray-800/50"></div>

                  {/* Assigned Character Card */}
                  {char ? (
                    <motion.div 
                      layoutId={`card-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute top-4 left-2 right-2 bottom-4 rounded-xl overflow-hidden shadow-xl border border-gray-700/50 flex flex-col ${char.color} bg-opacity-20`}
                    >
                      <div className={`h-2 ${char.color}`}></div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="font-bold text-xl text-white mb-1 flex justify-between items-start">
                          {char.name}
                          <button 
                            className="text-gray-400 hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocalSchedule(prev => {
                                const newSchedule = { ...prev };
                                delete newSchedule[index];
                                return newSchedule;
                              });
                            }}
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="text-gray-300 text-sm mb-4">09:00 - 18:00 (終日)</div>
                        <div className="flex-1 relative flex items-end justify-center">
                          <img 
                            src={char.img === 'player' ? `/assets/chars/player/normal-${state.playerGender}.png` : char.img} 
                            alt={char.name} 
                            className="h-full object-contain filter drop-shadow-lg" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-[#5b5fc7] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
                        <Plus size={20} />
                        予定を追加
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Selection Modal */}
      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#242424] w-[900px] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#2d2d2d]">
                <div className="flex items-center gap-3">
                  <Users className="text-[#5b5fc7]" size={28} />
                  <h2 className="text-2xl font-bold text-white">
                    {DAYS[selectedDay]}曜日 の担当をアサイン
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-gray-600 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-3 gap-6 bg-[#1e1e1e]">
                {CHARACTERS.map(char => {
                  let simulatedStamina = state.stamina;
                  let availableCases = state.activeCases;
                  
                  if (selectedDay !== null) {
                    for (let i = 0; i < selectedDay; i++) {
                      const prevCharId = localSchedule[i];
                      if (prevCharId) {
                        const prevChar = CHARACTERS.find(c => c.id === prevCharId);
                        if (prevChar) simulatedStamina = Math.max(0, simulatedStamina + prevChar.stamina);
                        if (prevCharId === 'act_5') availableCases--;
                      }
                    }
                  }
                  
                  const isNoCases = char.id === 'act_5' && availableCases <= 0;
                  const isStaminaDepleted = simulatedStamina <= 0 && char.id !== 'act_6';
                  const isDisabled = isStaminaDepleted || isNoCases;

                  return (
                    <button
                      key={char.id}
                      onClick={() => !isDisabled && assignCharacter(char.id)}
                      disabled={isDisabled}
                      className={`flex flex-col items-center bg-[#2d2d2d] p-6 rounded-xl border-2 transition-all group ${isDisabled ? 'opacity-40 cursor-not-allowed border-transparent' : 'border-transparent hover:border-[#5b5fc7] hover:bg-[#333333]'}`}
                    >
                      <div className={`w-full h-48 rounded-lg mb-4 flex items-end justify-center overflow-hidden bg-gradient-to-t from-[#1a1a1a] to-transparent relative`}>
                        <img 
                          src={char.img === 'player' ? `/assets/chars/player/normal-${state.playerGender}.png` : char.img} 
                          alt={char.name} 
                          className={`h-full object-contain transition-transform duration-300 ${!isDisabled && 'group-hover:scale-110'}`} 
                        />
                        {isDisabled && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <span className="text-red-500 font-bold text-2xl drop-shadow-md">
                              {isNoCases ? '案件不足' : '体力不足'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`text-xl font-bold transition-colors ${isDisabled ? 'text-gray-500' : 'text-white group-hover:text-[#5b5fc7]'}`}>
                        {char.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
