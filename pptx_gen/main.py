"""
PPT 생성 메인 모듈

이 모듈은 부동산 매물 정보를 바탕으로 PPT 파일을 생성하는 프로그램의 진입점입니다.
모듈화된 구조로 리팩토링되었습니다.
"""
import os
from ppt_generator import create_ppt_file

if __name__ == '__main__':
    # 샘플 매물 데이터 (테스트용)
    sample_property_data = {
        "documentTitle": "테스트 문서 제목",
        "clientName": "홍길동 고객님",
        "companyName": "테스트 주식회사",
        "userRemarks": "빠른 입주 희망",
        "userNotes": "풀옵션 선호",
        "articleDetail": {
            "articleNo": "1234567",
            "divisionName": "강남구",
            "aptName": "럭셔리 아파트",
            "exposureAddress": "서울시 강남구 테헤란로 123",
            "aptUseApproveYmd": "20201020",
            "aptHouseholdCount": "500",
            "totalDongCount": 5,
            "aptHeatMethodTypeName": "개별난방",
            "aptHeatFuelTypeName": "도시가스",
            "buildingName": "101동",
            "roomCount": "3",
            "bathroomCount": "2",
            "moveInTypeName": "즉시입주",
            "moveInPossibleYmd": None 
        },
        "articleAddition": {
            "floorInfo": "15/25", 
            "direction": "남향",
            "dealOrWarrantPrc": "10억", 
            "rentPrc": "300", 
            "area1": 162.12,  # 계약면적
            "area2": 134.84,  # 전용면적
        },
        "articlePrice": {
            "managementCost": "15만원" 
        }
    }
    sample_map_image_url = None 
    template_path = os.path.join(os.path.dirname(__file__), 'ppt_template.pptx')
    
    if not os.path.exists(template_path):
        print(f"[ERROR] PPT 템플릿 파일을 찾을 수 없습니다: {template_path}")
        print("스크립트와 같은 디렉토리에 'ppt_template.pptx' 파일이 있는지 확인하거나, 올바른 경로를 지정해주세요.")
    else:
        output_ppt_path = create_ppt_file(
            property_data=sample_property_data, 
            map_image_url=sample_map_image_url, 
            template_filepath=template_path,
            mapping_csv_filepath=None
        )
        print(f"PPT 파일 생성 완료: {output_ppt_path}")
