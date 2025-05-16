"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Property, PropertyDetail } from "@/types/real-estate"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft } from "lucide-react"

interface PropertyModalProps {
  isOpen: boolean
  onClose: () => void
  properties: Property[]
  onSelectProperty: (property: Property) => void
  complexName: string
}

export default function PropertyModal({
  isOpen,
  onClose,
  properties,
  onSelectProperty,
  complexName,
}: PropertyModalProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [activeView, setActiveView] = useState<"list" | "detail">("list")

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

  // 가격 표시 포맷
  const formatPrice = (mainPrice: string, rentPrice?: string) => {
    if (!mainPrice) return "-"

    if (rentPrice) {
      return `${mainPrice} / ${rentPrice}`
    }

    return mainPrice
  }

  // 매물 선택 핸들러
  const handlePropertySelect = async (property: Property) => {
    setSelectedProperty(property)
    setIsDetailLoading(true)
    setActiveView("detail")

    try {
      // 실제 구현에서는 API 호출
      // 예시 데이터로 대체
      const mockDetail: PropertyDetail = {
        articleNo: property.articleNo,
        complexNo: property.complexNo,
        articleName: "상지카일룸M 1동",
        realEstateTypeName: property.realEstateTypeName,
        tradeTypeName: property.tradeTypeName,
        dealOrWarrantPrc: property.dealOrWarrantPrc,
        rentPrc: property.rentPrc,
        supplySpace: property.area1,
        exclusiveSpace: property.area2,
        roomCount: "1",
        bathroomCount: "1",
        floorInfo: property.floorInfo,
        direction: property.direction,
        moveInTypeName: "즉시입주",
        articleFeatureDescription: property.articleFeatureDesc,
        detailDescription: `✅ 매물 정보

▪ 월세:보증금1억원/월세500만원 (선납)
▪ 공급 /전용면적:38.03평/16.71평
▪ 구조: 1룸 / 1욕실
▪ 주차: 자주식 1대
▪ 방향: 북향

━━━━━━━━━━━━━━
✅ 입지 및 교통

교통
지하철 3호선 신사역, 7호선 학동역 도보 이용 가능
도산대로, 올림픽대로, 강변북로 등 주요 도로 접근 용이

생활 인프라`,
      }

      setPropertyDetail(mockDetail)
    } catch (error) {
      console.error("Error fetching property detail:", error)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const handleBackToList = () => {
    setActiveView("list")
    setSelectedProperty(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[825px]">
        <DialogHeader>
          <DialogTitle>{complexName} 매물 선택</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">매물 목록</TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedProperty}>
              상세 정보
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <div className="grid gap-4 grid-cols-3">
              {properties.map((property) => (
                <Button
                  key={property.articleNo}
                  variant="outline"
                  className="justify-start text-left"
                  onClick={() => handlePropertySelect(property)}
                >
                  <div>
                    <div className="flex justify-between">
                      <span>{property.realEstateTypeName}</span>
                      <Badge variant={getTradeTypeBadgeVariant(property.tradeTypeName)}>{property.tradeTypeName}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{property.floorInfo}</div>
                    <div className="text-sm">{formatPrice(property.dealOrWarrantPrc, property.rentPrc)}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.area1} / {property.area2}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="detail">
            {activeView === "detail" && selectedProperty && propertyDetail ? (
              <div>
                <Button variant="ghost" size="sm" onClick={handleBackToList}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  목록으로 돌아가기
                </Button>
                <h3 className="text-lg font-semibold mb-2">{propertyDetail.articleName}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>매물 종류:</strong> {propertyDetail.realEstateTypeName}
                    </p>
                    <p>
                      <strong>거래 유형:</strong> {propertyDetail.tradeTypeName}
                    </p>
                    <p>
                      <strong>가격:</strong> {formatPrice(propertyDetail.dealOrWarrantPrc, propertyDetail.rentPrc)}
                    </p>
                    <p>
                      <strong>공급 면적:</strong> {propertyDetail.supplySpace}
                    </p>
                    <p>
                      <strong>전용 면적:</strong> {propertyDetail.exclusiveSpace}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>방 수:</strong> {propertyDetail.roomCount}
                    </p>
                    <p>
                      <strong>욕실 수:</strong> {propertyDetail.bathroomCount}
                    </p>
                    <p>
                      <strong>층 정보:</strong> {propertyDetail.floorInfo}
                    </p>
                    <p>
                      <strong>방향:</strong> {propertyDetail.direction}
                    </p>
                    <p>
                      <strong>입주 가능일:</strong> {propertyDetail.moveInTypeName}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-semibold">매물 특징:</p>
                  <p>{propertyDetail.articleFeatureDescription}</p>
                </div>
                <div className="mt-4">
                  <p className="font-semibold">상세 설명:</p>
                  <p>{propertyDetail.detailDescription}</p>
                </div>
                <Button onClick={() => onSelectProperty(selectedProperty)}>선택 완료</Button>
              </div>
            ) : isDetailLoading ? (
              <p>Loading...</p>
            ) : (
              <p>상세 정보를 불러오는 중 오류가 발생했습니다.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
