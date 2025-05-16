# config.py

# -- 스크래핑 대상 URL 및 파라미터 --
BASE_API_URL = 'https://new.land.naver.com/api/articles/complex/142587'
# API 파라미터 (필요에 따라 수정하여 사용)
DEFAULT_PARAMS = {
    'realEstateType': 'OPST:OBYG:PRE', # OPST: 오피스텔, OBYG: 빌라, PRE: 분양권 등
    'tradeType': 'B2:B1',             # B2: 월세, B1: 전세, A1: 매매
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
    'sameAddressGroup': 'true',
    'minMaintenanceCost': '',
    'maxMaintenanceCost': '',
    'priceType': 'RETAIL',
    'directions': '',
    'complexNo': '142587', # 예시 단지 번호, 변경 가능
    'buildingNos': '',
    'areaNos': '',
    'type': 'list',
    'order': 'rank'
}

# -- 요청 헤더 및 쿠키 --
# 중요: 아래 쿠키 및 인증 토큰은 실제 유효한 값으로 대체해야 합니다.
# 이 값들은 주기적으로 만료될 수 있으므로, 스크립트 실행 전 확인 및 업데이트가 필요합니다.
# 장기적으로는 로그인 자동화 또는 토큰 갱신 로직을 구현하는 것이 좋습니다.
HEADERS = {
    'accept': '*/*',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NDcwNjE1MzUsImV4cCI6MTc0NzA3MjMzNX0.zkaUPeh1Hp1ICPKfN5yaovCTX6rUMA0CSIyDppM6WyY',
    'priority': 'u=1, i',
    'referer': 'https://new.land.naver.com/complexes/142587?ms=37.5154881,127.0399418,17&a=OPST:OBYG:PRE&b=B2:B1&e=RETAIL&ad=true',
    'sec-ch-ua': '"Chromium";v="134", "Whale";v="4", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Whale/4.31.304.16 Safari/537.36',
    # 'cookie': 'NNB=PY3VYTEXWJKWO; NAC=KCJGBYA5zFnP; NSCS=1; landHomeFlashUseYn=Y; SHOW_FIN_BADGE=Y; NaverSuggestUse=unuse%26unuse; nid_inf=2084488452; NID_AUT=iI2ScIbHjEfMAML4fmzb31LUaIziT+nfO2xZPqeXFsQY+X70aSeonJzf6OqmXtbZ; NID_SES=AAABwpKPJU8TUyXOdvTT18FZE3kWcdBkmfjbQc100zDedKMKpiKxPhJ/cXJ5Cr4H1mT3qVKQl7D8rJKoBtQURvmrlh+jClBwVciL1B2XK6cbv7sIV6cbf8IU/XLGrNrRDnYbZbzZpXeHequGqcR4nD7EjwJ3MJvmnSEc6q69YVqhZ4XdwU3sm4X31Nm87zMDgHmPtrIgE38duC47kehv7NOzGB+7AncmuE8b1s9vBgOw3N5F1T8xvGOiqG3IgL7RD1WUpuhE59t1JRpI7gbMWuB1qqN7eh504Zed+smRGjKG8zFWdrX1H67tjdaHZEJP0b2j7wYiqrUvLNjDZTVD5kQV1DeyiXc9RXmfYeOw6G5hSq/QsO7aDrq4m/7SuFow3Y6/UyU9Tt18AZrMsaCgii40T8yTEJNAVaI1Zy1XJ2x5XLsDUu9Bebvq1UYSgX9oiqzt1NqHiBzEPKdfonHt/sj++qKihgQMtky9IWqvlr1uKjgS0iaHvKy7d3Xrv/Pcr60nWEvGgxLgeIXiOYOfNC8wO+yVxv7P3du0y0Pn8SILkdjoheOR4nS06ihhqpyF0Nl+zQxpJVc9UAlLadg1/ZybrDL7MB3JUZk3fpzY9z0UH5nm; SRT30=1747060936; page_uid=ju44ydqVN8VssldztiGssssssUs-516836; nhn.realestate.article.rlet_type_cd=A01; nhn.realestate.article.trade_type_cd=""; nhn.realestate.article.ipaddress_city=1100000000; REALESTATE=Mon%20May%2012%202025%2023%3A52%3A15%20GMT%2B0900%20(Korean%20Standard%20Time); BUC=WxiSz49gaWvQX4Qg24SyD2pFwUSzEGZ8KpOSF5Mzw4Q=',
}

COOKIES = {
    # 중요: NNB, NID_AUT, NID_SES 등 주요 쿠키 값들을 실제 유효한 값으로 채워주세요.
    # 이 값들은 브라우저 개발자 도구의 네트워크 탭에서 실제 요청을 확인하여 얻을 수 있습니다.
    'NNB': 'PY3VYTEXWJKWO',
    'NID_AUT': 'iI2ScIbHjEfMAML4fmzb31LUaIziT+nfO2xZPqeXFsQY+X70aSeonJzf6OqmXtbZ',
    'NID_SES': 'AAABwpKPJU8TUyXOdvTT18FZE3kWcdBkmfjbQc100zDedKMKpiKxPhJ/cXJ5Cr4H1mT3qVKQl7D8rJKoBtQURvmrlh+jClBwVciL1B2XK6cbv7sIV6cbf8IU/XLGrNrRDnYbZbzZpXeHequGqcR4nD7EjwJ3MJvmnSEc6q69YVqhZ4XdwU3sm4X31Nm87zMDgHmPtrIgE38duC47kehv7NOzGB+7AncmuE8b1s9vBgOw3N5F1T8xvGOiqG3IgL7RD1WUpuhE59t1JRpI7gbMWuB1qqN7eh504Zed+smRGjKG8zFWdrX1H67tjdaHZEJP0b2j7wYiqrUvLNjDZTVD5kQV1DeyiXc9RXmfYeOw6G5hSq/QsO7aDrq4m/7SuFow3Y6/UyU9Tt18AZrMsaCgii40T8yTEJNAVaI1Zy1XJ2x5XLsDUu9Bebvq1UYSgX9oiqzt1NqHiBzEPKdfonHt/sj++qKihgQMtky9IWqvlr1uKjgS0iaHvKy7d3Xrv/Pcr60nWEvGgxLgeIXiOYOfNC8wO+yVxv7P3du0y0Pn8SILkdjoheOR4nS06ihhqpyF0Nl+zQxpJVc9UAlLadg1/ZybrDL7MB3JUZk3fpzY9z0UH5nm',
    # ... 기타 필요한 쿠키 값들 ...
    'REALESTATE': 'Mon%20May%2012%202025%2023%3A52%3A15%20GMT%2B0900%20(Korean%20Standard%20Time)', # 예시 값
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

# -- 파일 경로 및 기타 설정 --
OUTPUT_FILENAME = 'response_data.json'
LOG_FILENAME = 'scraper.log'
REQUEST_DELAY_SECONDS = 0.75 # 서버 부하를 줄이기 위한 요청 간 지연 시간 (초)
MAX_RETRIES = 3 # 요청 실패 시 최대 재시도 횟수
RETRY_DELAY_SECONDS = 5 # 재시도 간 지연 시간 (초)

# -- 이미지 관련 설정 (ui_app.py용) --
NAVER_LAND_BASE_URL = "https://new.land.naver.com"