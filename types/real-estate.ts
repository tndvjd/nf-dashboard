// 매물 종류 타입
export type PropertyType = "APT:OPST:ABYG:OBYG" | "APT" | "OPST"

// 거래 유형 타입
export type TradeType = "A1:B1:B2:B3" | "A1" | "B1" | "B2" | "B3" | string

// 단지 정보 타입
export interface Complex {
  complexNo: string
  complexName: string
  realEstateTypeName: string
  cortarAddress: string
  totalHouseholdCount: number
  useApproveYmd: string
}

// 매물 목록 타입
export interface Property {
  articleNo: string
  complexNo?: string
  tradeTypeName: string
  realEstateTypeName: string
  dealOrWarrantPrc: string
  rentPrc?: string
  monRentPrc?: string
  areaName: string
  area1: number
  area2: number
  floorInfo: string
  direction?: string
  articleFeatureDesc?: string
  representativeImgUrl?: string
  articleConfirmYmd?: string
  realtorName?: string
}

// 매물 상세 정보 타입 - 제공된 JSON 기준
export interface ArticlePhoto {
  imageId: string
  imageOrder: number
  imageSrc: string
  imageType?: string
  imageKey?: string
  etcItem1?: string
  smallCategoryName?: string
  registYmdt?: string
  [key: string]: any
}

interface GrandPlan {
  imageId: string
  imageOrder: number
  imageSrc: string
  imageType: string
}

