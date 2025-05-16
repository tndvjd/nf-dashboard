import { NextRequest, NextResponse } from 'next/server';

// 네이버 부동산 API 관련 설정 (app/api/complexes/route.ts 와 동일하게 사용)
const NAVER_COMPLEX_ARTICLE_BASE_URL = 'https://new.land.naver.com/api/articles/complex';

// 실제 헤더 및 쿠키 값 (reference/config.py 참조)
const ACTUAL_DEFAULT_HEADERS = {
    'accept': '*/*',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NDcwNjE1MzUsImV4cCI6MTc0NzA3MjMzNX0.zkaUPeh1Hp1ICPKfN5yaovCTX6rUMA0CSIyDppM6WyY',
    'priority': 'u=1, i',
    'referer': 'https://new.land.naver.com/complexes/142587?ms=37.5154881,127.0399418,17&a=OPST:OBYG:PRE&b=B2:B1&e=RETAIL&ad=true',
    'sec-ch-ua': '"Chromium";v="134", "Whale";v="4", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Whale/4.31.304.16 Safari/537.36',
};

const ACTUAL_DEFAULT_COOKIES = 'NNB=PY3VYTEXWJKWO; NAC=KCJGBYA5zFnP; NSCS=1; landHomeFlashUseYn=Y; SHOW_FIN_BADGE=Y; NaverSuggestUse=unuse%26unuse; nid_inf=2084488452; NID_AUT=iI2ScIbHjEfMAML4fmzb31LUaIziT+nfO2xZPqeXFsQY+X70aSeonJzf6OqmXtbZ; NID_SES=AAABwpKPJU8TUyXOdvTT18FZE3kWcdBkmfjbQc100zDedKMKpiKxPhJ/cXJ5Cr4H1mT3qVKQl7D8rJKoBtQURvmrlh+jClBwVciL1B2XK6cbv7sIV6cbf8IU/XLGrNrRDnYbZbzZpXeHequGqcR4nD7EjwJ3MJvmnSEc6q69YVqhZ4XdwU3sm4X31Nm87zMDgHmPtrIgE38duC47kehv7NOzGB+7AncmuE8b1s9vBgOw3N5F1T8xvGOiqG3IgL7RD1WUpuhE59t1JRpI7gbMWuB1qqN7eh504Zed+smRGjKG8zFWdrX1H67tjdaHZEJP0b2j7wYiqrUvLNjDZTVD5kQV1DeyiXc9RXmfYeOw6G5hSq/QsO7aDrq4m/7SuFow3Y6/UyU9Tt18AZrMsaCgii40T8yTEJNAVaI1Zy1XJ2x5XLsDUu9Bebvq1UYSgX9oiqzt1NqHiBzEPKdfonHt/sj++qKihgQMtky9IWqvlr1uKjgS0iaHvKy7d3Xrv/Pcr60nWEvGgxLgeIXiOYOfNC8wO+yVxv7P3du0y0Pn8SILkdjoheOR4nS06ihhqpyF0Nl+zQxpJVc9UAlLadg1/ZybrDL7MB3JUZk3fpzY9z0UH5nm; SRT30=1747060936; page_uid=ju44ydqVN8VssldztiGssssssUs-516836; nhn.realestate.article.rlet_type_cd=A01; nhn.realestate.article.trade_type_cd=""; nhn.realestate.article.ipaddress_city=1100000000; REALESTATE=Mon%20May%2012%202025%2023%3A52%3A15%20GMT%2B0900%20(Korean%20Standard%20Time); BUC=WxiSz49gaWvQX4Qg24SyD2pFwUSzEGZ8KpOSF5Mzw4Q=';

// 기본 매물 파라미터
const BASE_PROPERTY_API_PARAMS = {
    realEstateType: 'APT:OPST:ABYG:OBYG',
    tradeType: 'A1:B1:B2:B3',
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
    sameAddressGroup: 'false',
    minMaintenanceCost: '',
    maxMaintenanceCost: '',
    priceType: 'RETAIL',
    directions: '',
    buildingNos: '',
    areaNos: '',
    type: 'list',
    order: 'rank',
};

interface NaverProperty {
    articleNo: string;
    complexNo?: string;
    tradeTypeName: string;
    realEstateTypeName: string;
    dealOrWarrantPrc: string;
    rentPrc?: string;
    areaName: string;
    area1: number;
    area2: number;
    floorInfo: string;
    direction?: string;
    articleFeatureDesc?: string;
    [key: string]: any;
}

interface NaverComplexPropertiesApiResponse {
    articleList?: NaverProperty[];
    isMoreData?: boolean;
    [key: string]: any;
}

export async function GET(request: NextRequest, { params }: { params: { complexNo: string } }) {
    const complexNo = params.complexNo;
    const { searchParams } = new URL(request.url);

    if (!complexNo) {
        return NextResponse.json({ error: 'complexNo is required' }, { status: 400 });
    }

    let fetchedProperties: NaverProperty[] = [];
    let page = 1;
    let isMoreData = true;

    const apiParams: Record<string, string> = {
        ...BASE_PROPERTY_API_PARAMS,
        complexNo
    };

    searchParams.forEach((value, key) => {
        if (key in BASE_PROPERTY_API_PARAMS || key === 'complexNo' || key === 'page') {
            apiParams[key] = value;
        }
    });

    if (apiParams.tradeType !== 'B2' && apiParams.tradeType !== 'B3') {
        delete apiParams.rentPriceMin;
        delete apiParams.rentPriceMax;
    }

    console.log(`API 요청 받음 (매물목록): 단지번호 ${complexNo}, 필터:`, apiParams);

    const headers = { ...ACTUAL_DEFAULT_HEADERS, Cookie: ACTUAL_DEFAULT_COOKIES };

    try {
        while (isMoreData) {
            const queryForNaver = new URLSearchParams(apiParams);
            queryForNaver.set('page', String(page));
            
            const requestUrl = `${NAVER_COMPLEX_ARTICLE_BASE_URL}/${complexNo}?${queryForNaver.toString()}`;
            console.log(`네이버 부동산 매물 목록 API 요청: ${requestUrl}, 페이지: ${page}`);

            const response = await fetch(requestUrl, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`네이버 부동산 매물 목록 API 오류 (단지: ${complexNo}, 페이지 ${page}): ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to fetch properties for complex ${complexNo}: ${response.status} ${errorText}`);
            }

            const data: NaverComplexPropertiesApiResponse = await response.json();
            console.log(`매물 목록 API 응답 상태 코드: ${response.status} (페이지 ${page})`);

            if (data && data.articleList && Array.isArray(data.articleList)) {
                fetchedProperties.push(...data.articleList);
            } else {
                console.log(`페이지 ${page}에서 'articleList' 데이터를 찾을 수 없거나 배열이 아닙니다. 응답:`, data);
            }

            isMoreData = data.isMoreData || false;
            if (isMoreData) {
                page += 1;
                await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
            } else {
                console.log("더 이상 가져올 매물 없음.");
                break;
            }
        }

        if (!fetchedProperties.length) {
            return NextResponse.json({ message: "해당 단지에 현재 조건에 맞는 매물이 없습니다.", properties: [] });
        }

        return NextResponse.json({ properties: fetchedProperties });

    } catch (error: any) {
        console.error(`매물 목록 조회 중 서버 오류 (단지: ${complexNo}):`, error);
        return NextResponse.json({ error: error.message || `Failed to fetch properties for complex ${complexNo}` }, { status: 500 });
    }
} 