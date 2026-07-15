import { useState } from 'react';
import eventsData from '../data/events.json';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizView({ onComplete }: { onComplete: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const quiz = eventsData.quiz;

  const handleSelect = (index: number) => {
    setSelectedOption(index);
    setShowResult(true);
    if (index === quiz[questionIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (questionIndex < quiz.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  if (quizFinished) {
    let grade = '要復習';
    if (score === 6) grade = 'S (Demo修了)';
    else if (score >= 5) grade = 'A (合格)';
    else if (score >= 4) grade = 'B (要復習ミッション)';
    
    return (
      <div className="absolute inset-0 bg-tkp-blue/90 flex flex-col items-center justify-center">
        <div className="w-[1000px] glass-panel p-16 rounded-3xl relative overflow-hidden text-center">
          <h2 className="text-6xl text-tkp-gold font-bold mb-12">最終テスト結果</h2>
          <div className="text-4xl text-white mb-8">正解数: {score} / {quiz.length}</div>
          <div className="text-8xl text-tkp-red font-bold mb-16 drop-shadow-lg text-shadow-glow">
            評価: {grade}
          </div>
          <button
            onClick={onComplete}
            className="px-16 py-6 bg-tkp-gold text-tkp-blue text-3xl font-bold rounded-full hover:bg-yellow-400 transition-colors shadow-lg hover:scale-105"
          >
            総合結果へ進む
          </button>
        </div>
      </div>
    );
  }

  const q = quiz[questionIndex];

  return (
    <div className="absolute inset-0 bg-tkp-blue/90 flex flex-col items-center justify-center">
      <div className="w-[1200px] glass-panel p-16 rounded-3xl relative overflow-hidden">
        
        {/* Progress */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-700">
          <div 
            className="h-full bg-tkp-gold transition-all duration-500" 
            style={{ width: `${((questionIndex) / quiz.length) * 100}%` }}
          />
        </div>

        <h2 className="text-4xl text-tkp-gold font-bold mb-8 tracking-widest text-center">
          最終テスト ({questionIndex + 1}/{quiz.length})
        </h2>
        
        <p className="text-5xl text-white font-bold mb-16 leading-tight text-center">
          {q.question}
        </p>

        <div className="flex flex-col gap-6 w-3/4 mx-auto">
          {q.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === q.correctIndex;
            
            let btnClass = "glass-panel text-3xl text-left px-12 py-8 rounded-xl transition-all border-2 border-transparent ";
            
            if (!showResult) {
              btnClass += "hover:border-tkp-gold hover:-translate-y-1 hover:shadow-lg hover:shadow-tkp-gold/20";
            } else {
              if (isSelected && !isCorrect) btnClass += "border-tkp-red bg-tkp-red/20 opacity-50";
              else if (isCorrect) btnClass += "border-green-500 bg-green-500/20 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]";
              else btnClass += "opacity-50";
            }

            return (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => handleSelect(idx)}
                className={btnClass}
              >
                {opt}
                {showResult && isCorrect && <span className="float-right text-green-400">✓ 正解</span>}
                {showResult && isSelected && !isCorrect && <span className="float-right text-tkp-red">✗ 不正解</span>}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 text-center"
            >
              <button
                onClick={handleNext}
                className="px-16 py-6 bg-tkp-gold text-tkp-blue text-3xl font-bold rounded-full hover:bg-yellow-400 transition-colors shadow-lg hover:scale-105"
              >
                {questionIndex < quiz.length - 1 ? '次の問題へ' : '結果を見る'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
