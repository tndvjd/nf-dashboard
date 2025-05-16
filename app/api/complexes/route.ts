import { NextRequest, NextResponse } from 'next/server';

// 네이버 부동산 API 관련 설정 (기존 config.py 참고)
const NAVER_SEARCH_API_URL = 'https://new.land.naver.com/api/search';
const NAVER_COMPLEX_ARTICLE_BASE_URL = 'https://new.land.naver.com/api/articles/complex';

// 헤더 및 쿠키는 실제 유효한 값으로 대체 필요 (사용자 별도 관리 예정)
const DEFAULT_HEADERS = {
    'accept': '*/*',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NDcwNjE1MzUsImV4cCI6MTc0NzA3MjMzNX0.zkaUPeh1Hp1ICPKfN5yaovCTX6rUMA0CSIyDppM6WyY', // 값 업데이트
    'priority': 'u=1, i',
    'referer': 'https://new.land.naver.com/complexes/142587?ms=37.5154881,127.0399418,17&a=OPST:OBYG:PRE&b=B2:B1&e=RETAIL&ad=true', // referer도 config.py 값으로 업데이트
    'sec-ch-ua': '"Chromium";v="134", "Whale";v="4", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Whale/4.31.304.16 Safari/537.36',
};

const DEFAULT_COOKIES = 'NNB=PY3VYTEXWJKWO; NAC=KCJGBYA5zFnP; NSCS=1; landHomeFlashUseYn=Y; SHOW_FIN_BADGE=Y; NaverSuggestUse=unuse%26unuse; nid_inf=2084488452; NID_AUT=iI2ScIbHjEfMAML4fmzb31LUaIziT+nfO2xZPqeXFsQY+X70aSeonJzf6OqmXtbZ; NID_SES=AAABwpKPJU8TUyXOdvTT18FZE3kWcdBkmfjbQc100zDedKMKpiKxPhJ/cXJ5Cr4H1mT3qVKQl7D8rJKoBtQURvmrlh+jClBwVciL1B2XK6cbv7sIV6cbf8IU/XLGrNrRDnYbZbzZpXeHequGqcR4nD7EjwJ3MJvmnSEc6q69YVqhZ4XdwU3sm4X31Nm87zMDgHmPtrIgE38duC47kehv7NOzGB+7AncmuE8b1s9vBgOw3N5F1T8xvGOiqG3IgL7RD1WUpuhE59t1JRpI7gbMWuB1qqN7eh504Zed+smRGjKG8zFWdrX1H67tjdaHZEJP0b2j7wYiqrUvLNjDZTVD5kQV1DeyiXc9RXmfYeOw6G5hSq/QsO7aDrq4m/7SuFow3Y6/UyU9Tt18AZrMsaCgii40T8yTEJNAVaI1Zy1XJ2x5XLsDUu9Bebvq1UYSgX9oiqzt1NqHiBzEPKdfonHt/sj++qKihgQMtky9IWqvlr1uKjgS0iaHvKy7d3Xrv/Pcr60nWEvGgxLgeIXiOYOfNC8wO+yVxv7P3du0y0Pn8SILkdjoheOR4nS06ihhqpyF0Nl+zQxpJVc9UAlLadg1/ZybrDL7MB3JUZk3fpzY9z0UH5nm; SRT30=1747060936; page_uid=ju44ydqVN8VssldztiGssssssUs-516836; nhn.realestate.article.rlet_type_cd=A01; nhn.realestate.article.trade_type_cd=""; nhn.realestate.article.ipaddress_city=1100000000; REALESTATE=Mon%20May%2012%202025%2023%3A52%3A15%20GMT%2B0900%20(Korean%20Standard%20Time); BUC=WxiSz49gaWvQX4Qg24SyD2pFwUSzEGZ8KpOSF5Mzw4Q='; // 값 업데이트

// 기본 매물 파라미터 (기존 config.py의 DEFAULT_PROPERTY_PARAMS_FOR_LIST 참고)
const DEFAULT_PROPERTY_PARAMS = {
    realEstateType: 'APT:OPST:ABYG:OBYG', // 아파트, 오피스텔, 빌라(연립/다세대), 단독/다가구
    tradeType: 'A1:B1:B2:B3', // 매매, 전세, 월세, 단기임대
    tag: '::::::::',
    rentPriceMin: '0',
    rentPriceMax: '900000000',
    priceMin: '0',
    priceMax: '900000000',
    areaMin: '0',
    areaMax: '900000000',
    oldBuildYears: '',
    recentlyBuildYears: '',
    minHouseHoldCount: '',
    maxHouseHoldCount: '',
    showArticle: 'false',
    sameAddressGroup: 'false', // true로 하면 주소 기준으로 묶어서 보여줌
    minMaintenanceCost: '',
    maxMaintenanceCost: '',
    priceType: 'RETAIL',
    directions: '',
    buildingNos: '',
    areaNos: '',
    type: 'list',
    order: 'rank', // 추천순
};


interface ComplexFromNaver {
    complexNo: string;
    complexName: string;
    realEstateTypeCode: string; // 예: "APT", "OPST"
    realEstateTypeName: string; // 예: "아파트", "오피스텔"
    cortarAddress: string; // 예: "서울시 강남구 개포동"
    totalHouseholdCount: number;
    useApproveYmd: string; // 사용승인일 예: "20200928"
    [key: string]: any; // 기타 속성들
}

