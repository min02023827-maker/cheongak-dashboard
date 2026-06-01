import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // ApplyhomeStatSvc: 지역별 청약 당첨자 정보 (최근 월 기준)
  const url = new URL('https://api.odcloud.kr/api/ApplyhomeStatSvc/v1/getAPTPrzwnerAreaStat');
  url.searchParams.set('serviceKey', process.env.PUBLIC_DATA_API_KEY!);
  url.searchParams.set('page', '1');
  url.searchParams.set('perPage', '20');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  const data = await res.json();
  return Response.json(data);
}
