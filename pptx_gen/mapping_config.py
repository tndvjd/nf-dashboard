"""
매핑 설정 정보 관리 모듈

이 모듈은 PPT 플레이스홀더와 데이터 필드 간의 매핑 설정을 관리합니다.
"""
from formatters import (
    format_article_no_title, format_title_with_item_index,
    format_area_m2_value, format_area_py_value
)

FONT_NAME_NANUM_GOTHIC = '나눔고딕'
DEFAULT_FONT_SIZE = 11  # 특별히 지정하지 않은 경우의 기본 크기
DEFAULT_IS_BOLD = False # 특별히 지정하지 않은 경우 볼드 여부


def get_default_mappings():
    """
    기본 매핑 정보를 반환합니다.
    항목 순서: (슬라이드번호, 플레이스홀더/도형이름, 데이터경로, 포맷함수, 이미지여부, 폰트이름, 폰트크기, 볼드여부)
    """
    return [
        # 슬라이드 1 (상세 정보 페이지)
        # 매물 기본 정보 (상단 타이틀)
        (1, "No.{{매물순번}} [{{지역구}}] {{단지명}}", ["articleDetail.articleNo", "articleDetail.divisionName", "articleDetail.aptName"], format_article_no_title, False, FONT_NAME_NANUM_GOTHIC, 18, True),
        (1, "{{단지_주소}}", "articleDetail.exposureAddress", None, False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{단지_준공연도}}", "articleDetail.aptUseApproveYmd",
            lambda x: f"{x[:4]}년 {x[4:6]}월" if x and len(x) >= 6 else "정보 없음", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{단지_총세대수}}", "articleDetail.aptHouseholdCount",
            lambda x: f"{x} 세대" if x else "정보 없음", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{단지_총층수}}", "articleDetail.totalDongCount",
            lambda x: f"{x} 개동" if x else "정보 없음", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{단지_난방방식}}", ["articleDetail.aptHeatMethodTypeName", "articleDetail.aptHeatFuelTypeName"],
            lambda vals: f"{vals[0] if vals[0] else ''}, {vals[1] if vals[1] else ''}".strip(', '), False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),

        # 물건 정보 테이블
        (1, "{{매물_동호수}}", ["articleDetail.buildingName", "articleAddition.floorInfo"],
            lambda vals: f"{vals[0] if vals[0] else ''} {vals[1].split('/')[0] + '층' if vals[1] and '/' in vals[1] else (vals[1] if vals[1] else '')}".strip(), False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),

        # 계약면적, 전용면적
        (1, "{{매물_계약면적_㎡}}", "articleAddition.area1", format_area_m2_value, False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{매물_계약면적_py}}", "articleAddition.area1", format_area_py_value, False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{매물_전용면적_㎡}}", "articleAddition.area2", format_area_m2_value, False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{매물_전용면적_py}}", "articleAddition.area2", format_area_py_value, False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),

        (1, "{{매물_방개수}}", "articleDetail.roomCount", lambda x: str(x) if x else "-", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{매물_화장실개수}}", "articleDetail.bathroomCount", lambda x: str(x) if x else "-", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{매물_방향}}", "articleAddition.direction", lambda x: str(x) if x else "정보 없음", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),

        (1, "{{매물_보증금}}", "articleAddition.dealOrWarrantPrc", lambda x: str(x) if x else "-", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{매물_월세}}", "articleAddition.rentPrc", lambda x: str(x) if x else "-", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),

        # 기본관리비
        (1, "{{매물_기본관리비}}", "articlePrice.managementCost",
            lambda x: str(x) if x else "확인 어려움", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{매물_입주가능일}}", "articleDetail.moveInTypeName",
            lambda x: str(x) if x else "-", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),

        (1, "{{매물_참고사항}}", "userRemarks", lambda x: str(x) if x else "", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
        (1, "{{매물_비고}}", "userNotes", lambda x: str(x) if x else "", False, FONT_NAME_NANUM_GOTHIC, DEFAULT_FONT_SIZE, DEFAULT_IS_BOLD),
    ]

def get_title_mappings():
    """
    표지 슬라이드 매핑 정보를 반환합니다.
    항목 순서: (슬라이드번호, 플레이스홀더, 데이터키, 폰트이름, 폰트크기, 볼드여부)
    """
    return [
        (0, "{{문서명}}", "documentTitle", FONT_NAME_NANUM_GOTHIC, 40, True),
        (0, "{{고객명}}", "clientName", FONT_NAME_NANUM_GOTHIC, 20, True),
        (0, "{{회사명}}", "companyName", FONT_NAME_NANUM_GOTHIC, 20, True)
    ]

def get_image_mappings():
    """이미지 매핑 정보를 반환합니다."""
    return [
        # 현재는 주석 처리된 상태이므로, 필요시 활성화
        # (1, "img_main_picture", "articleAddition.representativeImgUrl", None, True),
        # (1, "img_floor_plan", "articleDetail.complexPyeongDetailList[0].floorPlanUrl", None, True),
    ]