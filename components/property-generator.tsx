"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, FileText, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PropertyGeneratorProps {
  onGeneratePPT: (articleNo: string) => void
}

export default function PropertyGenerator({ onGeneratePPT }: PropertyGeneratorProps) {
  const [articleNo, setArticleNo] = useState("")
  const [propertyInfoList, setPropertyInfoList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // 매물 정보 검색 핸들러
  const handleSearch = async () => {
    if (!articleNo) {
      setError("매물번호를 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // 실제 구현에서는 API 호출
      // 예시 데이터로 대체
      const mockPropertyInfo = {
        articleNo,
        articleName: "상지카일룸M 1동",
        realEstateTypeName: "오피스텔",
        tradeTypeName: "월세",
        dealOrWarrantPrc: "2억",
        rentPrc: "500",
        supplySpace: 125.74,
        exclusiveSpace: 55.24,
        floorInfo: "11/17",
        direction: "동향",
      }

      // API 호출 시뮬레이션
      setTimeout(() => {
        // 중복 매물 체크
        if (!propertyInfoList.some((property) => property.articleNo === articleNo)) {
          setPropertyInfoList([...propertyInfoList, mockPropertyInfo])
        }
        setArticleNo("")
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      setError("매물 정보를 가져오는 중 오류가 발생했습니다.")
      setIsLoading(false)
    }
  }

  // 매물 제거 핸들러
  const handleRemoveProperty = (articleNo: string) => {
    setPropertyInfoList(propertyInfoList.filter((property) => property.articleNo !== articleNo))
  }

  // 가격 표시 포맷
  const formatPrice = (mainPrice: string, rentPrice?: string) => {
    if (!mainPrice) return "-"

    if (rentPrice) {
      return `${mainPrice} / ${rentPrice}`
    }

    return mainPrice
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          물건자료 생성
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">매물번호 입력</h3>
            <p className="text-gray-600 mb-4">
              네이버 부동산에서 확인한 매물번호를 입력하여 물건자료에 포함할 매물을 추가하세요.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="매물번호를 입력하세요 (예: 2523140511)"
                value={articleNo}
                onChange={(e) => setArticleNo(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "검색 중..." : <Search className="h-4 w-4 mr-2" />}
                {isLoading ? "" : "검색"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">매물 목록</h3>
              <div className="text-sm text-gray-500">총 {propertyInfoList.length}개의 매물</div>
            </div>

            {propertyInfoList.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">매물번호를 검색하여 물건자료에 포함할 매물을 추가하세요.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">매물번호</TableHead>
                      <TableHead>매물명</TableHead>
                      <TableHead>종류</TableHead>
                      <TableHead>거래조건</TableHead>
                      <TableHead>면적(㎡)</TableHead>
                      <TableHead>층/방향</TableHead>
                      <TableHead className="w-[80px]">삭제</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyInfoList.map((property) => (
                      <TableRow key={property.articleNo}>
                        <TableCell className="font-medium">{property.articleNo}</TableCell>
                        <TableCell>{property.articleName}</TableCell>
                        <TableCell>{property.realEstateTypeName}</TableCell>
                        <TableCell>
                          {property.tradeTypeName} {formatPrice(property.dealOrWarrantPrc, property.rentPrc)}
                        </TableCell>
                        <TableCell>
                          {property.exclusiveSpace} / {property.supplySpace}
                        </TableCell>
                        <TableCell>
                          {property.floorInfo} / {property.direction}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProperty(property.articleNo)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {propertyInfoList.length > 0 && (
            <div className="flex justify-end">
              <Button
                size="lg"
                className="px-8"
                onClick={() => onGeneratePPT(propertyInfoList.map((p) => p.articleNo).join(","))}
              >
                <FileText className="h-5 w-5 mr-2" />
                물건자료 생성하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