export interface PropertyDetail {
  articleDetail?: {
    articleNo: string
    articleName?: string
    articleSubName?: string
    cpId?: string
    cortarNo?: string
    hscpNo?: string
    ptpNo?: string
    ptpName?: string
    tradeBuildingTypeCode?: string
    exposeStartYMD?: string
    exposeEndYMD?: string
    buildNo?: string
    articleConfirmYmd?: string
    tradeCompleteYN?: string
    aptName?: string
    aptHeatMethodTypeName?: string
    aptHeatFuelTypeName?: string
    aptParkingCount?: string
    aptParkingCountPerHousehold?: string
    aptHouseholdCount?: string
    aptConstructionCompanyName?: string
    aptUseApproveYmd?: string
    isaleDealRestrictionCode?: string
    totalDongCount?: number
    articleStatusCode?: string
    articleTypeCode?: string
    realestateTypeCode?: string
    realestateTypeName?: string
    tradeTypeCode?: string
    tradeTypeName?: string
    verificationTypeCode?: string
    applyYN?: string
    directTradeYN?: string
    mapLocationIndicationYn?: string
    latitude?: string
    longitude?: string
    cityNo?: string
    cityName?: string
    divisionName?: string
    sectionName?: string
    householdCountByPtp?: string
    realtorId?: string
    walkingTimeToNearSubway?: number
    grandPlanList?: GrandPlan[]
    detailAddress?: string
    exposureAddress?: string
    roomCount?: string
    bathroomCount?: string
    moveInTypeCode?: string
    moveInTypeName?: string
    moveInPossibleYmd?: string
    monthlyManagementCost?: number
    originBuildingName?: string
    buildingName?: string
    articleFeatureDescription?: string
    detailDescription?: string
    parkingCount?: number
    parkingPerHouseholdCount?: string
    parkingPossibleYN?: string
    duplexYN?: string
    floorLayerName?: string
    hasBuildingUnitInfo?: boolean
    principalUse?: string
    tagList?: string[]
    isInterest?: boolean
    isFalseHoodDeclared?: boolean
    kisoConnectionYN?: string
    detailAddressYn?: string
    isComplex?: boolean
    isOwnerTradeCompleted?: boolean
    isSafeLessorOfHug?: boolean
    articlePhotos?: ArticlePhoto[] 
    [key: string]: any
  }
  articleAddition?: {
    articleNo: string
    articleName?: string
    articleStatus?: string
    realEstateTypeCode?: string
    realEstateTypeName?: string
    articleRealEstateTypeCode?: string
    articleRealEstateTypeName?: string
    tradeTypeCode?: string
    tradeTypeName?: string
    verificationTypeCode?: string
    floorInfo?: string
    rentPrc?: string
    priceChangeState?: string
    isPriceModification?: boolean
    dealOrWarrantPrc?: string
    areaName?: string
    area1?: number
    area2?: number
    direction?: string
    articleConfirmYmd?: string
    representativeImgUrl?: string
    representativeImgTypeCode?: string
    representativeImgThumb?: string
    siteImageCount?: number
    articleFeatureDesc?: string
    tagList?: string[]
    buildingName?: string
    sameAddrCnt?: number
    sameAddrDirectCnt?: number
    sameAddrMaxPrc?: string
    sameAddrMinPrc?: string
    cpid?: string
    cpName?: string
    cpPcArticleUrl?: string
    cpPcArticleBridgeUrl?: string
    cpPcArticleLinkUseAtArticleTitleYn?: boolean
    cpPcArticleLinkUseAtCpNameYn?: boolean
    cpMobileArticleUrl?: string
    cpMobileArticleLinkUseAtArticleTitleYn?: boolean
    cpMobileArticleLinkUseAtCpNameYn?: boolean
    latitude?: string
    longitude?: string
    isLocationShow?: boolean
    realtorName?: string
    realtorId?: string
    tradeCheckedByOwner?: boolean
    isDirectTrade?: boolean
    isInterest?: boolean
    isComplex?: boolean
    isVrExposed?: boolean
    isSafeLessorOfHug?: boolean
    [key: string]: any
  }
  articleFacility?: {
    directionTypeCode?: string
    directionTypeName?: string
    directionBaseTypeCode?: string
    directionBaseTypeName?: string
    floorAreaRatio?: string
    buildingCoverageRatio?: string
    usageTypeName?: string
    [key: string]: any
  }
  articleFloor?: {
    totalFloorCount?: string
    undergroundFloorCount?: string
    uppergroundFloorCount?: string
    floorTypeCode?: string
    floorInputMethodCode?: string
    correspondingFloorCount?: string
    buildingHighestFloor?: string
    complexHighestFloor?: string
    [key: string]: any
  }
  articleNoneHscp?: object
  articlePrice?: {
    rentPrice?: number | string
    dealPrice?: number | string
    warrantPrice?: number | string
    allWarrantPrice?: number | string
    financePrice?: number | string
    premiumPrice?: number | string
    isalePrice?: number | string
    allRentPrice?: number | string
    priceBySpace?: number | string
    bondPrice?: number | string
    middlePayment?: number | string
    [key: string]: any
  }
  articleRealtor?: {
    realtorId?: string
    realtorName?: string
    representativeName?: string
    address?: string
    establishRegistrationNo?: string
    dealCount?: number
    leaseCount?: number
    rentCount?: number
    shortTermRentCount?: number
    profileImageUrl?: string
    profileFullImageUrl?: string
    tradeCompleteCount?: number
    ownerArticleCount?: number
    badgeType?: string
    latitude?: number
    longitude?: number
    representativeTelNo?: string
    cellPhoneNo?: string
    isCellPhoneExposure?: boolean
    isRepresentativeTelExposure?: boolean
    cortarNo?: string
    exposeTelTypeCode?: string
    homePageUrl?: string
    [key: string]: any
  }
  articleSpace?: {
    supplySpace?: number | string
    exclusiveSpace?: number | string
    groundSpace?: number | string
    totalSpace?: number | string
    buildingSpace?: number | string
    expectSpace?: number | string
    groundShareSpace?: number | string
    exclusiveRate?: string
    [key: string]: any
  }
  articleTax?: {
    acquisitionTax?: number
    registTax?: number
    registFee?: number
    brokerFee?: number
    maxBrokerFee?: number
    eduTax?: number
    specialTax?: number
    registApplyFee?: number
    digitalRevenuStamp?: number
    nationHouseBond?: number
    totalPrice?: number
    [key: string]: any
  }
  articleExistTabs?: string[]
  articlePhotos?: ArticlePhoto[]
  landPrice?: object
  administrationCostInfo?: object
  isVrExposed?: boolean
  [key: string]: any
}

