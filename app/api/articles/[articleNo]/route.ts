import { NextRequest, NextResponse } from 'next/server';

// 네이버 부동산 API 관련 설정
const NAVER_ARTICLE_DETAIL_BASE_URL = 'https://new.land.naver.com/api/articles';

// 실제 헤더 및 쿠키 값 (다른 API Route와 동일하게 사용)
const ACTUAL_DEFAULT_HEADERS = {
    'accept': '*/*',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NDcwNjE1MzUsImV4cCI6MTc0NzA3MjMzNX0.zkaUPeh1Hp1ICPKfN5yaovCTX6rUMA0CSIyDppM6WyY',
    'priority': 'u=1, i',
    'referer': 'https://new.land.naver.com/complexes/142587?ms=37.5154881,127.0399418,17&a=OPST:OBYG:PRE&b=B2:B1&e=RETAIL&ad=true', // 리퍼러는 상황에 맞게 좀 더 일반적인 URL로 변경 가능
    'sec-ch-ua': '"Chromium";v="134", "Whale";v="4", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Whale/4.31.304.16 Safari/537.36',
};

const ACTUAL_DEFAULT_COOKIES = 'NNB=PY3VYTEXWJKWO; NAC=KCJGBYA5zFnP; NSCS=1; landHomeFlashUseYn=Y; SHOW_FIN_BADGE=Y; NaverSuggestUse=unuse%26unuse; nid_inf=2084488452; NID_AUT=iI2ScIbHjEfMAML4fmzb31LUaIziT+nfO2xZPqeXFsQY+X70aSeonJzf6OqmXtbZ; NID_SES=AAABwpKPJU8TUyXOdvTT18FZE3kWcdBkmfjbQc100zDedKMKpiKxPhJ/cXJ5Cr4H1mT3qVKQl7D8rJKoBtQURvmrlh+jClBwVciL1B2XK6cbv7sIV6cbf8IU/XLGrNrRDnYbZbzZpXeHequGqcR4nD7EjwJ3MJvmnSEc6q69YVqhZ4XdwU3sm4X31Nm87zMDgHmPtrIgE38duC47kehv7NOzGB+7AncmuE8b1s9vBgOw3N5F1T8xvGOiqG3IgL7RD1WUpuhE59t1JRpI7gbMWuB1qqN7eh504Zed+smRGjKG8zFWdrX1H67tjdaHZEJP0b2j7wYiqrUvLNjDZTVD5kQV1DeyiXc9RXmfYeOw6G5hSq/QsO7aDrq4m/7SuFow3Y6/UyU9Tt18AZrMsaCgii40T8yTEJNAVaI1Zy1XJ2x5XLsDUu9Bebvq1UYSgX9oiqzt1NqHiBzEPKdfonHt/sj++qKihgQMtky9IWqvlr1uKjgS0iaHvKy7d3Xrv/Pcr60nWEvGgxLgeIXiOYOfNC8wO+yVxv7P3du0y0Pn8SILkdjoheOR4nS06ihhqpyF0Nl+zQxpJVc9UAlLadg1/ZybrDL7MB3JUZk3fpzY9z0UH5nm; SRT30=1747060936; page_uid=ju44ydqVN8VssldztiGssssssUs-516836; nhn.realestate.article.rlet_type_cd=A01; nhn.realestate.article.trade_type_cd=""; nhn.realestate.article.ipaddress_city=1100000000; REALESTATE=Mon%20May%2012%202025%2023%3A52%3A15%20GMT%2B0900%20(Korean%20Standard%20Time); BUC=WxiSz49gaWvQX4Qg24SyD2pFwUSzEGZ8KpOSF5Mzw4Q=';

// 매물 상세 정보 타입 (필요한 주요 속성 위주로 정의)
interface NaverArticleDetail {
    articleNo: string;
    complexNo?: string;
    articleName?: string; 
    realEstateTypeName?: string; 
    tradeTypeName?: string; 
    dealOrWarrantPrc?: string; 
    rentPrc?: string; // 월세 (단기임대 포함 가능, API 응답 확인 필요)
    monRentPrc?: string; // 백업용 단기임대 월세 필드
    
