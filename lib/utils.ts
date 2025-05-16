import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 네이버 부동산 API 등에서 오는 가격 문자열 (예: "10억", "2억 5,000", "5000")을
 * 숫자형 만원 단위로 변환합니다.
 * @param priceStr 가격 문자열
 * @returns 만원 단위의 숫자. 변환 실패 시 null 반환.
 */
export function parsePriceToManwon(priceStr: string | null | undefined): number | null {
  if (!priceStr || typeof priceStr !== 'string') {
    return null;
  }

  let num = 0;
  const cleanedPriceStr = priceStr.replace(/,/g, '').trim();

  if (cleanedPriceStr.includes('억')) {
    const parts = cleanedPriceStr.split('억');
    num += parseFloat(parts[0]) * 10000;
    if (parts[1] && parts[1].trim() !== '') {
      num += parseFloat(parts[1].replace('만', '').trim()) || 0;
    }
  } else if (cleanedPriceStr.includes('만')) {
    num += parseFloat(cleanedPriceStr.replace('만', '').trim());
  } else {
    // 단위가 없는 경우, 숫자 자체를 만원 단위로 간주 (API 명세 확인 필요)
    // 또는 원 단위일 수 있으므로, API 응답의 실제 단위를 확인해야 함.
    // 현재는 사용자가 만원 단위라고 가정했으므로, 그대로 숫자로 변환.
    const parsed = parseFloat(cleanedPriceStr);
    if (!isNaN(parsed)) {
      num = parsed;
    }
  }
  
  return isNaN(num) || num === 0 ? null : num;
}

export function formatPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined || price === "" || price === "0") {
    // 0도 명시적으로 처리 (API에서 문자열 "0"으로 올 수 있음)
    return "-";
  }

  let priceNum: number;
  if (typeof price === 'string') {
    // 문자열에서 콤마 제거 후 숫자로 변환
    priceNum = parseInt(price.replace(/,/g, ""), 10);
  } else {
    // 이미 숫자인 경우
    priceNum = price;
  }

  // 변환 후에도 유효한 숫자인지, 그리고 0인지 확인
  if (isNaN(priceNum) || priceNum === 0) {
    return "-";
  }

  // 네이버 부동산 API는 가격을 정수형 원 단위로 반환하는 경우가 많음 (예: 150000000 -> 1억 5천만원)
  // 또는 만원 단위로 필터링하여 만원 단위로 내려올 수도 있음 (예: priceMin=5000 -> 5000만원)
  // 여기서는 입력된 priceNum이 '원' 단위라고 가정하고 만원 단위로 먼저 변환합니다.
  // 만약 API 응답이 이미 '만원' 단위라면 이 변환은 필요 없습니다.
  // 주석 처리: const priceInManwon = Math.floor(priceNum / 10000); // 원 단위를 만원 단위로
  // 우선은 입력값이 '만원' 단위라고 가정하고 진행합니다. (API 응답을 정확히 확인 필요)
  const valueInManwon = priceNum; // 입력값이 이미 만원 단위라고 가정

  const eok = Math.floor(valueInManwon / 10000);
  const man = valueInManwon % 10000;

  let result = "";

  if (eok > 0) {
    result += `${eok}억`;
  }

  if (man > 0) {
    if (eok > 0) {
      result += " "; // 억과 만 사이에 공백
    }
    // 1,000단위 콤마 추가
    result += `${man.toLocaleString()}만`;
  }
  
  // eok만 있고 man이 0일 경우 (예: 50000 입력 -> 5억)
  if (eok > 0 && man === 0) {
    // 이미 result에 "X억"이 담겨있음. 추가 작업 불필요
  }
  // eok는 없고 man만 있는 경우 (예: 5000 입력 -> 5,000만)
  else if (eok === 0 && man > 0) {
     // 이미 result에 "X만"이 담겨있음. 추가 작업 불필요
  }
  // eok, man 모두 0이거나 그 외의 경우 (초반에 필터링 되었어야 함)
  else if (result === "") {
     // 이 경우는 위쪽의 isNaN(priceNum) || priceNum === 0 에서 처리되어야 함.
     // 혹시 모를 예외를 위해, 원본 숫자를 만원 단위로 표시
     if (valueInManwon > 0) return `${valueInManwon.toLocaleString()}만`;
     return "-"; // 그래도 이상하면 "-"
  }
  
  return result;
}

// formatPrice 함수의 별칭으로 formatCurrency 사용
export { formatPrice as formatCurrency };

// 제곱미터를 평수로 변환하는 함수
export function m2ToPyeong(m2: string | number | undefined | null): string {
  if (m2 === null || typeof m2 === 'undefined') {
    return '-';
  }
  const numericM2 = parseFloat(String(m2));
  if (isNaN(numericM2) || numericM2 === 0) {
    return '-';
  }
  const pyeong = numericM2 * 0.3025;
  // 소수점 둘째자리까지 반올림
  return pyeong.toFixed(2);
}
