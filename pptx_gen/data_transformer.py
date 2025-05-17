def transform_naver_article_to_internal_format(naver_data: dict) -> dict:
    """
    네이버 부동산 API (NaverArticleDetail) 응답을
    내부에서 사용하는 full_json_data 형식으로 변환합니다.
    """
    article_detail = {}
    article_addition = {}
    article_price = {}
    article_space = {}
    article_photos = []
    article_floor = {} # 추가됨

    # 최상위 레벨에서 articleDetail로 이동할 필드들
    article_detail["articleNo"] = naver_data.get("articleNo")
    article_detail["articleName"] = naver_data.get("articleName") # aptName과 유사, 확인 필요
    article_detail["aptName"] = naver_data.get("articleName") # 일단 동일하게 매핑, 추후 네이버 데이터 구조 확인 후 수정

    # 주소 정보 (네이버 API 응답에 따라 키 확인 필요, 여기서는 예시)
    # naver_data에 exposureAddress와 유사한 필드가 있다면 매핑
    # 예: article_detail["exposureAddress"] = naver_data.get("address") or naver_data.get("jibunAddress")
    # 현재 NaverArticleDetail 인터페이스에는 주소 필드가 명시적으로 없으나, 실제 응답에 있을 수 있음.
    # debug_ppt_elements.py에서는 "서울시 강남구 논현동 123-45번지" 형태를 기대
    article_detail["exposureAddress"] = naver_data.get("exposureAddress", "주소 정보 없음") # 임시

    # 준공연도: Naver API에는 articleConfirmYmd (등록일)이 있음. aptUseApproveYmd는 단지 정보에서 올 수도 있음.
    # 여기서는 NaverArticleDetail에 있는 articleConfirmYmd를 사용하되, 형식 변환은 ppt 생성 로직에서 처리할 것으로 가정
    article_detail["aptUseApproveYmd"] = naver_data.get("articleConfirmYmd") # YYYYMMDD 형식

    # 기타 articleDetail 정보
    article_detail["roomCount"] = str(naver_data.get("roomCount", "0")) # 문자열로 변환
    article_detail["bathroomCount"] = str(naver_data.get("bathroomCount", "0")) # 문자열로 변환
    article_detail["moveInTypeName"] = naver_data.get("moveInTypeName")
    article_detail["articleFeatureDescription"] = naver_data.get("articleFeatureDescription")
    article_detail["detailDescription"] = naver_data.get("detailDescription")
    article_detail["tagList"] = naver_data.get("tagList", [])
    article_detail["latitude"] = naver_data.get("latitude")
    article_detail["longitude"] = naver_data.get("longitude")

    # 평면도/단지배치도 (grandPlanList)
    # naver_data의 grandPlanList 구조를 확인하고, imageSrc를 추출해야 함
    # debug_ppt_elements.py는 [{"imageSrc": "...", "imageType": "14"}] 형태를 기대
    if naver_data.get("grandPlanList") and isinstance(naver_data["grandPlanList"], list) and len(naver_data["grandPlanList"]) > 0:
        article_detail["grandPlanList"] = [{"imageSrc": item.get("imageSrc"), "imageType": item.get("imageType", "14")} for item in naver_data["grandPlanList"]]
    else:
        article_detail["grandPlanList"] = []


    # articleAddition 정보
    # 층 정보: flrInfo가 "저/17" 형태이므로, 이를 "저층/17" 등으로 변환하거나, ppt 생성시 처리
    floor_info_raw = naver_data.get("flrInfo", "") # "5/10" 또는 "저/15" 등
    # debug_ppt_elements.py는 "중층/9" 형태를 기대하므로, 유사하게 맞춰주거나, ppt 생성 시 가공
    article_addition["floorInfo"] = floor_info_raw # 직접 전달 후 ppt 생성 시 가공

    article_addition["direction"] = naver_data.get("direction")

    # 대표 이미지 URL: naver_data의 articlePhotos 중 첫번째 혹은 특정 타입의 이미지를 사용할 수 있음.
    # 여기서는 첫번째 사진을 대표 이미지로 가정
    if naver_data.get("articlePhotos") and len(naver_data["articlePhotos"]) > 0:
        article_addition["representativeImgUrl"] = naver_data["articlePhotos"][0].get("imageSrc")
    else:
        article_addition["representativeImgUrl"] = None


    # articlePrice 정보 (만원 단위로 변환 필요시 여기서 처리 또는 ppt 생성시 처리)
    # debug_ppt_elements.py는 warrantPrice, rentPrice가 숫자(정수) 만원 단위를 기대함
    # naver_data의 dealOrWarrantPrc, rentPrc는 문자열일 수 있고, "억" 단위 포함 가능 ("1억 5,000")
    # 여기서는 문자열 그대로 전달하고, ppt 생성 시 가공 함수에서 처리하도록 함.
    # 또는, 여기서 숫자(만원)로 변환하는 로직 추가 가능. 여기서는 일단 문자열로 전달.
    article_addition["dealOrWarrantPrc"] = naver_data.get("dealOrWarrantPrc") # "1억 5,000" or "5000"
    article_addition["rentPrc"] = naver_data.get("rentPrc") or naver_data.get("monRentPrc") # "100" or "50"

    # articlePrice는 숫자 만원 단위를 기대함
    # 임시로 dealOrWarrantPrc에서 숫자만 추출 (간단한 버전)
    w_prc_str = str(naver_data.get("dealOrWarrantPrc", "0")).replace("억", "0000").replace(",", "").replace("만원", "").strip()
    r_prc_str = str(naver_data.get("rentPrc", "") or naver_data.get("monRentPrc", "0")).replace(",", "").replace("만원", "").strip()

    try:
        # "1억 5000" 같은 경우 "100005000" -> 15000이 되어야 함. 복잡한 변환 필요.
        # 여기서는 단순화: "억"은 만 단위로, 나머지는 그대로.
        if "억" in str(naver_data.get("dealOrWarrantPrc", "")):
            parts = str(naver_data.get("dealOrWarrantPrc", "")).split("억")
            w_val = int(parts[0]) * 10000
            if len(parts) > 1 and parts[1].strip():
                 w_val += int(parts[1].replace(",", "").replace("만원", "").strip() or 0)
            article_price["warrantPrice"] = w_val
        else:
            article_price["warrantPrice"] = int(w_prc_str) if w_prc_str.isdigit() else 0
    except ValueError:
        article_price["warrantPrice"] = 0

    try:
        article_price["rentPrice"] = int(r_prc_str) if r_prc_str.isdigit() else 0
    except ValueError:
        article_price["rentPrice"] = 0


    # articleSpace 정보 (m2 단위)
    # spc1 (공급면적), spc2 (전용면적)는 숫자 또는 문자열일 수 있음. float으로 변환.
    try:
        article_space["supplySpace"] = float(naver_data.get("spc1", 0))
    except ValueError:
        article_space["supplySpace"] = 0.0
    try:
        article_space["exclusiveSpace"] = float(naver_data.get("spc2", 0))
    except ValueError:
        article_space["exclusiveSpace"] = 0.0

    # articlePhotos
    # debug_ppt_elements.py는 [{"imageSrc": "...", "imageType": "10"}] 형태를 기대
    if naver_data.get("articlePhotos") and isinstance(naver_data["articlePhotos"], list):
        article_photos = [{"imageSrc": item.get("imageSrc"), "imageType": item.get("imageType", "10")} for item in naver_data["articlePhotos"]]


    # articleFloor 정보 (추가됨)
    # flrInfo 에서 현재 층과 전체 층 분리 시도
    # 예: "5/10" -> currentFloor: 5, totalFloorCount: 10
    # 예: "저/15" -> currentFloor: "저", totalFloorCount: 15
    # naver_data의 flrInfo ("5/10" 또는 "저/15") 와 buildingHighestFloor/totalFloorCount 매핑
    # NaverArticleDetail에는 buildingHighestFloor, totalFloorCount 필드가 명시적으로 없음.
    # complex API에서 가져와야 할 수도 있음. 여기서는 flrInfo를 기반으로 채움.
    if floor_info_raw and "/" in floor_info_raw:
        parts = floor_info_raw.split("/")
        # article_floor["currentFloor"] = parts[0] # 사용하지 않음
        article_floor["totalFloorCount"] = parts[1] # 해당 동의 총 층수
        article_floor["buildingHighestFloor"] = parts[1] # 해당 동의 총 층수
    else:
        # article_floor["currentFloor"] = floor_info_raw # 사용하지 않음
        article_floor["totalFloorCount"] = None
        article_floor["buildingHighestFloor"] = None


    # debug_ppt_elements.py에서 사용하는 나머지 필드들은 네이버 API 응답을 보고 추가 매핑 필요
    # 예: aptHouseholdCount, aptHeatMethodTypeName, aptHeatFuelTypeName 등은 단지(complex) 정보 API에서 가져와야 할 수 있음.
    # 현재는 article 정보만 사용하므로, 이 값들은 비어있거나 기본값으로 설정됨.
    article_detail["aptHouseholdCount"] = naver_data.get("householdCountByPyeong", {}).get("total", naver_data.get("totalDongCount", None)) # 단지 정보 필요
    article_detail["aptHeatMethodTypeName"] = naver_data.get("heatMethodTypeCode", {}).get("name") # 단지 정보 필요
    article_detail["aptHeatFuelTypeName"] = naver_data.get("heatFuelTypeCode", {}).get("name") # 단지 정보 필요
    article_detail["buildingName"] = naver_data.get("buildingName", "") # 동 정보. API에 없을 수 있음.


    # administrationCostInfo는 네이버 API에 명확한 필드가 없을 수 있음.
    administration_cost_info = {"chargeCodeType": "03"} # 기본값 (확인 어려움)


    return {
        "articleDetail": article_detail,
        "articleAddition": article_addition,
        "articlePrice": article_price,
        "articleSpace": article_space,
        "articlePhotos": article_photos,
        "articleFloor": article_floor, # 추가됨
        "administrationCostInfo": administration_cost_info,
        # "참고사항_입력", "비고_입력" 등은 client_data에서 받아야 함.
    } 