    spc1?: string | number; // 공급면적 (string으로 올 가능성 높음)
    spc2?: string | number; // 전용면적 (string으로 올 가능성 높음)
    
    roomCount?: string;
    bathroomCount?: string;
    flrInfo?: string; // 예: "저/17", "5/20"
    direction?: string; 
    moveInTypeName?: string; 
    
    articleFeatureDescription?: string; 
    detailDescription?: string; 
    
    realtorName?: string; 
    realtorTelNo?: string; 
    
    tagList?: string[]; 
    
    // 사진 및 평면도
    articlePhotos?: { imageId: string; imageOrder: number; imageSrc: string; imageType?: string; [key: string]: any; }[];
    grandPlanList?: { imageId: string; imageOrder: number; imageSrc: string; imageType: string; }[];
    floorPlanUrl?: string; // 기존 평면도 (단일)

    // 네이버 링크 구성용 필드 (API 응답에 따라 추가/수정 필요)
    cortarNo?: string; // 지역 코드 (ms 파라미터 구성에 사용될 수 있음)
    hscpNo?: string; // 단지 번호 (complexNo와 유사하거나 다른 용도일 수 있음)
    ptpNo?: string; // 매물 타입 코드 (a 파라미터 구성에 사용될 수 있음)
    tradeBuildingTypeCode?: string; // 건물 유형 코드 (a 파라미터 구성에 사용될 수 있음)
    latitude?: string; // 위도 (ms 파라미터)
    longitude?: string; // 경도 (ms 파라미터)
    // 기타 링크 구성에 필요한 파라미터들 (e.g., 'a', 'e' 등)
    // 예시: naverLinkParams?: { ms?: string; a?: string; e?: string; [key: string]: any };

    // 등록일 (articleConfirmYmd가 루트에 있는지, articleDetail 내부에 있는지 확인 필요)
    articleConfirmYmd?: string; // YYYYMMDD 형식

    [key: string]: any; // 그 외 모든 필드 수용
}


export async function GET(request: NextRequest, { params }: { params: { articleNo: string } }) {
    const articleNo = params.articleNo;
    const { searchParams } = new URL(request.url);
    const complexNo = searchParams.get('complexNo'); // 선택적 파라미터

    if (!articleNo) {
        return NextResponse.json({ error: 'articleNo is required' }, { status: 400 });
    }

    console.log(`API 요청 받음 (매물상세): 매물번호 ${articleNo}, 단지번호: ${complexNo || '미지정'}`);

    const headers = { ...ACTUAL_DEFAULT_HEADERS, Cookie: ACTUAL_DEFAULT_COOKIES };
    
    // 네이버 상세 API는 쿼리 파라미터가 복잡하지 않음
    // complexNo가 있다면 추가 (일부 API 동작에 영향 줄 수 있음)
    const apiUrl = complexNo 
        ? `${NAVER_ARTICLE_DETAIL_BASE_URL}/${articleNo}?complexNo=${complexNo}`
        : `${NAVER_ARTICLE_DETAIL_BASE_URL}/${articleNo}`;

    console.log(`네이버 부동산 매물 상세 API 요청: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, { headers });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`네이버 부동산 매물 상세 API 오류 (매물: ${articleNo}): ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to fetch article details for ${articleNo}: ${response.status} ${errorText}`);
        }

        // 네이버 상세 API는 다양한 정보를 포함하므로, 필요한 부분만 선택적으로 파싱하거나 그대로 반환할 수 있음
        const data: NaverArticleDetail = await response.json(); 
        console.log(`매물 상세 API 응답 상태 코드: ${response.status}`);
        
        // data 객체 자체가 상세 정보이므로 그대로 반환 (필요시 가공)
        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`매물 상세 정보 조회 중 서버 오류 (매물: ${articleNo}):`, error);
        return NextResponse.json({ error: error.message || `Failed to fetch article details for ${articleNo}` }, { status: 500 });
    }
} 