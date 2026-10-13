import React from 'react';
import {
  ShieldAlert,
  Activity,
  Flame,
  MapPin,
  CheckSquare,
  BookOpen,
  AlertOctagon,
  Award,
  PhoneCall
} from 'lucide-react';
import { DisasterType } from '../types/disaster';

interface NavbarProps {
  currentDisaster: DisasterType;
  onSelectDisaster: (type: DisasterType) => void;
  activeTab: 'map' | 'checklist' | 'manual';
  onSelectTab: (tab: 'map' | 'checklist' | 'manual') => void;
  onOpenSos: () => void;
  onOpenQuiz: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDisaster,
  onSelectDisaster,
  activeTab,
  onSelectTab,
  onOpenSos,
  onOpenQuiz,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Disaster Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  긴급재난 대피 알리미
                </span>
                <span className="text-[10px] bg-slate-800 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-slate-700 hidden sm:inline">
                  SafeEscape
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                지진·화산 실시간 음성 경보 & 대피소 길안내 시스템
              </p>
            </div>
          </div>

          {/* Main Feature Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>대피소 지도</span>
            </button>
            <button
              onClick={() => onSelectTab('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>비상 물품</span>
            </button>
            <button
              onClick={() => onSelectTab('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>대피 방법</span>
            </button>
          </nav>

          {/* Emergency Disaster Selector & SOS triggers */}
          <div className="flex items-center gap-2">
            {/* Disaster Type Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => onSelectDisaster('earthquake')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  currentDisaster === 'earthquake'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="지진 모드 전환"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden md:inline">지진</span>
              </button>
              <button
                onClick={() => onSelectDisaster('volcano')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  currentDisaster === 'volcano'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="화산 폭발 모드 전환"
              >
                <Flame className="w-3.5 h-3.5" />
                <span className="hidden md:inline">화산</span>
              </button>
            </div>

            {/* Quiz Button */}
            <button
              onClick={onOpenQuiz}
              className="p-2 text-slate-300 hover:text-amber-400 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition cursor-pointer hidden sm:flex items-center gap-1 text-xs"
              title="대피 퀴즈 풀기"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">안전퀴즈</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-extrabold shadow-lg shadow-rose-600/30 transition cursor-pointer animate-pulse"
              title="긴급 구조 SOS 도구"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>긴급 SOS</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
