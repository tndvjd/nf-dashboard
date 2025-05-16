# main.py

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
from urllib.parse import urlencode
from typing import Optional, List

# config.py에서 설정 값 가져오기
try:
    from config import HEADERS as CONFIG_HEADERS, COOKIES as CONFIG_COOKIES, DEFAULT_PARAMS as DEFAULT_PROPERTY_PARAMS_FOR_LIST
    print("config.py에서 CONFIG_HEADERS, CONFIG_COOKIES, DEFAULT_PROPERTY_PARAMS_FOR_LIST를 성공적으로 가져왔습니다.")
except ImportError:
    print("경고: config.py를 찾을 수 없거나, HEADERS, COOKIES, DEFAULT_PARAMS 정의를 찾을 수 없습니다. main.py의 기본값을 사용합니다.")
    # config.py가 없거나 필요한 변수가 없는 경우를 위한 기본값 (기존 main.py의 값 유지)
    CONFIG_HEADERS = {
        'accept': '*/*',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'authorization': 'Bearer YOUR_BEARER_TOKEN', # Placeholder - 실제 유효한 토큰으로 교체 필요
        'priority': 'u=1, i',
        'referer': 'https://new.land.naver.com/',
        'sec-ch-ua': '"Chromium";v="134", "Whale";v="4", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Whale/4.31.304.16 Safari/537.36',
    }
    CONFIG_COOKIES = {
        'NNB': 'YOUR_NNB_COOKIE', # Placeholder - 실제 유효한 값으로 교체 필요
        'NID_AUT': 'YOUR_NID_AUT_COOKIE', # Placeholder - 실제 유효한 값으로 교체 필요
        'NID_SES': 'YOUR_NID_SES_COOKIE', # Placeholder - 실제 유효한 값으로 교체 필요
        'REALESTATE': 'Mon%20May%2012%202025%2023%3A52%3A15%20GMT%2B0900%20(Korean%20Standard%20Time)', # Placeholder
    }
    DEFAULT_PROPERTY_PARAMS_FOR_LIST = {
        'realEstateType': 'APT:OPST:ABYG:OBYG',
        'tradeType': 'A1:B1:B2:B3',
        'tag': '::::::::',
        'rentPriceMin': '0',
        'rentPriceMax': '900000000',
        'priceMin': '0',
        'priceMax': '900000000',
        'areaMin': '0',
        'areaMax': '900000000',
        'oldBuildYears': '',
        'recentlyBuildYears': '',
        'minHouseHoldCount': '',
        'maxHouseHoldCount': '',
        'showArticle': 'false',
        'sameAddressGroup': 'false',
        'minMaintenanceCost': '',
        'maxMaintenanceCost': '',
        'priceType': 'RETAIL',
        'directions': '',
        'buildingNos': '',
        'areaNos': '',
        'type': 'list',
        'order': 'rank'
    }

