'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, CartesianGrid, Cell,
} from 'recharts';

// ── 타입 ────────────────────────────────────────────────
interface CompetitionStat {
  STAT_DE: string;
  SUBSCRPT_AREA_CODE_NM: string;
  SUBSCRPT_AREA_CODE: string;
  SUPLY_CMPET_RATE: string;
  SPSPLY_CMPET_RATE: string;
  SUPLY_HSHLDCO: number;
  SUPLY_REQ_CNT: number;
}
interface AgeStat {
  STAT_DE: string;
  SUBSCRPT_AREA_CODE_NM: string;
  AGE_30: number; AGE_40: number; AGE_50: number; AGE_60: number;
}
interface ScoreStat {
  STAT_DE: string;
  SUBSCRPT_AREA_CODE_NM: string;
  RESIDE_SECD: string;
  AVRG_SCORE: number;
  TOP_SCORE: number;
  LWET_SCORE: number;
  MED_SCORE: number;
}

// ── 공통 섹션 헤더 ──────────────────────────────────────
function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
        {sub && <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '5px 0 0' }}>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

// ── 로딩 스켈레톤 ────────────────────────────────────────
function Skeleton({ h = 280 }: { h?: number }) {
  return <div style={{ height: h, background: 'var(--chip)', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />;
}

// ── 커스텀 Tooltip ──────────────────────────────────────
function ChartTooltip({ active, payload, label, unit = '' }: { active?: boolean; payload?: {name: string; value: number; color: string}[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{unit}</div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// ① 지역별 경쟁률 비교
// ────────────────────────────────────────────────────────
function RegionCompetition({ data }: { data: CompetitionStat[] }) {
  const latestMonth = data.reduce((m, d) => d.STAT_DE > m ? d.STAT_DE : m, '');
  const latest = data.filter(d => d.STAT_DE === latestMonth);

  const chartData = latest
    .map(d => ({
      name: d.SUBSCRPT_AREA_CODE_NM,
      일반공급: parseFloat(d.SUPLY_CMPET_RATE) || 0,
      특별공급: parseFloat(d.SPSPLY_CMPET_RATE) || 0,
    }))
    .filter(d => d.일반공급 > 0)
    .sort((a, b) => b.일반공급 - a.일반공급);

  const maxVal = Math.max(...chartData.map(d => d.일반공급), 1);
  const statLabel = `${latestMonth.slice(0, 4)}년 ${latestMonth.slice(4)}월`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {chartData.slice(0, 3).map((d, i) => (
          <div key={d.name} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>
              {['🥇', '🥈', '🥉'][i]} {d.name}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {d.일반공급.toFixed(1)}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}> : 1</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>일반공급 경쟁률</div>
          </div>
        ))}
      </div>

      {/* 바 차트 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{statLabel} 기준 · 일반공급 경쟁률 높은 순</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} unit="배" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={36} />
            <Tooltip content={<ChartTooltip unit="배" />} />
            <Bar dataKey="일반공급" radius={[0, 6, 6, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.일반공급 === maxVal ? '#2563eb' : '#93c5fd'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 일반 vs 특별공급 비교 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>일반공급 vs 특별공급 경쟁률 비교</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11 }} unit="배" />
            <Tooltip content={<ChartTooltip unit="배" />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="일반공급" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="특별공급" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// ② 신청자 vs 당첨자 연령대 비교
// ────────────────────────────────────────────────────────
function AgeComparison({ reqst, przwner }: { reqst: AgeStat[]; przwner: AgeStat[] }) {
  const latestReqst = reqst.reduce((m, d) => d.STAT_DE > m ? d.STAT_DE : m, '');
  const latestPrzwner = przwner.reduce((m, d) => d.STAT_DE > m ? d.STAT_DE : m, '');

  // 전국 합산
  const sumAge = (list: AgeStat[], month: string) => {
    const rows = list.filter(d => d.STAT_DE === month);
    return {
      '30대': rows.reduce((s, d) => s + (d.AGE_30 || 0), 0),
      '40대': rows.reduce((s, d) => s + (d.AGE_40 || 0), 0),
      '50대': rows.reduce((s, d) => s + (d.AGE_50 || 0), 0),
      '60대+': rows.reduce((s, d) => s + (d.AGE_60 || 0), 0),
    };
  };

  const reqstTotals = sumAge(reqst, latestReqst);
  const przwnerTotals = sumAge(przwner, latestPrzwner);
  const reqstTotal = Object.values(reqstTotals).reduce((a, b) => a + b, 0);
  const przwnerTotal = Object.values(przwnerTotals).reduce((a, b) => a + b, 0);

  const ages = ['30대', '40대', '50대', '60대+'] as const;
  const chartData = ages.map(age => ({
    name: age,
    신청비율: reqstTotal ? Math.round((reqstTotals[age] / reqstTotal) * 100) : 0,
    당첨비율: przwnerTotal ? Math.round((przwnerTotals[age] / przwnerTotal) * 100) : 0,
    신청건수: reqstTotals[age],
    당첨건수: przwnerTotals[age],
  }));

  // 지역별 30대 신청 비율
  const latestRegions = reqst.filter(d => d.STAT_DE === latestReqst).map(d => {
    const total = (d.AGE_30 || 0) + (d.AGE_40 || 0) + (d.AGE_50 || 0) + (d.AGE_60 || 0);
    return {
      name: d.SUBSCRPT_AREA_CODE_NM,
      '30대 비율': total ? Math.round(((d.AGE_30 || 0) / total) * 100) : 0,
    };
  }).sort((a, b) => b['30대 비율'] - a['30대 비율']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 인사이트 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 6 }}>📊 가장 많이 신청하는 연령대</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>
            {chartData.sort((a, b) => b.신청비율 - a.신청비율)[0]?.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            전체 신청자의 {chartData.sort((a, b) => b.신청비율 - a.신청비율)[0]?.신청비율}%
          </div>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>🏆 당첨률 가장 높은 연령대</div>
          {(() => {
            const ranked = [...chartData].sort((a, b) => {
              const ra = a.신청비율 > 0 ? a.당첨비율 / a.신청비율 : 0;
              const rb = b.신청비율 > 0 ? b.당첨비율 / b.신청비율 : 0;
              return rb - ra;
            });
            const top = ranked[0];
            const ratio = top.신청비율 > 0 ? (top.당첨비율 / top.신청비율).toFixed(2) : '—';
            return (
              <>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{top.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>신청 대비 당첨 {ratio}배</div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 신청 vs 당첨 비율 비교 바차트 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>연령대별 신청비율 vs 당첨비율 (%)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip content={<ChartTooltip unit="%" />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="신청비율" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            <Bar dataKey="당첨비율" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--muted)' }}>
          💡 막대가 신청비율보다 당첨비율이 높을수록 경쟁 우위 연령대
        </p>
      </div>

      {/* 지역별 30대 신청 비율 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>지역별 30대 신청 비율 (청년 수요 지표)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {latestRegions.map(r => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 48px', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{r.name}</div>
              <div style={{ position: 'relative', height: 22, background: 'var(--chip)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0, width: r['30대 비율'] + '%',
                  background: r['30대 비율'] > 60 ? '#2563eb' : '#93c5fd',
                  borderRadius: 6, transition: 'width .5s',
                }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {r['30대 비율']}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// ③ 지역별 당첨 가점 분포
// ────────────────────────────────────────────────────────
function ScoreDistribution({ data }: { data: ScoreStat[] }) {
  // 해당지역(01) 기준, 최신 월
  const latestMonth = data.reduce((m, d) => d.STAT_DE > m ? d.STAT_DE : m, '');
  const latest = data.filter(d => d.STAT_DE === latestMonth && d.RESIDE_SECD === '01');

  const chartData = latest
    .filter(d => d.AVRG_SCORE > 0)
    .map(d => ({
      name: d.SUBSCRPT_AREA_CODE_NM,
      평균: Math.round(d.AVRG_SCORE),
      최고: d.TOP_SCORE,
      최저: d.LWET_SCORE,
    }))
    .sort((a, b) => b.평균 - a.평균);

  const statLabel = `${latestMonth.slice(0, 4)}년 ${latestMonth.slice(4)}월`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>🏆 가점 가장 높은 지역</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{chartData[0]?.name}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            {chartData[0]?.평균}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>점</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>최고 {chartData[0]?.최고}점</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>💚 가점 가장 낮은 지역</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{chartData[chartData.length - 1]?.name}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
            {chartData[chartData.length - 1]?.평균}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>점</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>최고 {chartData[chartData.length - 1]?.최고}점</div>
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, marginBottom: 4 }}>📌 전국 평균 가점</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            {chartData.length ? Math.round(chartData.reduce((s, d) => s + d.평균, 0) / chartData.length) : '—'}
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>점</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{statLabel} · 해당지역 기준</div>
        </div>
      </div>

      {/* 가점 범위 시각화 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>지역별 당첨 가점 범위 (최저 ~ 최고, ●평균)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {chartData.map(d => (
            <div key={d.name} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{d.name}</div>
              <div style={{ position: 'relative', height: 12, background: 'var(--chip)', borderRadius: 999 }}>
                {/* 최저~최고 범위 바 */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${(d.최저 / 84) * 100}%`,
                  right: `${(1 - d.최고 / 84) * 100}%`,
                  background: 'var(--accent)', opacity: 0.25, borderRadius: 999,
                }} />
                {/* 평균 점 */}
                <div style={{
                  position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                  left: `${(d.평균 / 84) * 100}%`,
                  width: 14, height: 14, borderRadius: 999,
                  background: 'var(--accent)', border: '2px solid var(--surface)',
                }} />
              </div>
              <div style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-soft)' }}>
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{d.평균}</span>점
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>({d.최저}~{d.최고})</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--muted)' }}>
          💡 84점 만점 기준 · 해당지역 거주자 기준 · 일반공급 가점제 당첨선
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// ④ 월별 경쟁률 트렌드
// ────────────────────────────────────────────────────────
const TOP_REGIONS = ['서울', '경기', '인천', '부산', '대구'];

function TrendChart({ data }: { data: CompetitionStat[] }) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['서울', '경기', '부산']);
  const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed'];

  // 월별 x 지역 피벗
  const months = [...new Set(data.map(d => d.STAT_DE))].sort();
  const recentMonths = months.slice(-8);

  const chartData = recentMonths.map(month => {
    const row: Record<string, string | number> = { month: `${month.slice(0, 4)}.${month.slice(4)}` };
    TOP_REGIONS.forEach(region => {
      const found = data.find(d => d.STAT_DE === month && d.SUBSCRPT_AREA_CODE_NM === region);
      row[region] = found ? (parseFloat(found.SUPLY_CMPET_RATE) || 0) : 0;
    });
    return row;
  });

  const toggleRegion = (r: string) => {
    setSelectedRegions(prev =>
      prev.includes(r) ? (prev.length > 1 ? prev.filter(x => x !== r) : prev) : [...prev, r]
    );
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px' }}>
      {/* 지역 토글 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>지역 선택</span>
        {TOP_REGIONS.map((r, i) => {
          const on = selectedRegions.includes(r);
          return (
            <button key={r} onClick={() => toggleRegion(r)} style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', border: 'none',
              background: on ? COLORS[i] : 'var(--chip)',
              color: on ? '#fff' : 'var(--muted)',
            }}>{r}</button>
          );
        })}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="배" />
          <Tooltip content={<ChartTooltip unit="배" />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {TOP_REGIONS.map((r, i) =>
            selectedRegions.includes(r) ? (
              <Line key={r} type="monotone" dataKey={r} stroke={COLORS[i]}
                strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
      <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--muted)' }}>
        일반공급 경쟁률 월별 추이 · 최근 8개월
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 메인 페이지
// ────────────────────────────────────────────────────────
export default function AnalysisPage() {
  const [competition, setCompetition] = useState<CompetitionStat[]>([]);
  const [reqst, setReqst] = useState<AgeStat[]>([]);
  const [przwner, setPrzwner] = useState<AgeStat[]>([]);
  const [score, setScore] = useState<ScoreStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats/competition').then(r => r.json()),
      fetch('/api/stats/reqst').then(r => r.json()),
      fetch('/api/stats/przwner').then(r => r.json()),
      fetch('/api/stats/score').then(r => r.json()),
    ]).then(([comp, req, prz, scr]) => {
      setCompetition(comp.data ?? []);
      setReqst(req.data ?? []);
      setPrzwner(prz.data ?? []);
      setScore(scr.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* 헤더 */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>청약 ON</span>
          </div>
          <nav style={{ display: 'flex', gap: 28 }}>
            <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>청약 캘린더</Link>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}>경쟁률 분석</span>
            <Link href="/favorites" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>관심단지</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 28px 80px' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 8px' }}>경쟁률 분석</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>한국부동산원 청약홈 통계 데이터 기반 · 매월 26일 업데이트</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            <Skeleton h={320} /><Skeleton h={380} /><Skeleton h={280} /><Skeleton h={320} />
          </div>
        ) : (
          <>
            <Section title="① 지역별 경쟁률 비교" sub="어느 지역이 가장 치열한가">
              <RegionCompetition data={competition} />
            </Section>

            <Section title="② 연령대별 신청자 vs 당첨자" sub="많이 신청하는 연령대와 실제 당첨되는 연령대가 다르다">
              <AgeComparison reqst={reqst} przwner={przwner} />
            </Section>

            <Section title="③ 지역별 당첨 가점 분포" sub="내 가점으로 어느 지역이 유리할까 (84점 만점 · 해당지역 거주자 기준)">
              <ScoreDistribution data={score} />
            </Section>

            <Section title="④ 월별 경쟁률 트렌드" sub="청약 시장이 뜨거워지고 있을까, 식고 있을까">
              <TrendChart data={competition} />
            </Section>
          </>
        )}
      </main>
    </div>
  );
}
