"use client"

import { useState, useEffect } from "react"
import FilterHeader from "./filter-header"
import ComplexList from "./complex-list"
import PropertyList from "./property-list"
import PropertyDetailComponent from "./property-detail"; // Renamed component import to avoid conflict
import FilterModal from "./filter-modal"
import PropertyGenerator from "./property-generator"
import { Button } from "@/components/ui/button"
import type {
  PropertyType,
  TradeType,
  Complex,
  Property,
  PropertyDetail as PropertyDetailType, // Alias the type import
  DisplayPropertyInfo,
} from "@/types/real-estate"

const ITEMS_PER_PAGE_COMPLEXES = 5; // 단지 목록 페이지당 항목 수

export default function RealEstateDashboard() {
  // 필터 상태
  const [filters, setFilters] = useState({
    keyword: "",
    gu: "",
    dong: "",
    propertyType: "APT:OPST:ABYG:OBYG" as PropertyType,
    tradeType: "A1:B1:B2:B3" as TradeType,
    priceMin: null as number | null,
    priceMax: null as number | null,
    monthlyRentMin: null as number | null,
    monthlyRentMax: null as number | null,
    areaMin: null as number | null,
    areaMax: null as number | null,
  })

  // 데이터 상태
  const [allComplexes, setAllComplexes] = useState<Complex[]>([]) // 모든 단지 목록
  const [complexes, setComplexes] = useState<Complex[]>([]) // 현재 페이지에 보여줄 단지 목록
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetailType | null>(null) // Use the aliased type

  // 선택 상태
  const [selectedComplex, setSelectedComplex] = useState<Complex | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // 모달 상태
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // 로딩 상태
  const [isComplexLoading, setIsComplexLoading] = useState(false)
  const [isPropertyLoading, setIsPropertyLoading] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false) // PPT 생성 로딩 상태

  // 탭 상태
  const [activeTab, setActiveTab] = useState("property-search")
  
  // 페이지네이션 상태 (단지 목록용)
  const [currentComplexPage, setCurrentComplexPage] = useState(1);

  // 필터 적용 함수
  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setIsFilterModalOpen(false)
    setCurrentComplexPage(1); // 필터 변경 시 첫 페이지로
    fetchComplexes(newFilters, 1); // 페이지 정보 전달
  }

  // 단지 목록 가져오기 (페이지 정보 추가)
  const fetchComplexes = async (filterParams: typeof filters, page: number) => {
    setIsComplexLoading(true)
    // 전체 목록은 필터 적용 시 새로 가져오므로, 여기서는 현재 페이지만 신경쓰지 않아도 될 수 있음.
    // 또는, 첫 페이지 로드 시 전체를 받고, 이후에는 클라이언트 사이드 페이지네이션을 할 수도 있음.
    // 현재는 API 호출 시 페이지네이션을 지원하지 않는다는 가정하에, 전체를 받고 클라이언트에서 슬라이싱.
    setAllComplexes([]) 
    setComplexes([]) 
    setSelectedComplex(null)
    setProperties([])
    setSelectedProperty(null)
    setPropertyDetail(null)

    try {
      const queryParams = new URLSearchParams();
      if (filterParams.keyword) {
        queryParams.append('nameKeyword', filterParams.keyword);
        if (filterParams.propertyType) {
          queryParams.append('propertyType', filterParams.propertyType);
        }
        const response = await fetch(`/api/complexes/search-by-name?${queryParams.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '단지 목록(키워드)을 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setAllComplexes(data.complexes || []);
        // setComplexes( (data.complexes || []).slice( (page - 1) * ITEMS_PER_PAGE_COMPLEXES, page * ITEMS_PER_PAGE_COMPLEXES ) );

      } else if (filterParams.gu && filterParams.dong) {
        queryParams.append('guName', filterParams.gu);
        queryParams.append('dongName', filterParams.dong);
        if (filterParams.propertyType) {
          queryParams.append('propertyType', filterParams.propertyType);
        }
        const response = await fetch(`/api/complexes?${queryParams.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '단지 목록(지역)을 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setAllComplexes(data.complexes || []);
        // setComplexes( (data.complexes || []).slice( (page - 1) * ITEMS_PER_PAGE_COMPLEXES, page * ITEMS_PER_PAGE_COMPLEXES ) );
      } else {
        console.log("단지 검색을 위한 키워드 또는 지역 정보가 충분하지 않습니다.");
        setAllComplexes([]);
        // setComplexes([]); 
        return;
      }

    } catch (error: any) {
      console.error("단지 목록 가져오기 실패:", error);
      alert(`단지 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
      setAllComplexes([]);
      // setComplexes([]); 
    } finally {
      setIsComplexLoading(false)
    }
  }
  
  // allComplexes 또는 currentComplexPage가 변경될 때 complexes 상태 업데이트
  useEffect(() => {
    const start = (currentComplexPage - 1) * ITEMS_PER_PAGE_COMPLEXES;
    const end = start + ITEMS_PER_PAGE_COMPLEXES;
    setComplexes(allComplexes.slice(start, end));
  }, [allComplexes, currentComplexPage]);

  // 매물 목록 가져오기
  const fetchProperties = async (complexNo: string) => {
    setIsPropertyLoading(true)
    setProperties([]) // 기존 목록 초기화
    setSelectedProperty(null)
    setPropertyDetail(null)

    try {
      // 현재 적용된 필터 값들을 API 파라미터로 사용
      const queryParams = new URLSearchParams();
      if (filters.tradeType) queryParams.append('tradeType', filters.tradeType);
      if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
      if (filters.priceMin !== null) queryParams.append('priceMin', String(filters.priceMin));
      if (filters.priceMax !== null) queryParams.append('priceMax', String(filters.priceMax));
      if (filters.monthlyRentMin !== null) queryParams.append('rentPriceMin', String(filters.monthlyRentMin));
      if (filters.monthlyRentMax !== null) queryParams.append('rentPriceMax', String(filters.monthlyRentMax));
      if (filters.areaMin !== null) queryParams.append('areaMin', String(filters.areaMin));
      if (filters.areaMax !== null) queryParams.append('areaMax', String(filters.areaMax));

      const response = await fetch(`/api/complexes/${complexNo}/properties?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '매물 목록을 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setProperties(data.properties || []);

    } catch (error: any) {
      console.error("매물 목록 가져오기 실패:", error)
      alert(`매물 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
      setProperties([]); // 오류 발생 시 목록 비우기
    } finally {
      setIsPropertyLoading(false)
    }
  }

  // 매물 상세 정보 가져오기
  const fetchPropertyDetail = async (articleNo: string, complexNo: string) => {
    setIsDetailLoading(true)
    setPropertyDetail(null) // 기존 상세 정보 초기화

    try {
      // complexNo는 선택적 파라미터로 전달
      const apiUrl = complexNo
        ? `/api/articles/${articleNo}?complexNo=${complexNo}`
        : `/api/articles/${articleNo}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '매물 상세 정보를 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setPropertyDetail(data || null); // API 응답 전체를 propertyDetail 상태에 설정하도록 수정

    } catch (error: any) {
      console.error("매물 상세 정보 가져오기 실패:", error)
      alert(`매물 상세 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`);
      setPropertyDetail(null); // 오류 발생 시 상세 정보 비우기
    } finally {
      setIsDetailLoading(false)
    }
  }

  // 단지 선택 핸들러
  const handleComplexSelect = (complex: Complex) => {
    setSelectedComplex(complex)
    fetchProperties(complex.complexNo)
  }

  // 매물 선택 핸들러
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    fetchPropertyDetail(property.articleNo, property.complexNo || selectedComplex?.complexNo || "")
  }

  // PPT 생성 요청 핸들러
  const handleGeneratePPT = async (propertiesToGenerate: DisplayPropertyInfo[]): Promise<void> => {
    if (!propertiesToGenerate || propertiesToGenerate.length === 0) {
      alert("PPT를 생성할 매물을 선택해주세요.");
      return;
    }
    setIsGeneratingPPT(true);
    try {
      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: propertiesToGenerate }), // 매물 목록 데이터를 body에 담아 전송
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'PPT 생성에 실패했습니다.');
      }

      // 성공 시 파일 다운로드 처리 (API가 파일 스트림이나 URL을 반환한다고 가정)
      // 예시: API가 Blob을 반환하는 경우
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `부동산_매물자료_${new Date().toISOString().slice(0,10)}.pptx`; // 날짜를 포함한 파일명
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert('PPT 파일이 성공적으로 생성되어 다운로드됩니다.');

    } catch (error: any) {
      console.error("PPT 생성 오류:", error);
      alert(`PPT 생성 중 오류 발생: ${error.message}`);
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  // 단지 목록 페이지 변경 핸들러
  const handleComplexPageChange = (newPage: number) => {
    setCurrentComplexPage(newPage);
    // fetchComplexes(filters, newPage); // 만약 API가 페이지네이션을 지원한다면 여기서 다시 호출
    // 현재는 클라이언트 사이드 페이지네이션이므로 useEffect가 처리
  }
  
  const totalComplexPages = Math.ceil(allComplexes.length / ITEMS_PER_PAGE_COMPLEXES);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 헤더 및 탭 */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <FilterHeader
            filters={filters}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 h-full py-4">
          {activeTab === "property-search" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
              {/* 단지 목록 */}
              <div className="lg:col-span-3 bg-white rounded-lg shadow h-full overflow-hidden flex flex-col">
                <ComplexList
                  complexes={complexes} // 이제 현재 페이지의 단지 목록만 전달
                  selectedComplex={selectedComplex}
                  onSelectComplex={handleComplexSelect}
                  isLoading={isComplexLoading}
                />
                {/* 단지 목록 페이지네이션 */} 
                {allComplexes.length > ITEMS_PER_PAGE_COMPLEXES && (
                  <div className="p-4 border-t flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleComplexPageChange(currentComplexPage - 1)}
                      disabled={currentComplexPage <= 1}
                    >
                      이전
                    </Button>
                    <span className="text-sm">
                      {currentComplexPage} / {totalComplexPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleComplexPageChange(currentComplexPage + 1)}
                      disabled={currentComplexPage >= totalComplexPages}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </div>

              {/* 매물 목록 */}
              <div className="lg:col-span-4 bg-white rounded-lg shadow h-full overflow-hidden">
                <PropertyList
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onSelectProperty={handlePropertySelect}
                  isLoading={isPropertyLoading}
                  complexName={selectedComplex?.complexName || ""}
                />
              </div>

              {/* 매물 상세 정보 */}
              <div className="lg:col-span-5 bg-white rounded-lg shadow h-full overflow-hidden">
                {selectedProperty && propertyDetail ? (
                  <PropertyDetailComponent 
                    propertyDetail={propertyDetail} 
                    isLoading={isDetailLoading} 
                    onGeneratePPT={handleGeneratePPT} 
                  />
                ) : (
                  <p>매물을 선택해주세요.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-lg shadow overflow-hidden">
              <PropertyGenerator />
            </div>
          )}
        </div>
      </div>

      {/* 필터 모달 */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={applyFilters}
      />
    </div>
  )
}
