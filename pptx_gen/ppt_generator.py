"""
PPT 생성 핵심 기능 모듈
이 모듈은 부동산 매물 정보를 바탕으로 PPT 파일을 생성하는 핵심 기능을 담당합니다.
테스트 폴더의 ppt_logic.py와 debug_ppt_elements.py의 기능을 활용합니다.
"""
import os
import tempfile
from pptx import Presentation
from typing import Dict, Optional, Any, List
import datetime

# ppt_logic.py의 핵심 기능 임포트
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    from ppt_logic import clone_slide, generate_presentation_logic
except ImportError:
    print("[ERROR] ppt_logic 모듈을 찾을 수 없습니다. 경로를 확인하세요.")
    print(f"현재 Python 경로: {sys.path}")
    # 대체 구현 시도
    from pptx import Presentation
    
    def clone_slide(prs, index):
        print("[WARNING] 대체 구현된 clone_slide 함수를 사용합니다.")
        return prs.slides[index]
        
    def generate_presentation_logic(client_data, article_json_data, mappings=None, template_path=None, output_path=None):
        print("[WARNING] 대체 구현된 generate_presentation_logic 함수를 사용합니다.")
        prs = Presentation(template_path)
        prs.save(output_path)
        return output_path

# 기존 코드와의 호환성 유지를 위한 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def create_ppt_file(property_data: Dict, map_image_url: Optional[str], template_filepath: str, mapping_csv_filepath: Optional[str] = None) -> str:
    """
    매물 정보를 바탕으로 PPT 파일을 생성합니다.

    Args:
        property_data: 매물 정보 딕셔너리
        map_image_url: 지도 이미지 URL (선택 사항)
        template_filepath: PPT 템플릿 파일 경로
        mapping_csv_filepath: 매핑 CSV 파일 경로 (선택 사항)

    Returns:
        생성된 임시 PPT 파일 경로
    """
    print("--- create_ppt_file 진입 (ppt_logic 기반 구현) ---")
    print(f"[DEBUG] Received property_data keys: {list(property_data.keys()) if property_data else 'None'}")
    print(f"[DEBUG] Received map_image_url: {map_image_url}")
    print(f"[DEBUG] Using template: {template_filepath}")

    # API 기대 형식과 내부 로직에 맞게 데이터 변환
    article_json_data = {}
    client_data = {}
    
    # 문서 정보, 고객 정보 등 가져오기
    if "documentTitle" in property_data:
        client_data["문서명"] = property_data.get("documentTitle", "")
    if "clientName" in property_data:
        client_data["고객명"] = property_data.get("clientName", "")
    if "companyName" in property_data:
        client_data["회사명"] = property_data.get("companyName", "")
    
    # 참고사항 및 비고 정보 처리
    if "참고사항_입력" in property_data:
        client_data["참고사항_입력"] = property_data.get("참고사항_입력", "")
    if "비고_입력" in property_data:
        client_data["비고_입력"] = property_data.get("비고_입력", "")
        
    # 매물 상세 정보
    if "articleDetail" in property_data:
        article_json_data.update(property_data.get("articleDetail", {}))
    
    # 추가 정보
    if "articleAddition" in property_data:
        article_json_data["articleAddition"] = property_data.get("articleAddition", {})
    
    # 매물 가격 정보
    if "articlePrice" in property_data:
        article_json_data["articlePrice"] = property_data.get("articlePrice", {})
    elif "articleAddition" in property_data and "dealOrWarrantPrc" in property_data["articleAddition"]:
        # 기존 API는 다른 형식으로 가격 정보를 보낼 수 있음
        if not "articlePrice" in article_json_data:
            article_json_data["articlePrice"] = {}
            
        try:
            # 문자열 형식의 금액을 숫자로 변환
            warrant_price_text = property_data["articleAddition"].get("dealOrWarrantPrc", "0")
            warrant_price = int(warrant_price_text.replace("억", "0000").replace(",", ""))
            article_json_data["articlePrice"]["warrantPrice"] = warrant_price
        except (ValueError, TypeError, AttributeError) as e:
            print(f"[WARNING] 보증금 문자열 변환 오류: {e}")
            article_json_data["articlePrice"]["warrantPrice"] = 0
            
        try:
            # 월세 문자열을 숫자로 변환
            rent_price_text = property_data["articleAddition"].get("rentPrc", "0") 
            rent_price = int(rent_price_text.replace(",", ""))
            article_json_data["articlePrice"]["rentPrice"] = rent_price
        except (ValueError, TypeError, AttributeError) as e:
            print(f"[WARNING] 월세 문자열 변환 오류: {e}")
            article_json_data["articlePrice"]["rentPrice"] = 0
    
    # 면적 정보
    if "articleSpace" in property_data:
        article_json_data["articleSpace"] = property_data.get("articleSpace", {})
    
    # 사진 정보 처리
    if "articlePhotos" in property_data:
        article_json_data["articlePhotos"] = property_data.get("articlePhotos", [])
    
    # 층 정보
    if "articleFloor" in property_data:
        article_json_data["articleFloor"] = property_data.get("articleFloor", {})
    
    # 관리비 정보
    if "administrationCostInfo" in property_data:
        article_json_data["administrationCostInfo"] = property_data.get("administrationCostInfo", {})
    
    # 지도 이미지 처리 (이 부분은 ppt_logic에서 활용됩니다)
    if map_image_url:
        article_json_data["mapImageUrl"] = map_image_url

    # 임시 파일 경로 생성
    temp_dir = tempfile.gettempdir()
    temp_filename = f"property_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pptx"
    output_path = os.path.join(temp_dir, temp_filename)

    # ppt_logic의 generate_presentation_logic 함수 호출
    try:
        print(f"[INFO] PPT 생성 시작: {output_path}")
        generate_presentation_logic(client_data, article_json_data, None, template_filepath, output_path)
        print(f"[INFO] PPT 생성 완료: {output_path}")
        return output_path
    except Exception as e:
        print(f"[ERROR] PPT 생성 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        raise e


def create_ppt_file_multi(properties_data: List[Dict], document_info: Dict, map_image_url: Optional[str] = None, template_filepath: str = None, mapping_csv_filepath: Optional[str] = None) -> str:
    """
    여러 매물 정보를 바탕으로 하나의 PPT 파일을 생성합니다.
    
    Args:
        properties_data: 매물 정보 딕셔너리 목록
        document_info: 문서 제목, 고객명 등 문서 전체에 적용될 정보
        map_image_url: 지도 이미지 URL (선택 사항)
        template_filepath: PPT 템플릿 파일 경로
        mapping_csv_filepath: 매핑 CSV 파일 경로 (선택 사항)
        
    Returns:
        생성된 임시 PPT 파일 경로
    """
    print("--- create_ppt_file_multi 진입 (ppt_logic 기반 구현) ---")
    print(f"[DEBUG] Received {len(properties_data)} properties")
    print(f"[DEBUG] Document info: {document_info}")
    print(f"[DEBUG] Using template: {template_filepath}")
    
    # 문서 기본 정보 설정
    client_data = {
        "문서명": document_info.get("documentTitle", "매물 소개 자료"),
        "고객명": document_info.get("clientName", "고객님"),
        "회사명": document_info.get("companyName", ""),
        "참고사항_입력": document_info.get("참고사항_입력", ""),
        "비고_입력": document_info.get("비고_입력", "")
    }
    
    # 임시 파일 경로 생성
    temp_dir = tempfile.gettempdir()
    temp_filename = f"properties_multi_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pptx"
    output_path = os.path.join(temp_dir, temp_filename)
    
    # 프레젠테이션 객체 생성
    try:
        prs = Presentation(template_filepath)
    except Exception as e:
        print(f"[ERROR] Failed to load PPT template: {template_filepath}. Error: {e}")
        raise e
    
    # 첫 번째 매물 데이터를 이용해 문서 표지 슬라이드 생성
    if properties_data and len(properties_data) > 0:
        first_property = properties_data[0]
        
        # 첫 번째 매물로 표지 슬라이드 구성
        first_article_json_data = {}
        
        # 매물 상세 정보
        if "articleDetail" in first_property:
            first_article_json_data.update(first_property.get("articleDetail", {}))
        
        # 추가 정보
        if "articleAddition" in first_property:
            first_article_json_data["articleAddition"] = first_property.get("articleAddition", {})
        
        # 매물 가격 정보
        if "articlePrice" in first_property:
            first_article_json_data["articlePrice"] = first_property.get("articlePrice", {})
        
        # ppt_logic의 generate_presentation_logic 함수 호출하여 첫 매물로 표지 슬라이드 구성
        try:
            print("[INFO] 표지 슬라이드 생성 시작")
            prs = Presentation(template_filepath)
            
            # 첫 번째 슬라이드(표지)에 필요한 정보만 채우기
            # ppt_logic의 generate_presentation_logic과 다르게, 여기서는 매물 정보 슬라이드를 생성하지 않습니다.
            # 표지 슬라이드만 처리하는 코드...
            # (코드 추가 필요)
            
        except Exception as e:
            print(f"[ERROR] 표지 슬라이드 생성 중 오류 발생: {e}")
            import traceback
            traceback.print_exc()
            raise e
    
        # 각 매물마다 슬라이드 추가
        for idx, property_data in enumerate(properties_data):
            print(f"[INFO] 매물 {idx+1}/{len(properties_data)} 슬라이드 생성 중")
            
            # 매물 데이터 변환
            article_json_data = {}
            
            # 매물 상세 정보
            if "articleDetail" in property_data:
                article_json_data.update(property_data.get("articleDetail", {}))
            
            # 추가 정보
            if "articleAddition" in property_data:
                article_json_data["articleAddition"] = property_data.get("articleAddition", {})
            
            # 매물 가격 정보 
            if "articlePrice" in property_data:
                article_json_data["articlePrice"] = property_data.get("articlePrice", {})
            
            # 면적 정보
            if "articleSpace" in property_data:
                article_json_data["articleSpace"] = property_data.get("articleSpace", {})
            
            # 사진 정보 처리
            if "articlePhotos" in property_data:
                article_json_data["articlePhotos"] = property_data.get("articlePhotos", [])
            
            # 층 정보
            if "articleFloor" in property_data:
                article_json_data["articleFloor"] = property_data.get("articleFloor", {})
            
            # 관리비 정보
            if "administrationCostInfo" in property_data:
                article_json_data["administrationCostInfo"] = property_data.get("administrationCostInfo", {})
            
            # 매물 순번 추가 (1부터 시작)
            article_json_data["매물순번"] = idx + 1
            
            # 지도 이미지 처리 (이 부분은 ppt_logic에서 활용됩니다)
            if map_image_url:
                article_json_data["mapImageUrl"] = map_image_url
            
            try:
                # 참고용 템플릿 슬라이드 인덱스 (두번째 슬라이드)
                source_slide_idx = 1
                
                # 이 매물이 첫번째가 아니면 슬라이드 복제
                if idx > 0:
                    # 슬라이드 복제
                    new_slide = clone_slide(prs, source_slide_idx)
                else:
                    # 첫번째 매물은 템플릿의 두번째 슬라이드 사용
                    new_slide = prs.slides[source_slide_idx]
                
                # 복제된 슬라이드에 매물 정보 채우기
                # (상세 구현은 필요에 따라 작성)
                
            except Exception as e:
                print(f"[ERROR] 매물 {idx+1} 슬라이드 생성 중 오류 발생: {e}")
                import traceback
                traceback.print_exc()
                
    # PPT 파일 저장
    try:
        prs.save(output_path)
        print(f"[INFO] 다중 매물 PPT 파일 저장 완료: {output_path}")
        return output_path
    except Exception as e:
        print(f"[ERROR] PPT 파일 저장 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        raise e
