export type DisasterType = 'earthquake' | 'volcano';

export type ShelterCategory = 'earthquake_outdoor' | 'earthquake_indoor' | 'volcano_indoor' | 'medical_hub';

export interface Shelter {
  id: string;
  name: string;
  nameJp?: string; // 일본어 명칭 (원어 표기)
  country?: 'KR' | 'JP'; // 국가 구분
  type: ShelterCategory;
  address: string;
  lat: number;
  lng: number;
  capacity: number; // 수용 인원 (명)
  phone: string;
  facilities: string[];
  disasterSupport: DisasterType[];
  description: string;
  isSeismicResistant?: boolean;
  hasAirFiltration?: boolean; // 화산재 차단 공기정화 필터
  isOpen24h?: boolean;
}

export interface EmergencyItem {
  id: string;
  name: string;
  category: 'water_food' | 'safety_gear' | 'medical_hygiene' | 'communication' | 'volcano_special' | 'earthquake_special';
  description: string;
  recommendedQuantity: string;
  targetDisaster: 'all' | 'earthquake' | 'volcano';
  isChecked: boolean;
  priority: 'critical' | 'high' | 'medium';
}

export interface EvacuationStep {
  step: number;
  title: string;
  description: string;
  keyAction: string;
  warning?: string;
}

export interface DisasterManual {
  id: string;
  disasterType: DisasterType;
  situation: string; // e.g. "실내(가정/사무실)", "엘리베이터", "실외/거리", "운전 중", "화산재 강하 시"
  icon: string;
  summary: string;
  steps: EvacuationStep[];
  goldenRules: string[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface QuizQuestion {
  id: number;
  disaster: DisasterType;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
