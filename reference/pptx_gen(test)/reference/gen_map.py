import requests
import os

API_KEY_ID = "z6seg5ud7i"
API_KEY = "p99MRtwtaWpOpzT2X5JfKBplmpZDbuVvM8pmp9Zg"

def get_coordinates(query):
  """
  Naver Geocoding API를 사용하여 주어진 주소의 좌표를 반환합니다.

  Args:
    query (str): 좌표를 얻고자 하는 주소

  Returns:
    tuple: (x, y) 형태의 좌표. API 호출 실패 시 None 반환.
  """
  url = "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode"
  params = {
    "query": query
  }
  headers = {
    "X-NCP-APIGW-API-KEY-ID": API_KEY_ID,
    "X-NCP-APIGW-API-KEY": API_KEY
  }

  try:
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()  # HTTP 오류 발생 시 예외 발생
    data = response.json()

    if data["status"] == "OK":
      x = data["addresses"][0]["x"]
      y = data["addresses"][0]["y"]
      return (x, y)
    else:
      print(f"API 요청 실패: {data['errorMessage']}")
      return None
  except requests.exceptions.RequestException as e:
    print(f"API 요청 중 오류 발생: {e}")
    return None

def get_static_map_url(x, y, width=600, height=450, level=15, scale=2, lang="ja"):
  """
  Naver Static Map API URL을 생성합니다.

  Args:
    x (str): x 좌표 (경도)
    y (str): y 좌표 (위도)
    width (int, optional): 이미지 너비. 기본값은 300.
    height (int, optional): 이미지 높이. 기본값은 300.
    level (int, optional): 줌 레벨. 기본값은 16.
    scale (int, optional): 고해상도를 위한 값. 2로 고정.

  Returns:
    str: Static Map API URL
  """
  base_url = "https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?"
  # markers 파라미터 추가
  markers = f"type:d|size:mid|pos:{x} {y}|color:orange"  
  params = {
      "w": width,
      "h": height,
      "center": f"{x},{y}",
      "level": level,
      "markers": markers,  # markers 파라미터 추가
      "scale": scale,
      "lang": lang,
      "X-NCP-APIGW-API-KEY-ID": API_KEY_ID,
      "X-NCP-APIGW-API-KEY": API_KEY
  }
  return base_url + requests.compat.urlencode(params)

def download_image(url, filename):
  """
  주어진 URL의 이미지를 다운로드합니다.

  Args:
    url (str): 이미지 URL
    filename (str, optional): 저장할 파일 이름. 기본값은 "map.png".
  """
  try:
    response = requests.get(url, stream=True)
    response.raise_for_status()
    with open(filename, "wb") as f:
      for chunk in response.iter_content(chunk_size=1024):
        if chunk:
          f.write(chunk)
    print(f"이미지 다운로드 성공: {filename}")
  except requests.exceptions.RequestException as e:
    print(f"이미지 다운로드 실패: {e}")

if __name__ == "__main__":
  address = "서울시 송파구 잠실동 175-4"
  coordinates = get_coordinates(address)
  if coordinates:
    x, y = coordinates
    map_url = get_static_map_url(x, y)
    download_image(map_url)