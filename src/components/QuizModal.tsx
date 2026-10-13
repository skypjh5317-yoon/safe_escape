import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Trophy,
  Award,
  ChevronRight
} from 'lucide-react';
import { DISASTER_QUIZ } from '../data/quiz';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = DISASTER_QUIZ[currentIdx];

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < DISASTER_QUIZ.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Award className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">지진·화산 대피 역량 퀴즈</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isFinished ? (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                문제 {currentIdx + 1} / {DISASTER_QUIZ.length}
              </span>
              <span className="font-mono">현재 득점: {score}점</span>
            </div>

            {/* Question */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 inline-block mb-2">
                {currentQ.disaster === 'earthquake' ? '지진 대비' : '화산 대비'}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                {currentQ.question}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => {
                let btnStyle =
                  'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200';

                if (showExplanation) {
                  if (i === currentQ.correctAnswer) {
                    btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                  } else if (selectedOption === i) {
                    btnStyle = 'bg-rose-950 border-rose-500 text-rose-200 line-through';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={showExplanation}
                    className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showExplanation && i === currentQ.correctAnswer && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                    {showExplanation && selectedOption === i && i !== currentQ.correctAnswer && (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {showExplanation && (
              <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 animate-in fade-in">
                <span className="font-bold text-amber-400 block">💡 해설 및 생존 지침:</span>
                <p className="leading-relaxed">{currentQ.explanation}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>{currentIdx + 1 === DISASTER_QUIZ.length ? '결과 보기' : '다음 문제'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Quiz Results */
          <div className="text-center py-6 space-y-4">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">퀴즈 완료!</h4>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {score} / {DISASTER_QUIZ.length}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
              {score === 5
                ? '완벽합니다! 실전 재난 상황에서도 침착하게 생명을 지킬 수 있는 방재 전문가 수준입니다.'
                : score >= 3
                ? '훌륭합니다! 핵심 대피 요령을 잘 숙지하고 계십니다. 비상 배낭 준비도 확인해 보세요.'
                : '재난 대피 요령을 다시 한번 확인하고 숙지해 두시는 것을 권장합니다.'}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 풀기</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
