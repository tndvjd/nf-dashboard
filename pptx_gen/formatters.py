"""
부동산 매물 데이터 포맷팅 관련 유틸리티 함수들

이 모듈은 PPT 생성 시 필요한 다양한 데이터 포맷팅 함수들을 포함합니다.
"""
from typing import Dict, List, Optional, Any
import re
from pptx.util import Pt

def extract_area_from_description(description: str, area_type: str) -> Optional[float]:
    """articleFeaturesDesc 문자열에서 특정 면적 값을 추출합니다.
    예: "계약면적 162.12㎡, 전용면적 134.84㎡" 에서 '계약면적' 또는 '전용면적' 값을 추출
    """
    print(f"[DEBUG extract_area_from_description] Input description: '{description}', area_type: '{area_type}'")
    if not description or not area_type:
        return None
    pattern = re.compile(rf"{re.escape(area_type)}\s*([\d\.]+)\s*㎡")
    print(f"[DEBUG extract_area_from_description] Regex pattern: {pattern.pattern}")
    match = pattern.search(description)
    if match:
        try:
            value_str = match.group(1)
            print(f"[DEBUG extract_area_from_description] Found value string: '{value_str}' for type '{area_type}'")
            return float(value_str)
        except ValueError as e:
            print(f"[ERROR extract_area_from_description] ValueError converting '{value_str}': {e}")
            return None
    else:
        print(f"[DEBUG extract_area_from_description] No match found for type '{area_type}'")
        return None

def format_move_in_date(data_list):
    """입주 가능일 관련 데이터를 받아 포맷팅된 문자열로 반환합니다.
    data_list: [moveInDate (str), moveInDiscussionPossibleYn (str)]
    """
    print(f"[DEBUG format_move_in_date] Input data_list: {data_list}")
    if not isinstance(data_list, list) or len(data_list) < 2:
        return "정보 없음"
    
    move_in_date_str, discussion_possible_yn = data_list
    print(f"[DEBUG format_move_in_date] moveInDate: '{move_in_date_str}', discussionPossibleYn: '{discussion_possible_yn}'")

    if move_in_date_str and move_in_date_str.strip().lower() == "즉시입주":
        return "즉시입주"
    
    if discussion_possible_yn and discussion_possible_yn.upper() == 'Y':
        return "입주협의가능"
        
    if move_in_date_str and move_in_date_str.strip():
        return move_in_date_str

    return "정보 없음"

def format_article_no_title(data_list):
    """매물번호, 지역구, 단지명을 받아 포맷팅된 문자열로 반환합니다. (No. 붙는 기존 형식)"""
    if not isinstance(data_list, list) or len(data_list) < 3:
        print(f"[DEBUG format_article_no_title] Invalid data_list: {data_list}")
        return "정보 없음"
    article_no, division_name, apt_name = data_list
    article_no = article_no if article_no is not None else "N/A"
    division_name = division_name if division_name is not None else "N/A"
    apt_name = apt_name if apt_name is not None else "N/A"
    return f"No.{article_no} [{division_name}] {apt_name}"

def format_title_with_item_index(data_list):
    """매물 순번, 지역구, 단지명을 받아 포맷팅된 문자열로 반환합니다. (순번. 형식)"""
    if not isinstance(data_list, list) or len(data_list) < 3:
        print(f"[DEBUG format_title_with_item_index] Invalid data_list: {data_list}")
        return "정보 없음"
    item_idx, division_name, apt_name = data_list
    item_idx_str = str(item_idx) if item_idx is not None else "-"
    division_name_str = str(division_name) if division_name is not None else "N/A"
    apt_name_str = str(apt_name) if apt_name is not None else "N/A"
    return f"{item_idx_str}. [{division_name_str}] {apt_name_str}"

def format_area_m2_value(area_m2_input):
    """m² 면적 값을 받아 소수점 둘째 자리까지 포맷팅합니다."""
    print(f"[DEBUG format_area_m2_value] Input for m2 formatting: {area_m2_input}, type: {type(area_m2_input)}")
    try:
        val = float(area_m2_input)
        return f"{val:.2f}"
    except (ValueError, TypeError):
        print(f"[ERROR format_area_m2_value] Invalid input for m2 formatting: {area_m2_input}")
        return "-" # 오류 발생 시 기본값

def format_area_py_value(area_m2_input):
    """m² 면적 값을 평으로 변환하고 소수점 둘째 자리까지 포맷팅합니다."""
    print(f"[DEBUG format_area_py_value] Input for pyeong formatting: {area_m2_input}, type: {type(area_m2_input)}")
    try:
        val = float(area_m2_input)
        py_val = val / 3.305785
        return f"{py_val:.2f}"
    except (ValueError, TypeError):
        print(f"[ERROR format_area_py_value] Invalid input for pyeong formatting: {area_m2_input}")
        return "-" # 오류 발생 시 기본값
