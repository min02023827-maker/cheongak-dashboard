// ============================================================
// API 1: 분양정보 - ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail
// ============================================================
export interface SaleItem {
  HOUSE_MANAGE_NO: string;
  PBLANC_NO: string;
  HOUSE_NM: string;
  HOUSE_SECD: string;
  HOUSE_SECD_NM: string;
  HOUSE_DTL_SECD: string;
  HOUSE_DTL_SECD_NM: string;
  HSSPLY_ADRES: string;
  HSSPLY_ZIP: string;
  TOT_SUPLY_HSHLDCO: number;
  RCRIT_PBLANC_DE: string;      // 모집공고일
  RCEPT_BGNDE: string;          // 청약접수시작일
  RCEPT_ENDDE: string;          // 청약접수종료일
  SPSPLY_RCEPT_BGNDE: string;   // 특별공급 접수시작일
  SPSPLY_RCEPT_ENDDE: string;   // 특별공급 접수종료일
  PRZWNER_PRESNATN_DE: string;  // 당첨자발표일
  CNTRCT_CNCLS_BGNDE: string;  // 계약시작일
  CNTRCT_CNCLS_ENDDE: string;  // 계약종료일
  MVN_PREARNGE_YM: string;      // 입주예정월
  PBLANC_URL: string;
  BSNS_MBY_NM: string;          // 시행사
  CNSTRCT_ENTRPS_NM: string;    // 시공사
  MDHS_TELNO: string;
  GNRL_RNK1_CRSPAREA_RCPTDE: string;  // 1순위 해당지역 접수시작일
  GNRL_RNK1_CRSPAREA_ENDDE: string;
  GNRL_RNK2_CRSPAREA_RCPTDE: string;  // 2순위 해당지역 접수시작일
  GNRL_RNK2_CRSPAREA_ENDDE: string;
  SUBSCRPT_AREA_CODE: string;
  SUBSCRPT_AREA_CODE_NM: string;
  MDAT_TRGET_AREA_SECD: string;
}

// ============================================================
// API 2: 경쟁률 - ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancCmpet
// ============================================================
export interface CompetitionItem {
  HOUSE_MANAGE_NO: string | number;
  PBLANC_NO: string | number;
  MODEL_NO: string;
  HOUSE_TY: string;             // 주택형
  SUPLY_HSHLDCO: number;        // 공급세대수
  SUBSCRPT_RANK_CODE: number;   // 순위 (1 or 2)
  RESIDE_SECD: string;          // 거주코드 (01:해당지역 02:기타지역 03:기타경기)
  RESIDE_SENM: string;          // 거주지역명
  REQ_CNT: string;              // 접수건수
  CMPET_RATE: string;           // 경쟁률
}

// ============================================================
// API 3: 당첨자 통계 - ApplyhomeStatSvc/v1/getAPTPrzwnerAreaStat
// ============================================================
export interface WinnerItem {
  STAT_DE: string;              // 제공연월 (YYYYMM)
  SUBSCRPT_AREA_CODE: string;
  SUBSCRPT_AREA_CODE_NM: string;
  AGE_30: number;               // 30대 이하
  AGE_40: number;
  AGE_50: number;
  AGE_60: number;               // 60대 이상
}

// ============================================================
// Fetch 함수들
// ============================================================
export async function fetchSales(pageNo = 1, numOfRows = 20) {
  const res = await fetch(`/api/sales?pageNo=${pageNo}&numOfRows=${numOfRows}`);
  const data = await res.json();
  if (!data?.data) return { items: [], totalCount: 0 };
  return {
    items: data.data as SaleItem[],
    totalCount: Number(data.totalCount ?? 0),
  };
}

export async function fetchCompetition(houseManageNo: string) {
  const res = await fetch(`/api/competition?houseManageNo=${houseManageNo}`);
  const data = await res.json();
  if (!data?.data) return [];
  return data.data as CompetitionItem[];
}

export async function fetchWinners() {
  const res = await fetch(`/api/winners`);
  const data = await res.json();
  if (!data?.data) return [];
  return data.data as WinnerItem[];
}
