'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchSales, fetchCompetition, fetchWinners, SaleItem, CompetitionItem, WinnerItem } from '@/lib/api';
import CompetitionChart from '@/components/CompetitionChart';
import WinnerStats from '@/components/WinnerStats';
import HouseGlyph from '@/components/HouseGlyph';
import { getStatusInfo } from '@/components/SalesList';

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function ScheduleTimeline({ item }: { item: SaleItem }) {
  const steps = [
    { label: '모집공고', date: item.RCRIT_PBLANC_DE },
    { label: '특별공급', date: item.SPSPLY_RCEPT_BGNDE },
    { label: '1순위', date: item.GNRL_RNK1_CRSPAREA_RCPTDE },
    { label: '2순위', date: item.GNRL_RNK2_CRSPAREA_RCPTDE },
    { label: '당첨발표', date: item.PRZWNER_PRESNATN_DE },
    { label: '계약', date: item.CNTRCT_CNCLS_BGNDE },
  ];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '26px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 7, left: 24, right: 24, height: 2, background: 'var(--line)' }} />
        {steps.map((st, i) => {
          const active = st.date && st.date <= today;
          const isToday = st.date === today;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, position: 'relative', flex: 1 }}>
              <div style={{
                width: 16, height: 16, borderRadius: 999, zIndex: 1,
                background: active ? 'var(--accent)' : 'var(--surface)',
                border: active ? '2px solid var(--accent)' : '2px solid var(--line)',
                boxShadow: isToday ? '0 0 0 5px var(--accent-weak)' : 'none',
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: active ? 'var(--ink)' : 'var(--muted)' }}>{st.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {st.date ? st.date.slice(5).replace('-', '.') : '—'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoGrid({ item }: { item: SaleItem }) {
  const rows = [
    ['공급위치', item.HSSPLY_ADRES],
    ['공급규모', item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '-'],
    ['시행/시공', [item.BSNS_MBY_NM, item.CNSTRCT_ENTRPS_NM].filter(Boolean).join(' / ') || '-'],
    ['입주예정', item.MVN_PREARNGE_YM ? `${item.MVN_PREARNGE_YM.slice(0,4)}년 ${item.MVN_PREARNGE_YM.slice(4)}월` : '-'],
    ['문의처', item.MDHS_TELNO || '-'],
  ];
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
      {rows.map(([k, v], i) => (
        <div key={k} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
          <div style={{ padding: '14px 18px', background: 'var(--chip)', fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>{k}</div>
          <div style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>{v ?? '-'}</div>
        </div>
      ))}
    </div>
  );
}

export default function DetailPage() {
  const params = useParams();
  const houseId = params.houseId as string;

  const [saleInfo, setSaleInfo] = useState<SaleItem | null>(null);
  const [competition, setCompetition] = useState<CompetitionItem[]>([]);
  const [winners, setWinners] = useState<WinnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'competition' | 'winners'>('competition');

  useEffect(() => {
    if (!houseId) return;
    setLoading(true);
    Promise.all([
      fetchSales(1, 100),
      fetchCompetition(houseId),
      fetchWinners(),
    ]).then(([salesResult, comp, win]) => {
      const found = salesResult.items.find(i => String(i.HOUSE_MANAGE_NO) === String(houseId));
      setSaleInfo(found ?? null);
      setCompetition(comp);
      setWinners(win);
    }).finally(() => setLoading(false));
  }, [houseId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>불러오는 중...</div>
      </div>
    );
  }

  const status = saleInfo ? getStatusInfo(saleInfo) : null;
  const region = saleInfo?.SUBSCRPT_AREA_CODE_NM ?? '';

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
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}>청약 캘린더</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', cursor: 'pointer' }}>경쟁률 분석</span>
            <Link href="/favorites" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>관심단지</Link>
            <Link href="/calculator" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>가점 계산기</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 28px 90px' }}>
        {/* 뒤로가기 */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 22, textDecoration: 'none', fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          목록으로
        </Link>

        {saleInfo && (
          <>
            {/* 히어로 */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 30 }}>
              <HouseGlyph region={region} style={{ width: 96, height: 96, borderRadius: 18, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, flexWrap: 'wrap' }}>
                  {status && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: status.bg, color: status.color, fontSize: 13, fontWeight: 700 }}>
                      {status.dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: status.color, boxShadow: `0 0 0 3px ${status.color}44` }} />}
                      {status.label}
                    </span>
                  )}
                  {saleInfo.HOUSE_DTL_SECD_NM && (
                    <span style={{ padding: '3px 9px', borderRadius: 6, background: 'var(--chip)', color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>
                      {saleInfo.HOUSE_DTL_SECD_NM}
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 5px' }}>
                  {saleInfo.HOUSE_NM}
                </h1>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                  {region} · {saleInfo.HSSPLY_ADRES?.split(' ').slice(0, 3).join(' ')}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>주택관리번호 {saleInfo.HOUSE_MANAGE_NO}</div>
                {saleInfo.PBLANC_URL && (
                  <a href={saleInfo.PBLANC_URL} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
                    청약홈 공고 →
                  </a>
                )}
              </div>
            </div>

            <Section title="청약 일정" sub="모집공고부터 계약까지">
              <ScheduleTimeline item={saleInfo} />
            </Section>

            <Section title="단지 기본정보">
              <InfoGrid item={saleInfo} />
            </Section>
          </>
        )}

        {/* 탭 섹션 */}
        <div style={{ marginBottom: 34 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--line)' }}>
            {(['competition', 'winners'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '10px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'inherit', border: 'none', background: 'none',
                color: tab === t ? 'var(--accent)' : 'var(--muted)',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -2, transition: 'color .15s',
              }}>
                {t === 'competition' ? '타입별 경쟁률' : '신청자·당첨자 통계'}
              </button>
            ))}
          </div>
          {tab === 'competition' && <CompetitionChart items={competition} />}
          {tab === 'winners' && <WinnerStats items={winners} />}
        </div>
      </main>
    </div>
  );
}
