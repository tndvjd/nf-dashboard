"use client"

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilterHeaderProps {
  filters: {
    keyword: string
    gu: string
    dong: string
    propertyType: string
    tradeType: string
    priceMin: number | null
    priceMax: number | null
    monthlyRentMin: number | null
    monthlyRentMax: number | null
    areaMin: number | null
    areaMax: number | null
  }
  onOpenFilterModal: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function FilterHeader({ filters, onOpenFilterModal, activeTab, onTabChange }: FilterHeaderProps) {
  // 적용된 필터 텍스트 생성
  const getAppliedFiltersText = () => {
    const filterTexts = []

    if (filters.keyword) {
      filterTexts.push(`단지명: "${filters.keyword}"`)
    }

    if (filters.gu) {
      let locationText = `지역: ${filters.gu}`
      if (filters.dong) {
        locationText += ` ${filters.dong}`
      }
      filterTexts.push(locationText)
    }

    if (filters.propertyType !== "APT:OPST:ABYG:OBYG") {
      const propertyTypeMap: Record<string, string> = {
        APT: "아파트",
        OPST: "오피스텔",
        ABYG: "아파트분양권",
        OBYG: "오피스텔분양권",
      }

      const types = filters.propertyType.split(":").map((type) => propertyTypeMap[type] || type)
      filterTexts.push(`매물종류: ${types.join(", ")}`)
    }

    if (filters.tradeType !== "A1:B1:B2:B3") {
      const tradeTypeMap: Record<string, string> = {
        A1: "매매",
        B1: "전세",
        B2: "월세",
        B3: "단기임대",
      }

      const types = filters.tradeType.split(":").map((type) => tradeTypeMap[type] || type)
      filterTexts.push(`거래유형: ${types.join(", ")}`)
    }

    if (filters.priceMin !== null || filters.priceMax !== null) {
      let priceText = "가격: "
      if (filters.priceMin !== null) {
        priceText += `${filters.priceMin}만원 ~ `
      } else {
        priceText += "최소 없음 ~ "
      }

      if (filters.priceMax !== null) {
        priceText += `${filters.priceMax}만원`
      } else {
        priceText += "최대 없음"
      }

      filterTexts.push(priceText)
    }

    if (
      (filters.tradeType.includes("B2") || filters.tradeType.includes("B3")) &&
      (filters.monthlyRentMin !== null || filters.monthlyRentMax !== null)
    ) {
      let rentText = "월세: "
      if (filters.monthlyRentMin !== null) {
        rentText += `${filters.monthlyRentMin}만원 ~ `
      } else {
        rentText += "최소 없음 ~ "
      }

      if (filters.monthlyRentMax !== null) {
        rentText += `${filters.monthlyRentMax}만원`
      } else {
        rentText += "최대 없음"
      }

      filterTexts.push(rentText)
    }

    if (filters.areaMin !== null || filters.areaMax !== null) {
      let areaText = "면적: "
      if (filters.areaMin !== null) {
        areaText += `${filters.areaMin}㎡ ~ `
      } else {
        areaText += "최소 없음 ~ "
      }

      if (filters.areaMax !== null) {
        areaText += `${filters.areaMax}㎡`
      } else {
        areaText += "최대 없음"
      }

      filterTexts.push(areaText)
    }

    return filterTexts.length > 0 ? `적용된 필터: ${filterTexts.join(" | ")}` : "필터를 설정하려면 클릭하세요"
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-800 mr-6">부동산 크롤링 대시보드</h1>
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full md:w-auto">
          <TabsList className="bg-blue-50 p-1 rounded-lg">
            <TabsTrigger
              value="property-search"
              className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              매물 수배
            </TabsTrigger>
            <TabsTrigger
              value="generate-ppt"
              className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              물건자료 생성
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "property-search" && (
        <Button
          onClick={onOpenFilterModal}
          variant="outline"
          className="w-full md:w-auto flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Search className="h-4 w-4" />
          <span className="truncate max-w-[300px] text-sm">{getAppliedFiltersText()}</span>
        </Button>
      )}
    </div>
  )
}
