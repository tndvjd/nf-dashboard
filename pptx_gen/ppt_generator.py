"""
PPT 생성 핵심 기능 모듈

이 모듈은 부동산 매물 정보를 바탕으로 PPT 파일을 생성하는 핵심 기능을 담당합니다.
"""
import os
import tempfile
# import csv # csv 모듈은 현재 코드에서 사용되지 않음
from pptx import Presentation
from pptx.util import Inches # Inches는 ppt_utils에서 사용, 여기서 직접 필요 X. 단, add_image_from_url 호출 시 EMU->인치 변환 필요 시 사용
from typing import Dict, Optional, Any, List
# from io import BytesIO # BytesIO는 ppt_utils에서 사용

from ppt_utils import replace_text_in_frame, find_shape_by_placeholder_or_name, add_image_from_url, duplicate_slide
from data_utils import get_value_from_path
from mapping_config import get_default_mappings, get_title_mappings
# from mapping_config import get_image_mappings # get_image_mappings 사용 시 주석 해제

def create_ppt_file(property_data: Dict, map_image_url: Optional[str], template_filepath: str, mapping_csv_filepath: Optional[str] = None) -> str:
    """
    매물 정보를 바탕으로 PPT 파일을 생성합니다.

    Args:
        property_data: 매물 정보 딕셔너리
        map_image_url: 지도 이미지 URL (선택 사항)
        template_filepath: PPT 템플릿 파일 경로
        mapping_csv_filepath: 매핑 CSV 파일 경로 (선택 사항, 현재 직접 사용 안함)

    Returns:
        생성된 임시 PPT 파일 경로
    """
    print("--- create_ppt_file 진입 (모듈화된 매핑 사용) ---")
    print(f"[DEBUG] Received property_data keys: {list(property_data.keys()) if property_data else 'None'}")
    print(f"[DEBUG] Received map_image_url: {map_image_url}")
    print(f"[DEBUG] Using template: {template_filepath}")

    try:
        prs = Presentation(template_filepath)
    except Exception as e:
        print(f"[ERROR] Failed to load PPT template: {template_filepath}. Error: {e}")
        # 적절한 예외 처리 또는 빈 경로 반환
        return ""


    # 표지 슬라이드 처리 (표제, 고객명, 회사명 등)
    title_mappings = get_title_mappings()
    for slide_idx, placeholder, value_key, font_name, font_size, is_bold in title_mappings:
        if slide_idx < len(prs.slides):
            slide = prs.slides[slide_idx]
            # 플레이스홀더로 도형 찾기 (True)
            shape_to_modify = find_shape_by_placeholder_or_name(slide, placeholder, True, slide_idx)
            if shape_to_modify:
                target_text_frame = None
                # text_frame 속성 확인 및 가져오기
                if hasattr(shape_to_modify, 'text_frame') and shape_to_modify.text_frame is not None:
                    # callable 체크는 text_frame이 메서드일 경우에만 필요, 일반적으로는 속성임
                    target_text_frame = shape_to_modify.text_frame
                else: # 테이블 셀의 경우, shape_to_modify가 셀 객체이고 text_frame을 가짐
                    # find_shape_by_placeholder_or_name이 셀을 반환했을 때, 이미 text_frame을 가진 셀 객체임
                    # 이 부분은 find_shape_by_placeholder_or_name의 반환값에 따라 달라질 수 있음.
                    # 현재 find_shape_by_placeholder_or_name은 셀 자체를 반환하므로, 셀의 text_frame을 써야함.
                    # 위의 hasattr(shape_to_modify, 'text_frame') 로직으로 커버될 것으로 보임.
                    pass


                if target_text_frame:
                    value_to_set = str(get_value_from_path(property_data, value_key, "")) # 데이터 가져오기
                    print(f"[DEBUG][Slide {slide_idx+1}] Replacing text in placeholder '{placeholder}' with data from key '{value_key}'")
                    replace_text_in_frame(target_text_frame, placeholder, value_to_set,
                                          font_name, font_size, is_bold)
                else:
                    print(f"[WARNING][Slide {slide_idx+1}] Shape for placeholder '{placeholder}' found, but no usable text_frame.")
            else:
                print(f"[WARNING][Slide {slide_idx+1}] Placeholder shape '{placeholder}' not found.")
        else:
            print(f"[WARNING] Slide index {slide_idx} for placeholder '{placeholder}' is out of bounds.")

    # 매핑 정보 기반 값 대체 (get_default_mappings)
    default_mappings = get_default_mappings()
    for slide_idx, placeholder_or_shapename, data_path_or_paths, processing_func, is_image, font_name, font_size, is_bold in default_mappings:
        if slide_idx >= len(prs.slides):
            print(f"[WARNING] Slide index {slide_idx} for '{placeholder_or_shapename}' is out of bounds. Skipping.")
            continue

        slide = prs.slides[slide_idx]
        shape_to_modify = None
        raw_value = None

        # 데이터 경로에서 값 가져오기
        if isinstance(data_path_or_paths, list):
            raw_values_list = []
            for dp in data_path_or_paths:
                # get_value_from_path에 기본값 인자 추가 (예: "")
                raw_values_list.append(get_value_from_path(property_data, dp, ""))
            raw_value = raw_values_list
        elif isinstance(data_path_or_paths, str):
            raw_value = get_value_from_path(property_data, data_path_or_paths, "")
        else: # 직접 값 (예: 이미지 URL 문자열이 아닌 경우 등) 또는 이미 처리된 값
            raw_value = data_path_or_paths


        processed_value: Any = "" # 타입 명확화
        if processing_func:
            try:
                processed_value = processing_func(raw_value)
            except Exception as e:
                print(f"[ERROR][Slide {slide_idx+1}] Error processing value for '{placeholder_or_shapename}' with data '{raw_value}': {e}")
                processed_value = "오류" # 또는 빈 문자열 등 오류 표시
        elif raw_value is not None:
            processed_value = str(raw_value)
        # raw_value가 None이고 processing_func도 없으면 processed_value는 "" 유지

        # 도형 찾기
        # is_placeholder_search는 플레이스홀더 패턴({{...}}) 존재 여부로 판단
        is_placeholder_search_mode = isinstance(placeholder_or_shapename, str) and "{{" in placeholder_or_shapename and "}}" in placeholder_or_shapename
        shape_identifier = placeholder_or_shapename

        # 플레이스홀더 검색 모드이거나, 이름 검색 모드일 때 각각 검색
        if is_placeholder_search_mode:
            shape_to_modify = find_shape_by_placeholder_or_name(slide, shape_identifier, True, slide_idx)
        else: # 이름으로 검색 (is_placeholder_search_mode가 False일 때)
            shape_to_modify = find_shape_by_placeholder_or_name(slide, shape_identifier, False, slide_idx)


        if not shape_to_modify:
            # find_shape_by_placeholder_or_name 내부에서 이미 경고 출력하므로 여기서는 추가 출력 안 함
            continue


        if is_image:
            image_url_to_add = None
            if processed_value and isinstance(processed_value, str):
                image_url_to_add = processed_value
            elif isinstance(raw_value, str) and not processing_func : # 가공 함수 없고 원본이 URL 문자열인 경우
                image_url_to_add = raw_value

            if image_url_to_add:
                print(f"[DEBUG][Slide {slide_idx+1}] Adding image to shape '{placeholder_or_shapename}' from URL: {image_url_to_add}")
                try:
                    # add_image_from_url은 위치/크기를 인치 단위로 받음.
                    # shape_to_modify의 .left, .top 등은 EMU 단위. 변환 필요.
                    # 간단하게 Inches로 나누거나, pptx.util.Length 객체로 변환 후 .inches 속성 사용
                    # 또는 add_image_from_url이 EMU를 직접 받도록 수정.
                    # 여기서는 shape의 위치/크기를 그대로 전달 (add_image_from_url에서 Inches()를 사용한다고 가정)
                    # 이 부분은 add_image_from_url의 구현과 일치해야 함.
                    # 만약 shape_to_modify가 플레이스홀더가 아닌 실제 이미지 도형이면 그 위치/크기 사용.
                    # 플레이스홀더 텍스트 박스를 이미지 위치로 사용한다면, 그 박스의 크기를 활용.
                    img_left = shape_to_modify.left
                    img_top = shape_to_modify.top
                    img_width = getattr(shape_to_modify, 'width', None)
                    img_height = getattr(shape_to_modify, 'height', None)

                    add_image_from_url(slide, image_url_to_add, img_left, img_top, width=img_width, height=img_height)
                except Exception as e:
                    print(f"[ERROR][Slide {slide_idx+1}] Failed to add image for '{placeholder_or_shapename}': {e}")
            else:
                print(f"[WARNING][Slide {slide_idx+1}] No valid image URL found for '{placeholder_or_shapename}'. Processed: '{processed_value}', Raw: '{raw_value}'")
        else: # 텍스트 처리
            target_text_frame = None
            if hasattr(shape_to_modify, 'text_frame') and shape_to_modify.text_frame is not None:
                target_text_frame = shape_to_modify.text_frame
            # find_shape_by_placeholder_or_name이 Cell 객체를 반환한 경우, Cell 객체가 text_frame을 가짐.

            if target_text_frame:
                actual_placeholder_pattern = ""
                if is_placeholder_search_mode: # 플레이스홀더 검색 모드일 때만 플레이스홀더 패턴 전달
                    actual_placeholder_pattern = shape_identifier

                print(f"[DEBUG][Slide {slide_idx+1}] Replacing text for '{placeholder_or_shapename}' with processed value.")
                replace_text_in_frame(target_text_frame,
                                      actual_placeholder_pattern, # 플레이스홀더 패턴 전달
                                      str(processed_value), # 새 텍스트
                                      font_name, font_size, is_bold) # 폰트 정보 전달
            else:
                print(f"[WARNING][Slide {slide_idx+1}] Shape '{placeholder_or_shapename}' (type: {getattr(shape_to_modify, 'shape_type', 'Unknown')}) has no usable text_frame.")

    # 지도 이미지 처리 (제공된 경우)
    if map_image_url:
        map_slide_idx = 1 # 지도 이미지를 넣을 슬라이드 번호 (0부터 시작)
        map_shape_name = "img_map" # 지도 이미지를 넣을 도형의 이름

        if map_slide_idx < len(prs.slides):
            map_slide = prs.slides[map_slide_idx]
            map_shape = find_shape_by_placeholder_or_name(map_slide, map_shape_name, False, map_slide_idx) # 이름으로 검색
            if map_shape:
                print(f"[DEBUG][Slide {map_slide_idx+1}] Adding map image to shape '{map_shape_name}' from URL: {map_image_url}")
                try:
                    # add_image_from_url 호출 시 위치/크기 단위 주의
                    m_left = map_shape.left
                    m_top = map_shape.top
                    m_width = getattr(map_shape, 'width', None)
                    m_height = getattr(map_shape, 'height', None)
                    add_image_from_url(map_slide, map_image_url, m_left, m_top, width=m_width, height=m_height)
                except Exception as e:
                    print(f"[ERROR][Slide {map_slide_idx+1}] Failed to add map image for shape '{map_shape_name}': {e}")
            else:
                print(f"[WARNING][Slide {map_slide_idx+1}] Map image shape '{map_shape_name}' not found.")
        else:
            print(f"[WARNING] Slide index {map_slide_idx} for map image is out of bounds (Total slides: {len(prs.slides)}).")

    # 임시 파일 생성 및 저장
    temp_file_path = ""
    try:
        # delete=False는 함수 종료 후에도 파일 유지를 위함. 호출 측에서 필요시 삭제해야 함.
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pptx', prefix='gen_ppt_') as tmp_file:
            prs.save(tmp_file.name)
            temp_file_path = tmp_file.name
        print(f"--- PPT 생성 완료 (모듈화된 매핑): {temp_file_path} ---")
    except Exception as e:
        print(f"[ERROR] Failed to save PPT to temporary file: {e}")
        # 필요시 생성된 임시 파일 경로가 있더라도 오류 발생 시 빈 문자열 반환 또는 예외 재발생
        if temp_file_path and os.path.exists(temp_file_path): # 저장 실패 시 부분 파일 삭제 시도
             try:
                 os.remove(temp_file_path)
             except OSError:
                 pass # 삭제 실패는 무시
        return "" # 오류 시 빈 경로 반환

    return temp_file_path


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
    print(f"--- create_ppt_file_multi 진입 (총 {len(properties_data)}개 매물) ---")
    print(f"[DEBUG] Using template: {template_filepath}")
    
    if not properties_data:
        print("[ERROR] 매물 정보가 없습니다.")
        return ""
    
    try:
        prs = Presentation(template_filepath)
    except Exception as e:
        print(f"[ERROR] Failed to load PPT template: {template_filepath}. Error: {e}")
        return ""
    
    # 표지 슬라이드 처리 (첫 번째 슬라이드)
    title_mappings = get_title_mappings()
    
    # document_info에서 필요한 정보 추출
    document_title = document_info.get("documentTitle", "")
    client_name = document_info.get("clientName", "")
    company_name = document_info.get("companyName", "")
    
    # 표지 슬라이드 처리
    if len(prs.slides) > 0:
        title_slide = prs.slides[0]
        
        # 표지 슬라이드에 문서 정보 적용
        for slide_idx, placeholder, value_key, font_name, font_size, is_bold in title_mappings:
            if slide_idx == 0:  # 표지 슬라이드만 처리
                shape_to_modify = find_shape_by_placeholder_or_name(title_slide, placeholder, True, slide_idx)
                if shape_to_modify and hasattr(shape_to_modify, 'text_frame') and shape_to_modify.text_frame is not None:
                    # document_info에서 값 가져오기
                    if value_key == "documentTitle":
                        value_to_set = document_title
                    elif value_key == "clientName":
                        value_to_set = client_name
                    elif value_key == "companyName":
                        value_to_set = company_name
                    else:
                        value_to_set = document_info.get(value_key, "")
                    
                    print(f"[DEBUG][Slide {slide_idx+1}] Setting title slide info: {placeholder} = {value_to_set}")
                    replace_text_in_frame(shape_to_modify.text_frame, placeholder, value_to_set, font_name, font_size, is_bold)
    
    # 템플릿의 두 번째 슬라이드를 상세 정보 슬라이드로 사용
    if len(prs.slides) < 2:
        print("[ERROR] 템플릿에 매물 정보를 위한 두 번째 슬라이드가 없습니다.")
        return ""
    
    # 템플릿 슬라이드 인덱스 (두 번째 슬라이드 = 인덱스 1)
    template_slide_idx = 1
    
    # 템플릿 슬라이드 참조 저장
    template_slide = prs.slides[template_slide_idx]
    
    # 매물 매핑 정보 가져오기
    default_mappings = get_default_mappings()
    
    # 모든 매물에 대해 슬라이드 처리
    for i, property_data in enumerate(properties_data):
        if i == 0:
            # 첫 번째 매물은 기존 두 번째 슬라이드에 적용
            print(f"[INFO] 첫 번째 매물을 기존 템플릿 슬라이드(#{template_slide_idx+1})에 적용합니다.")
            _apply_property_to_slide(prs.slides[template_slide_idx], property_data, default_mappings, template_slide_idx)
        else:
            # 추가 매물은 실시간으로 슬라이드 생성
            print(f"[INFO] {i+1}번째 매물을 위한 슬라이드 추가 중...")
            try:
                # 템플릿의 레이아웃 가져오기
                template_slide = prs.slides[template_slide_idx]
                slide_layout = template_slide.slide_layout
                
                # 레이아웃을 사용해 새 슬라이드 추가
                new_slide = prs.slides.add_slide(slide_layout)
                
                # 새 슬라이드에 제목 추가
                title_left = Inches(0.5)
                title_top = Inches(0.5)
                title_width = Inches(9)
                title_height = Inches(0.8)
                title_text = f"No.{property_data.get('articleDetail', {}).get('articleNo', '')} [{property_data.get('articleDetail', {}).get('divisionName', '')}] {property_data.get('articleDetail', {}).get('aptName', '')}"
                
                title_box = new_slide.shapes.add_textbox(title_left, title_top, title_width, title_height)
                title_frame = title_box.text_frame
                p = title_frame.add_paragraph()
                p.text = title_text
                p.font.size = Pt(18)
                p.font.bold = True
                p.font.name = '나눔고딕'
                
                # 상단 이미지 배치
                img_top = Inches(1.3)
                img_height = Inches(3)
                
                # 왼쪽 이미지용 테스트 텍스트박스
                img1_left = Inches(0.5)
                img1_width = Inches(3)
                img1_box = new_slide.shapes.add_textbox(img1_left, img_top, img1_width, img_height)
                img1_box.text_frame.text = "매물 사진"
                
                # 가운데 이미지용 테스트 텍스트박스
                img2_left = Inches(3.8)
                img2_width = Inches(3)
                img2_box = new_slide.shapes.add_textbox(img2_left, img_top, img2_width, img_height)
                img2_box.text_frame.text = "플로어 플랜"
                
                # 오른쪽 이미지용 테스트 텍스트박스
                img3_left = Inches(7.1)
                img3_width = Inches(3)
                img3_box = new_slide.shapes.add_textbox(img3_left, img_top, img3_width, img_height)
                img3_box.text_frame.text = "지도"
                
                # 하단 제목 - 단지정보
                complex_title_top = Inches(4.5)
                complex_title_box = new_slide.shapes.add_textbox(img1_left, complex_title_top, img1_width, Inches(0.3))
                complex_title_box.text_frame.text = "단지정보"
                
                # 하단 제목 - 매물정보
                property_title_box = new_slide.shapes.add_textbox(img3_left, complex_title_top, img3_width, Inches(0.3))
                property_title_box.text_frame.text = "매물정보"
                
                # 하단 테이블 - 단지정보 테이블
                table_top = Inches(4.8)
                table_height = Inches(2.5)
                complex_table = new_slide.shapes.add_table(5, 2, img1_left, table_top, Inches(4.5), table_height).table
                
                # 하단 테이블 - 매물정보 테이블
                property_table = new_slide.shapes.add_table(5, 2, img3_left, table_top, Inches(3), table_height).table
                
                # 단지정보 테이블 기본 텍스트 설정
                complex_table.cell(0, 0).text = "주소"
                complex_table.cell(1, 0).text = "준공연도"
                complex_table.cell(2, 0).text = "총 세대수"
                complex_table.cell(3, 0).text = "총 층수"
                complex_table.cell(4, 0).text = "난방방식"
                
                complex_table.cell(0, 1).text = property_data.get('articleDetail', {}).get('exposureAddress', '')
                complex_table.cell(1, 1).text = f"{property_data.get('articleDetail', {}).get('aptUseApproveYmd', '')[:4]}년 {property_data.get('articleDetail', {}).get('aptUseApproveYmd', '')[4:6]}월" if property_data.get('articleDetail', {}).get('aptUseApproveYmd', '') else ""
                complex_table.cell(2, 1).text = f"{property_data.get('articleDetail', {}).get('aptHouseholdCount', '')} 세대"
                complex_table.cell(3, 1).text = f"{property_data.get('articleDetail', {}).get('totalDongCount', '')} 개동"
                complex_table.cell(4, 1).text = f"{property_data.get('articleDetail', {}).get('aptHeatMethodTypeName', '')}, {property_data.get('articleDetail', {}).get('aptHeatFuelTypeName', '')}"
                
                # 매물정보 테이블 기본 텍스트 설정
                property_table.cell(0, 0).text = "동/호수"
                property_table.cell(1, 0).text = "계약면적"
                property_table.cell(2, 0).text = "전용면적"
                property_table.cell(3, 0).text = "방/화장실"
                property_table.cell(4, 0).text = "방향"
                
                property_table.cell(0, 1).text = f"{property_data.get('articleDetail', {}).get('buildingName', '')} {property_data.get('articleAddition', {}).get('floorInfo', '').split('/')[0]}층"
                
                # 면적 계산
                area1 = property_data.get('articleAddition', {}).get('area1', 0)
                area2 = property_data.get('articleAddition', {}).get('area2', 0)
                property_table.cell(1, 1).text = f"{area1:.2f}m² / {area1 * 0.3025:.2f}평".replace(".00", "")
                property_table.cell(2, 1).text = f"{area2:.2f}m² / {area2 * 0.3025:.2f}평".replace(".00", "")
                
                property_table.cell(3, 1).text = f"{property_data.get('articleDetail', {}).get('roomCount', '')} / {property_data.get('articleDetail', {}).get('bathroomCount', '')}"
                property_table.cell(4, 1).text = property_data.get('articleAddition', {}).get('direction', '')

                # 새 슬라이드에 매물 정보 적용
                new_slide_idx = len(prs.slides) - 1
                _apply_property_to_slide(new_slide, property_data, default_mappings, new_slide_idx)
                print(f"[INFO] {i+1}번째 매물 슬라이드 추가 성공")
            except Exception as e:
                print(f"[ERROR] {i+1}번째 매물 슬라이드 추가 실패: {e}")
                import traceback
                traceback.print_exc()
                continue
    
    # 지도 이미지 처리 (제공된 경우)
    if map_image_url:
        map_slide_idx = 1  # 지도는 상세 정보 슬라이드에 추가
        map_shape_name = "img_map"  # 지도 이미지 도형 이름
        
        for slide_idx in range(len(prs.slides)):
            if slide_idx != 0:  # 표지 슬라이드 제외
                slide = prs.slides[slide_idx]
                map_shape = find_shape_by_placeholder_or_name(slide, map_shape_name, False, slide_idx)
                if map_shape:
                    try:
                        m_left = map_shape.left
                        m_top = map_shape.top
                        m_width = getattr(map_shape, 'width', None)
                        m_height = getattr(map_shape, 'height', None)
                        add_image_from_url(slide, map_image_url, m_left, m_top, width=m_width, height=m_height)
                        print(f"[DEBUG][Slide {slide_idx+1}] 지도 이미지 추가 성공")
                    except Exception as e:
                        print(f"[ERROR][Slide {slide_idx+1}] 지도 이미지 추가 실패: {e}")
    
    # 임시 파일 생성 및 저장
    temp_file_path = ""
    try:
        # delete=False는 함수 종료 후에도 파일 유지를 위함
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pptx', prefix='gen_ppt_multi_') as tmp_file:
            prs.save(tmp_file.name)
            temp_file_path = tmp_file.name
        print(f"--- 다중 매물 PPT 생성 완료: {temp_file_path} (매물 {len(properties_data)}개) ---")
    except Exception as e:
        print(f"[ERROR] 다중 매물 PPT 저장 중 오류 발생: {e}")
        # 오류 발생 시 부분 파일 삭제 시도
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except OSError:
                pass  # 삭제 실패는 무시
        return ""  # 오류 시 빈 경로 반환
    
    return temp_file_path


