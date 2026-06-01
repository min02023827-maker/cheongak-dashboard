'use client';

import { SaleItem } from '@/lib/api';
import Link from 'next/link';
import HouseGlyph, { regionBg } from './HouseGlyph';
import { useFavorites } from '@/lib/useFavorites';

export function getStatusInfo(item: SaleItem): { label: string; color: string; bg: string; dot: boolean } {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const start = item.RCEPT_BGNDE?.replace(/-/g, '') ?? '';
  const end = item.RCEPT_ENDDE?.replace(/-/g, '') ?? '';
  if (!start) return { label: '정보없음', color: '#94a3b8', bg: '#f1f5f9', dot: false };
  if (today < start) return { label: '접수예정', color: '#d97706', bg: '#fffbeb', dot: false };
  if (today <= end) return { label: '접수중', color: '#16a34a', bg: '#f0fdf4', dot: true };
  return { label: '마감', color: '#94a3b8', bg: '#f1f5f9', dot: false };
}

export function getDday(item: SaleItem): { label: string; sub: string; urgent: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  const todayMs = new Date(today).getTime();
  const end = item.RCEPT_ENDDE ?? item.RCEPT_BGNDE;
  if (!end) return { label: '-', sub: '', urgent: false };
  const endMs = new Date(end).getTime();
  const diff = Math.ceil((endMs - todayMs) / 86400000);
  const status = getStatusInfo(item);
  const urgent = diff >= 0 && diff <= 3 && status.label === '접수중';
  if (status.label === '마감') return { label: `D+${Math.abs(diff)}`, sub: '일정종료', urgent: false };
  if (diff === 0) return { label: 'D-Day', sub: '오늘마감', urgent: true };
  if (diff > 0) return { label: `D-${diff}`, sub: status.label === '접수중' ? '접수마감' : '접수시작', urgent };
  return { label: `D+${Math.abs(diff)}`, sub: '일정종료', urgent: false };
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--surface)', padding: '11px 14px' }}>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

export default function SalesList({ items }: { items: SaleItem[] }) {
  const { isFav, toggle, mounted } = useFavorites();

  if (!items.length) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 15 }}>
        조건에 맞는 청약 단지가 없어요.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }}>
      {items.map((item, i) => {
        const status = getStatusInfo(item);
        const dday = getDday(item);
        const region = item.SUBSCRPT_AREA_CODE_NM ?? '';
        const fav = mounted && isFav(item.HOUSE_MANAGE_NO);
        return (
          <Link key={item.HOUSE_MANAGE_NO ?? i} href={`/${item.HOUSE_MANAGE_NO}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              overflow: 'hidden',
              transition: 'transform .18s, box-shadow .18s, border-color .18s',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 14px 30px -12px rgba(15,23,42,.22)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(15,23,42,.04)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line)';
              }}
            >
              {/* 배너 이미지 영역 */}
              <div style={{ position: 'relative', height: 132, background: regionBg(region), overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'end center' }}>
                  <HouseGlyph region={region} bare style={{ width: 150, height: 96, display: 'block', opacity: 0.95 }} />
                </div>
                {/* 하트 버튼 */}
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(item.HOUSE_MANAGE_NO); }}
                  style={{
                    position: 'absolute', bottom: 10, right: 10, zIndex: 2,
                    width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: fav ? '#ef4444' : 'rgba(255,255,255,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s', boxShadow: '0 1px 4px rgba(0,0,0,.15)',
                  }}
                  aria-label={fav ? '관심단지 해제' : '관심단지 추가'}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill={fav ? 'white' : 'none'} stroke={fav ? 'white' : '#94a3b8'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>

                {/* 상태 배지 */}
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '3px 9px', borderRadius: 999,
                    background: status.bg, color: status.color,
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {status.dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: status.color, boxShadow: `0 0 0 3px ${status.color}44` }} />}
                    {status.label}
                  </span>
                </div>
                {/* D-day 배지 */}
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '6px 11px', borderRadius: 8,
                    background: dday.urgent ? '#fef2f2' : 'rgba(255,255,255,0.92)',
                    color: dday.urgent ? '#dc2626' : 'var(--accent)',
                    fontSize: 13, fontWeight: 800,
                  }}>
                    <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{dday.label}</span>
                    <span style={{ width: 1, height: 11, background: 'currentColor', opacity: 0.25 }} />
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{dday.sub}</span>
                  </span>
                </div>
              </div>

              {/* 카드 본문 */}
              <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--accent)', fontWeight: 700, marginBottom: 3 }}>
                    {region} · {item.HOUSE_DTL_SECD_NM || item.HOUSE_SECD_NM}
                  </div>
                  <div style={{ fontSize: 17.5, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.3 }}>
                    {item.HOUSE_NM}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
                    {item.BSNS_MBY_NM || item.CNSTRCT_ENTRPS_NM || '-'}
                  </div>
                </div>
                {/* 미니 통계 */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 1, background: 'var(--line)', borderRadius: 10, overflow: 'hidden', marginTop: 2,
                }}>
                  <MiniStat label="총 세대수" value={item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '—'} />
                  <MiniStat label="접수마감" value={item.RCEPT_ENDDE ?? '—'} />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
