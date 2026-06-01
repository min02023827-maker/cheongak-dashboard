// 지역별 당첨 가점 (해당지역 기준)
export async function GET() {
  const url = new URL('https://api.odcloud.kr/api/ApplyhomeStatSvc/v1/getAPTApsPrzwnerStat');
  url.searchParams.set('serviceKey', process.env.PUBLIC_DATA_API_KEY!);
  url.searchParams.set('page', '1');
  url.searchParams.set('perPage', '500');
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  const data = await res.json();
  return Response.json(data);
}
