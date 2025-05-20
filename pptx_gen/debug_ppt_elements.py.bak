from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.util import Inches, Pt
import datetime
import math
import requests # 이미지 로드용
from io import BytesIO # 이미지 및 PPTX 스트림용
import os

# --- 기본 설정 ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "ppt_template.pptx")
IMAGE_BASE_URL = "https://land.naver.com"

# --- 1. 샘플 데이터 정의 (테스트용, FastAPI에서는 동적으로 채워짐) ---
client_and_document_data_sample = {
    "문서명": "정식 사택 물건 자료",
    "고객명": "신지성 고객님",
    "회사명": "AGC일렉트로닉스코리아 (주)",
    "참고사항_입력": "6월 중 입주 협의 가능합니다. 반려동물 동반은 어렵습니다.",
    "비고_입력": "현관 보안 철저, 건물 내 편의시설(피트니스, 라운지) 이용 가능."
}

full_json_data_sample = {
    "articleDetail": {
        "articleNo": "2523213850", "articleName": "보타니끄논현 1동", "divisionName": "강남구",
        "aptName": "보타니끄논현", "exposureAddress": "서울시 강남구 논현동 123-45번지",
        "aptUseApproveYmd": "20241122", "aptHouseholdCount": "42",
        "aptHeatMethodTypeName": "개별난방", "aptHeatFuelTypeName": "도시가스",
        "buildingName": "101동", "roomCount": "1", "bathroomCount": "1",
        "moveInTypeName": "즉시입주",
        "articleFeatureDescription": "강남 중심, 즉시입주 가능한 최고급 하이엔드 오피스텔입니다.",
        "detailDescription": "사진은 실제 방문하여 촬영한 것이며, 보증금 및 월세 조건은 조율 가능합니다. 24시간 상담 환영!\\n복층형 구조에 넓은 테라스 보유. 분리형 원룸 및 화장실 1개. 주차는 세대당 1.45대 가능(총 61대).",
        "tagList": ["2년이내신축", "테라스굿", "역세권도보5분", "화장실1개"],
        "grandPlanList": [{"imageSrc": "/20220706_249/hscp_img_1657095670067Nphxa_JPEG/photoinfra_1657095669504.jpg", "imageType": "14"}],
        "latitude": "37.51189", "longitude": "127.035282",
    },
    "articleAddition": {
        "floorInfo": "중층/9", "direction": "남동향",
        "dealOrWarrantPrc": "1억", "rentPrc": "500",
        "representativeImgUrl": "/20250508_24/1746696666335n06Ea_JPEG/a80fd2f71dc5fe0c716ffda69d867e49.JPG"
    },
    "articleFloor": {"totalFloorCount": "9", "buildingHighestFloor": "9"},
    "articlePrice": {"warrantPrice": 10000, "rentPrice": 500},
    "articleSpace": {"supplySpace": 111.88, "exclusiveSpace": 47.35},
    "articlePhotos": [
        {"imageSrc": "/20250508_198/1746696668451MhMlb_JPEG/KakaoTalk_20250430_143429280_09.jpg", "imageType": "10"},
        {"imageSrc": "/20250508_212/1746696668451y2OrJ_JPEG/KakaoTalk_20250430_143429280_01.jpg", "imageType": "10"},
    ],
    "administrationCostInfo": {"chargeCodeType": "03"},
}

