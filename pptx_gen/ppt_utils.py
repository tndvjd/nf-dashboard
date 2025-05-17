"""
PPT 조작 관련 유틸리티 함수들

이 모듈은 PPT 생성과 관련된 다양한 유틸리티 함수들을 포함합니다.
"""
from pptx import Presentation # Presentation은 여기서 직접 사용 안 함 (필요시 사용)
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE_TYPE # MSO_SHAPE_TYPE은 여기서 직접 사용 안 함
from pptx.dml.color import RGBColor # RGBColor는 여기서 직접 사용 안 함
from pptx.enum.text import PP_ALIGN # PP_ALIGN은 여기서 직접 사용 안 함
from pptx.text.text import TextFrame
from typing import Optional
import re
import requests
from io import BytesIO

def replace_text_in_frame(shape_or_cell_or_frame,
                          old_text_pattern: str,
                          new_text: str,
                          font_name: Optional[str] = None,
                          font_size: Optional[int] = None,
                          is_bold: Optional[bool] = None):
    """
    텍스트 프레임 내의 텍스트를 대체하고, 지정된 폰트 스타일을 적용합니다.
    old_text_pattern이 빈 문자열("")이면 전체 텍스트를 new_text로 교체하고 스타일을 적용합니다.
    """
    text_frame: Optional[TextFrame] = None
    if isinstance(shape_or_cell_or_frame, TextFrame):
        text_frame = shape_or_cell_or_frame
    elif hasattr(shape_or_cell_or_frame, 'text_frame') and shape_or_cell_or_frame.text_frame is not None:
        text_frame = shape_or_cell_or_frame.text_frame
    else:
        print(f"[ERROR replace_text_in_frame] Unexpected type or no text_frame for input object: {type(shape_or_cell_or_frame)}. Cannot get text_frame.")
        return

    if text_frame is None: # 위에서 할당되지 않은 경우를 대비한 최종 방어
        print(f"[ERROR replace_text_in_frame] text_frame is None for input object: {type(shape_or_cell_or_frame)}.")
        return

    # old_text_pattern이 실제 문자열일 때만 정규 표현식 컴파일
    old_text_pattern_re = None
    if old_text_pattern: # 빈 문자열이 아닐 경우에만 컴파일
        try:
            old_text_pattern_re = re.compile(re.escape(old_text_pattern))
        except re.error as e:
            print(f"[ERROR replace_text_in_frame] Invalid regex pattern from old_text_pattern '{old_text_pattern}': {e}")
            return # 패턴이 유효하지 않으면 더 이상 진행 불가


    for paragraph_idx, paragraph in enumerate(text_frame.paragraphs):
        current_new_text = str(new_text) if new_text is not None else ""
        text_changed = False

        if old_text_pattern == "" and old_text_pattern_re is None: # 플레이스홀더가 비어있으면, 단락 전체를 새 텍스트로 교체
            if paragraph.text != current_new_text:
                paragraph.text = current_new_text # 텍스트만 교체, run별 스타일링은 아래에서
                text_changed = True
            # 스타일은 항상 적용 (텍스트가 같더라도)
        elif old_text_pattern_re and old_text_pattern_re.search(paragraph.text): # 플레이스홀더가 있고, 해당 패턴이 단락에 존재
            original_paragraph_text = paragraph.text
            # 정규식 치환으로 새 텍스트 생성
            replaced_paragraph_text = old_text_pattern_re.sub(current_new_text, original_paragraph_text)

            if original_paragraph_text != replaced_paragraph_text:
                paragraph.text = replaced_paragraph_text # 텍스트만 교체
                text_changed = True
            # 스타일은 항상 적용 (텍스트가 같더라도, 패턴이 일치하는 한)
        elif not old_text_pattern and not paragraph.text and paragraph_idx == 0: # 플레이스홀더 없고, 단락도 비어있고, 첫번째 단락이면 (완전 빈칸에 텍스트 채우기)
            paragraph.text = current_new_text
            text_changed = True


        # 스타일 적용 (텍스트가 변경되었거나, 플레이스홀더가 비어있었거나, 혹은 플레이스홀더와 텍스트가 같지만 스타일만 적용해야 하는 경우)
        # 위 조건에서 text_changed가 True이거나, old_text_pattern == "" 이거나, (old_text_pattern and old_text_pattern == current_new_text)
        # 좀 더 간단하게는, placeholder가 있거나, 없더라도 첫번째 단락이면 스타일 적용 시도.
        # 여기서는 paragraph.runs를 순회하며 각 run에 스타일을 적용하는 것이 더 정교할 수 있으나,
        # 현재 코드는 paragraph.clear() 후 add_run() 하는 방식이 아니므로,
        # paragraph의 모든 run에 일괄 적용하거나, 첫번째 run에만 적용하는 방식을 택해야 함.
        # 가장 일반적인 것은 단락의 첫 번째 run에 스타일을 지정하거나, 단락 전체의 기본 폰트를 설정하는 것.
        # 여기서는 단락의 모든 run에 스타일을 적용 시도 (템플릿에서 여러 run으로 나뉘어 있을 수 있음)

        # paragraph.clear()와 add_run()을 사용하지 않고, 기존 run들의 스타일을 최대한 보존하면서
        # 요청된 폰트 속성만 변경하는 방식
        for run in paragraph.runs:
            if run.font:
                if font_name:
                    run.font.name = font_name
                if font_size:
                    run.font.size = Pt(font_size)
                if is_bold is not None:
                    run.font.bold = is_bold

        if text_changed:
             print(f"[DEBUG Style] Text SET and Applied Style (Font: {font_name or 'Default'}, Size: {font_size or 'Default'}pt, Bold: {is_bold if is_bold is not None else 'Default'}) for '{current_new_text[:30]}...'")
        elif old_text_pattern_re and old_text_pattern_re.search(paragraph.text): # 텍스트 변경은 없었지만 패턴이 존재하여 스타일만 적용된 경우
             print(f"[DEBUG Style] Style ONLY Applied (Font: {font_name or 'Default'}, Size: {font_size or 'Default'}pt, Bold: {is_bold if is_bold is not None else 'Default'}) for existing text matching '{old_text_pattern[:30]}...'")


