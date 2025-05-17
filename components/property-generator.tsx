"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, FileText, Search, Trash2, Plus, X } from "lucide-react" // 아이콘 추가
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Card 컴포넌트 사용
import { Label } from "@/components/ui/label" // Label 컴포넌트 사용
import { Checkbox } from "@/components/ui/checkbox" // 체크박스 추가
import { Badge } from "@/components/ui/badge" // 뱃지 컴포넌트 추가
import type { PropertyDetail, PPTGenerationRequestData } from "../types/real-estate"

// 파일 다운로드를 위한 유틸리티 함수 (예: FileSaver.js 사용 또는 직접 구현)
// import FileSaver from 'file-saver'; // 만약 FileSaver.js를 사용한다면

export default function PropertyGenerator() { 
  const [articleNoSearch, setArticleNoSearch] = useState("") 
  const [currentPropertyInfo, setCurrentPropertyInfo] = useState<PropertyDetail | null>(null)
  
  // 여러 매물을 저장하기 위한 상태 추가
  const [selectedProperties, setSelectedProperties] = useState<PropertyDetail[]>([])
  
  const [documentTitle, setDocumentTitle] = useState("")
  const [clientName, setClientName] = useState("")
  const [companyName, setCompanyName] = useState("")

  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [isLoadingPPT, setIsLoadingPPT] = useState(false) 
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("") 

  const handleSearch = async () => {
    if (!articleNoSearch) {
      setError("매물번호를 입력해주세요.")
      return
    }

    setIsLoadingSearch(true)
    setError("")
    setSuccessMessage("")
    setCurrentPropertyInfo(null) 

    try {
      const response = await fetch(`/api/articles/${articleNoSearch}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `매물 정보(${articleNoSearch})를 가져오는데 실패했습니다. (${response.status})`)
      }
      const data: PropertyDetail = await response.json()

      setCurrentPropertyInfo(data) 
      setArticleNoSearch("") 
    } catch (err: any) {
      console.error("매물 정보 검색 오류:", err)
      setError(err.message || "매물 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsLoadingSearch(false)
    }
  }
  
  // 현재 매물을 선택된 매물 목록에 추가
  const handleAddProperty = () => {
    if (!currentPropertyInfo) return;
    
    const articleNo = currentPropertyInfo.articleDetail?.articleNo;
    if (!articleNo) {
      setError("매물 번호가 없는 데이터로 추가할 수 없습니다.");
      return;
    }
    
    // 이미 추가된 매물인지 확인
    if (!selectedProperties.some(p => p.articleDetail?.articleNo === articleNo)) {
      setSelectedProperties(prev => [...prev, currentPropertyInfo]);
      setCurrentPropertyInfo(null); // 매물 추가 후 현재 매물 정보 초기화
      setSuccessMessage("매물이 목록에 추가되었습니다.");
      setTimeout(() => setSuccessMessage(""), 3000); // 3초 후 메시지 사라짐
    } else {
      setError("이미 목록에 추가된 매물입니다.");
    }
  }
  
  // 선택된 매물 목록에서 제거
  const handleRemoveProperty = (articleNo: string) => {
    setSelectedProperties(prev => prev.filter(p => p.articleDetail?.articleNo !== articleNo))
  }

  const handleClearProperty = () => {
    setCurrentPropertyInfo(null)
    setError("")
    setSuccessMessage("")
  }
  
  // 모든 선택된 매물 및 입력 정보 초기화
  const handleClearAll = () => {
    setCurrentPropertyInfo(null)
    setSelectedProperties([])
    setError("")
    setSuccessMessage("")
    setDocumentTitle("")
    setClientName("")
    setCompanyName("")
  }

  const handleGeneratePPT = async () => {
    // 선택된 매물이 없다면 현재 매물로 시도
    const propertiesToUse = selectedProperties.length > 0 ? selectedProperties : (currentPropertyInfo ? [currentPropertyInfo] : []);
    
    if (propertiesToUse.length === 0) { 
      setError("PPT를 생성할 매물 정보가 없습니다. 먼저 매물을 검색하고 추가해주세요.")
      return
    }
    if (!documentTitle || !clientName) {
      setError("문서 제목과 고객명은 필수 입력 항목입니다.")
      return
    }

    setIsLoadingPPT(true)
    setError("")
    setSuccessMessage("")

    // 일단 기존 API 호환성을 위해 첫 번째 매물만 사용 (추후 백엔드 수정 필요)
    if (propertiesToUse.length === 0) {
      throw new Error("PPT를 생성할 매물 정보가 없습니다.");
    }
    
    // 첫 번째 매물 사용
    const mainProperty = propertiesToUse[0];
    
    // 요청 본문 생성
    const requestBody: PPTGenerationRequestData = {
      articleDetail: mainProperty.articleDetail,
      articleAddition: mainProperty.articleAddition,
      documentTitle,
      clientName,
      companyName: companyName || undefined,
      // 다중 매물 전송을 위한 properties 배열 추가
      properties: propertiesToUse.map(p => ({
        articleDetail: p.articleDetail,
        articleAddition: p.articleAddition,
      })),
    };

    try {
      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.error || `PPT 생성에 실패했습니다. 서버 응답: ${response.status}`);
      }

      const blob = await response.blob();
      
      // 파일명 생성 로직 수정 (다중 매물 지원)
      let filename = '';
      
      if (selectedProperties.length > 0) {
        // 여러 매물인 경우
        filename = `${documentTitle}_${selectedProperties.length}개_매물_소개자료.pptx`;
      } else if (propertiesToUse.length === 1) {
        // 단일 매물인 경우
        const property = propertiesToUse[0];
        const articleName = property.articleDetail?.articleName || '';
        const articleNo = property.articleDetail?.articleNo || '매물';
        filename = `${articleName || articleNo}_소개자료.pptx`;
      } else {
        // 기본 파일명
        filename = `${documentTitle}_소개자료.pptx`;
      }
      const disposition = response.headers.get('content-disposition');
      if (disposition) {
        const filenameMatch = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); 

      setSuccessMessage(`'${filename}' 파일이 성공적으로 다운로드되었습니다.`);

    } catch (err: any) {
      console.error("PPT 생성 오류:", err);
      setError(err.message || "PPT 생성 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoadingPPT(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          매물 PPT 생성
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. 매물 검색</CardTitle>
              <CardDescription>PPT로 만들 네이버 부동산 매물번호를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="매물번호 입력 (예: 2523140511)"
                  value={articleNoSearch}
                  onChange={(e) => setArticleNoSearch(e.target.value)}
                  className="flex-1"
                  disabled={isLoadingSearch}
                />
                <Button onClick={handleSearch} disabled={isLoadingSearch}>
                  {isLoadingSearch ? "검색 중..." : <Search className="h-4 w-4 mr-2" />}
                  {isLoadingSearch ? "" : "매물 검색"}
                </Button>
              </div>
              {currentPropertyInfo && (
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={handleClearProperty} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" /> 검색 취소
                  </Button>
                  <Button variant="default" size="sm" onClick={handleAddProperty} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" /> 매물 추가
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {currentPropertyInfo && currentPropertyInfo.articleDetail && (
            <Card>
              <CardHeader>
                <CardTitle>선택된 매물 정보</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                <p><strong>매물번호:</strong> {currentPropertyInfo.articleDetail.articleNo}</p>
                <p><strong>매물명:</strong> {currentPropertyInfo.articleDetail.articleName || currentPropertyInfo.articleAddition?.articleName || 'N/A'}</p>
                <p><strong>부동산 종류:</strong> {currentPropertyInfo.articleDetail.realEstateTypeName || currentPropertyInfo.articleAddition?.realEstateTypeName || 'N/A'}</p>
                <p><strong>거래 종류:</strong> {currentPropertyInfo.articleDetail.tradeTypeName || currentPropertyInfo.articleAddition?.tradeTypeName || 'N/A'}</p>
                {currentPropertyInfo.articleAddition?.dealOrWarrantPrc && <p><strong>가격/보증금:</strong> {currentPropertyInfo.articleAddition.dealOrWarrantPrc}</p>}
                {currentPropertyInfo.articleAddition?.rentPrc && <p><strong>월세:</strong> {currentPropertyInfo.articleAddition.rentPrc}</p>}
                {currentPropertyInfo.articleAddition?.area1 && <p><strong>공급면적:</strong> {currentPropertyInfo.articleAddition.area1} m²</p>}
                {currentPropertyInfo.articleAddition?.area2 && <p><strong>전용면적:</strong> {currentPropertyInfo.articleAddition.area2} m²</p>}
                {currentPropertyInfo.articleAddition?.floorInfo && <p><strong>층 정보:</strong> {currentPropertyInfo.articleAddition.floorInfo}</p>}
                {currentPropertyInfo.articleAddition?.direction && <p><strong>방향:</strong> {currentPropertyInfo.articleAddition.direction}</p>}
              </CardContent>
            </Card>
          )}

          {/* 선택된 매물 목록 표시 */}
          {selectedProperties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>선택된 매물 목록</CardTitle>
                <CardDescription>PPT에 포함될 매물 목록입니다. {selectedProperties.length}개의 매물이 선택되었습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedProperties.map((property, index) => (
                  <div key={property.articleDetail?.articleNo} className="flex justify-between items-center p-2 border rounded-md">
                    <div>
                      <Badge variant="outline" className="mb-1">{index + 1}</Badge>
                      <p className="text-sm font-medium">{property.articleDetail?.articleName || property.articleAddition?.articleName || property.articleDetail?.articleNo}</p>
                      <p className="text-xs text-gray-500">
                        {property.articleDetail?.realestateTypeName || property.articleAddition?.realEstateTypeName}, 
                        {property.articleAddition?.area2 && `${property.articleAddition.area2}m²`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveProperty(property.articleDetail?.articleNo || '')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setSelectedProperties([])} className="w-full mt-2">
                  <Trash2 className="h-4 w-4 mr-2" /> 모든 매물 삭제
                </Button>
              </CardContent>
            </Card>
          )}

          {(currentPropertyInfo || selectedProperties.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>2. PPT 생성 정보 입력</CardTitle>
                <CardDescription>생성될 PPT에 포함될 정보를 입력하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="documentTitle">문서 제목 (필수)</Label>
                  <Input 
                    id="documentTitle" 
                    placeholder="예: 고객님께 드리는 특별 매물 제안"
                    value={documentTitle} 
                    onChange={(e) => setDocumentTitle(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="clientName">고객명 (필수)</Label>
                  <Input 
                    id="clientName" 
                    placeholder="예: 김철수 고객님"
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">회사명 (선택)</Label>
                  <Input 
                    id="companyName" 
                    placeholder="예: 행복 부동산 중개법인"
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClearAll} disabled={isLoadingPPT} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" /> 모두 지우기
                  </Button>
                  <Button onClick={handleGeneratePPT} disabled={isLoadingPPT} className="flex-1">
                    {isLoadingPPT ? "PPT 생성 중..." : <FileText className="h-4 w-4 mr-2" />}
                    {isLoadingPPT ? "" : "PPT 생성 및 다운로드"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default"> 
              <FileText className="h-4 w-4" />
              <AlertTitle>성공</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
