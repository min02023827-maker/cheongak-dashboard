'use client';

import { WinnerItem } from '@/lib/api';

const AGE_BANDS = [
  { key: 'AGE_30' as keyof WinnerItem, label: '30대' },
  { key: 'AGE_40' as keyof WinnerItem, label: '40대' },
  { key: 'AGE_50' as keyof WinnerItem, label: '50대' },
  { key: 'AGE_60' as keyof WinnerItem, label: '60대+' },
];

export default function WinnerStats({ items }: { items: WinnerItem[] }) {
  if (!items.length) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '40px 28px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
        당첨자 데이터가 없습니다.
      </div>
    );
  }

  // 전국 합산
  const totals = { AGE_30: 0, AGE_40: 0, AGE_50: 0, AGE_60: 0 };
  items.forEach(item => {
    AGE_BANDS.forEach(b => {
      totals[b.key as keyof typeof totals] += Number(item[b.key] ?? 0);
    });
  });

  const totalAll = Object.values(totals).reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...Object.values(totals), 1);
  const statDe = items[0]?.STAT_DE ?? '';

  const ageBandData = AGE_BANDS.map(b => ({
    label: b.label,
    value: totals[b.key as keyof typeof totals],
    pct: totalAll ? Math.round((totals[b.key as keyof typeof totals] / totalAll) * 100) : 0,
    isMax: totals[b.key as keyof typeof totals] === maxVal,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
        기준: {statDe.slice(0, 4)}년 {statDe.slice(4)}월 · 전국 당첨자 연령대 합산
      </p>

      {/* 연령대 바 차트 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 18 }}>당첨자 연령대 분포</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 150 }}>
          {ageBandData.map(a => (
            <div key={a.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: a.isMax ? 'var(--accent)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                {a.pct}%
              </div>
              <div style={{
                width: '100%', maxWidth: 52,
                height: `${(a.value / maxVal) * 100}%`,
                background: 'var(--accent)',
                opacity: a.isMax ? 1 : 0.4,
                borderRadius: '6px 6px 0 0',
                transition: 'height .5s',
              }} />
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 지역별 테이블 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: 'var(--chip)' }}>
              <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>지역</th>
              {AGE_BANDS.map(b => (
                <th key={b.key} style={{ padding: '12px 18px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{b.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '13px 18px', fontWeight: 700, color: 'var(--ink)' }}>{item.SUBSCRPT_AREA_CODE_NM}</td>
                <td style={{ padding: '13px 18px', textAlign: 'right', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                  {Number(item.AGE_30 ?? 0).toLocaleString()}
                </td>
                {(['AGE_40', 'AGE_50', 'AGE_60'] as (keyof WinnerItem)[]).map(k => (
                  <td key={k} style={{ padding: '13px 18px', textAlign: 'right', color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>
                    {Number(item[k] ?? 0).toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
