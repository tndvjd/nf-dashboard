# scraper.py

import asyncio
import aiohttp
import aiofiles
import re
from playwright.async_api import async_playwright
from dataclasses import dataclass
import os


@dataclass
class PropertyInfo:
    area: str  # 면적 정보
    floor: str  # 동/호 정보
    rooms: str  # 방 수/욕실 수 정보
    maintenance_fee: str  # 관리비 정보
    direction: str  # 방향 정보
    move_in_date: str  # 입주 가능일 정보
    address: str  # 주소 정보
    total_units: str  # 총 세대 수 정보
    approval_date: str  # 사용 승인일 정보
    heating: str  # 난방 정보
    complex_name: str  # 단지 이름
    complex_type: str  # 단지 유형 (아파트, 오피스텔 등)
    price: str  # 가격 정보
    district: str  # [ㅇㅇ구] 데이터
    total_floors: str  # 총층수 데이터

    async def translate(self, translator):
        fields_to_translate = ['rooms', 'maintenance_fee', 'price','direction', 'move_in_date', 'address', 'total_units', 'approval_date', 'heating', 'complex_name', 'complex_type', 'floor', 'district']
        
        values_to_translate = [getattr(self, field) for field in fields_to_translate]
        translated_values = await translator.translate_batch(values_to_translate, target_lang='JA')
        
        for field, translated_value in zip(fields_to_translate, translated_values):
            setattr(self, field, translated_value)
                # 번역 실패 시 원본 값 유지



def convert_price(price_str):
    """
    가격 정보 문자열을 "보증금/월세" 형식으로 변환합니다.

    Args:
        price_str (str): 가격 정보 문자열 (예: "1억/250")

    Returns:
        str: 변환된 가격 정보 문자열 (예: "10,000/250 (만원)")
    """
    parts = price_str.split('/')
    deposit = parts[0].strip()

    # 쉼표 제거
    deposit = deposit.replace(',', '')

    # '억' 처리
    if '억' in deposit:
        billion_part = deposit.split('억')[0]
        million_part = deposit.split('억')[1] if len(deposit.split('억')) > 1 else '0000'
        deposit = str(int(billion_part) * 10000 + int(million_part.strip() or '0'))

    # 쉼표 추가
    deposit = f"{int(deposit):,}"

    return f"{deposit}/{parts[1].strip()} (만원)" if len(parts) > 1 else f"{deposit} (만원)"


