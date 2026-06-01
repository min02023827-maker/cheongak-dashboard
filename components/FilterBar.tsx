'use client';

const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

interface FilterBarProps {
  region: string;
  status: string;
  onRegionChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}

export default function FilterBar({ region, status, onRegionChange, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div>
        <label className="text-sm text-gray-500 mr-2">지역</label>
        <select
          value={region}
          onChange={e => onRegionChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-500 mr-2">상태</label>
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="전체">전체</option>
          <option value="접수중">접수중</option>
          <option value="예정">예정</option>
          <option value="마감">마감</option>
        </select>
      </div>
    </div>
  );
}
