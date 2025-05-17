import uvicorn
from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import tempfile

# main.py에서 create_ppt_file 함수 임포트
from main import create_ppt_file

# PPT 템플릿 파일 및 매핑 CSV 파일의 절대 경로 설정
PPT_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'ppt_template.pptx') # 템플릿 파일명 수정
MAPPING_CSV_PATH = os.path.join(os.path.dirname(__file__), '매핑데이터.csv') # 매핑 CSV 파일 경로 추가

app = FastAPI()

# --- Pydantic 모델 정의 수정 --- 
class ArticlePhotoModel(BaseModel):
    photoUrl: str  # HttpUrl에서 str로 변경 - 상대 URL도 허용

class ComplexPyeongDetailModel(BaseModel):
    floorPlanUrl: str  # HttpUrl에서 str로 변경 - 상대 URL도 허용

class ArticleDetailModel(BaseModel):
    articleNo: str
    articleName: Optional[str] = None
    latitude: Optional[str] = None # Next.js에서 문자열로 올 수 있음
    longitude: Optional[str] = None # Next.js에서 문자열로 올 수 있음
    articlePhotos: Optional[List[ArticlePhotoModel]] = Field(default_factory=list)
    complexPyeongDetailList: Optional[List[ComplexPyeongDetailModel]] = Field(default_factory=list)
    exposureAddress: Optional[str] = None # create_ppt_file에서 사용
    # create_ppt_file에서 사용하는 다른 articleDetail 필드들을 여기에 추가 가능
    # 예: areaName, aptName, pricePrint 등
    class Config:
        extra = "allow" # 명시적으로 정의되지 않은 필드도 허용 (개발 중 유용)

class ArticleAdditionModel(BaseModel):
    # create_ppt_file에서 사용하는 articleAddition 필드들을 여기에 추가 가능
    class Config:
        extra = "allow" # 명시적으로 정의되지 않은 필드도 허용

class PropertyItem(BaseModel):
    articleDetail: ArticleDetailModel
    articleAddition: Optional[ArticleAdditionModel] = Field(default_factory=dict)

class PropertyInputModel(BaseModel):
    articleDetail: ArticleDetailModel  # 기존 호환성을 위해 유지
    articleAddition: Optional[ArticleAdditionModel] = Field(default_factory=dict)  # 기존 호환성을 위해 유지
    properties: Optional[List[PropertyItem]] = Field(default_factory=list)  # 다중 매물 지원을 위해 추가
    documentTitle: str
    clientName: str
    companyName: Optional[str] = None
    mapImageUrl: Optional[str] = None  # HttpUrl에서 str로 변경 - 상대 URL도 허용
    companyLogoUrl: Optional[str] = None  # HttpUrl에서 str로 변경 - 상대 URL도 허용
# --- Pydantic 모델 정의 수정 완료 ---

async def cleanup_temp_file(file_path: str):
    """백그라운드에서 임시 파일을 삭제합니다."""
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
        print(f"Temporary file {file_path} deleted successfully.")
    except Exception as e:
        print(f"Error deleting temporary file {file_path}: {e}")

