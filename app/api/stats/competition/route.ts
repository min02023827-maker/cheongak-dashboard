// 지역별 경쟁률 (최신 월)
export async function GET() {
  const url = new URL('https://api.odcloud.kr/api/ApplyhomeStatSvc/v1/getAPTCmpetrtAreaStat');
  url.searchParams.set('serviceKey', process.env.PUBLIC_DATA_API_KEY!);
  url.searchParams.set('page', '1');
  url.searchParams.set('perPage', '100');
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  const data = await res.json();
  return Response.json(data);
}