def _apply_property_to_slide(slide, property_data: Dict, mappings, slide_idx: int):
    """
    슬라이드에 매물 정보를 적용합니다. create_ppt_file_multi의 내부 헬퍼 함수입니다.
    
    Args:
        slide: 정보를 적용할 슬라이드 객체
        property_data: 매물 정보 딕셔너리
        mappings: 매핑 정보 리스트
        slide_idx: 슬라이드 인덱스 (로깅용)
    """
    # 매물 상세 정보 매핑 처리
    for mapping_slide_idx, placeholder_or_shapename, data_path_or_paths, processing_func, is_image, font_name, font_size, is_bold in mappings:
        if mapping_slide_idx != 1:  # 매물 정보는 항상 두 번째 슬라이드 템플릿 기준으로 매핑
            continue
            
        # 데이터 경로에서 값 가져오기
        raw_value = None
        if isinstance(data_path_or_paths, list):
            raw_values_list = []
            for dp in data_path_or_paths:
                raw_values_list.append(get_value_from_path(property_data, dp, ""))
            raw_value = raw_values_list
        elif isinstance(data_path_or_paths, str):
            raw_value = get_value_from_path(property_data, data_path_or_paths, "")
        else:
            raw_value = data_path_or_paths

        # 값 처리 (포맷팅)
        processed_value = ""
        if processing_func:
            try:
                processed_value = processing_func(raw_value)
            except Exception as e:
                print(f"[ERROR][Slide {slide_idx+1}] 매물 정보 처리 중 오류: '{placeholder_or_shapename}': {e}")
                processed_value = "오류"  # 또는 빈 문자열 등 오류 표시
        elif raw_value is not None:
            processed_value = str(raw_value)

        # 플레이스홀더 검색 모드 여부 확인
        is_placeholder_search_mode = isinstance(placeholder_or_shapename, str) and "{{" in placeholder_or_shapename and "}}" in placeholder_or_shapename

        # 도형 찾기
        shape_to_modify = None
        if is_placeholder_search_mode:
            shape_to_modify = find_shape_by_placeholder_or_name(slide, placeholder_or_shapename, True, slide_idx)
        else:  # 이름으로 검색
            shape_to_modify = find_shape_by_placeholder_or_name(slide, placeholder_or_shapename, False, slide_idx)

        if not shape_to_modify:
            continue

        # 이미지 또는 텍스트 처리
        if is_image:
            image_url_to_add = None
            if processed_value and isinstance(processed_value, str):
                image_url_to_add = processed_value
            elif isinstance(raw_value, str) and not processing_func:  # 가공 함수 없고 원본이 URL 문자열인 경우
                image_url_to_add = raw_value

            if image_url_to_add:
                try:
                    img_left = shape_to_modify.left
                    img_top = shape_to_modify.top
                    img_width = getattr(shape_to_modify, 'width', None)
                    img_height = getattr(shape_to_modify, 'height', None)
                    add_image_from_url(slide, image_url_to_add, img_left, img_top, width=img_width, height=img_height)
                except Exception as e:
                    print(f"[ERROR][Slide {slide_idx+1}] 이미지 추가 실패: '{placeholder_or_shapename}': {e}")
        else:  # 텍스트 처리
            target_text_frame = None
            if hasattr(shape_to_modify, 'text_frame') and shape_to_modify.text_frame is not None:
                target_text_frame = shape_to_modify.text_frame

            if target_text_frame:
                actual_placeholder_pattern = ""
                if is_placeholder_search_mode:
                    actual_placeholder_pattern = placeholder_or_shapename

                replace_text_in_frame(target_text_frame, 
                                     actual_placeholder_pattern,
                                     str(processed_value),
                                     font_name, font_size, is_bold)