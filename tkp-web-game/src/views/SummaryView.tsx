import { useGameState } from '../hooks/useGameState';

export default function SummaryView({ onNext }: { onNext: () => void }) {
  const { state } = useGameState();

  const isFinalWeek = state.currentWeek >= 12;

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-12">
      <h1 className="text-8xl font-bold mb-8 text-tkp-gold text-shadow-glow">
        第 {state.currentWeek} 週 完了！
      </h1>
      <p className="text-4xl mb-12">
        {isFinalWeek 
          ? "お疲れ様でした。3ヶ月の研修が完了し、いよいよ新人賞の発表です！" 
          : "お疲れ様でした。現在の進捗を確認して、次の週へ進みましょう。"}
      </p>
      
      <div className="grid grid-cols-3 gap-8 text-3xl mb-16 w-3/4 max-w-[1200px]">
        <div className="glass-panel p-8 rounded-xl text-center border-t-4 border-green-500">
          <div className="text-gray-400 mb-2">累計売上</div>
          <div className="text-green-400 font-bold">¥{state.money.toLocaleString()}</div>
        </div>
        <div className="glass-panel p-8 rounded-xl text-center border-t-4 border-tkp-gold">
          <div className="text-gray-400 mb-2">獲得カード</div>
          <div className="text-tkp-gold font-bold">{state.collectedCards.length} 枚</div>
        </div>
        <div className="glass-panel p-8 rounded-xl text-center border-t-4 border-blue-500">
          <div className="text-gray-400 mb-2">知識ポイント</div>
          <div className="text-blue-400 font-bold">{state.knowledge} pt</div>
        </div>
        <div className="glass-panel p-8 rounded-xl text-center border-t-4 border-pink-500">
          <div className="text-gray-400 mb-2">お客様満足度</div>
          <div className="text-pink-400 font-bold">{state.satisfaction} pt</div>
        </div>
        <div className="glass-panel p-8 rounded-xl text-center border-t-4 border-purple-500">
          <div className="text-gray-400 mb-2">社内評価</div>
          <div className="text-purple-400 font-bold">{state.reputation} pt</div>
        </div>
        <div className="glass-panel p-8 rounded-xl text-center border-t-4 border-red-500">
          <div className="text-gray-400 mb-2">残り体力</div>
          <div className="text-red-400 font-bold">{state.stamina} / 100</div>
        </div>
      </div>

      <button 
        onClick={onNext}
        className="px-12 py-5 bg-tkp-blue text-white text-3xl font-bold rounded-full hover:bg-tkp-blue/80 transition-colors shadow-lg shadow-tkp-blue/50 hover:scale-105 active:scale-95"
      >
        {isFinalWeek ? '新人賞発表へ' : '次の週へ'}
      </button>
    </div>
  );
}