def find_shape_by_placeholder_or_name(slide, identifier: str, is_placeholder_search: bool, slide_idx_for_log: int):
    """슬라이드에서 플레이스홀더 또는 이름으로 도형을 찾습니다."""
    if is_placeholder_search:
        # 플레이스홀더 텍스트가 정확히 일치하는 것을 먼저 찾고, 그 다음 포함된 것을 찾도록 개선 가능
        for shape in slide.shapes:
            if shape.has_text_frame:
                # 정확히 일치하는 경우 (양끝 공백 제거 후 비교)
                if shape.text_frame.text and shape.text_frame.text.strip() == identifier:
                    print(f"[DEBUG][Slide {slide_idx_for_log+1}] Shape found by EXACT placeholder text '{identifier}': name='{shape.name if shape.name else 'N/A'}', type={shape.shape_type}")
                    return shape
                # 포함된 경우 (이전 로직)
                if identifier in shape.text_frame.text: # identifier가 비어있지 않아야 의미가 있음
                    print(f"[DEBUG][Slide {slide_idx_for_log+1}] Shape found by containing placeholder text '{identifier}': name='{shape.name if shape.name else 'N/A'}', type={shape.shape_type}")
                    return shape
            if shape.has_table:
                for row_idx, row in enumerate(shape.table.rows):
                    for col_idx, cell in enumerate(row.cells):
                        if cell.text_frame and cell.text_frame.text is not None:
                            if cell.text_frame.text.strip() == identifier:
                                print(f"[DEBUG find_shape] Found EXACT placeholder '{identifier}' in table cell ({row_idx},{col_idx}) on slide {slide_idx_for_log+1}")
                                return cell
                            if identifier in cell.text_frame.text:
                                print(f"[DEBUG find_shape] Found containing placeholder '{identifier}' in table cell ({row_idx},{col_idx}) on slide {slide_idx_for_log+1}")
                                return cell
    else: # 이름으로 검색
        try:
            # 이름으로 도형을 찾는 것은 slide.shapes.get_by_name()이 더 효율적일 수 있으나,
            # 현재 코드는 순회를 사용하고 있으므로, 일관성을 위해 유지하거나 get_by_name()으로 변경 고려.
            # 여기서는 get_by_name을 사용하는 것이 좋음.
            shape_by_name = slide.shapes.get_by_name(identifier)
            print(f"[DEBUG][Slide {slide_idx_for_log+1}] Shape found by name '{identifier}': type={shape_by_name.shape_type}")
            return shape_by_name
        except KeyError: # get_by_name 사용 시 도형을 찾지 못하면 KeyError 발생
            pass # 다음 경고 메시지로 넘어감
        except Exception as e: # 기타 예외 처리
            print(f"[ERROR find_shape_by_placeholder_or_name] Error finding shape by name '{identifier}': {e}")


    print(f"[WARNING][Slide {slide_idx_for_log+1}] Shape with identifier '{identifier}' (search_mode: {'placeholder' if is_placeholder_search else 'name'}) not found. Skipping.")
    return None

