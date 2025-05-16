"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PropertyType, TradeType } from "@/types/real-estate"

// 서울시 행정구역 데이터
const SEOUL_DISTRICTS: Record<string, string[]> = {
  강남구: [
    "개포동",
    "논현동",
    "대치동",
    "도곡동",
    "삼성동",
    "세곡동",
    "수서동",
    "신사동",
    "압구정동",
    "역삼동",
    "율현동",
    "일원동",
    "자곡동",
    "청담동",
  ],
  강동구: ["강일동", "고덕동", "길동", "둔촌동", "명일동", "상일동", "성내동", "암사동", "천호동"],
  강북구: ["미아동", "번동", "수유동", "우이동"],
  강서구: [
    "가양동",
    "개화동",
    "공항동",
    "등촌동",
    "마곡동",
    "방화동",
    "염창동",
    "오곡동",
    "오쇠동",
    "외발산동",
    "화곡동",
  ],
  관악구: ["봉천동", "신림동"],
  광진구: ["광장동", "구의동", "군자동", "능동", "자양동", "중곡동", "화양동"],
  구로구: ["가리봉동", "개봉동", "고척동", "구로동", "궁동", "신도림동", "오류동", "온수동", "천왕동", "항동"],
  금천구: ["가산동", "독산동", "시흥동"],
  노원구: ["공릉동", "상계동", "월계동", "중계동", "하계동"],
  도봉구: ["도봉동", "방학동", "쌍문동", "창동"],
  동대문구: ["답십리동", "신설동", "용두동", "이문동", "장안동", "전농동", "제기동", "청량리동", "회기동", "휘경동"],
  동작구: ["노량진동", "대방동", "동작동", "본동", "사당동", "상도동", "신대방동", "흑석동"],
  마포구: [
    "공덕동",
    "대흥동",
    "도화동",
    "망원동",
    "상암동",
    "서교동",
    "성산동",
    "신수동",
    "아현동",
    "연남동",
    "염리동",
    "용강동",
    "합정동",
  ],
  서대문구: ["남가좌동", "북가좌동", "북아현동", "신촌동", "연희동", "창천동", "천연동", "충정로", "홍은동", "홍제동"],
  서초구: ["내곡동", "반포동", "방배동", "서초동", "신원동", "양재동", "우면동", "원지동", "잠원동"],
  성동구: ["금호동", "마장동", "사근동", "성수동", "송정동", "옥수동", "왕십리동", "행당동"],
  성북구: [
    "길음동",
    "돈암동",
    "동선동",
    "동소문동",
    "보문동",
    "삼선동",
    "석관동",
    "성북동",
    "안암동",
    "정릉동",
    "종암동",
    "하월곡동",
  ],
  송파구: [
    "가락동",
    "거여동",
    "마천동",
    "문정동",
    "방이동",
    "삼전동",
    "석촌동",
    "송파동",
    "신천동",
    "오금동",
    "잠실동",
    "장지동",
    "풍납동",
  ],
  양천구: ["목동", "신월동", "신정동"],
  영등포구: ["당산동", "대림동", "도림동", "문래동", "신길동", "양평동", "여의도동", "영등포동"],
  용산구: [
    "갈월동",
    "남영동",
    "보광동",
    "서계동",
    "서빙고동",
    "용문동",
    "용산동",
    "원효로",
    "이촌동",
    "이태원동",
    "주성동",
    "청암동",
    "청파동",
    "한강로",
    "한남동",
    "효창동",
    "후암동",
  ],
  은평구: [
    "갈현동",
    "구산동",
    "녹번동",
    "대조동",
    "불광동",
    "수색동",
    "신사동",
    "역촌동",
    "응암동",
    "증산동",
    "진관동",
  ],
  종로구: [
    "가회동",
    "견지동",
    "경운동",
    "계동",
    "공평동",
    "관수동",
    "관철동",
    "관훈동",
    "교남동",
    "교북동",
    "구기동",
    "궁정동",
    "권농동",
    "낙원동",
    "내수동",
    "내자동",
    "누상동",
    "누하동",
    "당주동",
    "도렴동",
    "돈의동",
    "동숭동",
    "명륜동",
    "묘동",
    "무악동",
    "봉익동",
    "부암동",
    "사간동",
    "사직동",
    "삼청동",
    "서린동",
    "세종로",
    "소격동",
    "송월동",
    "송현동",
    "수송동",
    "숭인동",
    "신교동",
    "신문로",
    "신영동",
    "안국동",
    "연건동",
    "연지동",
    "예지동",
    "옥인동",
    "와룡동",
    "운니동",
    "원남동",
    "원서동",
    "이화동",
    "익선동",
    "인사동",
    "인의동",
    "장사동",
    "재동",
    "적선동",
    "종로",
    "중학동",
    "창성동",
    "창신동",
    "청운동",
    "청진동",
    "체부동",
    "충신동",
    "통의동",
    "통인동",
    "팔판동",
    "평동",
    "평창동",
    "필운동",
    "혜화동",
    "홍지동",
    "홍파동",
    "화동",
    "효자동",
    "효제동",
    "훈정동",
  ],
  중구: [
    "광희동",
    "남대문로",
    "남산동",
    "남창동",
    "남학동",
    "다동",
    "만리동",
    "명동",
    "무교동",
    "무학동",
    "묵정동",
    "방산동",
    "봉래동",
    "북창동",
    "산림동",
    "삼각동",
    "서소문동",
    "소공동",
    "수표동",
    "수하동",
    "순화동",
    "신당동",
    "쌍림동",
    "예관동",
    "예장동",
    "오장동",
    "을지로",
    "의주로",
    "인현동",
    "입정동",
    "장교동",
    "장충동",
    "저동",
    "정동",
    "주교동",
    "주자동",
    "중림동",
    "초동",
    "충무로",
    "태평로",
    "필동",
    "황학동",
    "회현동",
    "흥인동",
  ],
  중랑구: ["망우동", "면목동", "묵동", "상봉동", "신내동", "중화동"],
}

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    keyword: string
    gu: string
    dong: string
    propertyType: PropertyType
    tradeType: TradeType
    priceMin: number | null
    priceMax: number | null
    monthlyRentMin: number | null
    monthlyRentMax: number | null
    areaMin: number | null
    areaMax: number | null
  }
  onApplyFilters: (filters: FilterModalProps["filters"]) => void
}

