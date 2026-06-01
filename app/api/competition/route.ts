import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const houseManageNo = searchParams.get('houseManageNo') || '';

  // ApplyhomeInfoCmpetRtSvc: 단지별 주택형 경쟁률 조회
  const url = new URL('https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancCmpet');
  url.searchParams.set('serviceKey', process.env.PUBLIC_DATA_API_KEY!);
  url.searchParams.set('page', '1');
  url.searchParams.set('perPage', '100');
  if (houseManageNo) {
    url.searchParams.set('cond[HOUSE_MANAGE_NO::EQ]', houseManageNo);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  const data = await res.json();
  return Response.json(data);
}