def normalize_url(url: str, base_domain: str = "https://image.neonet.co.kr") -> str:
    """URL을 정규화합니다."""
    if not url: # 빈 URL 처리
        return ""
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        # base_domain이 /로 끝나고 url이 /로 시작하면 중복될 수 있으므로 처리
        base = base_domain.rstrip('/')
        lpath = url.lstrip('/')
        return f"{base}/{lpath}"
    return url

def add_image_from_url(slide, image_url: str, left: float, top: float, width: Optional[float] = None, height: Optional[float] = None):
    """URL에서 이미지를 가져와 슬라이드에 추가합니다."""
    try:
        if not image_url:
            print("[WARNING] Empty image URL provided to add_image_from_url. Skipping.")
            return None

        normalized_url = normalize_url(image_url)
        if not normalized_url: # 정규화 후에도 비어있으면 스킵
             print("[WARNING] Normalized image URL is empty. Skipping.")
             return None

        print(f"[DEBUG add_image_from_url] Downloading image from: {normalized_url}")

        response = requests.get(normalized_url, timeout=10)
        response.raise_for_status() # HTTP 오류 발생 시 예외 발생

        image_stream = BytesIO(response.content)

        # add_picture에는 EMU 단위가 필요. Inches()는 인치를 EMU로 변환.
        # 따라서 left, top, width, height는 인치 단위로 전달되어야 함.
        # create_ppt_file에서 shape.left 등을 전달할 때 EMU 단위이므로, 이를 인치로 변환하거나,
        # 이 함수에서 EMU를 직접 받도록 수정해야 함.
        # 현재는 Inches()를 사용하므로, 호출부에서 인치 단위로 값을 전달한다고 가정.
        # 만약 호출부(create_ppt_file)에서 shape_to_modify.left (EMU)를 그대로 전달하고 있다면,
        # 여기서는 Inches()를 사용하지 않거나, 호출부에서 Inches(shape_to_modify.left).value 등으로 변환해야 함.
        # 이 부분은 호출부와의 규약이 중요. 여기서는 일단 주어진 대로 Inches()를 사용.
        pic = slide.shapes.add_picture(image_stream, left, top, width=width, height=height)

        print(f"[DEBUG add_image_from_url] Image added successfully: position=({left}, {top}), size=({width}, {height}) if specified")
        return pic

    except requests.exceptions.RequestException as e:
        print(f"[ERROR add_image_from_url] Failed to download image from '{normalized_url}': {e}")
    except Exception as e:
        print(f"[ERROR add_image_from_url] Failed to add image for URL '{image_url}': {e}")
    return None


