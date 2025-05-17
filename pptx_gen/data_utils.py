"""
데이터 처리 관련 유틸리티 함수들

이 모듈은 PPT 생성 시 필요한 데이터 처리 함수들을 포함합니다.
"""
from typing import Dict, Any, List, Optional

def get_value_from_path(data: dict, path, default_value=None):
    """
    주어진 딕셔너리에서 .으로 구분된 경로를 사용하여 값을 가져옵니다.
    
    Args:
        data: 데이터 딕셔너리
        path: 점으로 구분된 경로 문자열 또는 경로 리스트
        default_value: 경로가 존재하지 않을 경우 반환할 기본값(기본: None)
        
    Returns:
        찾은 값 또는 경로가 존재하지 않는 경우 None
    """
    if not data or not path:
        return default_value
    
    # 경로가 문자열인 경우 리스트로 변환
    if isinstance(path, str):
        path_parts = path.split('.')
    else:  # 이미 리스트인 경우
        path_parts = path
    
    # 현재 딕셔너리 참조 유지
    current = data
    
    # 경로 순회
    for part in path_parts:
        # 리스트 인덱스 처리 - 예: complexPyeongDetailList[0]
        if '[' in part and ']' in part:
            name, index_str = part.split('[')
            index = int(index_str.strip(']'))
            
            if not name in current:
                print(f"[ERROR get_value_from_path] Key '{name}' not found in data")
                return default_value
                
            if not isinstance(current[name], (list, tuple)) or len(current[name]) <= index:
                print(f"[ERROR get_value_from_path] List index {index} out of range for key '{name}'")
                return default_value
                
            current = current[name][index]
        else:
            # 일반 키 처리
            if part not in current:
                print(f"[ERROR get_value_from_path] Key '{part}' not found in data")
                return default_value
            current = current[part]
    
    return current