@app.post("/generate-ppt/")
async def generate_ppt_endpoint(property_input: PropertyInputModel, background_tasks: BackgroundTasks):
    """
    매물 정보를 받아 PPT 파일을 생성하고 반환하는 엔드포인트입니다.
    """
    print(f"PPT 생성 요청 수신: {property_input.model_dump(exclude_none=True, by_alias=False)}")

    if not os.path.exists(PPT_TEMPLATE_PATH):
        print(f"PPT 템플릿 파일 없음: {PPT_TEMPLATE_PATH}")
        raise HTTPException(status_code=500, detail=f"PPT template file not found at {PPT_TEMPLATE_PATH}.")

    if not os.path.exists(MAPPING_CSV_PATH): # 매핑 CSV 파일 존재 여부 확인 추가
        print(f"매핑 CSV 파일 없음: {MAPPING_CSV_PATH}")
        raise HTTPException(status_code=500, detail=f"Mapping CSV file not found at {MAPPING_CSV_PATH}.")

    # Pydantic 모델을 딕셔너리로 변환 (이미 중첩 구조를 가짐)
    property_data_dict = property_input.model_dump(exclude_none=True, by_alias=False)
    
    # URL들은 이미 str 타입이므로 별도의 변환 불필요
    map_image_url_str = property_input.mapImageUrl
    
    # 다중 매물 처리 확인
    has_multiple_properties = property_input.properties and len(property_input.properties) > 0
    
    # 디버깅: 이미지 URL 출력
    if property_data_dict.get('articleDetail') and property_data_dict['articleDetail'].get('complexPyeongDetailList'):
        for idx, plan in enumerate(property_data_dict['articleDetail']['complexPyeongDetailList']):
            print(f"[DEBUG] floorPlanUrl[{idx}]: {plan.get('floorPlanUrl')}")
    
    try:
        if has_multiple_properties:
            # 다중 매물 처리
            print(f"[INFO] 다중 매물을 처리합니다. 총 {len(property_input.properties)}개의 매물.")
            
            # 다중 매물을 처리하는 create_ppt_file_multi 함수 호출
            properties_list = [prop.model_dump(exclude_none=True) for prop in property_input.properties]
            
            # 다중 매물 처리를 위한 함수 호출 (함수 구현 필요)
            from ppt_generator import create_ppt_file_multi
            temp_ppt_path = create_ppt_file_multi(
                properties_data=properties_list,
                document_info={
                    "documentTitle": property_input.documentTitle,
                    "clientName": property_input.clientName,
                    "companyName": property_input.companyName
                },
                map_image_url=map_image_url_str,
                template_filepath=PPT_TEMPLATE_PATH,
                mapping_csv_filepath=MAPPING_CSV_PATH
            )
        else:
            # 기존 단일 매물 처리
            # create_ppt_file 함수는 property_data_dict['articleDetail']['articlePhotos'] 등을 직접 사용
            # photoUrl, floorPlanUrl 등도 이미 HttpUrl 객체이므로 create_ppt_file 내부에서 str() 변환 필요 시 처리
            from ppt_generator import create_ppt_file
            temp_ppt_path = create_ppt_file(
                property_data=property_data_dict, 
                map_image_url=map_image_url_str, # mapImageUrl은 최상위 레벨에서 전달
                template_filepath=PPT_TEMPLATE_PATH,
                mapping_csv_filepath=MAPPING_CSV_PATH # mapping_csv_filepath 인자 추가
            )
    except FileNotFoundError as e:
        print(f"PPT 생성 중 파일 관련 오류: {e}")
        raise HTTPException(status_code=500, detail=f"Error during PPT generation: {e}")
    except Exception as e:
        print(f"PPT 생성 중 예외 발생: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during PPT generation: {str(e)}")

    if not temp_ppt_path or not os.path.exists(temp_ppt_path):
        print(f"임시 PPT 파일 생성 실패 또는 찾을 수 없음: {temp_ppt_path}")
        raise HTTPException(status_code=500, detail="Failed to generate PPT file or temporary file not found.")

    background_tasks.add_task(cleanup_temp_file, temp_ppt_path)

    # 파일명은 articleDetail.articleName 또는 documentTitle 기반으로 생성 가능
    base_filename = property_input.articleDetail.articleName or property_input.documentTitle or "부동산_매물"
    output_filename = f"{base_filename.replace(' ', '_')}_소개자료.pptx"
    
    print(f"PPT 파일 생성 완료: {temp_ppt_path}, 다운로드 파일명: {output_filename}")

    return FileResponse(
        path=temp_ppt_path,
        filename=output_filename,
        media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation',
    )

if __name__ == "__main__":
    print("FastAPI 서버 시작 (개발용)")
    print(f"PPT 템플릿 경로: {PPT_TEMPLATE_PATH}")
    print(f"매핑 CSV 경로: {MAPPING_CSV_PATH}") # 매핑 CSV 경로 출력 추가
    if not os.path.exists(PPT_TEMPLATE_PATH):
        print(f"경고: PPT 템플릿 파일({PPT_TEMPLATE_PATH})을 찾을 수 없습니다. 실제 경로를 확인하세요.")
    if not os.path.exists(MAPPING_CSV_PATH): # 매핑 CSV 파일 존재 여부 확인 추가
        print(f"경고: 매핑 CSV 파일({MAPPING_CSV_PATH})을 찾을 수 없습니다. 실제 경로를 확인하세요.")
    
    uvicorn.run(app, host="0.0.0.0", port=8001)
