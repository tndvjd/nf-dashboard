"use client"

import type { PropertyDetail as PropertyDetailType, DisplayPropertyInfo } from "@/types/real-estate"
import { Info, FileText, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { formatCurrency, parsePriceToManwon, m2ToPyeong } from "@/lib/utils"
import { useState } from "react"

interface PropertyDetailProps {
  propertyDetail: PropertyDetailType | null
  isLoading: boolean
  onGeneratePPT: (properties: DisplayPropertyInfo[]) => Promise<void>
}

const IMAGE_PREFIX = "https://landthumb-phinf.pstatic.net";

export default function PropertyDetail({ propertyDetail, isLoading, onGeneratePPT }: PropertyDetailProps) {
  const [areaUnit, setAreaUnit] = useState<'m2' | 'pyeong'>('m2');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const openImageModal = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImageUrl(null);
  };

  const getFormattedPrice = () => {
    if (!propertyDetail?.articlePrice || !propertyDetail?.articleDetail) return "-";
    
    const { tradeTypeName } = propertyDetail.articleDetail;
    const { warrantPrice, rentPrice, dealPrice: apiDealPrice } = propertyDetail.articlePrice;

    let displayDealPrice = "0";
    let displayRentPrice = "0";

    if (tradeTypeName === "월세" || tradeTypeName === "단기임대") {
      displayDealPrice = String(warrantPrice || "0"); // 보증금
      displayRentPrice = String(rentPrice || "0");    // 월세
    } else if (tradeTypeName === "전세") {
      displayDealPrice = String(warrantPrice || "0"); // 전세금
    } else if (tradeTypeName === "매매") {
      // 매매의 경우 dealPrice를 사용해야 하는지, 아니면 warrantPrice에 매매가가 오는지 확인 필요
      // 제공된 JSON에서는 dealPrice가 0, warrantPrice가 20000이므로 warrantPrice를 사용
      displayDealPrice = String(warrantPrice || apiDealPrice || "0"); // 매매가
    }
    
    const formattedDealPrice = formatCurrency(parsePriceToManwon(displayDealPrice));
    
    if ((tradeTypeName === "월세" || tradeTypeName === "단기임대") && parseFloat(displayRentPrice) > 0) {
      const formattedRentPrice = formatCurrency(parsePriceToManwon(displayRentPrice));
      return `${formattedDealPrice} / ${formattedRentPrice}`;
    }
    return formattedDealPrice;
  };

  const mainFloorPlan = propertyDetail?.articleDetail?.grandPlanList?.find(plan => plan.imageOrder === 1 || plan.imageType === '대표') || propertyDetail?.articleDetail?.grandPlanList?.[0];
  // floorPlanUrl은 articleDetail 내에 없는 것으로 보이므로, grandPlanList만 사용하거나, 다른 경로 확인 필요
  const floorPlanFullUrl = mainFloorPlan?.imageSrc ? `${IMAGE_PREFIX}${mainFloorPlan.imageSrc}` : null;

  // 네이버 부동산 링크용 complexNo (hscpNo를 사용하거나, propertyDetail 루트에 있는지 확인)
  // 우선 propertyDetail 루트에 있는 complexNo를 사용한다고 가정
  const complexNoForLink = propertyDetail?.complexNo || propertyDetail?.articleDetail?.hscpNo;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Info className="mr-2 h-5 w-5 text-blue-600" />
          매물 상세정보
        </h2>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">매물 상세 정보를 불러오는 중...</div>
          </div>
        ) : !propertyDetail ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500">매물을 선택하면 상세 정보가 표시됩니다.</p>
          </div>
        ) : (
          <div className="p-4">
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">기본 정보</TabsTrigger>
                <TabsTrigger value="photos">사진</TabsTrigger>
                <TabsTrigger value="generate">자료 생성</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl flex-grow">
                        {propertyDetail.articleDetail?.articleName || '-'}
                        {propertyDetail.articleFacility?.usageTypeName && (
                          <Badge 
                            variant={
                              propertyDetail.articleFacility.usageTypeName.includes("업무") ? "secondary" :
                              propertyDetail.articleFacility.usageTypeName.includes("겸용") ? "default" :
                              "outline"
                            }
                            className="text-xs ml-2 align-middle"
                          >
                            {propertyDetail.articleFacility.usageTypeName}
                          </Badge>
                        )}
                      </CardTitle>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto ml-2 flex-shrink-0"
                        onClick={() => setAreaUnit(prev => prev === 'm2' ? 'pyeong' : 'm2')}
                      >
                        ㎡ / 평
                      </Button>
                    </div>
                    <CardDescription className="flex flex-wrap gap-2 mt-2">
                      {propertyDetail.articleDetail?.tagList?.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">매물번호</span>
                          <span className="font-medium">{propertyDetail.articleDetail?.articleNo || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">거래유형</span>
                          <span className="font-medium">{propertyDetail.articleDetail?.tradeTypeName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">가격</span>
                          <span className="font-medium">
                            {getFormattedPrice()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">면적</span>
                          <div className="flex items-center">
                            <span className="font-medium whitespace-nowrap text-sm">
                              {areaUnit === 'm2' ? (
                                <>
                                  {propertyDetail.articleSpace?.supplySpace || '-'}㎡ / {propertyDetail.articleSpace?.exclusiveSpace || '-'}㎡
                                  {propertyDetail.articleSpace?.exclusiveRate && ` (전용률: ${propertyDetail.articleSpace.exclusiveRate}%)`}
                                </>
                              ) : (
                                <>
                                  {m2ToPyeong(propertyDetail.articleSpace?.supplySpace)}평 / {m2ToPyeong(propertyDetail.articleSpace?.exclusiveSpace)}평
                                  {propertyDetail.articleSpace?.exclusiveRate && ` (전용률: ${propertyDetail.articleSpace.exclusiveRate}%)`}
                                </> 
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">방/욕실</span>
                          <span className="font-medium">
                            {propertyDetail.articleDetail?.roomCount || '-'}개 / {propertyDetail.articleDetail?.bathroomCount || '-'}개
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">층수</span>
                          <span className="font-medium">
                            {propertyDetail.articleFloor?.correspondingFloorCount && propertyDetail.articleFloor?.totalFloorCount
                              ? `${propertyDetail.articleFloor.correspondingFloorCount}층 / ${propertyDetail.articleFloor.totalFloorCount}층`
                              : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">방향</span>
                          <span className="font-medium">
                            {propertyDetail.articleFacility?.directionTypeName || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">입주가능일</span>
                          <span className="font-medium">{propertyDetail.articleDetail?.moveInTypeName || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {floorPlanFullUrl && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-2">평면도</h4>
                        <div 
                          className="relative h-64 w-full bg-gray-100 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImageModal(floorPlanFullUrl)}
                        >
                          <Image
                            src={floorPlanFullUrl}
                            alt="평면도"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}

                    {propertyDetail.articleDetail?.articleFeatureDescription && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-2">매물 특징</h4>
                        <div className="bg-gray-50 p-3 rounded-md text-sm">
                          {propertyDetail.articleDetail.articleFeatureDescription}
                        </div>
                      </div>
                    )}

                    {propertyDetail.articleDetail?.detailDescription && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-2">상세 설명</h4>
                        <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-line">
                          {propertyDetail.articleDetail.detailDescription}
                        </div>
                      </div>
                    )}

                    {propertyDetail.articleDetail?.articleConfirmYmd && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-2">등록일</h4>
                        <div className="bg-gray-50 p-3 rounded-md text-sm">
                          {propertyDetail.articleDetail.articleConfirmYmd}
                        </div>
                      </div>
                    )}

                    {propertyDetail.articleRealtor?.realtorName && (
                      <div className="mt-6 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-700 mb-3">중개업소 정보</h4>
                        <div className="flex items-start space-x-4">
                          <div className="flex-grow text-sm space-y-1">
                            <p><strong>상호명:</strong> {propertyDetail.articleRealtor.realtorName}</p>
                            {propertyDetail.articleRealtor.representativeName && (
                              <p><strong>대표자:</strong> {propertyDetail.articleRealtor.representativeName}</p>
                            )}
                            {propertyDetail.articleRealtor.address && (
                              <p><strong>주소:</strong> {propertyDetail.articleRealtor.address}</p>
                            )}
                            {(propertyDetail.articleRealtor.representativeTelNo) && (
                              <p>
                                <strong>대표번호: </strong>
                                <a 
                                  href={`tel:${propertyDetail.articleRealtor.representativeTelNo}`} 
                                  className="text-blue-600 hover:underline"
                                >
                                  {propertyDetail.articleRealtor.representativeTelNo}
                                </a>
                              </p>
                            )}
                            {(propertyDetail.articleRealtor.cellPhoneNo && propertyDetail.articleRealtor.isCellPhoneExposure) && (
                              <p>
                                <strong>휴대전화: </strong>
                                <a 
                                  href={`tel:${propertyDetail.articleRealtor.cellPhoneNo}`} 
                                  className="text-blue-600 hover:underline"
                                >
                                  {propertyDetail.articleRealtor.cellPhoneNo}
                                </a>
                              </p>
                            )}
                          </div>
                          {propertyDetail.articleRealtor.profileImageUrl && (
                            <div className="w-20 h-20 relative flex-shrink-0 rounded-md overflow-hidden">
                              <Image 
                                src={`${IMAGE_PREFIX}${propertyDetail.articleRealtor.profileImageUrl}`} 
                                alt={`${propertyDetail.articleRealtor.realtorName} 프로필`}
                                fill 
                                className="object-cover" 
                                unoptimized
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (propertyDetail.articleDetail?.articleNo) {
                            let naverLink = `https://new.land.naver.com/articles/${propertyDetail.articleDetail.articleNo}`;
                            if (complexNoForLink) { // complexNoForLink 사용
                                naverLink = `https://new.land.naver.com/complexes/${complexNoForLink}?articleNo=${propertyDetail.articleDetail.articleNo}`;
                            }
                            window.open(naverLink, "_blank");
                          }
                        }}
                        disabled={!propertyDetail?.articleDetail?.articleNo}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        네이버 부동산에서 보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>매물 사진</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {propertyDetail.articlePhotos && propertyDetail.articlePhotos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {propertyDetail.articlePhotos.map((photo, index) => (
                          photo.imageSrc && (
                            <div 
                              key={photo.imageId || photo.imageKey || index} 
                              className="relative aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(`${IMAGE_PREFIX}${photo.imageSrc}`)}
                            >
                              <Image
                                src={`${IMAGE_PREFIX}${photo.imageSrc}`}
                                alt={`매물 사진 ${photo.imageOrder || index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">등록된 사진이 없습니다.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="generate" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>물건자료 생성</CardTitle>
                    <CardDescription>이 매물의 정보를 기반으로 PPT 자료를 생성합니다.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-700 mb-2">매물 정보 확인</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">매물번호</span>
                              <span>{propertyDetail.articleDetail?.articleNo || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">매물명</span>
                              <span>{propertyDetail.articleDetail?.articleName || '-'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">거래조건</span>
                              <span>
                                {propertyDetail.articleDetail?.tradeTypeName}{" "}
                                {getFormattedPrice()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">면적</span>
                              <div className="flex items-center">
                                <span className="whitespace-nowrap mr-2">
                                  {areaUnit === 'm2' ? (
                                    <>
                                      {propertyDetail.articleSpace?.supplySpace || '-'}㎡ / {propertyDetail.articleSpace?.exclusiveSpace || '-'}㎡
                                      {propertyDetail.articleSpace?.exclusiveRate && ` (전용률: ${propertyDetail.articleSpace.exclusiveRate}%)`}
                                    </>
                                  ) : (
                                    <>
                                      {m2ToPyeong(propertyDetail.articleSpace?.supplySpace)}평 / {m2ToPyeong(propertyDetail.articleSpace?.exclusiveSpace)}평
                                      {propertyDetail.articleSpace?.exclusiveRate && ` (전용률: ${propertyDetail.articleSpace.exclusiveRate}%)`}
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="default"
                        size="lg"
                        onClick={() => {
                          if (propertyDetail?.articleDetail?.articleNo) {
                            const currentPropertyForPPT: DisplayPropertyInfo = {
                              articleNo: propertyDetail.articleDetail.articleNo,
                              articleName: propertyDetail.articleDetail.articleName,
                              realEstateTypeName: propertyDetail.articleDetail.realestateTypeName,
                              tradeTypeName: propertyDetail.articleDetail.tradeTypeName,
                              dealOrWarrantPrc: propertyDetail.articleAddition?.dealOrWarrantPrc || propertyDetail.articlePrice?.warrantPrice?.toString(),
                              rentPrc: propertyDetail.articleAddition?.rentPrc || propertyDetail.articlePrice?.rentPrice?.toString(),
                              supplySpace: typeof (propertyDetail.articleAddition?.area1) === 'string' 
                                ? parseFloat(propertyDetail.articleAddition.area1) 
                                : propertyDetail.articleAddition?.area1 || (typeof propertyDetail.articleSpace?.supplySpace === 'string' 
                                    ? parseFloat(propertyDetail.articleSpace.supplySpace) 
                                    : propertyDetail.articleSpace?.supplySpace),
                              exclusiveSpace: typeof (propertyDetail.articleAddition?.area2) === 'string' 
                                ? parseFloat(propertyDetail.articleAddition.area2) 
                                : propertyDetail.articleAddition?.area2 || (typeof propertyDetail.articleSpace?.exclusiveSpace === 'string' 
                                    ? parseFloat(propertyDetail.articleSpace.exclusiveSpace) 
                                    : propertyDetail.articleSpace?.exclusiveSpace),
                              floorInfo: propertyDetail.articleAddition?.floorInfo || 
                                         (propertyDetail.articleFloor?.correspondingFloorCount && propertyDetail.articleFloor?.totalFloorCount 
                                           ? `${propertyDetail.articleFloor.correspondingFloorCount}층 / ${propertyDetail.articleFloor.totalFloorCount}층` 
                                           : undefined),
                              direction: propertyDetail.articleAddition?.direction || propertyDetail.articleFacility?.directionTypeName,
                            };
                            onGeneratePPT([currentPropertyForPPT]);
                          }
                        }}
                        className="w-full"
                        disabled={isLoading || !propertyDetail?.articleDetail?.articleNo}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PPT 자료 생성하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* 이미지 모달 */} 
      {showImageModal && selectedImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeImageModal}
        >
          <div className="relative max-w-3xl max-h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
            <Image src={selectedImageUrl} alt="확대 이미지" width={1000} height={700} className="object-contain" unoptimized />
            <button 
              onClick={closeImageModal} 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