app = FastAPI()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- 1. 선택한 동의 단지 목록 가져오는 API ---
@app.get("/api/complexes")
async def get_complexes_in_dong(
    gu_name: str, 
    dong_name: str, 
    propertyType: Optional[str] = Query(None)
):
    print(f"API 요청 받음 (단지목록): {gu_name} {dong_name}, 매물종류필터: {propertyType}")
    keyword = f"{gu_name} {dong_name}"
    raw_complex_list = [] 
    page = 1
    is_more_data = True
    session = requests.Session()
    session.headers.update(CONFIG_HEADERS)
    session.cookies.update(CONFIG_COOKIES)
    search_api_url = 'https://new.land.naver.com/api/search'
    
    while is_more_data:
        params = {'keyword': keyword, 'page': str(page)}
        print(f"네이버 부동산 단지 검색 API 요청: {search_api_url}, 파라미터: {params}, 페이지: {page}")
        try:
            response = session.get(search_api_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            print(f"단지 검색 API 응답 상태 코드: {response.status_code} (페이지 {page})")
            
            if data and 'complexes' in data and data['complexes'] is not None:
                complex_results_on_page = [item for item in data['complexes'] if 'complexNo' in item and item['complexNo']]
                raw_complex_list.extend(complex_results_on_page)
            else:
                print(f"페이지 {page}에서 'complexes' 데이터를 찾을 수 없거나 null입니다. 응답: {data}")
                
            is_more_data = data.get('isMoreData', False)
            if is_more_data:
                page += 1
                time.sleep(0.2) 
            else:
                print("더 이상 가져올 단지 데이터 없음 (초기 목록 - Raw).")
                break
        except Exception as e:
            print(f"네이버 부동산 단지 검색 API 요청 중 오류 (페이지 {page}): {e}")
            return {"error": f"단지 목록 초기 조회 중 오류: {e}", "complexes": []}

    if not raw_complex_list:
        print(f"{keyword}에 해당하는 단지 정보 없음 (Raw).")
        return {"message": "해당 지역에 검색된 단지가 없습니다.", "complexes": []}

    all_complexes_data = []
    # DEFAULT_PROPERTY_PARAMS_FOR_LIST가 정상적으로 로드되었는지 확인
    default_real_estate_type = DEFAULT_PROPERTY_PARAMS_FOR_LIST.get('realEstateType', 'APT:OPST:ABYG:OBYG') if DEFAULT_PROPERTY_PARAMS_FOR_LIST else 'APT:OPST:ABYG:OBYG'

    if propertyType and propertyType != default_real_estate_type:
        print(f"매물 종류 '{propertyType}'으로 단지 필터링 시작...")
        target_types = propertyType.split(':')
        for complex_item in raw_complex_list:
            complex_estate_type_code = complex_item.get('realEstateTypeCode')
            complex_estate_type_name = complex_item.get('realEstateTypeName') 
            matched = False
            if complex_estate_type_code and complex_estate_type_code in target_types:
                 matched = True
            elif complex_estate_type_name: 
                for t_type in target_types:
                    if t_type == "APT" and "아파트" in complex_estate_type_name: matched = True; break
                    elif t_type == "OPST" and ("오피스텔" in complex_estate_type_name or "오피" in complex_estate_type_name): matched = True; break
                    elif t_type == "ABYG" and ("연립" in complex_estate_type_name or "빌라" in complex_estate_type_name): matched = True; break
                    elif t_type == "OBYG" and ("단독" in complex_estate_type_name or "다가구" in complex_estate_type_name or "주택" in complex_estate_type_name): matched = True; break
            if matched:
                all_complexes_data.append(complex_item)
        print(f"매물 종류 필터링 후 {len(all_complexes_data)}개 단지 남음.")
    else:
        all_complexes_data = raw_complex_list 
        print(f"매물 종류 필터링 건너뜀 (propertyType: {propertyType}). 총 {len(all_complexes_data)}개 단지.")

    if not all_complexes_data: 
        return {"message": f"해당 지역 및 조건에 맞는 단지가 없습니다 (매물종류: {propertyType}).", "complexes": []}
        
    print(f"최종 {len(all_complexes_data)}개의 단지 정보 반환.")
    return {"complexes": all_complexes_data}

# --- 2. 선택한 단지의 매물 목록 가져오는 API ---
@app.get("/api/complexes/{complex_no}/properties")
async def get_properties_in_complex(
    complex_no: str, 
    tradeType: Optional[str] = Query(None),
    realEstateType: Optional[str] = Query(None),
    priceMin: Optional[int] = Query(None),
    priceMax: Optional[int] = Query(None),
    rentMin: Optional[int] = Query(None),
    rentMax: Optional[int] = Query(None),
    areaMin: Optional[int] = Query(None),
    areaMax: Optional[int] = Query(None)
):
    print(f"API 요청 받음 (매물목록): 단지번호 {complex_no}, 거래유형: {tradeType}, 매물종류: {realEstateType}, 주요금액: {priceMin}~{priceMax}, 월세: {rentMin}~{rentMax}, 면적: {areaMin}~{areaMax}")
    fetched_properties = []
    page = 1
    is_more_data = True

    session = requests.Session()
    session.headers.update(CONFIG_HEADERS)
    session.cookies.update(CONFIG_COOKIES)

    base_article_url = f"https://new.land.naver.com/api/articles/complex/{complex_no}"
    
    # DEFAULT_PROPERTY_PARAMS_FOR_LIST가 정상적으로 로드되었는지 확인하고 .copy() 호출
    api_params = DEFAULT_PROPERTY_PARAMS_FOR_LIST.copy() if DEFAULT_PROPERTY_PARAMS_FOR_LIST else {}
    if not api_params: # DEFAULT_PROPERTY_PARAMS_FOR_LIST 로드 실패 시 기본값 설정
        print("경고: DEFAULT_PROPERTY_PARAMS_FOR_LIST 로드 실패, API 파라미터 기본값 수동 설정")
        api_params = {
            'realEstateType': 'APT:OPST:ABYG:OBYG', 'tradeType': 'A1:B1:B2:B3', 'tag': '::::::::',
            'rentPriceMin': '0', 'rentPriceMax': '900000000', 'priceMin': '0', 'priceMax': '900000000',
            'areaMin': '0', 'areaMax': '900000000', 'showArticle': 'false', 'sameAddressGroup': 'false',
            'priceType': 'RETAIL', 'type': 'list', 'order': 'rank'
        }
    api_params['complexNo'] = complex_no


    if tradeType: api_params['tradeType'] = tradeType
    if realEstateType: api_params['realEstateType'] = realEstateType
    if priceMin is not None: api_params['priceMin'] = str(priceMin)
    if priceMax is not None: api_params['priceMax'] = str(priceMax)
    
    if tradeType and (tradeType == 'B2' or tradeType == 'B3'): 
        if rentMin is not None: api_params['rentPriceMin'] = str(rentMin)
        if rentMax is not None: api_params['rentPriceMax'] = str(rentMax)
    else: 
        api_params.pop('rentPriceMin', None) 
        api_params.pop('rentPriceMax', None)

    if areaMin is not None: api_params['areaMin'] = str(areaMin)
    if areaMax is not None: api_params['areaMax'] = str(areaMax)
    
    print(f"네이버 API로 전달될 최종 파라미터 (매물목록): {api_params}")

    while is_more_data:
        api_params['page'] = str(page)
        request_url = f"{base_article_url}?{urlencode(api_params)}"
        print(f"네이버 부동산 매물 목록 API 요청: {request_url}, 페이지: {page}")
        try:
            response = session.get(request_url, timeout=10)
            response.raise_for_status()
            data = response.json()
            print(f"매물 목록 API 응답 상태 코드: {response.status_code} (페이지 {page})")

            articles_on_page = data.get('articleList', [])
            if articles_on_page:
                fetched_properties.extend(articles_on_page)
            else:
                print(f"페이지 {page}에서 'articleList' 데이터를 찾을 수 없거나 비어있습니다. 응답: {data}")

            is_more_data = data.get('isMoreData', False)
            if is_more_data:
                page += 1
                time.sleep(0.5) 
            else:
                print("더 이상 가져올 매물 없음.")
                break
        except Exception as e:
            print(f"매물 목록 API 요청/처리 중 오류 (단지: {complex_no}, 페이지: {page}): {e}")
            return {"error": f"매물 목록을 가져오는 중 문제가 발생했습니다: {e}", "properties": []}

    if not fetched_properties:
        return {"message": f"해당 단지에 현재 조건에 맞는 매물이 없습니다.", "properties": []}

    return {"properties": fetched_properties}

# --- 3. 선택한 매물의 상세 정보 가져오는 API ---
@app.get("/api/articles/{article_no}")
async def get_article_details(article_no: str, complex_no: Optional[str] = Query(None)):
    print(f"API 요청 받음 (매물상세): 매물번호 {article_no} (단지번호: {complex_no if complex_no else '미지정'})")
    session = requests.Session()
    session.headers.update(CONFIG_HEADERS)
    session.cookies.update(CONFIG_COOKIES)
    detail_api_url = f"https://new.land.naver.com/api/articles/{article_no}"
    params_for_detail = {}
    if complex_no:
        params_for_detail['complexNo'] = complex_no 
    
    print(f"네이버 부동산 매물 상세 API 요청: {detail_api_url}, 파라미터: {params_for_detail}")
    try:
        response = session.get(detail_api_url, params=params_for_detail, timeout=10)
        response.raise_for_status()
        data = response.json()
        print(f"매물 상세 API 응답 상태 코드: {response.status_code}")
        if not data: 
            return {"error": "매물 상세 정보를 찾을 수 없습니다 (빈 응답).", "details": None}
        return {"details": data}
    except Exception as e:
        print(f"매물 상세 API 요청/처리 중 오류 (매물: {article_no}): {e}")
        return {"error": f"매물 상세 정보를 가져오는 중 문제가 발생했습니다: {e}", "details": None}

# --- 4. 단지명 키워드 검색 API ---
@app.get("/api/complexes/search_by_name")
async def search_complexes_by_name(
    name_keyword: str = Query(..., min_length=2), 
    propertyType: Optional[str] = Query(None) 
):
    print(f"API 요청 받음 (단지명 키워드 검색): '{name_keyword}', 매물종류필터: {propertyType}")
    raw_complex_list: List[dict] = [] 
    page = 1
    is_more_data = True
    session = requests.Session()
    session.headers.update(CONFIG_HEADERS)
    session.cookies.update(CONFIG_COOKIES)
    search_api_url = 'https://new.land.naver.com/api/search'
    
    while is_more_data:
        params = {'keyword': name_keyword, 'page': str(page)}
        print(f"네이버 부동산 단지 키워드 검색 API 요청: {search_api_url}, 파라미터: {params}, 페이지: {page}")
        try:
            response = session.get(search_api_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            print(f"단지 키워드 검색 API 응답 상태 코드: {response.status_code} (페이지 {page})")
            
            if data and 'complexes' in data and data['complexes'] is not None:
                complex_results_on_page = [item for item in data['complexes'] if 'complexNo' in item and item.get('complexNo')]
                raw_complex_list.extend(complex_results_on_page)
            else:
                print(f"페이지 {page}에서 'complexes' 데이터를 찾을 수 없거나 null입니다. 응답: {data}")
                
            is_more_data = data.get('isMoreData', False)
            if is_more_data:
                page += 1
                time.sleep(0.25) 
            else:
                print("더 이상 가져올 단지 데이터 없음 (키워드 검색 - Raw).")
                break
        except Exception as e:
            print(f"네이버 부동산 단지 키워드 검색 API 요청 중 오류 (페이지 {page}): {e}")
            return {"error": f"단지명 검색 중 오류 발생: {e}", "complexes": []}
            
    if not raw_complex_list:
        print(f"'{name_keyword}'에 해당하는 단지 정보 없음 (Raw).")
        return {"message": f"'{name_keyword}'(으)로 검색된 단지가 없습니다.", "complexes": []}
        
    all_complexes_data = []
    default_real_estate_type = DEFAULT_PROPERTY_PARAMS_FOR_LIST.get('realEstateType', 'APT:OPST:ABYG:OBYG') if DEFAULT_PROPERTY_PARAMS_FOR_LIST else 'APT:OPST:ABYG:OBYG'

    if propertyType and propertyType != default_real_estate_type:
        print(f"매물 종류 '{propertyType}'으로 단지 필터링 시작 (키워드 검색 결과)...")
        target_types = propertyType.split(':')
        for complex_item in raw_complex_list:
            complex_estate_type_code = complex_item.get('realEstateTypeCode')
            complex_estate_type_name = complex_item.get('realEstateTypeName')
            matched = False
            if complex_estate_type_code and complex_estate_type_code in target_types:
                 matched = True
            elif complex_estate_type_name: 
                for t_type in target_types:
                    if t_type == "APT" and "아파트" in complex_estate_type_name: matched = True; break
                    elif t_type == "OPST" and ("오피스텔" in complex_estate_type_name or "오피" in complex_estate_type_name): matched = True; break
                    elif t_type == "ABYG" and ("연립" in complex_estate_type_name or "빌라" in complex_estate_type_name): matched = True; break
                    elif t_type == "OBYG" and ("단독" in complex_estate_type_name or "다가구" in complex_estate_type_name or "주택" in complex_estate_type_name): matched = True; break
            if matched:
                all_complexes_data.append(complex_item)
        print(f"매물 종류 필터링 후 {len(all_complexes_data)}개 단지 남음 (키워드 검색).")
    else:
        all_complexes_data = raw_complex_list
        print(f"매물 종류 필터링 건너뜀 (propertyType: {propertyType}). 총 {len(all_complexes_data)}개 단지 (키워드 검색).")

    if not all_complexes_data:
        return {"message": f"'{name_keyword}'(으)로 검색하고 선택된 매물 종류로 필터링한 결과, 해당하는 단지가 없습니다.", "complexes": []}
        
    print(f"키워드 '{name_keyword}' 검색 및 필터링 결과, 총 {len(all_complexes_data)}개의 단지 정보 반환.")
    return {"complexes": all_complexes_data}

