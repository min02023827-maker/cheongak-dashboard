'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

// ── 가점 계산 로직 ──────────────────────────────────────
function calcHomeless(years: number) {
  if (years < 1) return 2;
  return Math.min(2 + years * 2, 32);
}
function calcDependents(count: number) {
  return Math.min(5 + count * 5, 35);
}
function calcAccount(months: number) {
  if (months < 6) return 1;
  if (months < 12) return 2;
  const years = Math.floor(months / 12);
  return Math.min(2 + years, 17);
}

// ── 점수 등급 ────────────────────────────────────────────
function getGrade(score: number): { label: string; color: string; bg: string; desc: string } {
  if (score >= 70) return { label: '매우 높음', color: '#16a34a', bg: '#f0fdf4', desc: '서울·수도권 인기 단지도 도전해볼 만해요' };
  if (score >= 55) return { label: '높음', color: '#2563eb', bg: '#eff6ff', desc: '수도권·광역시 대부분 지역에서 경쟁력 있어요' };
  if (score >= 40) return { label: '보통', color: '#d97706', bg: '#fffbeb', desc: '지방 중소도시나 비인기 단지 위주로 도전해보세요' };
  return { label: '낮음', color: '#dc2626', bg: '#fef2f2', desc: '가점제보다 추첨제 물량이 많은 단지를 노려보세요' };
}

// ── 숫자 스텝퍼 ──────────────────────────────────────────
function Stepper({ value, min, max, onChange, unit }: {
  value: number; min: number; max: number;
  onChange: (v: number) => void; unit: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: 36, height: 36, borderRadius: 999, border: '1.5px solid var(--line)',
          background: 'var(--surface)', fontSize: 18, fontWeight: 700, cursor: value <= min ? 'not-allowed' : 'pointer',
          color: value <= min ? 'var(--line)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit',
        }}
      >−</button>
      <div style={{ minWidth: 64, textAlign: 'center' }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</span>
        <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 4 }}>{unit}</span>
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: 36, height: 36, borderRadius: 999, border: '1.5px solid var(--line)',
          background: 'var(--surface)', fontSize: 18, fontWeight: 700, cursor: value >= max ? 'not-allowed' : 'pointer',
          color: value >= max ? 'var(--line)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit',
        }}
      >+</button>
    </div>
  );
}

// ── 슬라이더 ─────────────────────────────────────────────
function Slider({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <input type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
    />
  );
}