def duplicate_slide(prs, template_slide_idx):
    """Presentation의 특정 슬라이드를 복제합니다.
    
    Args:
        prs: Presentation 객체
        template_slide_idx: 복제할 템플릿 슬라이드 인덱스
        
    Returns:
        복제된 슬라이드 객체
    """
    if template_slide_idx >= len(prs.slides):
        print(f"[ERROR duplicate_slide] Template slide index {template_slide_idx} is out of range. Total slides: {len(prs.slides)}")
        return None
        
    template_slide = prs.slides[template_slide_idx]
    
    # 슬라이드 레이아웃 가져오기
    slide_layout = template_slide.slide_layout
    
    # 레이아웃을 사용하여 새 슬라이드 추가
    new_slide = prs.slides.add_slide(slide_layout)
    
    # 기존 템플릿 슬라이드의 모든 도형 및 카드 복사
    for shape in template_slide.shapes:
        # 템플릿 슬라이드의 도형 정보 가져오기
        shape_type = shape.shape_type
        left = shape.left
        top = shape.top
        width = shape.width
        height = shape.height
        
        # 도형 유형에 따라 실제 객체 생성
        if shape.has_text_frame:
            # 텍스트 프레임 복사
            new_shape = new_slide.shapes.add_textbox(left, top, width, height)
            new_text_frame = new_shape.text_frame
            
            # 텍스트 및 서식 복사 (가능한 데까지)
            for i, paragraph in enumerate(shape.text_frame.paragraphs):
                if i == 0:
                    # 첫 번째 단락은 이미 존재
                    new_para = new_text_frame.paragraphs[0]
                else:
                    # 나머지 단락은 추가
                    new_para = new_text_frame.add_paragraph()
                
                # 단락 내용 복사
                new_para.text = paragraph.text
                
                # TODO: 더 자세한 서식 (폰트, 색상 등) 복사도 가능하지만 제한적
                
        elif shape.has_table:
            try:
                # 테이블 복사 (단순화된 구현)
                # 행과 열 개수 추출
                rows_count = len(shape.table.rows)
                cols_count = len(shape.table.columns)
                
                print(f"[DEBUG duplicate_slide] 테이블 복사 시도: {rows_count}x{cols_count} 크기, 위치=({left}, {top}), 크기=({width}, {height})")
                
                # 새 테이블 추가
                new_table = new_slide.shapes.add_table(rows_count, cols_count, left, top, width, height).table
                
                # 각 셀 복사
                for r_idx in range(rows_count):
                    for c_idx in range(cols_count):
                        try:
                            # 셀 내용 복사
                            source_cell = shape.table.cell(r_idx, c_idx)
                            text = source_cell.text_frame.text if hasattr(source_cell, 'text_frame') and source_cell.text_frame else ""
                            new_table.cell(r_idx, c_idx).text = text
                        except Exception as cell_err:
                            print(f"[ERROR duplicate_slide] 테이블 셀({r_idx},{c_idx}) 복사 오류: {cell_err}")
            except Exception as table_err:
                print(f"[ERROR duplicate_slide] 테이블 복사 오류: {table_err}")
                # 테이블 복사 실패 시 기본 텍스트박스로 대체
                try:
                    new_textbox = new_slide.shapes.add_textbox(left, top, width, height)
                    new_textbox.text_frame.text = "[Table content could not be copied]"
                except Exception as e:
                    print(f"[ERROR duplicate_slide] 대체 텍스트박스 생성 실패: {e}")
                    
        # 이미지 처리
        elif hasattr(shape, 'image'):
            try:
                # 이미지 파트 정보 추출
                image_part = shape.image
                image_blob = image_part.blob
                content_type = image_part.content_type
                
                # 새 이미지 도형 추가
                new_picture = new_slide.shapes.add_picture(
                    image_blob, 
                    left, top, 
                    width, height
                )
                print(f"[DEBUG duplicate_slide] 이미지 복사 성공: {left}, {top}, {width}, {height}")
            except Exception as e:
                print(f"[ERROR duplicate_slide] 이미지 복사 중 오류: {e}")
                
        # 다른 도형 유형 처리 (예: 도형, 선, 화살표 등)
        elif hasattr(shape, 'shape_type'):
            try:
                # 도형 타입 확인
                from pptx.enum.shapes import MSO_SHAPE_TYPE
                
                # 직사각형 처리
                if shape.shape_type == MSO_SHAPE_TYPE.RECTANGLE:
                    new_shape = new_slide.shapes.add_shape(
                        MSO_SHAPE_TYPE.RECTANGLE,
                        left, top, width, height
                    )
                    # 가능한 경우 서식 복사
                    if hasattr(shape, 'fill') and hasattr(new_shape, 'fill'):
                        if shape.fill.type is not None:
                            new_shape.fill.solid()
                            if hasattr(shape.fill, 'fore_color') and hasattr(shape.fill.fore_color, 'rgb'):
                                new_shape.fill.fore_color.rgb = shape.fill.fore_color.rgb
                
                # 상기 처리되지 않은 도형은 오류 로그만 작성
                else:
                    print(f"[INFO duplicate_slide] 지원하지 않는 도형 타입: {shape.shape_type}")
            except Exception as e:
                print(f"[ERROR duplicate_slide] 도형 복사 중 오류: {e}")
        
    print(f"[INFO duplicate_slide] Successfully duplicated slide at index {template_slide_idx}")
    return new_slide