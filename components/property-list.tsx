"use client"

import type { Property } from "@/types/real-estate"
import { Home } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, parsePriceToManwon } from "@/lib/utils"
import Image from "next/image"

interface PropertyListProps {
  properties: Property[]
  selectedProperty: Property | null
  onSelectProperty: (property: Property) => void
  isLoading: boolean
  complexName: string
}

const IMAGE_PREFIX = "https://landthumb-phinf.pstatic.net";

export default function PropertyList({
  properties,
  selectedProperty,
  onSelectProperty,
  isLoading,
  complexName,
}: PropertyListProps) {
  // 거래 유형에 따른 배지 색상
  const getTradeTypeBadgeVariant = (tradeType: string) => {
    switch (tradeType) {
      case "매매":
        return "default"
      case "전세":
        return "secondary"
      case "월세":
        return "destructive"
      case "단기임대":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Home className="mr-2 h-5 w-5 text-blue-600" />
          매물 목록
          {complexName && <span className="ml-2 text-sm font-normal text-gray-500">({complexName})</span>}
        </h2>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">매물 목록을 불러오는 중...</div>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500">
              {complexName ? `${complexName}의 매물 정보가 없습니다.` : "단지를 선택하면 매물 목록이 표시됩니다."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {properties.map((property) => {
              // 가격 포맷팅
              const dealPrice = parsePriceToManwon(property.dealOrWarrantPrc);
              let rentPrice = null;
              if (property.tradeTypeName === "단기임대" && property.monRentPrc && property.monRentPrc !== "0") {
                rentPrice = parsePriceToManwon(property.monRentPrc);
              } else if (property.tradeTypeName === "월세" && property.rentPrc && property.rentPrc !== "0") {
                rentPrice = parsePriceToManwon(property.rentPrc);
              }
              
              let formattedPriceDisplay;
              if ((property.tradeTypeName === "월세" || property.tradeTypeName === "단기임대") && rentPrice) {
                formattedPriceDisplay = `${formatCurrency(dealPrice)} / ${formatCurrency(rentPrice)}`;
              } else {
                formattedPriceDisplay = formatCurrency(dealPrice);
              }

              const representativeImgFullUrl = property.representativeImgUrl 
                ? `${IMAGE_PREFIX}${property.representativeImgUrl}` 
                : null;

              return (
                <li
                  key={property.articleNo}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedProperty?.articleNo === property.articleNo
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectProperty(property)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTradeTypeBadgeVariant(property.tradeTypeName)}>{property.tradeTypeName}</Badge>
                        <span className="text-xs text-gray-500">{property.realEstateTypeName}</span>
                      </div>

                      <div className="font-medium text-gray-900 mt-2">
                        {formattedPriceDisplay}
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        {property.areaName} ({property.area1}㎡ / {property.area2}㎡)
                      </div>

                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="bg-gray-100 rounded-full px-2 py-1 mr-2">{property.floorInfo}</span>
                        {property.direction && (
                          <span className="bg-gray-100 rounded-full px-2 py-1">{property.direction}</span>
                        )}
                      </div>
                    </div>

                    {representativeImgFullUrl && (
                      <div className="w-28 h-28 relative flex-shrink-0 rounded overflow-hidden">
                        <Image 
                          src={representativeImgFullUrl} 
                          alt={`${property.areaName} 대표 이미지`} 
                          fill 
                          className="object-cover" 
                          unoptimized
                        />
                      </div>
                    )}
                  </div>

                  {property.articleFeatureDesc && (
                    <div className="mt-3 text-xs text-gray-500 line-clamp-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      {property.articleFeatureDesc}
                    </div>
                  )}

                  {/* 등록일 및 중개업소 정보 표시 시작 */}
                  {(property.articleConfirmYmd || property.realtorName) && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center text-xs text-gray-500">
                      {property.articleConfirmYmd && (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full mr-2">
                          확인매물 {property.articleConfirmYmd}
                        </span>
                      )}
                      {property.realtorName && (
                        <span className="mr-2">{property.realtorName}</span>
                      )}
                      {/* 추가적인 정보가 있다면 여기에 파이프와 함께 표시 가능 */}
                    </div>
                  )}
                  {/* 등록일 및 중개업소 정보 표시 끝 */}
                </li>
              )}
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