// ── 점수 항목 카드 ───────────────────────────────────────
function ScoreCard({ label, score, maxScore, color, children }: {
  label: string; score: number; maxScore: number; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>/ {maxScore}점</span>
        </div>
      </div>
      {/* 게이지 */}
      <div style={{ height: 6, background: 'var(--chip)', borderRadius: 999, marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(score / maxScore) * 100}%`, background: color, borderRadius: 999, transition: 'width .4s' }} />
      </div>
      {children}
    </div>
  );
}

// ── 지역별 비교 ──────────────────────────────────────────
interface ScoreStat {
  SUBSCRPT_AREA_CODE_NM: string;
  RESIDE_SECD: string;
  AVRG_SCORE: number;
  TOP_SCORE: number;
  LWET_SCORE: number;
}

function RegionComparison({ myScore, stats }: { myScore: number; stats: ScoreStat[] }) {
  const latestMonth = stats.reduce((m, d: ScoreStat & { STAT_DE?: string }) =>
    (d.STAT_DE ?? '') > m ? (d.STAT_DE ?? '') : m, '');
  const regions = stats
    .filter((d: ScoreStat & { STAT_DE?: string }) => d.STAT_DE === latestMonth && d.RESIDE_SECD === '01' && d.AVRG_SCORE > 0)
    .sort((a, b) => a.AVRG_SCORE - b.AVRG_SCORE);

  const possible = regions.filter(r => myScore >= r.LWET_SCORE);
  const tough = regions.filter(r => myScore < r.LWET_SCORE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 요약 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>✅ 도전 가능 지역</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>{possible.length}<span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>곳</span></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>최저 가점 기준 충족</div>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>❌ 가점 부족 지역</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>{tough.length}<span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>곳</span></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>최저 가점 미충족</div>
        </div>
      </div>

      {/* 지역별 바 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
          지역별 당첨 가점 범위 · <span style={{ color: '#2563eb', fontWeight: 700 }}>●</span> 내 가점 위치
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {regions.map(r => {
            const canWin = myScore >= r.LWET_SCORE;
            const myPos = Math.min(Math.max((myScore / 84) * 100, 0), 100);
            return (
              <div key={r.SUBSCRPT_AREA_CODE_NM}
                style={{ display: 'grid', gridTemplateColumns: '36px 1fr 96px', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: canWin ? 'var(--ink)' : 'var(--muted)' }}>
                  {r.SUBSCRPT_AREA_CODE_NM}
                </div>
                <div style={{ position: 'relative', height: 14, background: 'var(--chip)', borderRadius: 999 }}>
                  {/* 당첨 가점 범위 */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: `${(r.LWET_SCORE / 84) * 100}%`,
                    right: `${(1 - r.TOP_SCORE / 84) * 100}%`,
                    background: canWin ? '#2563eb' : '#e2e8f0',
                    opacity: 0.3, borderRadius: 999,
                  }} />
                  {/* 내 가점 마커 */}
                  <div style={{
                    position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)',
                    left: `${myPos}%`,
                    width: 14, height: 14, borderRadius: 999,
                    background: canWin ? '#16a34a' : '#94a3b8',
                    border: '2px solid var(--surface)',
                    zIndex: 1,
                  }} />
                </div>
                <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: canWin ? '#16a34a' : '#dc2626' }}>
                    {canWin ? '✓' : '✗'}
                  </span>
                  <span style={{ color: 'var(--muted)', marginLeft: 4 }}>
                    {r.LWET_SCORE}~{r.TOP_SCORE}점
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--muted)' }}>
          💡 해당지역 거주자 기준 · 일반공급 가점제 당첨선 · 최신 데이터 기준
        </p>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────
export default function CalculatorPage() {
  const [homelessYears, setHomelessYears] = useState(3);
  const [dependents, setDependents] = useState(1);
  const [accountMonths, setAccountMonths] = useState(36);
  const [scoreStats, setScoreStats] = useState<ScoreStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch('/api/stats/score').then(r => r.json()).then(d => {
      setScoreStats(d.data ?? []);
    }).finally(() => setLoadingStats(false));
  }, []);

  const s1 = calcHomeless(homelessYears);
  const s2 = calcDependents(dependents);
  const s3 = calcAccount(accountMonths);
  const total = s1 + s2 + s3;
  const grade = getGrade(total);

  const accountDisplay = useMemo(() => {
    if (accountMonths < 12) return `${accountMonths}개월`;
    const y = Math.floor(accountMonths / 12);
    const m = accountMonths % 12;
    return m > 0 ? `${y}년 ${m}개월` : `${y}년`;
  }, [accountMonths]);

  // 헤더 공통
  const Header = () => (
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
          <Link href="/analysis" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>경쟁률 분석</Link>
          <Link href="/favorites" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>관심단지</Link>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>가점 계산기</span>
        </nav>
      </div>
    </header>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 28px 80px' }}>
        {/* 타이틀 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 8px' }}>
            청약 가점 계산기
          </h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
            무주택기간·부양가족·청약통장으로 내 가점을 계산하고 어느 지역에 넣을지 알아보세요
          </p>
        </div>

        {/* 입력 카드 3개 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>

          {/* 무주택기간 */}
          <ScoreCard label="무주택기간" score={s1} maxScore={32} color="#2563eb">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <Slider value={homelessYears} min={0} max={15} onChange={setHomelessYears} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  <span>1년 미만</span><span>15년 이상</span>
                </div>
              </div>
              <Stepper value={homelessYears} min={0} max={15} onChange={setHomelessYears} unit="년" />
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--chip)', borderRadius: 8, fontSize: 12.5, color: 'var(--muted)' }}>
              {homelessYears < 1 ? '1년 미만 → 2점' : `${homelessYears}년 → ${s1}점`}
              {homelessYears >= 15 && ' (최대)'}
            </div>
          </ScoreCard>

          {/* 부양가족수 */}
          <ScoreCard label="부양가족수" score={s2} maxScore={35} color="#16a34a">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <Slider value={dependents} min={0} max={6} onChange={setDependents} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  <span>0명 (본인만)</span><span>6명 이상</span>
                </div>
              </div>
              <Stepper value={dependents} min={0} max={6} onChange={setDependents} unit="명" />
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--chip)', borderRadius: 8, fontSize: 12.5, color: 'var(--muted)' }}>
              {dependents === 0 ? '본인 포함 1인 세대 → 5점' : `부양가족 ${dependents}명 → ${s2}점`}
              {dependents >= 6 && ' (최대)'}
              <span style={{ display: 'block', marginTop: 3, color: '#94a3b8', fontSize: 11.5 }}>
                💡 배우자·직계존속(부모)·직계비속(자녀) 포함 (주민등록 동거)
              </span>
            </div>
          </ScoreCard>

          {/* 청약통장 가입기간 */}
          <ScoreCard label="청약통장 가입기간" score={s3} maxScore={17} color="#7c3aed">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <Slider value={accountMonths} min={1} max={180} onChange={setAccountMonths} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  <span>6개월 미만</span><span>15년 이상</span>
                </div>
              </div>
              <div style={{ minWidth: 80, textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{accountDisplay}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, justifyContent: 'center' }}>
                  <button onClick={() => setAccountMonths(m => Math.max(1, m - 6))}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>-6월</button>
                  <button onClick={() => setAccountMonths(m => Math.min(180, m + 6))}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>+6월</button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--chip)', borderRadius: 8, fontSize: 12.5, color: 'var(--muted)' }}>
              {accountDisplay} → {s3}점{accountMonths >= 180 && ' (최대)'}
            </div>
          </ScoreCard>
        </div>

        {/* 총점 결과 카드 */}
        <div style={{
          background: grade.bg, border: `1.5px solid ${grade.color}33`,
          borderRadius: 20, padding: '28px 32px', marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: grade.color, marginBottom: 6 }}>내 청약 가점</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 56, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em', lineHeight: 1 }}>{total}</span>
                <span style={{ fontSize: 20, color: 'var(--muted)', fontWeight: 600 }}>/ 84점</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 999, background: grade.color, color: '#fff', fontSize: 14, fontWeight: 800 }}>
                {grade.label}
              </span>
              <div style={{ fontSize: 13, color: grade.color, fontWeight: 600, marginTop: 8, maxWidth: 200, lineHeight: 1.5 }}>
                {grade.desc}
              </div>
            </div>
          </div>

          {/* 전체 게이지 */}
          <div style={{ height: 12, background: 'rgba(0,0,0,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(total / 84) * 100}%`, background: grade.color, borderRadius: 999, transition: 'width .5s cubic-bezier(.2,.7,.2,1)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: grade.color, opacity: 0.7 }}>
            <span>0점</span>
            <span style={{ fontWeight: 700 }}>{total}점</span>
            <span>84점</span>
          </div>

          {/* 항목별 분해 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 18 }}>
            {[
              { label: '무주택기간', score: s1, max: 32, color: '#2563eb' },
              { label: '부양가족수', score: s2, max: 35, color: '#16a34a' },
              { label: '청약통장', score: s3, max: 17, color: '#7c3aed' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                  {item.score}<span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>/{item.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 지역별 비교 */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            지역별 도전 가능 여부
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 20px' }}>
            내 가점 <strong style={{ color: 'var(--ink)' }}>{total}점</strong>으로 어느 지역 청약에 도전할 수 있을까요?
          </p>
          {loadingStats ? (
            <div style={{ height: 300, background: 'var(--chip)', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />
          ) : (
            <RegionComparison myScore={total} stats={scoreStats} />
          )}
        </div>
      </main>
    </div>
  );
}
