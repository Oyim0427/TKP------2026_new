import { useEffect, useState } from 'react';
import { useGameState } from './hooks/useGameState';
import TitleView from './views/TitleView';
import IntroView from './views/IntroView';
import ScheduleView from './views/ScheduleView';
import ExecutionView from './views/ExecutionView';
import SummaryView from './views/SummaryView';
import AwardView from './views/AwardView';
import MenuView from './components/MenuView';
import QuizView from './views/QuizView';
import SpecialEventView from './views/SpecialEventView';
import { Menu, Save } from 'lucide-react';

function App() {
  const { state, updateState, resetGame, newGame, continueGame, hasSave } = useGameState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const virtualWidth = isPortrait ? 1080 : 1920;
      const virtualHeight = isPortrait ? 1920 : 1080;
      
      const scaleX = window.innerWidth / virtualWidth;
      const scaleY = window.innerHeight / virtualHeight;
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <>
      <div 
        className="game-container shadow-2xl"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {/* Game Views */}
        {state.gameStage === 'title' && (
          <TitleView 
            onNewGame={newGame} 
            onContinue={continueGame} 
            hasSave={hasSave} 
            collectedCards={state.collectedCards} 
          />
        )}
        {state.gameStage === 'intro' && <IntroView onComplete={() => updateState({ gameStage: 'schedule' })} />}
        
        {state.gameStage === 'schedule' && (
          <ScheduleView onExecute={() => updateState({ gameStage: 'execution' })} />
        )}
        
        {state.gameStage === 'execution' && (
          <ExecutionView 
            onWeekComplete={() => updateState({ gameStage: 'summary' })} 
          />
        )}
        
        {state.gameStage === 'summary' && (
          <SummaryView 
            onNext={() => {
              if (state.currentWeek >= 12) {
                updateState({ gameStage: 'award' });
              } else if (state.currentWeek === 4 || state.currentWeek === 8) {
                updateState({ gameStage: 'special_event' });
              } else {
                updateState({ 
                  gameStage: 'schedule', 
                  currentWeek: state.currentWeek + 1,
                  schedule: {} 
                });
              }
            }} 
          />
        )}

        {state.gameStage === 'special_event' && (
          <SpecialEventView 
            onComplete={(rewards) => {
              const newCards = [...state.collectedCards];
              if (rewards.cardId && !newCards.includes(rewards.cardId)) {
                newCards.push(rewards.cardId);
              }
              updateState({
                gameStage: 'schedule',
                currentWeek: state.currentWeek + 1,
                schedule: {},
                money: state.money + rewards.money,
                collectedCards: newCards
              });
            }}
          />
        )}

        {state.gameStage === 'award' && (
          <AwardView onComplete={() => updateState({ gameStage: 'quiz' })} />
        )}

        {state.gameStage === 'quiz' && (
          <QuizView onComplete={() => updateState({ gameStage: 'end' })} />
        )}

        {state.gameStage === 'end' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-white p-12">
            <h1 className="text-8xl font-bold mb-8 text-tkp-gold text-shadow-glow">ゲームクリア！</h1>
            <p className="text-4xl mb-12">TKP会場マスターの全研修を修了しました。</p>
            <button 
              onClick={resetGame}
              className="px-12 py-4 bg-tkp-red text-white text-3xl font-bold rounded-full hover:bg-tkp-red-dark transition-colors shadow-lg shadow-tkp-red/50 hover:scale-105 active:scale-95"
            >
              タイトルに戻る
            </button>
          </div>
        )}

        {/* Global Game Header */}
        {state.gameStage !== 'title' && state.gameStage !== 'intro' && state.gameStage !== 'end' && (
          <div 
            onClick={() => setIsMenuOpen(true)}
            className="absolute top-0 left-0 right-0 h-16 bg-[#1a1a2e]/95 backdrop-blur-md border-b border-[#3b3b5b] z-50 flex items-center justify-between px-8 text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#20203a] transition-all group"
          >
            <div className="flex items-center gap-8 font-bold text-xl">
              <span className="text-gray-300 group-hover:text-white transition-colors">📊 プレイヤー情報</span>
              <div className="h-6 w-px bg-white/20"></div>
              <span className="text-tkp-gold drop-shadow-md">第 {state.currentWeek} 週目</span>
              <span className="text-pink-400 drop-shadow-md">💼 案件: {state.activeCases}</span>
              <span className="text-green-400 drop-shadow-md">💰 売上 ¥{state.money.toLocaleString()}</span>
              <span className={`${state.stamina > 50 ? 'text-green-500' : state.stamina > 20 ? 'text-yellow-500' : 'text-red-500'} drop-shadow-md`}>
                ⚡ 体力: {state.stamina}
              </span>
              <span className="text-blue-400 drop-shadow-md">📚 知識: {state.knowledge}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem('tkp_master_save', JSON.stringify(state));
                  setIsSavedText(true);
                  setTimeout(() => setIsSavedText(false), 2000);
                }}
                className={`flex items-center gap-3 font-bold text-lg px-6 py-2 rounded-full border transition-all pointer-events-auto ${
                  isSavedText 
                    ? 'bg-green-600 text-white border-green-500 shadow-md shadow-green-600/30' 
                    : 'bg-white/5 text-gray-300 hover:text-white border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <Save size={20} />
                <span>{isSavedText ? '保存完了！' : 'セーブ'}</span>
              </button>

              <div className="flex items-center gap-3 font-bold text-lg text-gray-300 group-hover:text-white bg-white/5 px-6 py-2 rounded-full border border-white/10 group-hover:border-white/30 transition-all">
                <Menu size={20} />
                <span>ステータス詳細を開く</span>
              </div>
            </div>
          </div>
        )}

        {/* Overlay Menu */}
        <MenuView isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      </div>
    </>
  );
}

export default App;
