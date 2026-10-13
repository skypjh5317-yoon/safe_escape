import React, { useState } from 'react';
import {
  AlertTriangle,
  Home,
  Trees,
  ArrowDownSquare,
  Car,
  Flame,
  ShieldAlert,
  Shirt,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DisasterType, DisasterManual } from '../types/disaster';
import { DISASTER_MANUALS } from '../data/manuals';
import { speechBroadcaster } from '../utils/speech';

interface ManualViewProps {
  currentDisaster: DisasterType;
}

export const ManualView: React.FC<ManualViewProps> = ({ currentDisaster }) => {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>(currentDisaster);
  const manuals = DISASTER_MANUALS.filter((m) => m.disasterType === selectedDisaster);
  const [activeManualId, setActiveManualId] = useState<string>(manuals[0]?.id || 'eq-indoor');
  const [speakingManualId, setSpeakingManualId] = useState<string | null>(null);

  // Sync if prop changes
  React.useEffect(() => {
    setSelectedDisaster(currentDisaster);
    const first = DISASTER_MANUALS.find((m) => m.disasterType === currentDisaster);
    if (first) setActiveManualId(first.id);
  }, [currentDisaster]);

  const activeManual = manuals.find((m) => m.id === activeManualId) || manuals[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Trees':
        return <Trees className="w-4 h-4" />;
      case 'ArrowDownSquare':
        return <ArrowDownSquare className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleSpeakManual = (manual: DisasterManual) => {
    if (speakingManualId === manual.id) {
      speechBroadcaster.stop();
      setSpeakingManualId(null);
      return;
    }

    const narration = `[${manual.situation} 대피요령입니다] ` +
      `${manual.summary} ` +
      manual.steps.map((s) => `${s.step}단계, ${s.title}. ${s.description}`).join(' ');

    setSpeakingManualId(manual.id);
    speechBroadcaster.speak(narration, {
      rate: 1.0,
      onEnd: () => setSpeakingManualId(null),
      onError: () => setSpeakingManualId(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Disaster Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            상황별 표준 생존 대피요령 (Action Manual)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            행정안전부 국민행동요령 기반 실시간 대피 지침 및 단계별 생존 수칙
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => {
              setSelectedDisaster('earthquake');
              const eq = DISASTER_MANUALS.find((m) => m.disasterType === 'earthquake');
              if (eq) setActiveManualId(eq.id);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedDisaster === 'earthquake'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            지진(Earthquake) 대피요령
          </button>
          <button
            onClick={() => {
              setSelectedDisaster('volcano');
              const vc = DISASTER_MANUALS.find((m) => m.disasterType === 'volcano');
              if (vc) setActiveManualId(vc.id);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedDisaster === 'volcano'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            화산(Volcano) 대피요령
          </button>
        </div>
      </div>

      {/* Main Layout: Situation Selector + Detail Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Situation Tabs on Left */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
            재난 발생 위치 / 상황 선택
          </span>
          <div className="space-y-1.5">
            {manuals.map((man) => {
              const isActive = man.id === activeManualId;
              return (
                <button
                  key={man.id}
                  onClick={() => setActiveManualId(man.id)}
                  className={`w-full p-3.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-800 border-amber-500/60 shadow-lg text-white'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2 rounded-lg ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {getIcon(man.icon)}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold">{man.situation}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {man.steps.length}단계 행동 지침
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-600'}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Golden Rules Summary Card */}
          {activeManual && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                이 상황의 3대 골든타임 원칙
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeManual.goldenRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0">{idx + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Japan Evacuation System Guide Note */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
            <h5 className="font-bold text-rose-300 flex items-center gap-1.5">
              <span>🇯🇵 일본 현지 체류 시 대피 상식</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • <strong className="text-slate-200">지정 긴급피난장소 (指定緊急避難場所)</strong>: 지진 흔들림/화재 발생 즉시 목숨을 건지기 위해 피하는 1차 야외 공원 및 운동장.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • <strong className="text-slate-200">지정 피난소 (指定避難所)</strong>: 집이 무너졌을 때 식량과 잠자리를 제공받는 2차 내진 체육관 및 학교 강당.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • <strong className="text-slate-200">화산 퇴피호 (退避舎)</strong>: 사쿠라지마·후지산 등 활화산 지역의 철근 콘크리트 분석 방호 벙커.
            </p>
          </div>
        </div>

        {/* Situation Steps on Right */}
        <div className="lg:col-span-8 space-y-4">
          {activeManual && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                    {getIcon(activeManual.icon)}
                  </div>
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedDisaster === 'earthquake' ? '지진' : '화산'} 대피 매뉴얼
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {activeManual.situation} 대피 가이드
                    </h3>
                  </div>
                </div>

                {/* Voice narration button for this specific manual */}
                <button
                  onClick={() => handleSpeakManual(activeManual)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer self-start sm:self-auto ${
                    speakingManualId === activeManual.id
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>
                    {speakingManualId === activeManual.id ? '음성 안내 중지' : '음성으로 듣기'}
                  </span>
                </button>
              </div>

              {/* Summary Lead */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="text-amber-400 font-bold mr-1">핵심 요약:</span>
                {activeManual.summary}
              </div>

              {/* Numbered Steps */}
              <div className="space-y-4">
                {activeManual.steps.map((step) => (
                  <div
                    key={step.step}
                    className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                          {step.step}
                        </span>
                        <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 pl-8 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="pl-8 flex flex-col sm:flex-row sm:items-center gap-2 pt-1 text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 self-start">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        필수 행동: {step.keyAction}
                      </span>

                      {step.warning && (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 self-start">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          주의: {step.warning}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
