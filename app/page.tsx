'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { fetchSales, SaleItem } from '@/lib/api';
import SalesList, { getStatusInfo } from '@/components/SalesList';

const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const STATUSES = ['전체', '접수중', '예정', '마감'];

export default function Home() {
  const [allItems, setAllItems] = useState<SaleItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [region, setRegion] = useState('전체');
  const [status, setStatus] = useState('전체');
  const [sort, setSort] = useState('dday');
  const [query, setQuery] = useState('');

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchSales(p, 20);
      setAllItems(result.items);
      setTotalCount(result.totalCount);
    } catch {
      setError('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let list = allItems.filter(item => {
      if (region !== '전체' && !item.HSSPLY_ADRES?.includes(region) && !item.SUBSCRPT_AREA_CODE_NM?.includes(region)) return false;
      if (query.trim()) {
        const q = query.trim();
        if (!(item.HOUSE_NM?.includes(q) || item.HSSPLY_ADRES?.includes(q) || item.BSNS_MBY_NM?.includes(q))) return false;
      }
      if (status !== '전체') {
        const st = getStatusInfo(item);
        if (st.label !== status && !(status === '예정' && st.label === '접수예정')) return false;
      }
      return true;
    });

    // 정렬
    const ddayKey = (item: SaleItem) => {
      const today2 = new Date().toISOString().slice(0, 10);
      const end = item.RCEPT_ENDDE ?? item.RCEPT_BGNDE ?? '9999-12-31';
      const diff = Math.ceil((new Date(end).getTime() - new Date(today2).getTime()) / 86400000);
      return diff >= 0 ? diff : 100000 + Math.abs(diff);
    };
    if (sort === 'dday') list = [...list].sort((a, b) => ddayKey(a) - ddayKey(b));
    if (sort === 'units') list = [...list].sort((a, b) => Number(b.TOT_SUPLY_HSHLDCO ?? 0) - Number(a.TOT_SUPLY_HSHLDCO ?? 0));
    return list;
  }, [allItems, region, status, sort, query]);

  const openCount = allItems.filter(i => getStatusInfo(i).label === '접수중').length;
  const soonCount = allItems.filter(i => ['접수예정', '예정'].includes(getStatusInfo(i).label)).length;
  const totalPages = Math.ceil(totalCount / 20);
  const today = new Date();
  const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* 헤더 */}
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--line)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>청약 ON</span>
          </div>
          <nav style={{ display: 'flex', gap: 28 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}>청약 캘린더</span>
            <Link href="/analysis" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>경쟁률 분석</Link>
            <Link href="/favorites" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>관심단지</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 28px 80px' }}>
        {/* 헤드라인 */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 8px' }}>청약 캘린더</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
            지금 접수 중인 단지{' '}
            <strong style={{ color: '#16a34a' }}>{openCount}곳</strong>
            {' · '}접수 예정{' '}
            <strong style={{ color: '#d97706' }}>{soonCount}곳</strong>
            {' · '}기준일 {todayStr}
          </p>
        </div>

        {/* 필터 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {/* 검색 */}
          <div style={{ position: 'relative', maxWidth: 420 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', stroke: 'var(--muted)', fill: 'none', strokeWidth: 2 }}>
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="단지명 · 지역 검색"
              style={{
                width: '100%', padding: '11px 14px 11px 42px', borderRadius: 10,
                border: '1px solid var(--line)', background: 'var(--surface)',
                fontSize: 14, color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}
            />
          </div>

          {/* 지역 칩 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {REGIONS.map(r => (
              <button key={r} onClick={() => setRegion(r)} style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                border: region === r ? '1px solid var(--accent)' : '1px solid var(--line)',
                background: region === r ? 'var(--accent)' : 'var(--surface)',
                color: region === r ? '#fff' : 'var(--ink-soft)',
              }}>{r}</button>
            ))}
          </div>

          {/* 상태 세그먼트 + 정렬 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'inline-flex', background: 'var(--chip)', borderRadius: 10, padding: 3 }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all .15s',
                  background: status === s ? 'var(--surface)' : 'transparent',
                  color: status === s ? 'var(--ink)' : 'var(--muted)',
                  boxShadow: status === s ? '0 1px 3px rgba(15,23,42,.08)' : 'none',
                }}>{s}</button>
              ))}
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
              정렬
              <select value={sort} onChange={e => setSort(e.target.value)} style={{
                padding: '7px 30px 7px 12px', borderRadius: 8, border: '1px solid var(--line)',
                background: 'var(--surface)', fontSize: 13, fontWeight: 700, color: 'var(--ink)',
                fontFamily: 'inherit', cursor: 'pointer', appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>\")",
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
              }}>
                <option value="dday">마감임박순</option>
                <option value="units">세대수순</option>
              </select>
            </label>
          </div>
        </div>

        {/* 결과 수 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 600 }}>
            총 <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong>개 단지
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: '#dc2626' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
                <div style={{ height: 132, background: 'var(--chip)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '16px 18px 18px' }}>
                  <div style={{ height: 12, background: 'var(--chip)', borderRadius: 6, width: '40%', marginBottom: 10 }} />
                  <div style={{ height: 18, background: 'var(--chip)', borderRadius: 6, width: '80%', marginBottom: 8 }} />
                  <div style={{ height: 12, background: 'var(--chip)', borderRadius: 6, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SalesList items={filtered} />
        )}

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13, fontWeight: 700, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, color: 'var(--ink)', fontFamily: 'inherit' }}
            >이전</button>
            <span style={{ padding: '8px 16px', fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13, fontWeight: 700, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, color: 'var(--ink)', fontFamily: 'inherit' }}
            >다음</button>
          </div>
        )}
      </main>
    </div>
  );
}
