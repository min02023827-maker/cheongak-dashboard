'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSales, SaleItem } from '@/lib/api';
import { useFavorites } from '@/lib/useFavorites';
import { getStatusInfo, getDday } from '@/components/SalesList';
import HouseGlyph, { regionBg } from '@/components/HouseGlyph';

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 0', gap: 16, textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 999, background: 'var(--chip)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#94a3b8" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
          저장된 관심단지가 없어요
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          청약 캘린더에서 단지 카드의 ♡ 버튼을 눌러<br />관심 단지를 저장해 보세요
        </div>
      </div>
      <Link href="/" style={{
        marginTop: 8, padding: '10px 24px', borderRadius: 10,
        background: 'var(--accent)', color: '#fff',
        fontSize: 14, fontWeight: 700, textDecoration: 'none',
      }}>
        청약 캘린더 보러가기
      </Link>
    </div>
  );
}

export default function FavoritesPage() {
  const { favorites, toggle, isFav, mounted } = useFavorites();
  const [allItems, setAllItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 여러 페이지에 걸쳐 있을 수 있으므로 충분히 가져옴
  useEffect(() => {
    fetchSales(1, 100).then(r => {
      setAllItems(r.items);
      setLoading(false);
    });
  }, []);

  const favItems = allItems.filter(i => favorites.includes(i.HOUSE_MANAGE_NO));

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
            <Link href="/analysis" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>경쟁률 분석</Link>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>관심단지</span>
            <Link href="/calculator" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>가점 계산기</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 28px 80px' }}>
        {/* 헤드라인 */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 6px' }}>
            관심단지
          </h1>
          {mounted && favorites.length > 0 && (
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
              저장된 단지 <strong style={{ color: 'var(--ink)' }}>{favorites.length}곳</strong>
            </p>
          )}
        </div>

        {loading || !mounted ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
                <div style={{ height: 132, background: 'var(--chip)' }} />
                <div style={{ padding: '16px 18px 18px' }}>
                  <div style={{ height: 12, background: 'var(--chip)', borderRadius: 6, width: '40%', marginBottom: 10 }} />
                  <div style={{ height: 18, background: 'var(--chip)', borderRadius: 6, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }}>
            {favItems.length > 0 ? favItems.map(item => (
              <FavCard key={item.HOUSE_MANAGE_NO} item={item} onRemove={() => toggle(item.HOUSE_MANAGE_NO)} />
            )) : (
              // 관심 단지가 현재 페이지에 없는 경우 ID만 표시
              favorites.map(id => (
                <div key={id} style={{
                  background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16,
                  padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>주택관리번호</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>{id}</div>
                  </div>
                  <button onClick={() => toggle(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 700, padding: '6px 10px', borderRadius: 8, fontFamily: 'inherit' }}>삭제</button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// 관심단지 카드 (삭제 버튼 포함)
function FavCard({ item, onRemove }: { item: SaleItem; onRemove: () => void }) {
  const status = getStatusInfo(item);
  const dday = getDday(item);
  const region = item.SUBSCRPT_AREA_CODE_NM ?? '';

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16,
      overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      {/* 배너 */}
      <Link href={`/${item.HOUSE_MANAGE_NO}`} style={{ textDecoration: 'none' }}>
        <div style={{ position: 'relative', height: 120, background: regionBg(region), overflow: 'hidden', cursor: 'pointer' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'end center' }}>
            <HouseGlyph region={region} bare style={{ width: 130, height: 84, display: 'block', opacity: 0.95 }} />
          </div>
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, background: status.bg, color: status.color, fontSize: 12, fontWeight: 700 }}>
              {status.dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: status.color }} />}
              {status.label}
            </span>
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.9)', color: dday.urgent ? '#dc2626' : 'var(--accent)', fontSize: 12, fontWeight: 800 }}>
              {dday.label}
            </span>
          </div>
        </div>
      </Link>

      {/* 본문 */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginBottom: 2 }}>
            {region} · {item.HOUSE_DTL_SECD_NM || item.HOUSE_SECD_NM}
          </div>
          <Link href={`/${item.HOUSE_MANAGE_NO}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              {item.HOUSE_NM}
            </div>
          </Link>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {item.BSNS_MBY_NM || item.CNSTRCT_ENTRPS_NM || '-'}
          </div>
        </div>

        {/* 미니 정보 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--line)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: 'var(--surface)', padding: '9px 12px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>총 세대수</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>
              {item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '—'}
            </div>
          </div>
          <div style={{ background: 'var(--surface)', padding: '9px 12px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>당첨자 발표</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>
              {item.PRZWNER_PRESNATN_DE ?? '—'}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <Link href={`/${item.HOUSE_MANAGE_NO}`} style={{
            flex: 1, padding: '9px 0', borderRadius: 9, background: 'var(--accent-weak)',
            color: 'var(--accent)', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            textAlign: 'center',
          }}>
            상세보기
          </Link>
          <button onClick={onRemove} style={{
            padding: '9px 14px', borderRadius: 9, border: '1px solid var(--line)',
            background: 'var(--surface)', color: 'var(--muted)', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#ef4444" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            해제
          </button>
        </div>
      </div>
    </div>
  );
}
