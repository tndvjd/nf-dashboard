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
interface ArticlePhoto {
  imageId: string
  imageOrder: number
  imageSrc: string
  imageType: string
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
