import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Shield,
  Building2,
  Cross,
  Phone,
  Users,
  Compass,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  LocateFixed,
  Route,
  Clock,
  Sparkles
} from 'lucide-react';
import { Shelter, DisasterType, Coordinates } from '../types/disaster';
import {
  INITIAL_SHELTERS,
  DEFAULT_LOCATIONS,
  generateLocalSheltersAround
} from '../data/shelters';
import {
  calculateDistanceKm,
  formatDistance,
  estimateWalkingMinutes
} from '../utils/geo';

interface ShelterMapProps {
  currentDisaster: DisasterType;
}

export const ShelterMap: React.FC<ShelterMapProps> = ({ currentDisaster }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // User coordinates state
  const [userLocation, setUserLocation] = useState<Coordinates>(
    DEFAULT_LOCATIONS.seoul.coords
  );
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('seoul');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Shelters state
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<'all' | 'KR' | 'JP'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sorted shelters with distances
  const sheltersWithDistance = shelters.map((s) => ({
    ...s,
    distanceKm: calculateDistanceKm(userLocation, { lat: s.lat, lng: s.lng }),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  // Filtered shelters
  const filteredShelters = sheltersWithDistance.filter((s) => {
    // Current disaster filter
    const matchesDisaster = s.disasterSupport.includes(currentDisaster);

    // Country filter
    const matchesCountry =
      filterCountry === 'all' ||
      (filterCountry === 'KR' && (s.country === 'KR' || !s.country)) ||
      (filterCountry === 'JP' && s.country === 'JP');

    // Type filter
    const matchesType =
      filterType === 'all' ||
      s.type === filterType ||
      (filterType === 'earthquake_all' && (s.type === 'earthquake_outdoor' || s.type === 'earthquake_indoor')) ||
      (filterType === 'volcano_all' && s.type === 'volcano_indoor');

    // Search query
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameJp && s.nameJp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDisaster && matchesCountry && matchesType && matchesSearch;
  });

  // Nearest shelter
  const nearestShelter = filteredShelters.length > 0 ? filteredShelters[0] : null;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync markers when shelters, userLocation, or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Draw User Location Marker
    const userIcon = L.divIcon({
      className: 'user-location-pin',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: -8px; background: rgba(59, 130, 246, 0.35); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 0; background: #2563eb; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    })
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; font-size: 13px;">
          <b style="color: #2563eb;">현재 사용자 위치</b>
          <p style="margin: 4px 0 0; color: #475569; font-size: 12px;">대피 출발 기준점</p>
        </div>
      `)
      .addTo(markersLayerRef.current);

    // 2. Draw Shelter Markers
    filteredShelters.forEach((shelter) => {
      const isSelected = selectedShelter?.id === shelter.id;

      let bgColor = '#059669'; // Emerald for outdoor
      let label = '옥외';
      if (shelter.type === 'earthquake_indoor') {
        bgColor = '#2563eb'; // Blue for indoor seismic
        label = '실내';
      } else if (shelter.type === 'volcano_indoor') {
        bgColor = '#ea580c'; // Orange for volcano
        label = '화산';
      } else if (shelter.type === 'medical_hub') {
        bgColor = '#dc2626'; // Red for medical
        label = '의료';
      }

      const shelterIcon = L.divIcon({
        className: 'shelter-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${bgColor};
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 6px;
            border: ${isSelected ? '3px solid #facc15' : '2px solid white'};
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            white-space: nowrap;
            cursor: pointer;
            transform: scale(${isSelected ? 1.15 : 1});
            transition: all 0.2s ease;
          ">
            <span>${label} · ${shelter.name.slice(0, 8)}</span>
          </div>
        `,
        iconSize: [100, 30],
        iconAnchor: [50, 15],
      });

      const marker = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon });

      marker.on('click', () => {
        handleSelectShelter(shelter);
      });

      marker.addTo(markersLayerRef.current!);
    });

    // 3. Draw Route Polyline if shelter is selected
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (selectedShelter) {
      // Emergency walking route line
      const latlngs: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        // Waypoint with minor offset for realistic street bend
        [
          (userLocation.lat + selectedShelter.lat) / 2 + 0.0004,
          (userLocation.lng + selectedShelter.lng) / 2 - 0.0003,
        ],
        [selectedShelter.lat, selectedShelter.lng],
      ];

      routeLayerRef.current = L.polyline(latlngs, {
        color: '#f59e0b',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
      }).addTo(map);

      // Fit bounds to show both user and selected shelter
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [selectedShelter.lat, selectedShelter.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [userLocation, filteredShelters, selectedShelter]);

  // Handle Select Shelter
  const handleSelectShelter = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([shelter.lat, shelter.lng], 15);
    }
  };

  // Switch Preset Region
  const handleRegionChange = (key: string) => {
    setSelectedRegionKey(key);
    const target = DEFAULT_LOCATIONS[key];
    if (target) {
      setUserLocation(target.coords);
      setSelectedShelter(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([target.coords.lat, target.coords.lng], 14);
      }
    }
  };

  // Find User's Real GPS Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setSelectedRegionKey('custom');

        // Dynamically add realistic neighborhood shelters around user's exact coords!
        const localShelters = generateLocalSheltersAround(coords);
        setShelters((prev) => {
          // Keep base shelters, prepend dynamic local ones
          return [...localShelters, ...prev.filter((s) => !s.id.startsWith('local-'))];
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([coords.lat, coords.lng], 15);
        }
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Auto Select Closest Shelter
  const handleAutoSelectNearest = () => {
    if (nearestShelter) {
      handleSelectShelter(nearestShelter);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[620px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Sidebar: Shelters List & Route Guidance */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-950 border-r border-slate-800 shrink-0">
        {/* Controls Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              대피소 실시간 레이더
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              검색된 대피소: {filteredShelters.length}곳
            </span>
          </div>

          {/* Country Filter Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <span className="text-[11px] text-slate-400 pl-1 font-medium">국가:</span>
            <button
              onClick={() => setFilterCountry('all')}
              className={`px-2 py-0.5 rounded transition cursor-pointer font-medium ${
                filterCountry === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterCountry('KR')}
              className={`px-2 py-0.5 rounded transition cursor-pointer font-medium flex items-center gap-1 ${
                filterCountry === 'KR'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇰🇷 한국</span>
            </button>
            <button
              onClick={() => setFilterCountry('JP')}
              className={`px-2 py-0.5 rounded transition cursor-pointer font-medium flex items-center gap-1 ${
                filterCountry === 'JP'
                  ? 'bg-rose-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇯🇵 일본</span>
            </button>
          </div>

          {/* Region Switcher Pills & GPS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>기준 위치 설정:</span>
              <button
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium cursor-pointer transition"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? '위치 확인 중...' : '내 GPS 위치로 찾기'}</span>
              </button>
            </div>

            {/* Korea Presets */}
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>🇰🇷 대한민국 방재권역</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(DEFAULT_LOCATIONS)
                  .filter(([_, v]) => v.country === 'KR')
                  .map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => handleRegionChange(k)}
                      className={`px-2 py-1 text-xs rounded-md transition cursor-pointer ${
                        selectedRegionKey === k
                          ? 'bg-amber-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {v.name.split(' ')[0]}
                    </button>
                  ))}
              </div>
            </div>

            {/* Japan Presets */}
            <div className="space-y-1 pt-1 border-t border-slate-800/60">
              <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>🇯🇵 일본 방재권역 (지진·화산 거점)</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(DEFAULT_LOCATIONS)
                  .filter(([_, v]) => v.country === 'JP')
                  .map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => handleRegionChange(k)}
                      className={`px-2 py-1 text-xs rounded-md transition cursor-pointer ${
                        selectedRegionKey === k
                          ? 'bg-rose-600 text-white font-bold shadow'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {v.name.split(' ')[0]}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="대피소명(한글/일본어), 시설 또는 주소 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter Types */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer transition ${
                filterType === 'all'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterType('earthquake_outdoor')}
              className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer transition ${
                filterType === 'earthquake_outdoor'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              옥외 개활지
            </button>
            <button
              onClick={() => setFilterType('earthquake_indoor')}
              className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer transition ${
                filterType === 'earthquake_indoor'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              내진 실내체육관
            </button>
            <button
              onClick={() => setFilterType('volcano_indoor')}
              className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer transition ${
                filterType === 'volcano_indoor'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              화산재 차단쉘터
            </button>
          </div>

          {/* 1-Click Nearest Shelter Action */}
          {nearestShelter && (
            <button
              onClick={handleAutoSelectNearest}
              className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>
                최단거리 {nearestShelter.name.slice(0, 10)}... (
                {formatDistance(nearestShelter.distanceKm)} / 도보 {estimateWalkingMinutes(nearestShelter.distanceKm)}분) 즉시 길안내
              </span>
            </button>
          )}
        </div>

        {/* Shelter List Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1 max-h-[380px] lg:max-h-none">
          {filteredShelters.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              조건에 맞는 대피소가 없습니다. 필터를 변경해 보세요.
            </div>
          ) : (
            filteredShelters.map((shelter) => {
              const isSelected = selectedShelter?.id === shelter.id;
              const walkingMin = estimateWalkingMinutes(shelter.distanceKm);

              return (
                <div
                  key={shelter.id}
                  onClick={() => handleSelectShelter(shelter)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/50'
                      : 'hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {shelter.country === 'JP' ? (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold border border-rose-500/30">
                            🇯🇵 일본
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-500/30">
                            🇰🇷 한국
                          </span>
                        )}
                        {shelter.type === 'earthquake_outdoor' && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-medium border border-emerald-500/30">
                            지진 옥외공터
                          </span>
                        )}
                        {shelter.type === 'earthquake_indoor' && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium border border-blue-500/30">
                            내진 실내구호소
                          </span>
                        )}
                        {shelter.type === 'volcano_indoor' && (
                          <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-medium border border-orange-500/30">
                            화산재 밀폐쉘터
                          </span>
                        )}
                        {shelter.type === 'medical_hub' && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium border border-red-500/30">
                            응급의료센터
                          </span>
                        )}
                        {shelter.isSeismicResistant && (
                          <span className="text-[10px] text-slate-400">내진1등급</span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-100 mt-1 flex items-baseline gap-1.5 flex-wrap">
                        <span>{shelter.name}</span>
                        {shelter.nameJp && (
                          <span className="text-[11px] font-normal text-slate-400">({shelter.nameJp})</span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {shelter.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-amber-400">
                        {formatDistance(shelter.distanceKm)}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>도보 {walkingMin}분</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-1.5">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      수용 {shelter.capacity.toLocaleString()}명
                    </span>
                    <span className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5">
                      대피 경로 안내 보기 &rarr;
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Map Canvas & Selected Shelter Guide Panel */}
      <div className="flex-1 flex flex-col relative min-h-[420px]">
        {/* Map Container */}
        <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[380px] z-0" />

        {/* Selected Shelter Floating Guide Card */}
        {selectedShelter && (
          <div className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto bg-slate-950/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-4 shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                    선택된 목적지
                  </span>
                  <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                    <Route className="w-3.5 h-3.5" />
                    직선거리 {formatDistance(calculateDistanceKm(userLocation, { lat: selectedShelter.lat, lng: selectedShelter.lng }))} · 예상 도보 {estimateWalkingMinutes(calculateDistanceKm(userLocation, { lat: selectedShelter.lat, lng: selectedShelter.lng }))}분
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1 flex items-baseline gap-2 flex-wrap">
                  <span>{selectedShelter.name}</span>
                  {selectedShelter.nameJp && (
                    <span className="text-xs font-normal text-rose-300">({selectedShelter.nameJp})</span>
                  )}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedShelter.address}
                </p>
              </div>

              <button
                onClick={() => setSelectedShelter(null)}
                className="text-slate-400 hover:text-slate-200 p-1 text-xs cursor-pointer"
              >
                닫기 ✕
              </button>
            </div>

            {/* Description & Amenities */}
            <p className="text-xs text-slate-300 mt-2 bg-slate-900/80 p-2 rounded border border-slate-800">
              {selectedShelter.description}
            </p>

            {/* Facilities Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {selectedShelter.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {fac}
                </span>
              ))}
            </div>

            {/* Step-by-Step Walking Guidance Action */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>건물 외벽 낙하물에 주의하며 큰 도로를 따라 이동하십시오.</span>
              </div>

              <a
                href={`tel:${selectedShelter.phone}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium border border-slate-700 transition"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>{selectedShelter.phone}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
