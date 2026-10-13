import React, { useState } from 'react';
import {
  DisasterType
} from './types/disaster';
import { Navbar } from './components/Navbar';
import { VoiceAlertBanner } from './components/VoiceAlertBanner';
import { ShelterMap } from './components/ShelterMap';
import { ChecklistView } from './components/ChecklistView';
import { ManualView } from './components/ManualView';
import { SosModal } from './components/SosModal';
import { QuizModal } from './components/QuizModal';
import {
  Phone,
  ShieldAlert,
  Info,
  Radio,
  ExternalLink,
  Flame,
  Activity,
  HeartHandshake
} from 'lucide-react';

export default function App() {
  const [currentDisaster, setCurrentDisaster] = useState<DisasterType>('earthquake');
  const [activeTab, setActiveTab] = useState<'map' | 'checklist' | 'manual'>('map');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header Navbar */}
      <Navbar
        currentDisaster={currentDisaster}
        onSelectDisaster={setCurrentDisaster}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
      />

      {/* 2. Emergency Voice Warning & Siren Broadcast Banner */}
      <VoiceAlertBanner disasterType={currentDisaster} />

      {/* 3. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Disaster Status Kicker Card */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1.5 ${
                currentDisaster === 'earthquake'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {currentDisaster === 'earthquake' ? (
                <>
                  <Activity className="w-4 h-4" />
                  <span>현재 감시대상: 규모 6.0급 강진 대비 모드</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>현재 감시대상: 화산 폭발 및 화산재 낙하 대비 모드</span>
                </>
              )}
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              상단 탭에서 대피소 지도, 72시간 비상물품, 상황별 행동요령을 신속히 확인하십시오.
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono">실시간 방재 시스템 가동 중</span>
          </div>
        </div>

        {/* Tab 1: Shelter Map */}
        {activeTab === 'map' && <ShelterMap currentDisaster={currentDisaster} />}

        {/* Tab 2: Emergency Checklist */}
        {activeTab === 'checklist' && <ChecklistView currentDisaster={currentDisaster} />}

        {/* Tab 3: Situation Evacuation Manual */}
        {activeTab === 'manual' && <ManualView currentDisaster={currentDisaster} />}
      </main>

      {/* 4. Footer & Disaster Hotline Bar */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-200">
              긴급재난 대피 알리미 (SafeEscape)
            </span>
            <span>· 행정안전부 국민행동요령 및 지진·화산 방재 지침 준수</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-slate-400">
            <a
              href="tel:119"
              className="hover:text-rose-400 flex items-center gap-1 transition"
            >
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>재난신고 119</span>
            </a>
            <a
              href="tel:112"
              className="hover:text-amber-400 flex items-center gap-1 transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>경찰 112</span>
            </a>
            <a
              href="tel:1339"
              className="hover:text-sky-400 flex items-center gap-1 transition"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-sky-400" />
              <span>응급의료 1339</span>
            </a>
          </div>
        </div>
      </footer>

      {/* SOS Modal */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />

      {/* Quiz Modal */}
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </div>
  );
}
