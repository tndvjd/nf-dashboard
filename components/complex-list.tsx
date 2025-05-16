"use client"

import type { Complex } from "@/types/real-estate"
import { Building } from "lucide-react"

interface ComplexListProps {
  complexes: Complex[]
  selectedComplex: Complex | null
  onSelectComplex: (complex: Complex) => void
  isLoading: boolean
}

export default function ComplexList({ complexes, selectedComplex, onSelectComplex, isLoading }: ComplexListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Building className="mr-2 h-5 w-5 text-blue-600" />
          단지 목록
        </h2>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">단지 목록을 불러오는 중...</div>
          </div>
        ) : complexes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500">필터를 적용하여 단지를 검색해주세요.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {complexes.map((complex) => (
              <li
                key={complex.complexNo}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedComplex?.complexNo === complex.complexNo
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => onSelectComplex(complex)}
              >
                <div className="font-medium text-gray-900">{complex.complexName}</div>
                <div className="text-sm text-gray-500 mt-1">{complex.cortarAddress}</div>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="bg-gray-100 rounded-full px-2 py-1 mr-2">{complex.realEstateTypeName}</span>
                  <span className="bg-gray-100 rounded-full px-2 py-1 mr-2">{complex.totalHouseholdCount}세대</span>
                  <span className="bg-gray-100 rounded-full px-2 py-1">
                    {complex.useApproveYmd ? complex.useApproveYmd.substring(0, 4) + "년 준공" : "준공년도 정보없음"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
