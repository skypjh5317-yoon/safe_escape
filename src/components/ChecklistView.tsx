import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Backpack,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Droplets,
  HardHat,
  HeartPulse,
  Radio,
  Flame,
  Search
} from 'lucide-react';
import { EmergencyItem, DisasterType } from '../types/disaster';
import { INITIAL_CHECKLIST_ITEMS } from '../data/checklists';

interface ChecklistViewProps {
  currentDisaster: DisasterType;
}

const STORAGE_KEY = 'safe_escape_checklist_v1';

export const ChecklistView: React.FC<ChecklistViewProps> = ({ currentDisaster }) => {
  const [items, setItems] = useState<EmergencyItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_CHECKLIST_ITEMS;
  });

  const [filterDisaster, setFilterDisaster] = useState<'all' | 'earthquake' | 'volcano'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New item modal or inline input
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Sync with current disaster if changed
  useEffect(() => {
    setFilterDisaster(currentDisaster);
  }, [currentDisaster]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage limit handle
    }
  }, [items]);

  // Toggle item check
  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  // Add custom item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: EmergencyItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: 'safety_gear',
      description: newItemDesc.trim() || '사용자 추가 개인 비상 물품',
      recommendedQuantity: newItemQty.trim() || '1개',
      targetDisaster: filterDisaster === 'all' ? 'all' : filterDisaster,
      isChecked: true,
      priority: 'high',
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemQty('');
    setIsAdding(false);
  };

  // Delete custom item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset checklist
  const handleResetChecklist = () => {
    if (window.confirm('체크리스트 상태를 초기화하시겠습니까?')) {
      setItems(INITIAL_CHECKLIST_ITEMS);
    }
  };

  // Mark all filtered items as completed
  const handleCheckAll = (checked: boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        const matches =
          (filterDisaster === 'all' || item.targetDisaster === 'all' || item.targetDisaster === filterDisaster) &&
          (selectedCategory === 'all' || item.category === selectedCategory);
        return matches ? { ...item, isChecked: checked } : item;
      })
    );
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesDisaster =
      filterDisaster === 'all' ||
      item.targetDisaster === 'all' ||
      item.targetDisaster === filterDisaster;

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDisaster && matchesCategory && matchesSearch;
  });

  // Calculate preparedness score
  const totalRelevantCount = items.filter(
    (i) => filterDisaster === 'all' || i.targetDisaster === 'all' || i.targetDisaster === filterDisaster
  ).length;

  const checkedRelevantCount = items.filter(
    (i) =>
      (filterDisaster === 'all' || i.targetDisaster === 'all' || i.targetDisaster === filterDisaster) &&
      i.isChecked
  ).length;

  const progressPercentage =
    totalRelevantCount > 0 ? Math.round((checkedRelevantCount / totalRelevantCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Preparedness Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Backpack className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  72시간 생존 비상 배낭 (Go-Bag) 체크리스트
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  재난 발생 시 전기와 수도가 끊긴 상태에서 자력 생존할 수 있도록 배낭을 미리 패킹해 두세요.
                </p>
              </div>
            </div>
          </div>

          {/* Preparedness Score Pill */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">비상 배낭 준비율</span>
              <span className="font-bold text-amber-400">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  progressPercentage >= 80
                    ? 'bg-emerald-500'
                    : progressPercentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>{checkedRelevantCount} / {totalRelevantCount}개 품목 준비</span>
              <span>
                {progressPercentage >= 80
                  ? '안심 수준'
                  : progressPercentage >= 50
                  ? '보강 필요'
                  : '위험 수준'}
              </span>
            </div>
          </div>
        </div>

        {/* Packing Guidelines Quick Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-amber-400 font-bold shrink-0">TIP 1</span>
            <span>배낭은 현관문 바로 앞 또는 신발장 근처 즉시 집을 수 있는 곳에 보관하십시오.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-amber-400 font-bold shrink-0">TIP 2</span>
            <span>배낭 무게는 본인 체중의 10~15% 이내(성인 기준 10kg 미만)로 꾸려야 신속 이동이 가능합니다.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-amber-400 font-bold shrink-0">TIP 3</span>
            <span>생수와 비상식량의 유통기한은 반기별(6개월 주기)로 점검하고 교체하십시오.</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Disaster Mode Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterDisaster('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterDisaster === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            전체 비상물품
          </button>
          <button
            onClick={() => setFilterDisaster('earthquake')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterDisaster === 'earthquake'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            지진 특화용품 (안전모·장갑)
          </button>
          <button
            onClick={() => setFilterDisaster('volcano')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterDisaster === 'volcano'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            화산재 방호용품 (KF94·고글)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCheckAll(true)}
            className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            전체 선택
          </button>
          <button
            onClick={() => handleCheckAll(false)}
            className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            전체 해제
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>물품 직접 추가</span>
          </button>
          <button
            onClick={handleResetChecklist}
            className="p-1.5 text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800 rounded-lg transition cursor-pointer"
            title="기본값 복원"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Custom Item Form */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="bg-slate-900 border border-amber-500/40 p-4 rounded-xl space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              나만의 개인 비상물품 추가
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              취소
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="물품명 (예: 혈압약, 아기 분유, 반려견 사료)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
            <input
              type="text"
              placeholder="권장 수량 (예: 7일분, 2캔)"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="설명 또는 주의사항"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              체크리스트에 추가
            </button>
          </div>
        </form>
      )}

      {/* Items List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 select-none ${
              item.isChecked
                ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                : 'bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-100 shadow-md'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="mt-0.5 shrink-0 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(item.id);
                }}
              >
                {item.isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4
                    className={`text-sm font-bold ${
                      item.isChecked ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {item.name}
                  </h4>

                  {item.priority === 'critical' && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      생존필수
                    </span>
                  )}
                  {item.targetDisaster === 'volcano' && (
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                      화산재전용
                    </span>
                  )}
                  {item.targetDisaster === 'earthquake' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      지진전용
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    권장: {item.recommendedQuantity}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom item delete button */}
            {item.id.startsWith('custom-') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteItem(item.id);
                }}
                className="text-slate-600 hover:text-rose-400 p-1 transition"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