interface NaverSearchApiResponse {
    complexes?: ComplexFromNaver[];
    isMoreData?: boolean;
    [key: string]: any;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const guName = searchParams.get('guName');
    const dongName = searchParams.get('dongName');
    const propertyTypeFilter = searchParams.get('propertyType'); // 예: "APT" 또는 "APT:OPST"

    if (!guName || !dongName) {
        return NextResponse.json({ error: 'guName and dongName are required' }, { status: 400 });
    }

    const keyword = `${guName} ${dongName}`;
    let rawComplexList: ComplexFromNaver[] = [];
    let page = 1;
    let isMoreData = true;

    console.log(`API 요청 받음 (단지목록): ${guName} ${dongName}, 매물종류필터: ${propertyTypeFilter}`);

    const headers = { ...DEFAULT_HEADERS, Cookie: DEFAULT_COOKIES };
    // 중요: 실제 운영 시 DEFAULT_HEADERS의 'authorization' 및 DEFAULT_COOKIES 값을 유효한 값으로 설정해야 합니다.

    try {
        while (isMoreData) {
            const queryParams = new URLSearchParams({
                keyword: keyword,
                page: String(page),
            });
            const searchApiUrlWithParams = `${NAVER_SEARCH_API_URL}?${queryParams.toString()}`;
            console.log(`네이버 부동산 단지 검색 API 요청: ${searchApiUrlWithParams}, 페이지: ${page}`);

            const response = await fetch(searchApiUrlWithParams, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`네이버 부동산 단지 검색 API 오류 (페이지 ${page}): ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to fetch complexes from Naver API: ${response.status} ${errorText}`);
            }

            const data: NaverSearchApiResponse = await response.json();
            console.log(`단지 검색 API 응답 상태 코드: ${response.status} (페이지 ${page})`);

            if (data && data.complexes && Array.isArray(data.complexes)) {
                const complexResultsOnPage = data.complexes.filter(item => item.complexNo);
                rawComplexList.push(...complexResultsOnPage);
            } else {
                console.log(`페이지 ${page}에서 'complexes' 데이터를 찾을 수 없거나 배열이 아닙니다. 응답:`, data);
            }
            
            isMoreData = data.isMoreData || false;
            if (isMoreData) {
                page += 1;
                await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
            } else {
                console.log("더 이상 가져올 단지 데이터 없음 (초기 목록 - Raw).");
                break;
            }
        }

        if (!rawComplexList.length) {
            console.log(`${keyword}에 해당하는 단지 정보 없음 (Raw).`);
            return NextResponse.json({ message: "해당 지역에 검색된 단지가 없습니다.", complexes: [] });
        }

        let filteredComplexes = rawComplexList;

        // 매물 종류 필터링 (propertyTypeFilter가 제공된 경우)
        if (propertyTypeFilter && propertyTypeFilter !== DEFAULT_PROPERTY_PARAMS.realEstateType) {
            console.log(`매물 종류 '${propertyTypeFilter}'으로 단지 필터링 시작...`);
            const targetTypes = propertyTypeFilter.split(':');
            filteredComplexes = rawComplexList.filter(complex => {
                const complexEstateTypeCode = complex.realEstateTypeCode;
                const complexEstateTypeName = complex.realEstateTypeName;
                
                if (complexEstateTypeCode && targetTypes.includes(complexEstateTypeCode)) {
                    return true;
                }
                // realEstateTypeName으로도 필터링 (기존 코드 참고)
                if (complexEstateTypeName) {
                    for (const tType of targetTypes) {
                        if (tType === "APT" && complexEstateTypeName.includes("아파트")) return true;
                        if (tType === "OPST" && (complexEstateTypeName.includes("오피스텔") || complexEstateTypeName.includes("오피"))) return true;
                        if (tType === "ABYG" && (complexEstateTypeName.includes("연립") || complexEstateTypeName.includes("빌라"))) return true;
                        if (tType === "OBYG" && (complexEstateTypeName.includes("단독") || complexEstateTypeName.includes("다가구") || complexEstateTypeName.includes("주택"))) return true;
                    }
                }
                return false;
            });
            console.log(`매물 종류 필터링 후 ${filteredComplexes.length}개 단지 남음.`);
        } else {
            console.log(`매물 종류 필터링 건너뜀 (propertyTypeFilter: ${propertyTypeFilter}). 총 ${filteredComplexes.length}개 단지.`);
        }

        if (!filteredComplexes.length) {
            return NextResponse.json({ message: `해당 지역 및 조건에 맞는 단지가 없습니다 (매물종류: ${propertyTypeFilter}).`, complexes: [] });
        }
        
        console.log(`최종 ${filteredComplexes.length}개의 단지 정보 반환.`);
        return NextResponse.json({ complexes: filteredComplexes });

    } catch (error: any) {
        console.error("단지 목록 조회 중 서버 오류:", error);
        return NextResponse.json({ error: error.message || 'Failed to fetch complexes' }, { status: 500 });
    }
} 