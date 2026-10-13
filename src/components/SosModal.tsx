import React, { useState, useEffect } from 'react';
import {
  Phone,
  Volume2,
  Flashlight,
  ShieldAlert,
  X,
  HelpCircle,
  AlertOctagon,
  BellRing
} from 'lucide-react';
import { soundSynth } from '../utils/audio';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [strobeState, setStrobeState] = useState(false);
  const [isSirenOn, setIsSirenOn] = useState(false);

  // Strobe flashing loop for screen flashlight
  useEffect(() => {
    let timer: number;
    if (isStrobeActive) {
      timer = window.setInterval(() => {
        setStrobeState((prev) => !prev);
      }, 150);
    } else {
      setStrobeState(false);
    }
    return () => clearInterval(timer);
  }, [isStrobeActive]);

  useEffect(() => {
    return () => {
      soundSynth.stopSiren();
    };
  }, []);

  if (!isOpen) return null;

  const handleWhistle = () => {
    soundSynth.playWhistle();
  };

  const handleToggleSiren = () => {
    if (isSirenOn) {
      soundSynth.stopSiren();
      setIsSirenOn(false);
    } else {
      soundSynth.startSiren(0.5);
      setIsSirenOn(true);
    }
  };

  const [contactCountry, setContactCountry] = useState<'KR' | 'JP'>('KR');

  const koreaContacts = [
    { name: '소방청 재난신고 및 구조', number: '119', desc: '화재·구조·응급환자 발생 즉시' },
    { name: '경찰청 긴급신고', number: '112', desc: '치안 및 긴급 대피 통제' },
    { name: '행정안전부 중앙재난안전상황실', number: '044-205-1119', desc: '국가 재난 종합 상황' },
    { name: '기상청 지진화산감시과', number: '02-2181-0682', desc: '지진 규모 및 화산 분화 속보' },
    { name: '질병관리청 응급의료정보센터', number: '1339', desc: '응급처치 안내 및 병원 안내' },
  ];

  const japanContacts = [
    { name: '일본 소방·구급 (消防・救急)', number: '119', desc: '일본 현지 화재·인명구조·구급차' },
    { name: '일본 경찰 긴급통보 (警察)', number: '110', desc: '일본 현지 경찰 긴급 신고' },
    { name: '재해용 전언 다이얼 (災害用伝言ダイヤル)', number: '171', desc: '통신 마비 시 음성 안부 녹음/확인' },
    { name: '일본정부관광국(JNTO) 24시간 재난상담', number: '+81-50-3816-2720', desc: '한국어 대응 외국인 24시간 긴급 콜센터' },
    { name: '대한민국 외교부 영사콜센터', number: '+82-2-3210-0404', desc: '해외 체류 국민 긴급 재난 구조 지원' },
  ];

  const activeContacts = contactCountry === 'KR' ? koreaContacts : japanContacts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      {/* High-intensity screen flashlight strobe overlay if triggered */}
      {isStrobeActive && (
        <div
          className={`fixed inset-0 z-50 pointer-events-none transition-colors duration-75 ${
            strobeState ? 'bg-white' : 'bg-black'
          }`}
        />
      )}

      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/50 rounded-2xl p-6 shadow-2xl z-50 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">긴급 SOS & 비상 구조 도구</h3>
          </div>
          <button
            onClick={() => {
              if (isSirenOn) soundSynth.stopSiren();
              setIsStrobeActive(false);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rescue Audio & Light Signals */}
        <div className="grid grid-cols-2 gap-3">
          {/* Rescue Whistle */}
          <button
            onClick={handleWhistle}
            className="p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-500 rounded-xl text-center space-y-1.5 transition cursor-pointer active:scale-95"
          >
            <Volume2 className="w-6 h-6 mx-auto text-amber-400" />
            <div className="text-xs font-bold text-white">비상 호각 (고주파 신호)</div>
            <div className="text-[10px] text-slate-400">갇혔을 때 체력 보존 구조 요청</div>
          </button>

          {/* Flashlight Strobe */}
          <button
            onClick={() => setIsStrobeActive(!isStrobeActive)}
            className={`p-3.5 border rounded-xl text-center space-y-1.5 transition cursor-pointer active:scale-95 ${
              isStrobeActive
                ? 'bg-amber-500 text-slate-950 border-white font-bold animate-pulse'
                : 'bg-slate-950 border-slate-800 hover:border-amber-500 text-white'
            }`}
          >
            <Flashlight className="w-6 h-6 mx-auto text-amber-400" />
            <div className="text-xs font-bold">
              {isStrobeActive ? '화면 점멸 스트로브 끄기' : '화면 SOS 스트로브 점멸'}
            </div>
            <div className={`text-[10px] ${isStrobeActive ? 'text-slate-900' : 'text-slate-400'}`}>
              야간 정전 시 구조대 신호용
            </div>
          </button>
        </div>

        {/* Emergency Siren Button */}
        <button
          onClick={handleToggleSiren}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
            isSirenOn
              ? 'bg-rose-600 text-white border-white animate-pulse'
              : 'bg-rose-950/40 text-rose-300 border-rose-500/50 hover:bg-rose-900/40'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>{isSirenOn ? '비상 경보 사이렌 멈추기' : '비상 대피 사이렌 연속 울리기'}</span>
        </button>

        {/* Emergency Hotlines One-Touch Call */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              비상 긴급 연락망 (원클릭 통화)
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setContactCountry('KR')}
                className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                  contactCountry === 'KR'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇰🇷 한국
              </button>
              <button
                onClick={() => setContactCountry('JP')}
                className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                  contactCountry === 'JP'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇯🇵 일본
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {activeContacts.map((contact, i) => (
              <a
                key={i}
                href={`tel:${contact.number}`}
                className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-xs transition"
              >
                <div>
                  <div className="font-bold text-slate-200">{contact.name}</div>
                  <div className="text-[11px] text-slate-400">{contact.desc}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold rounded">
                  <Phone className="w-3 h-3" />
                  <span>{contact.number}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