# --- 2. 매핑 규칙 정의 ---
mappings = {
    "txt_document_title": ("{{document_title}}", "문서명", None, {"font_name": "나눔고딕", "font_size": Pt(24)}),
    "txt_client_name": ((0,0), "고객명", None, {"font_name": "나눔고딕", "font_size": Pt(18)}),
    "txt_company_name": ("{{company_name}}", "회사명", None, {"font_name": "나눔고딕", "font_size": Pt(16)}),
    "txt_property_title": ((0,0), ["articleDetail.divisionName", "articleDetail.aptName"], 'format_property_title_text', {"font_name": "나눔고딕", "font_size": Pt(18)}),
    "txt_property_page": ("{{매물순번_표시}}", None, 'get_property_order', {"font_name": "나눔고딕", "font_size": Pt(10)}),
    "tbl_complex_info": {
        (0, 0): ("단지주소", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (0, 1): (None, "articleDetail.exposureAddress", None, {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (1, 0): ("준공연도", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (1, 1): (None, "articleDetail.aptUseApproveYmd", 'format_date_yyyy_mm', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (2, 0): ("총세대수", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (2, 1): (None, "articleDetail.aptHouseholdCount", 'format_household_count', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (3, 0): ("총층수", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (3, 1): (None, "articleFloor.buildingHighestFloor", 'format_floor_count', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (4, 0): ("난방방식", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (4, 1): (None, ["articleDetail.aptHeatMethodTypeName", "articleDetail.aptHeatFuelTypeName"], 'format_heating_info', {"font_name": "나눔고딕", "font_size": Pt(10)}),
    },
    "tbl_property_detail_1": {
        (0, 0): ("동·호수", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (0, 1): (None, ["articleDetail.buildingName", "articleAddition.floorInfo"], 'format_dong_ho_for_ppt', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (1, 0): ("계약면적", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (1, 1): (None, "articleSpace.supplySpace", 'format_supply_area_text', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (2, 0): ("전용면적", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (2, 1): (None, "articleSpace.exclusiveSpace", 'format_exclusive_area_text', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (3, 0): ("방수/욕실수", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (3, 1): (None, ["articleDetail.roomCount", "articleDetail.bathroomCount"], 'format_room_bathroom_text', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (4, 0): ("방향", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (4, 1): (None, "articleAddition.direction", None, {"font_name": "나눔고딕", "font_size": Pt(10)}),
    },
    "tbl_property_detail_2": {
        (0, 0): ("보증금/월세", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (0, 1): (None, ["articlePrice.warrantPrice", "articlePrice.rentPrice", "articleAddition.dealOrWarrantPrc", "articleAddition.rentPrc"], 'format_price_details_for_ppt', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (1, 0): ("기본관리비", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (1, 1): (None, "administrationCostInfo.chargeCodeType", 'format_management_fee_for_ppt', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (2, 0): ("입주가능일", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (2, 1): (None, "articleDetail.moveInTypeName", None, {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (3, 0): ("참고사항", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (3, 1): (None, ["articleDetail.articleFeatureDescription", "참고사항_입력"], 'get_first_available_value', {"font_name": "나눔고딕", "font_size": Pt(10)}),
        (4, 0): ("비고", "TABLE_HEADER", None, {"font_name": "나눔고딕", "font_size": Pt(10), "bold": True}),
        (4, 1): (None, ["articleDetail.tagList", "articleDetail.detailDescription", "비고_입력"], 'format_note_for_ppt', {"font_name": "나눔고딕", "font_size": Pt(10)}),
    },
    "img_complex_view": (None, "articleAddition.representativeImgUrl", 'prepare_image_url', None),
    "img_complex_floorplan": (None, "articleDetail.grandPlanList[0].imageSrc", 'prepare_image_url_if_type14', None),
    "img_complex_mapimg": (None, ["articleDetail.latitude", "articleDetail.longitude"], 'generate_map_image_placeholder', None),
}

# --- 3. 데이터 가공 헬퍼 함수들 ---
def get_single_nested_value(data_source, keys_string, default=""):
    """ 단일 경로 문자열을 사용하여 중첩된 값을 가져옵니다. data_source는 article_json_data 또는 client_data가 될 수 있습니다. """
    if keys_string is None or not isinstance(data_source, dict):
        return default
    keys = keys_string.split('.')
    value = data_source
    try:
        for key_part in keys:
            if '[' in key_part and key_part.endswith(']'):
                key = key_part.split('[')[0]
                index = int(key_part.split('[')[1][:-1])
                if key in value and isinstance(value[key], list) and len(value[key]) > index:
                    value = value[key][index]
                else: return default
            elif isinstance(value, dict) and key_part in value:
                value = value[key_part]
            else: return default
        return value if value is not None else default
    except (KeyError, IndexError, TypeError, AttributeError): return default

def get_nested_value(full_merged_data, keys_string_or_list, default=""):
    """
    full_merged_data ('client_data'와 'article_json_data' 포함)에서 값을 가져옵니다.
    keys_string_or_list가 "client_data."로 시작하면 client_data에서, 아니면 article_json_data에서 찾습니다.
    또는 매핑 규칙에서 직접 "문서명" 처럼 client_data의 키를 사용하면 full_merged_data 최상위에서 찾습니다.
    """
    if keys_string_or_list is None: return default

    # client_data의 특정 키들은 full_merged_data 최상위에도 복사해두었으므로, 먼저 거기서 찾아봄
    if isinstance(keys_string_or_list, str) and keys_string_or_list in full_merged_data:
         val = full_merged_data.get(keys_string_or_list)
         if val is not None: return val
    
    # article_json_data를 기본 검색 대상으로 설정
    target_data_source = full_merged_data.get("article_json_data", {})

    if isinstance(keys_string_or_list, list):
        for keys_string in keys_string_or_list:
            # 키 문자열이 "client_data."로 시작하면 client_data에서 값을 찾도록 target_data_source 변경
            current_target_source = full_merged_data.get("client_data", {}) if keys_string.startswith("client_data.") else target_data_source
            actual_key_string = keys_string[len("client_data."):] if keys_string.startswith("client_data.") else keys_string
            
            val = get_single_nested_value(current_target_source, actual_key_string, None)
            if val is not None and str(val).strip() != "": return val
        return default
    else: # 단일 문자열 경로
        current_target_source = full_merged_data.get("client_data", {}) if keys_string_or_list.startswith("client_data.") else target_data_source
        actual_key_string = keys_string_or_list[len("client_data."):] if keys_string_or_list.startswith("client_data.") else keys_string_or_list
        return get_single_nested_value(current_target_source, actual_key_string, default)

def format_date_yyyy_mm(value, data_dict=None, json_path=None): # data_dict는 full_merged_data
    if not value or len(str(value)) != 8: return ""
    try:
        dt_obj = datetime.datetime.strptime(str(value), "%Y%m%d")
        return f"{dt_obj.year}년 {dt_obj.month}월"
    except ValueError: return ""

def calculate_pyeong(m2_value, precision=1):
    if isinstance(m2_value, (int, float)) and m2_value > 0:
        return round(m2_value / 3.3058, precision)
    return ""

def format_property_title_text(values, data_dict=None, json_path=None): # data_dict는 full_merged_data
    prop_order = "1" # TODO: 실제 매물 순번 로직 필요시 data_dict에서 가져오거나 인자로 받아야 함
    div_name = values[0] if len(values) > 0 and values[0] else ""
    apt_name = values[1] if len(values) > 1 and values[1] else ""
    return f"No.{prop_order} [{div_name}] {apt_name}"

def get_property_order(value=None, data_dict=None, json_path=None): # data_dict는 full_merged_data
    return "1" # TODO: 실제 매물 순번 로직

def format_household_count(value, data_dict=None, json_path=None): # data_dict는 full_merged_data
    return f"{value}세대" if value else ""

def format_floor_count(value, data_dict=None, json_path=None): # data_dict는 full_merged_data
    return f"{value}층" if value else ""

def format_heating_info(values, data_dict=None, json_path=None): # data_dict는 full_merged_data
    method = values[0] if len(values) > 0 and values[0] else ""
    fuel = values[1] if len(values) > 1 and values[1] else ""
    if method and fuel: return f"{method}, {fuel}"
    return method or fuel or ""

def format_dong_ho_for_ppt(values, data_dict=None, json_path=None): # data_dict는 full_merged_data
    building_name = values[0] if len(values) > 0 and values[0] else ""
    floor_info_raw = values[1] if len(values) > 1 and values[1] else ""
    floor_display = ""
    if isinstance(floor_info_raw, str):
        if "중층" in floor_info_raw or "고층" in floor_info_raw or "저층" in floor_info_raw:
            floor_display = floor_info_raw.split('/')[0]
        elif "/" in floor_info_raw:
            floor_display = floor_info_raw.split('/')[0] + "층"
        else: floor_display = floor_info_raw
    else: floor_display = str(floor_info_raw)
    return f"{building_name} {floor_display}".strip()

def format_supply_area_text(supply_m2_val, data_dict=None, json_path=None): # data_dict는 full_merged_data
    supply_py_val = calculate_pyeong(supply_m2_val)
    return f"{supply_m2_val}㎡ ({supply_py_val}평)" if supply_m2_val and supply_py_val else (f"{supply_m2_val}㎡" if supply_m2_val else "")

def format_exclusive_area_text(exclusive_m2_val, data_dict=None, json_path=None): # data_dict는 full_merged_data
    exclusive_py_val = calculate_pyeong(exclusive_m2_val)
    return f"{exclusive_m2_val}㎡ ({exclusive_py_val}평)" if exclusive_m2_val and exclusive_py_val else (f"{exclusive_m2_val}㎡" if exclusive_m2_val else "")

def format_room_bathroom_text(values, data_dict=None, json_path=None): # data_dict는 full_merged_data
    room = values[0] if len(values) > 0 and values[0] else "0"
    bath = values[1] if len(values) > 1 and values[1] else "0"
    return f"{room} / {bath}"

def format_management_fee_for_ppt(value, data_dict=None, json_path=None): # data_dict는 full_merged_data
    # value는 administrationCostInfo.chargeCodeType
    # 실제 금액 정보가 JSON에 없으므로 하드코딩 또는 다른 로직 필요
    return "확인 어려움" # 또는 "별도 문의"

def format_price_details_for_ppt(values, data_dict=None, json_path=None): # data_dict는 full_merged_data
    # values는 [articlePrice.warrantPrice(숫자,만원), articlePrice.rentPrice(숫자,만원), articleAddition.dealOrWarrantPrc(문자열), articleAddition.rentPrc(문자열)]
    # 우선순위: articlePrice의 숫자 데이터 > articleAddition의 문자열 데이터
    w_price_num = values[0] if len(values) > 0 and values[0] else 0
    r_price_num = values[1] if len(values) > 1 and values[1] else 0
    
    # deal_text = values[2] if len(values) > 2 and values[2] else "" # data_transformer에서 변환된 값이 들어옴
    # rent_text = values[3] if len(values) > 3 and values[3] else "" # data_transformer에서 변환된 값이 들어옴

    # 숫자 기반으로 "X억 Y만원 / Z만원" 형태 구성
    formatted_w = ""
    if isinstance(w_price_num, (int, float)) and w_price_num > 0:
        if w_price_num >= 10000:
            eok = int(w_price_num // 10000)
            manwon_part = int(w_price_num % 10000)
            formatted_w = f"{eok}억"
            if manwon_part > 0: formatted_w += f" {manwon_part:,}"
        else: formatted_w = f"{int(w_price_num):,}"
    
    formatted_r = ""
    if isinstance(r_price_num, (int, float)) and r_price_num > 0:
        formatted_r = f"{int(r_price_num):,}"
        
    if formatted_w and formatted_r: return f"{formatted_w} / {formatted_r} (만원)"
    if formatted_w: return f"{formatted_w} (만원)"
    if formatted_r: return f" / {formatted_r} (만원)"
    return "가격 정보 없음"

def get_first_available_value(keys_to_check, data_dict=None, json_path=None): # data_dict는 full_merged_data
    """
    keys_to_check 리스트에 있는 키들을 순서대로 data_dict (full_merged_data) 에서 찾아 첫 번째 유효한 값을 반환합니다.
    키가 "참고사항_입력" 또는 "비고_입력" 등 client_data에만 있는 필드를 직접 가리킬 수 있습니다.
    article_json_data 내의 중첩된 값도 "articleDetail.articleFeatureDescription" 처럼 경로로 지정 가능합니다.
    """
    if not isinstance(keys_to_check, list):
        # 단일 키가 온 경우, get_nested_value를 통해 값을 찾음
        # 이 경우는 client_data의 최상위 키 ("참고사항_입력") 또는 article_json_data의 경로를 기대
        raw_val = get_nested_value(data_dict, keys_to_check, None)
        return str(raw_val) if raw_val is not None and str(raw_val).strip() != "" else ""

    for key_or_path in keys_to_check:
        # data_dict는 full_merged_data 전체. get_nested_value가 알아서 client_data 또는 article_json_data에서 찾음
        value = get_nested_value(data_dict, key_or_path, None)
        if value is not None and str(value).strip() != "":
            return str(value)
    return ""

def format_note_for_ppt(keys_to_check, data_dict=None, json_path=None): # data_dict는 full_merged_data
    """
    keys_to_check 리스트에 있는 키들을 data_dict (full_merged_data) 에서 찾아 노트 문자열을 조합합니다.
    주로 "articleDetail.tagList", "articleDetail.detailDescription", "비고_입력" (client_data) 등을 사용.
    """
    note_parts = []
    
    # 1. tagList (article_json_data에서)
    tag_list = get_nested_value(data_dict, "articleDetail.tagList", [])
    if tag_list and isinstance(tag_list, list):
        note_parts.append("#" + " #".join(tag_list))

    # 2. detailDescription (article_json_data에서)
    detail_desc = get_nested_value(data_dict, "articleDetail.detailDescription", "")
    if detail_desc:
        note_parts.append(str(detail_desc))

    # 3. 비고_입력 (client_data에서, full_merged_data 최상위에도 있음)
    client_note = get_nested_value(data_dict, "비고_입력", "")
    if client_note:
        note_parts.append(str(client_note))
    
    return "\\n".join(note_parts) if note_parts else ""


def prepare_image_url(value, data_dict=None, json_path=None): # data_dict는 full_merged_data
    if not value: return None
    if isinstance(value, str) and (value.startswith("http://") or value.startswith("https://")):
        return value
    if isinstance(value, str) and value.startswith("/"): # 네이버 상대 경로 이미지
        return f"{IMAGE_BASE_URL}{value}"
    return None # 그 외의 경우는 처리하지 않음 (또는 예외 발생)

def prepare_image_url_if_type14(value, data_dict=None, json_path=None): # data_dict는 full_merged_data
    # 현재 매핑에서는 'articleDetail.grandPlanList[0].imageSrc'로 imageSrc만 넘어옴.
    # 만약 grandPlanList[0] (객체) 전체가 넘어온다면 imageType 체크 가능.
    # 여기서는 value가 imageSrc라고 가정하고 prepare_image_url과 동일하게 처리.
    return prepare_image_url(value, data_dict, json_path)


def generate_map_image_placeholder(values, data_dict=None, json_path=None): # data_dict는 full_merged_data
    # values는 [latitude, longitude]
    lat = values[0] if len(values) > 0 and values[0] else None
    lon = values[1] if len(values) > 1 and values[1] else None
    if lat and lon:
        # 실제 지도 이미지 API URL로 대체 필요
        return f"https://via.placeholder.com/400x300.png?text=Map+({lat},{lon})"
    return None


# --- 4. PPTX 처리 함수들 ---
def find_shape_by_name(slide_or_group, shape_name):
    for shape in slide_or_group.shapes:
        if shape.name == shape_name:
            return shape
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            found_shape = find_shape_by_name(shape, shape_name)
            if found_shape: return found_shape
    return None

def replace_text_in_shape(shape, new_text, font_details=None):
    if not shape or not hasattr(shape, "text_frame"): return
    text_frame = shape.text_frame
    text_frame.clear()
    p = text_frame.paragraphs[0]
    run = p.add_run()
    run.text = str(new_text) if new_text is not None else ""
    if font_details:
        font = run.font
        if "font_name" in font_details: font.name = font_details["font_name"]
        if "font_size" in font_details: font.size = font_details["font_size"]
        if "bold" in font_details: font.bold = font_details["bold"]
        if "italic" in font_details: font.italic = font_details["italic"]

def add_image_to_shape(slide, shape, image_url_or_data):
    """ slide와 shape을 모두 받아 이미지를 추가/대체 합니다. """
    if not shape or not image_url_or_data:
        print(f"Warning: Shape or image_url_or_data is None for shape: {shape.name if shape else 'Unknown'}")
        return

    image_data_stream = None
    try:
        if isinstance(image_url_or_data, BytesIO):
            image_data_stream = image_url_or_data
            image_data_stream.seek(0)
        elif isinstance(image_url_or_data, str) and (image_url_or_data.startswith("http://") or image_url_or_data.startswith("https://")):
            # print(f"Fetching image from URL: {image_url_or_data}")
            response = requests.get(image_url_or_data, stream=True, timeout=10)
            response.raise_for_status()
            image_data_stream = BytesIO(response.content)
        elif isinstance(image_url_or_data, str) and os.path.exists(image_url_or_data): # 로컬 파일 (테스트용)
            with open(image_url_or_data, "rb") as img_file:
                image_data_stream = BytesIO(img_file.read())
        else:
            print(f"Warning: Invalid image source for shape '{shape.name}': {str(image_url_or_data)[:100]}")
            return

        if not image_data_stream:
            print(f"Warning: Could not prepare image stream for shape '{shape.name}'.")
            return

        # Picture Placeholder인 경우
        if shape.shape_type == MSO_SHAPE_TYPE.PLACEHOLDER and hasattr(shape, "placeholder_format") and shape.placeholder_format.type in [18, MSO_SHAPE_TYPE.PICTURE]: # 18: Picture Placeholder
            try:
                shape.insert_picture(image_data_stream)
                # print(f"Successfully inserted picture into placeholder '{shape.name}'.")
            except Exception as e_ins:
                print(f"Error inserting picture into placeholder '{shape.name}': {e_ins}")
        # 일반 도형(AutoShape)이거나 이미 Picture인 경우 -> 해당 위치/크기에 새로 추가하고 기존 것 삭제 시도 (주의)
        else:
            try:
                # print(f"Replacing shape '{shape.name}' with image.")
                left, top, width, height = shape.left, shape.top, shape.width, shape.height
                # 기존 도형 삭제
                sp = shape._element
                sp.getparent().remove(sp)
                # 새 이미지 추가
                slide.shapes.add_picture(image_data_stream, left, top, width=width, height=height)
            except Exception as e_repl:
                print(f"Error replacing shape '{shape.name}' with image: {e_repl}. Adding image at shape's location.")
                # 대체 실패시 그냥 추가 시도 (겹칠 수 있음)
                try:
                    slide.shapes.add_picture(image_data_stream, shape.left, shape.top, width=shape.width, height=shape.height)
                except Exception as e_add:
                     print(f"Error fallback adding picture for shape '{shape.name}': {e_add}")


    except requests.exceptions.RequestException as e_req:
        print(f"Error fetching image for shape '{shape.name}' from URL {image_url_or_data}: {e_req}")
    except Exception as e_img:
        print(f"Error processing image for shape '{shape.name}': {e_img}")
    finally:
        if image_data_stream and not isinstance(image_url_or_data, BytesIO): # 외부에서 BytesIO를 준게 아니면 닫음
            image_data_stream.close()


def set_cell_text(cell, text, font_details=None):
    cell.text = str(text) if text is not None else ""
    if cell.text_frame.paragraphs:
        para = cell.text_frame.paragraphs[0]
        # 기존 run들을 모두 지우고 새로 추가 (스타일 초기화 효과)
        for run_to_remove in para.runs:
            p_elm = para._p
            p_elm.remove(run_to_remove._r)
        
        run = para.add_run()
        run.text = str(text) if text is not None else "" # 다시 텍스트 설정

        if font_details:
            font = run.font
            if "font_name" in font_details: font.name = font_details["font_name"]
            if "font_size" in font_details: font.size = font_details["font_size"]
            if "bold" in font_details: font.bold = font_details["bold"]


def fill_table_from_mappings(table_shape, table_mapping_rules, full_merged_data):
    if not table_shape or table_shape.shape_type != MSO_SHAPE_TYPE.TABLE: return

    for cell_coord, mapping_info in table_mapping_rules.items():
        if not isinstance(cell_coord, tuple) or len(cell_coord) != 2: continue
        row_idx, col_idx = cell_coord
        
        placeholder_or_header, json_path_or_list, func_name, font_info = None, None, None, {}
        if isinstance(mapping_info, tuple):
            if len(mapping_info) > 0: placeholder_or_header = mapping_info[0]
            if len(mapping_info) > 1: json_path_or_list = mapping_info[1]
            if len(mapping_info) > 2: func_name = mapping_info[2]
            if len(mapping_info) > 3 and isinstance(mapping_info[3], dict): font_info = mapping_info[3]
        
        final_text = ""
        if placeholder_or_header == "TABLE_HEADER":
            final_text = str(json_path_or_list) if json_path_or_list is not None else ""
        elif json_path_or_list is not None:
            value_from_json = get_nested_value(full_merged_data, json_path_or_list)
            if func_name and callable(globals().get(func_name)):
                final_text = globals()[func_name](value_from_json, data_dict=full_merged_data, json_path=json_path_or_list)
            else:
                final_text = str(value_from_json) if value_from_json is not None else ""
        elif placeholder_or_header:
             final_text = placeholder_or_header

        try:
            cell = table_shape.table.cell(row_idx, col_idx)
            set_cell_text(cell, final_text, font_info)
        except IndexError:
            print(f"Warning: Cell ({row_idx}, {col_idx}) out of range for table '{table_shape.name}'.")
        except Exception as e:
            print(f"Error setting cell text for table '{table_shape.name}', cell ({row_idx}, {col_idx}): {e}")

# --- 5. 메인 PPT 생성 함수 ---
def generate_presentation(client_data_input: dict, article_json_data_input: dict, 매핑규칙: dict) -> BytesIO:
    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(f"PPTX Template not found at {TEMPLATE_PATH}")

    prs = Presentation(TEMPLATE_PATH)

    # client_data와 article_json_data를 병합하고, 일부 client_data 키는 최상위에도 추가
    full_merged_data = {
        "client_data": client_data_input,
        "article_json_data": article_json_data_input
    }
    for client_key in ["문서명", "고객명", "회사명", "참고사항_입력", "비고_입력"]:
        if client_key in client_data_input:
            full_merged_data[client_key] = client_data_input[client_key]


    for slide_idx, slide in enumerate(prs.slides):
        # analyze_slide_shapes_for_debug(slide_idx, slide) # 디버깅 시 사용
        for shape_name, mapping_info in 매핑규칙.items():
            shape = find_shape_by_name(slide, shape_name)
            if not shape: continue

            if shape.shape_type == MSO_SHAPE_TYPE.TABLE:
                if isinstance(mapping_info, dict):
                    fill_table_from_mappings(shape, mapping_info, full_merged_data)
                continue

            placeholder_text, json_path_or_list, func_name, style_info = None, None, None, None
            if isinstance(mapping_info, tuple):
                if len(mapping_info) > 0: placeholder_text = mapping_info[0]
                if len(mapping_info) > 1: json_path_or_list = mapping_info[1]
                if len(mapping_info) > 2: func_name = mapping_info[2]
                if len(mapping_info) > 3: style_info = mapping_info[3]
            
            value_from_json = None
            if json_path_or_list is not None:
                value_from_json = get_nested_value(full_merged_data, json_path_or_list)

            final_value = None
            if func_name and callable(globals().get(func_name)):
                final_value = globals()[func_name](value_from_json, data_dict=full_merged_data, json_path=json_path_or_list)
            elif value_from_json is not None:
                final_value = value_from_json
            elif placeholder_text and "{{" not in str(placeholder_text): # {{...}} 형태의 플레이스홀더가 아닌 경우
                final_value = placeholder_text

            is_image_shape = shape_name.startswith("img_") or \
                             (func_name and any(kw in func_name for kw in ["image", "img", "url"])) or \
                             (isinstance(final_value, str) and final_value.startswith("https://via.placeholder.com")) # 지도 이미지 예시
            
            if is_image_shape and final_value:
                add_image_to_shape(slide, shape, final_value) # slide 객체 전달
            elif hasattr(shape, "text_frame"):
                font_details = style_info if isinstance(style_info, dict) else None
                replace_text_in_shape(shape, str(final_value) if final_value is not None else "", font_details)

    ppt_stream = BytesIO()
    prs.save(ppt_stream)
    ppt_stream.seek(0)
    return ppt_stream

# --- 6. 로컬 테스트 실행 부분 ---
if __name__ == '__main__':
    print(f"Current working directory: {os.getcwd()}")
    print(f"Base directory of script: {BASE_DIR}")
    print(f"Template path: {TEMPLATE_PATH}")
    
    if not os.path.exists(TEMPLATE_PATH):
        print(f"Error: Template file not found at {TEMPLATE_PATH}")
    else:
        print("Template file found. Proceeding with test generation...")
        
        # 테스트용 client_data와 article_json_data 준비
        # client_and_document_data_sample에 "참고사항_입력", "비고_입력"이 이미 포함됨
        test_client_data = client_and_document_data_sample 
        test_article_json_data = full_json_data_sample

        try:
            generated_ppt_stream = generate_presentation(test_client_data, test_article_json_data, mappings)
            
            output_filename = os.path.join(BASE_DIR, "생성된_테스트_물건자료_v2.pptx")
            with open(output_filename, "wb") as f:
                f.write(generated_ppt_stream.getvalue())
            print(f"Presentation saved to {output_filename}")
            generated_ppt_stream.close()
        except FileNotFoundError as e:
            print(f"Error during test generation (FileNotFound): {e}")
        except Exception as e:
            print(f"An unexpected error occurred during test generation: {e}")
            import traceback
            traceback.print_exc()

def analyze_slide_shapes_for_debug(slide_number, slide): # 독립된 함수로 유지
    print(f"\n--- Slide {slide_number + 1} Shapes ---")
    for i, shape in enumerate(slide.shapes):
        shape_type_name = str(shape.shape_type)
        try: 
            shape_type_name = MSO_SHAPE_TYPE.to_xml(shape.shape_type)
        except: pass 

        print(f"  Shape {i+1}: Name='{shape.name}', Type='{shape_type_name}' ({shape.shape_type})")
        if hasattr(shape, "text_frame") and shape.text_frame and shape.text_frame.text.strip():
            print(f"    Text: '{shape.text_frame.text[:50].strip()}...'")
        if shape.shape_type == MSO_SHAPE_TYPE.PLACEHOLDER:
            print(f"    Placeholder Type: {shape.placeholder_format.type}")
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            print(f"    Grouped Shapes:")
            for j, sub_shape in enumerate(shape.shapes):
                sub_shape_type_name = str(sub_shape.shape_type)
                try: sub_shape_type_name = MSO_SHAPE_TYPE.to_xml(sub_shape.shape_type)
                except: pass
                print(f"      Sub-Shape {j+1}: Name='{sub_shape.name}', Type='{sub_shape_type_name}' ({sub_shape.shape_type})")
                if hasattr(sub_shape, "text_frame") and sub_shape.text_frame and sub_shape.text_frame.text.strip():
                     print(f"        Text: '{sub_shape.text_frame.text[:50].strip()}...'")