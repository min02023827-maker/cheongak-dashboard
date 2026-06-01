'use client';

import { CompetitionItem } from '@/lib/api';

export default function CompetitionChart({ items }: { items: CompetitionItem[] }) {
  if (!items.length) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '40px 28px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
        경쟁률 데이터가 없습니다.
      </div>
    );
  }

  // 주택형별 그룹 (1순위 해당지역 기준)
  const grouped: Record<string, { ty: string; area: string; rate: number; req: number; supply: number }> = {};
  items.forEach(item => {
    const ty = item.HOUSE_TY;
    const rate = parseFloat(item.CMPET_RATE) || 0;
    if (!grouped[ty]) {
      grouped[ty] = { ty, area: ty, rate: 0, req: Number(item.REQ_CNT) || 0, supply: item.SUPLY_HSHLDCO };
    }
    // 1순위 해당지역 우선
    if (item.SUBSCRPT_RANK_CODE === 1 && item.RESIDE_SECD === '01') {
      grouped[ty].rate = rate;
      grouped[ty].req = Number(item.REQ_CNT) || 0;
      grouped[ty].supply = item.SUPLY_HSHLDCO;
    }
  });

  const types = Object.values(grouped);
  const max = Math.max(...types.map(t => t.rate), 1);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>일반공급 1순위 기준 · 경쟁률 = 접수건수 ÷ 공급세대수</p>
      {types.map(t => {
        const pct = (t.rate / max) * 100;
        const top = t.rate === max;
        return (
          <div key={t.ty} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 130px', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>{t.ty}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t.supply.toLocaleString()}세대</div>
            </div>
            <div style={{ position: 'relative', height: 30, background: 'var(--chip)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', inset: 0, width: pct + '%',
                background: top ? 'linear-gradient(90deg, #2563eb, #3b82f6)' : '#2563eb',
                opacity: top ? 1 : 0.65,
                borderRadius: 8,
                transition: 'width .6s cubic-bezier(.2,.7,.2,1)',
              }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: top ? 'var(--accent)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                {t.rate > 0 ? t.rate.toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}> : 1</span>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                {t.req.toLocaleString()}명 / {t.supply.toLocaleString()}세대
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
