import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get('pageNo') || '1';
  const numOfRows = searchParams.get('numOfRows') || '20';

  const url = new URL('https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail');
  url.searchParams.set('serviceKey', process.env.PUBLIC_DATA_API_KEY!);
  url.searchParams.set('page', pageNo);
  url.searchParams.set('perPage', numOfRows);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  const data = await res.json();
  return Response.json(data);
}
