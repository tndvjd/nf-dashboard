from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import io

# ppt_logic.py에서 필요한 함수 및 변수 임포트
from ppt_logic import generate_presentation_logic, mappings, TEMPLATE_PATH

app = FastAPI()

# --- Pydantic 모델 정의 --- 
# client_and_document_data 모델
class ClientDocumentData(BaseModel):
    문서명: str = Field(..., example="정식 사택 물건 자료")
    고객명: str = Field(..., example="신지성 고객님")
    회사명: str = Field(..., example="AGC일렉트로닉스코리아 (주)")

# articleDetail 내부 모델
class ArticleDetail(BaseModel):
    articleNo: Optional[str] = None
    articleName: Optional[str] = None
    divisionName: Optional[str] = None
    aptName: Optional[str] = None
    exposureAddress: Optional[str] = None
    aptUseApproveYmd: Optional[str] = None
    aptHouseholdCount: Optional[str] = None
    aptHeatMethodTypeName: Optional[str] = None
    aptHeatFuelTypeName: Optional[str] = None
    buildingName: Optional[str] = None
    roomCount: Optional[str] = None
    bathroomCount: Optional[str] = None
    moveInTypeName: Optional[str] = None
    articleFeatureDescription: Optional[str] = None
    detailDescription: Optional[str] = None
    tagList: Optional[List[str]] = []
    grandPlanList: Optional[List[Dict[str, Any]]] = []
    latitude: Optional[str] = None
    longitude: Optional[str] = None

# articleAddition 내부 모델
class ArticleAddition(BaseModel):
    floorInfo: Optional[str] = None
    direction: Optional[str] = None
    dealOrWarrantPrc: Optional[str] = None
    rentPrc: Optional[str] = None
    representativeImgUrl: Optional[str] = None

# articleFloor 내부 모델
class ArticleFloor(BaseModel):
    totalFloorCount: Optional[str] = None
    buildingHighestFloor: Optional[str] = None

# articlePrice 내부 모델
class ArticlePrice(BaseModel):
    warrantPrice: Optional[int] = None # 만원 단위
    rentPrice: Optional[int] = None    # 만원 단위

# articleSpace 내부 모델
class ArticleSpace(BaseModel):
    supplySpace: Optional[float] = None   # ㎡ 단위
    exclusiveSpace: Optional[float] = None # ㎡ 단위

# articlePhotos 내부 모델
class ArticlePhoto(BaseModel):
    imageSrc: Optional[str] = None
    imageType: Optional[str] = None

# administrationCostInfo 내부 모델
class AdministrationCostInfo(BaseModel):
    chargeCodeType: Optional[str] = None

# full_json_data 모델 (전체 JSON 구조)
class FullJsonData(BaseModel):
    articleDetail: Optional[ArticleDetail] = None
    articleAddition: Optional[ArticleAddition] = None
    articleFloor: Optional[ArticleFloor] = None
    articlePrice: Optional[ArticlePrice] = None
    articleSpace: Optional[ArticleSpace] = None
    articlePhotos: Optional[List[ArticlePhoto]] = []
    administrationCostInfo: Optional[AdministrationCostInfo] = None
    참고사항_입력: Optional[str] = None
    비고_입력: Optional[str] = None

# API 요청 본문 모델
class PptRequest(BaseModel):
    client_data: ClientDocumentData
    article_json_data: FullJsonData

# --- API 엔드포인트 --- 
@app.post("/generate-ppt/")
async def generate_ppt_endpoint(request_data: PptRequest):
    try:
        # Pydantic 모델을 dict로 변환하여 기존 로직에 전달
        client_data_dict = request_data.client_data.model_dump()
        article_json_data_dict = request_data.article_json_data.model_dump(exclude_none=True)
        
        # print(f"TEMPLATE_PATH: {TEMPLATE_PATH}") # 디버깅용

        # PPT 생성 로직 호출
        ppt_buffer = generate_presentation_logic(
            client_data_dict,
            article_json_data_dict,
            mappings # ppt_logic.py에서 임포트한 매핑 규칙
        )
        
        # 생성된 PPT 파일을 스트리밍 응답으로 반환
        return StreamingResponse(
            ppt_buffer, 
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": "attachment; filename=generated_presentation.pptx"}
        )
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Template file '{TEMPLATE_PATH}' not found. Please ensure the template file exists at the correct path.")
    except Exception as e:
        # 실제 운영 환경에서는 더 구체적인 오류 처리 및 로깅 필요
        raise HTTPException(status_code=500, detail=f"An error occurred during PPT generation: {str(e)}")

# 서버 실행을 위한 uvicorn 명령어 (터미널에서 직접 실행):
# uvicorn main:app --reload 