// PPT 생성 시 프론트엔드와 백엔드 간에 전달될 매물 정보 구조
// RealEstateDashboard.tsx 및 PropertyGenerator.tsx 에서 사용
export interface DisplayPropertyInfo {
  articleNo: string
  articleName?: string
  realEstateTypeName?: string
  tradeTypeName?: string
  dealOrWarrantPrc?: string
  rentPrc?: string
  supplySpace?: number // 공급면적
  exclusiveSpace?: number // 전용면적
  floorInfo?: string // 층정보 (예: "10/15")
  direction?: string // 방향 (예: "남향")
}

// --- PPT 생성 관련 타입 정의 추가 ---

// PPT에 포함될 고객 정보
export interface ClientInfo {
  documentTitle: string; // 예: "강남 오피스텔 월세 물건 자료"
  clientName: string;    // 예: "김철수 고객님"
  companyName?: string;   // 예: "(주)미래부동산컨설팅"
}

// PPT에 포함될 지도 정보
export interface MapInfo {
  mapImageUrl?: string; // 정적 지도 이미지 URL
}

// property-generator.tsx에서 상태로 관리하고,
// /api/generate-ppt 로 전송될 데이터의 기본 구조.
export interface PropertyDataForGenerator extends PropertyDetail { // PropertyDetail을 확장
  // PropertyDetail에 articleNo, articleName 등이 이미 포함되어 있음
  // 추가적으로 사용자가 입력하는 PPT 관련 정보
  documentTitle?: string;
  clientName?: string;
  companyName?: string;
  // 위도, 경도는 PropertyDetail.articleDetail.latitude/longitude 사용
}

// Next.js 백엔드 API (/api/generate-ppt/route.ts)가
// 프론트엔드로부터 요청받는 데이터의 타입.
export interface PPTGenerationRequestData { 
  articleDetail: PropertyDetail['articleDetail']; 
  articleAddition?: PropertyDetail['articleAddition'];
  articlePhotos?: ArticlePhoto[]; 
  documentTitle: string;
  clientName: string;
  companyName?: string;
  companyLogoUrl?: string;
  mapImageUrl?: string;
  // 다중 매물 지원을 위한 필드
  properties?: {
    articleDetail: PropertyDetail['articleDetail']
    articleAddition?: PropertyDetail['articleAddition']
  }[]
  // 사진 URL 목록은 articleDetail.articlePhotos 에서 추출하여 사용
  // 위도, 경도는 articleDetail.latitude, articleDetail.longitude 사용
}

// Python API (FastAPI)로 전달될 최종 데이터 구조 (Next.js 백엔드에서 이 형태로 가공 후 전송)
export interface DataPayloadForPython {
  articleDetail: {
    articleNo: string; 
    articleName?: string;
    articlePhotos?: { photoUrl: string }[];
    complexPyeongDetailList?: { floorPlanUrl: string }[];
    // ... 기타 articleDetail에서 필요한 필드들
    [key: string]: any; 
  };
  articleAddition: {
    // ... 기타 articleAddition에서 필요한 필드들
    [key: string]: any; 
  };
  documentTitle: string;
  clientName: string;
  companyName?: string;
  mapImageUrl?: string; 
  companyLogoUrl?: string;
}

// 기존 PropertyDataForPPT는 DataPayloadForPython 등으로 대체되었으므로 주석 처리합니다.
/*
export interface PropertyDataForPPT {
  articleDetail: PropertyDetail;
  clientInfo: ClientInfo;
  mapInfo?: MapInfo;
}
*/

// property-generator.tsx에서 매물 검색 후 상태로 관리할 데이터 타입 (기존 PropertyDetail 활용)
// export type FetchedPropertyData = PropertyDetail;
// 주석 처리: PropertyDetail을 직접 사용하면 되므로 별도 타입 선언 불필요.