export default function FilterModal({ isOpen, onClose, filters: initialFilters, onApplyFilters }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(initialFilters)
  const [dongOptions, setDongOptions] = useState<string[]>([])

  useEffect(() => {
    setLocalFilters(initialFilters)
  }, [initialFilters])

  useEffect(() => {
    if (localFilters.gu && SEOUL_DISTRICTS[localFilters.gu]) {
      setDongOptions(SEOUL_DISTRICTS[localFilters.gu].sort())
    } else {
      setDongOptions([])
    }
  }, [localFilters.gu])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setLocalFilters(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [name]: value === "PLACEHOLDER_VALUE" ? "" : value }))
    if (name === "gu") {
        setLocalFilters(prev => ({ ...prev, dong: ""}));
    }
  }

  const handleRadioChange = (name: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [name]: value as PropertyType | TradeType }))
  }

  const handleApplyFilters = () => {
    onApplyFilters(localFilters)
  }

  const handleResetFilters = () => {
    const defaultFilters = {
      keyword: "",
      gu: "",
      dong: "",
      propertyType: "APT:OPST" as PropertyType,
      tradeType: "A1:B1:B2:B3" as TradeType,
      priceMin: null,
      priceMax: null,
      monthlyRentMin: null,
      monthlyRentMax: null,
      areaMin: null,
      areaMax: null,
    }
    setLocalFilters(defaultFilters)
    setDongOptions([])
  }
  
  const priceFilterConfig = useMemo(() => {
    const { tradeType } = localFilters;
    let mainPriceLabel = "가격";
    let showMonthlyRent = false;

    if (tradeType.includes("A1")) { // 매매
      mainPriceLabel = "매매가";
    } else if (tradeType.includes("B1")) { // 전세
      mainPriceLabel = "전세금";
    } else if (tradeType.includes("B2") || tradeType.includes("B3")) { // 월세 또는 단기임대 (B3 추가)
      mainPriceLabel = "보증금";
      showMonthlyRent = true;
    } else { // 전체 또는 기타 (기본값)
      mainPriceLabel = "매매/전세/보증금";
    }
    return { mainPriceLabel, showMonthlyRent };
  }, [localFilters.tradeType]);


  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상세 필터</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* 단지명 검색 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="keyword-modal" className="text-right col-span-1">
              단지명
            </Label>
            <Input
              id="keyword-modal"
              name="keyword"
              value={localFilters.keyword}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="단지명 입력"
            />
          </div>

          {/* 지역 선택 (구, 동) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right col-span-1">지역</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <Select
                name="gu"
                value={localFilters.gu || undefined}
                onValueChange={value => handleSelectChange("gu", value === undefined ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- 구 선택 --" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SEOUL_DISTRICTS)
                    .sort()
                    .map(guName => (
                      <SelectItem key={guName} value={guName}>
                        {guName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                name="dong"
                value={localFilters.dong || undefined}
                onValueChange={value => handleSelectChange("dong", value === undefined ? "" : value)}
                disabled={!localFilters.gu || dongOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- 동 선택 --" />
                </SelectTrigger>
                <SelectContent>
                  {dongOptions.map(dongName => (
                    <SelectItem key={dongName} value={dongName}>
                      {dongName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* 매물 종류 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right col-span-1">매물 종류</Label>
            <RadioGroup
              name="propertyType"
              value={localFilters.propertyType}
              onValueChange={value => handleRadioChange("propertyType", value)}
              className="col-span-3 flex flex-wrap gap-x-4 gap-y-2"
            >
              {[
                { value: "APT:OPST", label: "전체" },
                { value: "APT", label: "아파트" },
                { value: "OPST", label: "오피스텔" },
              ].map(pt => (
                <div key={pt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={pt.value} id={`pt-${pt.value}-modal`} />
                  <Label htmlFor={`pt-${pt.value}-modal`} className="font-normal">
                    {pt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 거래 유형 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right col-span-1">거래 유형</Label>
            <RadioGroup
              name="tradeType"
              value={localFilters.tradeType}
              onValueChange={value => handleRadioChange("tradeType", value)}
              className="col-span-3 flex flex-wrap gap-x-4 gap-y-2"
            >
              {[
                { value: "A1:B1:B2:B3", label: "전체" },
                { value: "A1", label: "매매" },
                { value: "B1", label: "전세" },
                { value: "B2", label: "월세" },
                { value: "B3", label: "단기임대" },
              ].map(tt => (
                <div key={tt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={tt.value} id={`tt-${tt.value}-modal`} />
                  <Label htmlFor={`tt-${tt.value}-modal`} className="font-normal">
                    {tt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 가격 필터 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priceMin-modal" className="text-right col-span-1">
              {priceFilterConfig.mainPriceLabel} (만원)
            </Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <Input
                id="priceMin-modal"
                name="priceMin"
                type="number"
                value={localFilters.priceMin ?? ""}
                onChange={handleInputChange}
                placeholder="최소"
              />
              <Input
                name="priceMax"
                type="number"
                value={localFilters.priceMax ?? ""}
                onChange={handleInputChange}
                placeholder="최대"
              />
            </div>
          </div>

          {/* 월세 필터 (동적으로 표시) */}
          {priceFilterConfig.showMonthlyRent && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthlyRentMin-modal" className="text-right col-span-1">
                월세 (만원)
              </Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Input
                  id="monthlyRentMin-modal"
                  name="monthlyRentMin"
                  type="number"
                  value={localFilters.monthlyRentMin ?? ""}
                  onChange={handleInputChange}
                  placeholder="최소"
                />
                <Input
                  name="monthlyRentMax"
                  type="number"
                  value={localFilters.monthlyRentMax ?? ""}
                  onChange={handleInputChange}
                  placeholder="최대"
                />
              </div>
            </div>
          )}

          {/* 면적 필터 (㎡) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="areaMin-modal" className="text-right col-span-1">
              면적 (㎡)
            </Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <Input
                id="areaMin-modal"
                name="areaMin"
                type="number"
                value={localFilters.areaMin ?? ""}
                onChange={handleInputChange}
                placeholder="최소"
              />
              <Input
                name="areaMax"
                type="number"
                value={localFilters.areaMax ?? ""}
                onChange={handleInputChange}
                placeholder="최대"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleResetFilters}>
            초기화
          </Button>
          <Button type="button" onClick={handleApplyFilters}>
            필터 적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
