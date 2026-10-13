import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Radio,
  Flame,
  Activity,
  BellRing
} from 'lucide-react';
import { DisasterType } from '../types/disaster';
import { speechBroadcaster, EMERGENCY_BROADCAST_SCRIPTS } from '../utils/speech';
import { soundSynth } from '../utils/audio';

interface VoiceAlertBannerProps {
  disasterType: DisasterType;
  autoTrigger?: boolean;
}

export const VoiceAlertBanner: React.FC<VoiceAlertBannerProps> = ({
  disasterType,
  autoTrigger = false,
}) => {
  const [broadcastLang, setBroadcastLang] = useState<'ko' | 'ja'>('ko');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [rate, setRate] = useState(0.95);
  const [volume, setVolume] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const isMountedRef = useRef(true);

  const currentScript = EMERGENCY_BROADCAST_SCRIPTS[broadcastLang][disasterType];

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      speechBroadcaster.stop();
      soundSynth.stopSiren();
    };
  }, []);

  // When disaster type switches, stop existing speech
  useEffect(() => {
    if (isPlayingVoice) {
      speechBroadcaster.stop();
      setIsPlayingVoice(false);
    }
    if (isSirenActive) {
      soundSynth.stopSiren();
      setIsSirenActive(false);
    }
  }, [disasterType]);

  const handleStartVoice = () => {
    // Play introductory emergency EAS alert chime, then broadcast voice
    soundSynth.playAlertChime(() => {
      if (!isMountedRef.current) return;
      speechBroadcaster.speak(currentScript.script, {
        lang: broadcastLang === 'ko' ? 'ko-KR' : 'ja-JP',
        rate,
        volume,
        repeat,
        onStart: () => setIsPlayingVoice(true),
        onEnd: () => {
          if (!repeat) setIsPlayingVoice(false);
        },
        onError: () => setIsPlayingVoice(false),
      });
    });
  };

  const handleStopVoice = () => {
    speechBroadcaster.stop();
    setIsPlayingVoice(false);
  };

  const handleToggleSiren = () => {
    if (isSirenActive) {
      soundSynth.stopSiren();
      setIsSirenActive(false);
    } else {
      soundSynth.startSiren(0.35);
      setIsSirenActive(true);
    }
  };

  return (
    <div
      className={`relative border-b transition-colors duration-300 ${
        disasterType === 'earthquake'
          ? 'bg-amber-950/20 border-amber-500/30'
          : 'bg-rose-950/25 border-rose-500/30'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Disaster Broadcast Status */}
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-lg shrink-0 flex items-center justify-center ${
                disasterType === 'earthquake'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
              }`}
            >
              {disasterType === 'earthquake' ? (
                <Activity className="w-5 h-5" />
              ) : (
                <Flame className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded tracking-wide ${
                    disasterType === 'earthquake'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-rose-600 text-white font-bold'
                  }`}
                >
                  {disasterType === 'earthquake' ? '지진 긴급경보' : '화산폭발 경보'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {isPlayingVoice ? '● 음성 대피방송 송출 중' : '음성 경보 대기 상태'}
                </span>
                {isSirenActive && (
                  <span className="text-xs font-semibold text-rose-400 animate-pulse flex items-center gap-1">
                    <BellRing className="w-3.5 h-3.5" />
                    사이렌 작동 중
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 mt-0.5">
                {currentScript.title}
              </h2>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 max-w-2xl">
                {currentScript.summary}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center flex-wrap gap-2 pt-1 md:pt-0">
            {/* Play/Stop Voice Button */}
            {!isPlayingVoice ? (
              <button
                onClick={handleStartVoice}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg shadow transition cursor-pointer ${
                  disasterType === 'earthquake'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
                title="음성 경보 방송 시작"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>경고 음성 방송 시작</span>
              </button>
            ) : (
              <button
                onClick={handleStopVoice}
                className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/40 shadow transition cursor-pointer"
                title="음성 방송 중지"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>음성 방송 중지</span>
              </button>
            )}

            {/* Emergency Siren Toggle */}
            <button
              onClick={handleToggleSiren}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition cursor-pointer ${
                isSirenActive
                  ? 'bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="비상 사이렌 토글"
            >
              <BellRing className={`w-4 h-4 ${isSirenActive ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>{isSirenActive ? '사이렌 끄기' : '비상 사이렌'}</span>
            </button>

            {/* Broadcast Language Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => {
                  setBroadcastLang('ko');
                  if (isPlayingVoice) speechBroadcaster.stop();
                  setIsPlayingVoice(false);
                }}
                className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                  broadcastLang === 'ko'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="한국어 경보 방송"
              >
                🇰🇷 한국어
              </button>
              <button
                onClick={() => {
                  setBroadcastLang('ja');
                  if (isPlayingVoice) speechBroadcaster.stop();
                  setIsPlayingVoice(false);
                }}
                className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                  broadcastLang === 'ja'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="일본어 경보 방송 (日本語放送)"
              >
                🇯🇵 日本語
              </button>
            </div>

            {/* Repeat Toggle */}
            <button
              onClick={() => setRepeat(!repeat)}
              className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border transition cursor-pointer ${
                repeat
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700'
              }`}
              title="반복 방송 여부"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{repeat ? '반복 ON' : '1회'}</span>
            </button>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-700 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="음성 설정"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time speech wave animation when broadcasting */}
        {isPlayingVoice && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-slate-300 font-mono">
                비상 음성 대피 방송 송출 중 ({broadcastLang === 'ko' ? '한국어' : '日本語'}):
              </span>
              <span className="text-slate-200 italic font-medium hidden sm:inline truncate max-w-lg">
                &ldquo;{currentScript.script.slice(0, 52)}...&rdquo;
              </span>
            </div>

            {/* Visualizer bars */}
            <div className="flex items-end gap-1 h-4">
              {[40, 90, 60, 100, 75, 45, 85, 30].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                  className={`w-1 rounded-full animate-bounce ${
                    disasterType === 'earthquake' ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Audio rate / volume slide-out settings */}
        {showSettings && (
          <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">말하기 속도:</span>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-slate-200">{rate}x</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">볼륨:</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-slate-200">{Math.round(volume * 100)}%</span>
            </div>

            <div className="text-slate-400 text-xs ml-auto">
              Web Speech API (ko-KR) 한국어 표준 음성 엔진 탑재
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
