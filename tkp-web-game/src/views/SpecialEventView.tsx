import { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { motion } from 'framer-motion';
import { BookOpen, Briefcase, Coins, Trophy, Check, X } from 'lucide-react';
import cardsData from '../data/cards.json';
import type { Card } from '../types';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

const FACILITY_QUESTIONS: Question[] = [
  {
    question: "「スクール型」レイアウトでの机1台に対する一般的な着席人数は？",
    options: ["1名", "2〜3名", "5名"],
    correctIndex: 1
  },
  {
    question: "天井高が低い会場でプロジェクターを使用する際、最も注意すべき点は？",
    options: ["スクリーンの見え方（後席からの視界遮り）", "マイクの音量設定", "照明の明るさ調整"],
    correctIndex: 0
  },
  {
    question: "100名規模の会場で「シアター型」にした場合、収容人数は「スクール型」と比べてどうなる？",
    options: ["減少する", "変わらない", "増加する"],
    correctIndex: 2
  },
  {
    question: "会場の電気容量（アンペア数）を確認する必要がある主な用途は？",
    options: ["一般的な会議でのPC利用", "展示会や臨時調理器具などの高電力機器使用", "通常のマイクの使用"],
    correctIndex: 1
  },
  {
    question: "会場の「仮予約」期間として、TKPで一般的な標準的な期間は？",
    options: ["1週間程度", "1ヶ月間", "当日の予約のみ"],
    correctIndex: 0
  }
];

const NEGOTIATION_QUESTIONS: Question[] = [
  {
    question: "お客様から「予算が合わない」と値引きを要求された時、営業としての最初の正しい対応は？",
    options: ["即座に要求通りの値引きに応じる", "レイアウト変更や備品調整、日程調整による予算削減案を提案する", "競合他社を勧める"],
    correctIndex: 1
  },
  {
    question: "初めて問い合わせをいただいたお客様に対し、ヒアリングで最も優先して確認すべき情報は？",
    options: ["お客様の会社の設立年と規模", "開催目的・日時・人数・予算・希望エリア", "競合他社の過去の見積額"],
    correctIndex: 1
  },
  {
    question: "会期直前にお客様から「追加でマイクを増やしたい」と連絡があった場合、正しい対応は？",
    options: ["料金を上乗せせず無償で追加する", "在庫状況を確認し、追加料金について説明して手配する", "直前の変更なので一律断る"],
    correctIndex: 1
  },
  {
    question: "競合他社と比較されている中で、TKPの強みとして最も適切にアピールすべき点は？",
    options: ["拠点の多さと、会議・懇親会・お弁当・宿泊までワンストップで手配できる利便性", "とにかく他社より価格が安いこと", "会場の設備がシンプルで何もないこと"],
    correctIndex: 0
  },
  {
    question: "大規模なイベントの提案で、見積書の他に用意すると決定率が上がるものは？",
    options: ["会場のレイアウト図面・看板のデザイン案・進行スケジュールなどの提案書面", "自社オフィスの外観写真", "自社の最新決算報告書"],
    correctIndex: 0
  }
];

interface SpecialEventViewProps {
  onComplete: (rewards: { cardId: string | null; money: number }) => void;
}

export default function SpecialEventView({ onComplete }: SpecialEventViewProps) {
  const { state } = useGameState();
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [eventType, setEventType] = useState<'facility' | 'negotiation'>('facility');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [rewardedCard, setRewardedCard] = useState<Card | null>(null);

  // Initialize event type and select 3 random questions
  useEffect(() => {
    const selectedType = Math.random() < 0.5 ? 'facility' : 'negotiation';
    setEventType(selectedType);

    const pool = selectedType === 'facility' ? FACILITY_QUESTIONS : NEGOTIATION_QUESTIONS;
    // Shuffle and pick 3
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 3));
  }, []);

  // Determine rewards upon quiz completion
  const handleQuizFinish = (finalScore: number) => {
    if (eventType === 'facility' && finalScore >= 2) {
      // Find unowned cards
      const unowned = (cardsData as Card[]).filter(c => !state.collectedCards.includes(c.id));
      if (unowned.length > 0) {
        const randomCard = unowned[Math.floor(Math.random() * unowned.length)];
        setRewardedCard(randomCard);
      }
    }
    setPhase('result');
  };

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);

    const isCorrect = idx === questions[questionIndex].correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
    }

    // Auto proceed or finish after 1.5s
    setTimeout(() => {
      if (questionIndex < 2) {
        setQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowResult(false);
      } else {
        handleQuizFinish(newScore);
      }
    }, 1500);
  };

  if (phase === 'intro') {
    const isFacility = eventType === 'facility';
    return (
      <div className="absolute inset-0 bg-[#0f172a]/95 flex flex-col items-center justify-center text-white text-shadow">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-[1000px] glass-panel-dark p-16 rounded-3xl border-4 text-center ${isFacility ? 'border-sky-500/40 shadow-sky-500/20' : 'border-amber-500/40 shadow-amber-500/20'} shadow-2xl`}
        >
          <div className="flex justify-center mb-8">
            <span className={`p-6 rounded-full ${isFacility ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'} animate-pulse`}>
              {isFacility ? <BookOpen size={64} /> : <Briefcase size={64} />}
            </span>
          </div>

          <h1 className="text-7xl font-extrabold mb-4 tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            四半期査定イベント発生！
          </h1>
          <h2 className={`text-4xl font-bold mb-12 ${isFacility ? 'text-sky-400' : 'text-amber-400'}`}>
            【{isFacility ? '施設知識査定' : '大型交渉バトル'}】
          </h2>

          <p className="text-3xl text-gray-300 leading-relaxed mb-16 px-12">
            {isFacility 
              ? "現場力と施設レイアウトの知識が試される！3つのクイズに挑戦し、2問以上正解して新たな【会場カード】を獲得しよう！"
              : "大物顧客との重要な商談が発生！3つの交渉クイズに挑戦し、正しい提案で合意を獲得して【追加売上ボーナス】を勝ち取れ！"
            }
          </p>

          <button
            onClick={() => setPhase('quiz')}
            className={`px-16 py-6 text-3xl font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg ${
              isFacility 
                ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30' 
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
            }`}
          >
            {isFacility ? '査定を開始する' : '商談交渉を開始する'}
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[questionIndex];
    const isFacility = eventType === 'facility';
    return (
      <div className="absolute inset-0 bg-[#0f172a]/95 flex flex-col items-center justify-center text-white text-shadow">
        <div className="w-[1100px] glass-panel-dark p-16 rounded-3xl border border-white/10 relative shadow-2xl">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-3 bg-gray-800 rounded-t-3xl overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isFacility ? 'bg-sky-500' : 'bg-amber-500'}`}
              style={{ width: `${((questionIndex + (showResult ? 1 : 0)) / 3) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-12">
            <span className={`text-2xl font-bold px-6 py-2 rounded-full bg-white/5 border border-white/10 ${isFacility ? 'text-sky-400' : 'text-amber-400'}`}>
              {isFacility ? '施設知識' : '交渉'} クイズ ({questionIndex + 1} / 3)
            </span>
            <span className="text-2xl text-gray-400 font-bold">
              正解数: {score}
            </span>
          </div>

          <h3 className="text-4xl font-bold mb-16 leading-snug text-center">
            {q.question}
          </h3>

          <div className="flex flex-col gap-6 w-5/6 mx-auto">
            {q.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === q.correctIndex;
              
              let btnClass = "text-left text-2xl px-10 py-6 rounded-2xl transition-all border-2 flex justify-between items-center ";
              
              if (!showResult) {
                btnClass += "glass-panel hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5 active:translate-y-0";
              } else {
                if (isSelected && !isCorrect) {
                  btnClass += "border-red-500 bg-red-500/20 text-red-200";
                } else if (isCorrect) {
                  btnClass += "border-green-500 bg-green-500/20 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                } else {
                  btnClass += "border-white/5 bg-white/2 opacity-30";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={showResult}
                  onClick={() => handleSelect(idx)}
                  className={btnClass}
                >
                  <span>{opt}</span>
                  {showResult && isCorrect && <Check size={28} className="text-green-400" />}
                  {showResult && isSelected && !isCorrect && <X size={28} className="text-red-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const isFacility = eventType === 'facility';
    const isSuccess = score >= 2;
    const moneyReward = !isFacility ? score * 100000 : 0;

    return (
      <div className="absolute inset-0 bg-[#0f172a]/98 flex flex-col items-center justify-center text-white text-shadow">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-[900px] glass-panel-dark p-16 rounded-3xl text-center border-2 ${
            isSuccess ? 'border-green-500/30' : 'border-red-500/20'
          } shadow-2xl relative overflow-hidden`}
        >
          {/* Glow elements */}
          {isSuccess && (
            <div className="absolute -inset-10 bg-gradient-to-tr from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none blur-3xl" />
          )}

          <h2 className="text-5xl font-bold mb-6 text-gray-400">査定結果発表</h2>

          <div className="flex justify-center items-center gap-4 mb-10">
            <span className="text-8xl font-black">{score}</span>
            <span className="text-4xl text-gray-500">/ 3 問正解</span>
          </div>

          {isFacility ? (
            // Facility Result
            <div>
              {isSuccess ? (
                <>
                  <div className="text-5xl font-bold text-green-400 mb-8 flex items-center justify-center gap-3">
                    <Trophy size={48} className="text-yellow-400 animate-bounce" />
                    合格！新規会場カード獲得！
                  </div>
                  
                  {rewardedCard ? (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mx-auto w-[400px] rounded-2xl border-2 p-8 mb-12 shadow-xl text-left bg-gradient-to-b from-gray-800 to-gray-900 border-white/10"
                      style={{
                        boxShadow: rewardedCard.rarity === 'SSR' 
                          ? '0 0 25px rgba(212, 175, 55, 0.25)' 
                          : rewardedCard.rarity === 'SR' 
                          ? '0 0 25px rgba(59, 130, 246, 0.25)' 
                          : '0 0 15px rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <span className={`px-4 py-1.5 rounded-lg text-2xl font-black border ${
                          rewardedCard.rarity === 'SSR' 
                            ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' 
                            : rewardedCard.rarity === 'SR' 
                            ? 'bg-blue-500/20 border-blue-400 text-blue-400' 
                            : 'bg-gray-500/20 border-gray-400 text-gray-400'
                        }`}>
                          {rewardedCard.rarity}
                        </span>
                        <span className="text-xl text-gray-400 font-bold">{rewardedCard.location}</span>
                      </div>

                      <h4 className="text-3xl font-black mb-6 text-white leading-tight min-h-16">
                        {rewardedCard.name}
                      </h4>

                      <div className="border-t border-white/10 pt-4 flex justify-between text-xl text-gray-400 font-medium">
                        <span>最大収容人数:</span>
                        <span className="text-white font-bold">{rewardedCard.capacity} 名</span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mt-6 border-t border-white/10 pt-4 text-lg">
                        {rewardedCard.stats.knowledge && (
                          <div className="bg-white/5 p-3 rounded-lg flex justify-between">
                            <span className="text-gray-400 font-semibold">知識</span>
                            <span className="text-green-400 font-bold">+{rewardedCard.stats.knowledge}</span>
                          </div>
                        )}
                        {rewardedCard.stats.satisfaction && (
                          <div className="bg-white/5 p-3 rounded-lg flex justify-between">
                            <span className="text-gray-400 font-semibold">満足度</span>
                            <span className="text-green-400 font-bold">+{rewardedCard.stats.satisfaction}</span>
                          </div>
                        )}
                        {rewardedCard.stats.proposal && (
                          <div className="bg-white/5 p-3 rounded-lg flex justify-between">
                            <span className="text-gray-400 font-semibold">提案力</span>
                            <span className="text-green-400 font-bold">+{rewardedCard.stats.proposal}</span>
                          </div>
                        )}
                        {rewardedCard.stats.sales && (
                          <div className="bg-white/5 p-3 rounded-lg flex justify-between">
                            <span className="text-gray-400 font-semibold">売上</span>
                            <span className="text-green-400 font-bold">+{rewardedCard.stats.sales.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <p className="text-2xl text-gray-400 mb-12">全ての会場カードを既に所持しています！</p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-5xl font-bold text-red-400 mb-6 flex items-center justify-center gap-3">
                    不合格...
                  </div>
                  <p className="text-2xl text-gray-400 mb-16 leading-relaxed px-12">
                    基準点（2問正解）に届きませんでした。施設知識が不足しています。来期に向けて復習しましょう！
                  </p>
                </>
              )}
            </div>
          ) : (
            // Negotiation Result
            <div>
              {score > 0 ? (
                <>
                  <div className="text-5xl font-bold text-amber-400 mb-8 flex items-center justify-center gap-3">
                    <Coins size={48} className="text-amber-400 animate-bounce" />
                    交渉成立！追加売上ボーナス！
                  </div>
                  
                  <div className="glass-panel p-8 rounded-2xl w-3/5 mx-auto mb-16 border border-amber-500/20">
                    <span className="text-2xl text-gray-400 block font-bold mb-2">獲得売上</span>
                    <span className="text-6xl font-black text-green-400 font-sans">
                      +¥{moneyReward.toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-5xl font-bold text-red-400 mb-6">
                    交渉決裂...
                  </div>
                  <p className="text-2xl text-gray-400 mb-16 leading-relaxed px-12">
                    顧客の納得を得られず、案件は失注となってしまいました。提案のヒアリングと顧客ニーズの分析を見直しましょう。
                  </p>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => onComplete({ cardId: rewardedCard?.id || null, money: moneyReward })}
            className="px-16 py-6 bg-tkp-blue text-white text-3xl font-bold rounded-full hover:bg-tkp-blue/80 transition-colors shadow-lg hover:scale-105 active:scale-95"
          >
            次週スケジュールへ
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}
