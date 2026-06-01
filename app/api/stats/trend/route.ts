import { NextRequest } from 'next/server';

// 월별 경쟁률 트렌드 (전국 합산)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || ''; // 특정 지역 필터 (선택)

  const url = new URL('https://api.odcloud.kr/api/ApplyhomeStatSvc/v1/getAPTCmpetrtAreaStat');
  url.searchParams.set('serviceKey', process.env.PUBLIC_DATA_API_KEY!);
  url.searchParams.set('page', '1');
  url.searchParams.set('perPage', '300'); // 넉넉히 가져와서 클라이언트에서 필터링
  if (region) {
    url.searchParams.set('cond[SUBSCRPT_AREA_CODE_NM::EQ]', region);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  const data = await res.json();
  return Response.json(data);
}