async def download_floor_plan(complex_url: str, temp_dir: str) -> str:
    """
    네이버 부동산에서 평면도 이미지를 다운로드합니다.

    Args:
        complex_url (str): 매물 페이지 URL
        temp_dir (str): 임시 디렉토리 경로

    Returns:
        str: 다운로드된 이미지 파일 경로
    """
    print(f"Starting download_floor_plan with URL: {complex_url}")

    complex_id = complex_url.split("/complexes/")[1].split("?")[0]
    floor_plan_url = f"https://land.naver.com/info/groundPlanGallery.naver?rletNo={complex_id}&ptpId=1&newComplex=Y&expand=false&buildNo=2"

    print(f"Generated floor plan URL: {floor_plan_url}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(floor_plan_url, wait_until="networkidle")

        # 페이지 내용 출력 (디버깅용)
        content = await page.content()
        print(f"Page content length: {len(content)}")

        # 이미지 엘리먼트 찾기 시도
        img_element = await page.query_selector('#content > div > div.map_section img')
        if img_element:
            img_src = await img_element.get_attribute('src')
            print(f"Found image URL: {img_src}")
            img_filename = os.path.join(temp_dir, f"floor_plan_{complex_id}.jpg")

            # 이미지 다운로드
            async with aiohttp.ClientSession() as session:
                async with session.get(img_src) as response:
                    if response.status == 200:
                        async with aiofiles.open(img_filename, mode='wb') as f:
                            content = await response.read()
                            await f.write(content)
                            print(f"Successfully downloaded image to {img_filename}. Size: {len(content)} bytes")
                        return img_filename
                    else:
                        print(f"Failed to download image. Status: {response.status}")
        else:
            print("Could not find image element in the page")

            # 디버깅: 페이지의 모든 이미지 요소 출력
            all_images = await page.query_selector_all('img')
            print(f"Total number of images found: {len(all_images)}")
            for idx, img in enumerate(all_images):
                src = await img.get_attribute('src')
                print(f"Image {idx + 1}: {src}")

        await browser.close()

    return None


async def download_complex_photo(complex_url: str, temp_dir: str) -> str:
    """
    네이버 부동산에서 단지 사진을 다운로드합니다.

    Args:
        complex_url (str): 매물 페이지 URL
        temp_dir (str): 임시 디렉토리 경로

    Returns:
        str: 다운로드된 이미지 파일 경로
    """
    print(f"Starting download_complex_photo with URL: {complex_url}")

    complex_id = complex_url.split("/complexes/")[1].split("?")[0]
    gallery_url = f"https://land.naver.com/info/groundPlanGallery.naver?rletNo={complex_id}&ptpId=1&newComplex=Y&expand=false&buildNo=2"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
        page = await context.new_page()

        try:
            await page.goto(gallery_url, wait_until="networkidle", timeout=60000)

            # "단지사진" 탭 클릭
            complex_photo_tab = await page.wait_for_selector("text='단지사진'", timeout=5000)
            if complex_photo_tab:
                await complex_photo_tab.click()
                await page.wait_for_load_state('networkidle')

                # "단지 전경" 탭 존재 여부 확인
                complex_view_button = await page.query_selector("text='단지 전경'")

                if complex_view_button:
                    # "단지 전경" 탭이 존재하는 경우
                    await complex_view_button.click()  # "단지 전경" 탭 클릭
                    await page.wait_for_load_state('networkidle')
                    image_selector = '#newImageDIV > div.img_box > img'
                else:
                    # "단지 전경" 탭이 없는 경우
                    await page.wait_for_selector('#imageDIV > img:not(.plainimage)')
                    image_selector = '#imageDIV > img:not(.plainimage)'
                    await page.wait_for_selector(image_selector, timeout=1000)  # 10초 대기

                    # "plainimage" 클래스 적용을 위한 추가 대기
                    await page.wait_for_timeout(1000)  # 1초 대기

                # 이미지 URL 추출
                img_element = await page.query_selector(image_selector)
                if img_element:
                    img_src = await img_element.get_attribute('src')
                    img_filename = os.path.join(temp_dir, f"complex_photo_{complex_id}.jpg")
                    async with aiohttp.ClientSession() as session:
                        async with session.get(img_src) as response:
                            if response.status == 200:
                                async with aiofiles.open(img_filename, mode='wb') as f:
                                    content = await response.read()
                                    await f.write(content)
                                print(f"Successfully downloaded complex photo to {img_filename}")
                                return img_filename
                            else:
                                print(f"Failed to download complex photo. Status: {response.status}")
                else:
                    print(f"선택자 '{image_selector}'를 사용하여 이미지를 찾을 수 없습니다.")
                    return None
            else:
                print("'단지사진' 섹션을 찾을 수 없습니다.")
                return None

        except Exception as e:
            print(f"An error occurred while downloading complex photo: {str(e)}")
            return None

        finally:
            await browser.close()

    return None


def extract_dong_floor(floor_info: str) -> str:
    """
    입력된 문자열에서 동과 층 정보를 추출하여 "동/층" 형식으로 반환합니다.
    
    예시:
    "한가람 207동 · 중층" -> "207동/중층"
    """
    parts = floor_info.split()
    if len(parts) < 2:
        return floor_info  # 형식이 맞지 않으면 원본 문자열 반환
    
    last_part = parts[-1]
    if '동' in last_part and '·' in last_part:
        dong, floor = last_part.split(' · ')
        return f"{dong}/{floor}"
    elif '동' in last_part:
        # '동'은 있지만 '·'가 없는 경우 (예: "207동중층")
        dong_index = last_part.index('동')
        dong = last_part[:dong_index+1]
        floor = last_part[dong_index+1:]
        return f"{dong}/{floor}"
    else:
        return floor_info  # 형식이 맞지 않으면 원본 문자열 반환


async def scrape_property_info(url: str) -> tuple[PropertyInfo, str]:
    """
    네이버 부동산 매물 페이지에서 매물 정보를 스크래핑합니다.

    Args:
        url (str): 매물 페이지 URL

    Returns:
        tuple[PropertyInfo, str]: 매물 정보 (PropertyInfo 객체), 총 층수 정보 (str)
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        await page.goto(url, wait_until="networkidle", timeout=60000)

        await page.wait_for_selector("#detailContents1 > div.detail_box--summary > table", timeout=60000)

        info = {}

        # 기존 정보 스크래핑
        table = await page.query_selector("#detailContents1 > div.detail_box--summary > table")
        if table:
            rows = await table.query_selector_all("tr")
            for row in rows:
                ths = await row.query_selector_all("th")
                tds = await row.query_selector_all("td")
                for i in range(len(ths)):
                    key = await ths[i].inner_text()
                    value = await tds[i].inner_text() if i < len(tds) else ""
                    info[key.strip()] = value.strip()

        # 단지 이름과 유형 스크래핑
        complex_title = await page.query_selector("#summaryInfo > div.complex_title")
        if complex_title:
            complex_name = await complex_title.query_selector("#complexTitle")
            complex_type = await complex_title.query_selector("span")
            info["complex_name"] = await complex_name.inner_text() if complex_name else ""
            info["complex_type"] = await complex_type.inner_text() if complex_type else ""

        # 가격 정보 스크래핑
        price_selectors = [
            "#ct > div.map_wrap > div.detail_panel > div > div.detail_contents_inner > div.detail_fixed > div.main_info_area > div.info_article_price > span.price",
            "#ct > div.map_wrap > div.detail_panel > div > div.detail_fixed.is-fixed > div.main_info_area > div.info_total_wrap > h4 > span"
        ]

        price = None
        for selector in price_selectors:
            try:
                price_element = await page.wait_for_selector(selector, timeout=5000)
                if price_element:
                    price = await price_element.inner_text()
                    print(f"Raw price text: {price}")
                    break
            except Exception as e:
                print(f"가격 정보 영역을 찾는 중 오류 발생: {str(e)}")

        if price:
            info["price"] = convert_price(price)  # convert_price 함수 적용
        else:
            info["price"] = "가격 정보 없음"

        # 새로운 정보 추출 (동/층)
        floor_info_selector = "#ct > div.map_wrap > div.detail_panel > div > div.detail_contents_inner > div.detail_fixed > div.main_info_area > div.info_title_wrap > h4"
        floor_info_element = await page.query_selector(floor_info_selector)
        floor_info = await floor_info_element.inner_text() if floor_info_element else ""
        dong_floor = extract_dong_floor(floor_info)  # 동/호 데이터 추출

        # 해당층/총층 정보 추출
        floor_info = info.get("해당층/총층", "")
        total_floors = floor_info.split('/')[-1].replace("층", "").strip() if '/' in floor_info else ""

        # 단지정보 버튼 클릭
        try:
            await page.wait_for_selector("#summaryInfo > div.complex_summary_info > div.complex_detail_link", timeout=10000)
            complex_info_button = await page.query_selector(
                '#summaryInfo > div.complex_summary_info > div.complex_detail_link > button:has-text("단지정보")')
            if complex_info_button:
                await complex_info_button.click()
                await page.wait_for_selector("#detailContents1 > div.detail_box--complex > table", timeout=10000)

                # 단지정보 스크래핑
                complex_table = await page.query_selector("#detailContents1 > div.detail_box--complex > table")
                if complex_table:
                    rows = await complex_table.query_selector_all("tr")
                    for row in rows:
                        ths = await row.query_selector_all("th")
                        tds = await row.query_selector_all("td")
                        for i in range(len(ths)):
                            key = await ths[i].inner_text()
                            value = await tds[i].inner_text() if i < len(tds) else ""
                            info[key.strip()] = value.strip()
            else:
                print("단지정보 버튼을 찾을 수 없습니다.")
        except Exception as e:
            print(f"단지정보를 가져오는 중 오류 발생: {str(e)}")

        # 아파트와 오피스텔 모두 처리
        area = info.get("공급/전용면적") or info.get("계약/전용면적", "")

        # 사용승인일 포맷 변경
        approval_date = info.get("사용승인일", "")
        if approval_date:
            approval_date_parts = approval_date.split()
            if len(approval_date_parts) >= 2:
                approval_date = f"{approval_date_parts[0]} {approval_date_parts[1]}"

        # 세대수 정보 수정 (정제 함수 적용)
        total_units = info.get("세대수", "")
        if total_units:
            total_units = total_units.split('(')[0].strip()

        # 관리비 정보 수정 (정제 함수 적용)
        maintenance_fee = info.get("관리비", "")
        if maintenance_fee:
            maintenance_fee = maintenance_fee.split('상세')[0].strip()  # "상세보기" 제거
            maintenance_fee = f"약 {maintenance_fee}"  # "약" 추가

        # 주소 정보 수정 (도로명 주소 제거)
        address = info.get("주소", "")
        if address:
            address = address.split('\n')[0].strip()  # 도로명 주소 제거
            district = re.search(r'(\w+구)', address)
            district = district.group(1) if district else ""

        # 정제된 데이터를 사용하여 PropertyInfo 객체 생성
        property_info = PropertyInfo(
            area=area,
            floor=dong_floor,  # 동/호 데이터
            rooms=info.get("방수/욕실수", ""),
            maintenance_fee=maintenance_fee,
            direction=info.get("방향", ""),
            move_in_date=info.get("입주가능일", ""),
            address=address,
            total_units=total_units,
            approval_date=approval_date,
            heating=info.get("난방", ""),
            complex_name=info.get("complex_name", ""),
            complex_type=info.get("complex_type", ""),
            price=info.get("price", ""),
            district=district,  # [ㅇㅇ구] 데이터
            total_floors=total_floors  # 총층수 데이터
        )

        await browser.close()
        return property_info, total_floors

async def scrape_broker_info(url: str) -> str:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        await page.goto(url, wait_until="networkidle", timeout=60000)

        await page.wait_for_selector("#detailContents1 > div.detail_box--summary > table", timeout=60000)

        # "중개사" 정보를 포함한 th 요소 찾기
        broker_info = ""
        table = await page.query_selector("#detailContents1 > div.detail_box--summary > table")
        if table:
            rows = await table.query_selector_all("tr")
            for row in rows:
                ths = await row.query_selector_all("th")
                tds = await row.query_selector_all("td")
                for th in ths:
                    th_text = await th.inner_text()
                    if "중개사" in th_text:
                        for td in tds:
                            broker_info += await td.inner_text() + "\n"

        # 중개사 정보 정제
        broker_info = clean_broker_info(broker_info)

        await browser.close()

        return broker_info

def clean_broker_info(broker_info: str) -> str:
    """
    중개사 정보를 정제하고 가독성을 높입니다.

    Args:
        broker_info (str): 원본 중개사 정보 문자열

    Returns:
        str: 정제된 중개사 정보 문자열
    """
    # "길찾기" 제거
    broker_info = broker_info.replace("길찾기", "")
    
    # "등록번호" 텍스트 제거
    broker_info = broker_info.replace("등록번호", "")
    
    # "소재지" 텍스트 제거
    broker_info = broker_info.replace("소재지", "")
    
    # "대표" 텍스트 제거
    broker_info = broker_info.replace("대표", "")
    
    # "전화" 텍스트 제거
    broker_info = broker_info.replace("전화", "")
    
    # 전화번호 이후의 불필요한 데이터 제거
    phone_numbers = re.findall(r'\d{2,3}-\d{3,4}-\d{4}', broker_info)
    if phone_numbers:
        last_phone_number = phone_numbers[-1]
        # 전화번호 이후의 텍스트 제거
        broker_info = broker_info.split(last_phone_number)[0] + last_phone_number
    
    # "최근 3개월 집주인확인" 이후의 텍스트 제거
    if "최근 3개월 집주인확인" in broker_info:
        broker_info = broker_info.split("최근 3개월 집주인확인")[0]
    
    # 가독성을 높이기 위해 줄바꿈 추가
    broker_info = broker_info.replace("\n", "\n")
    
    return broker_info.strip()