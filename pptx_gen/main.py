from fastapi import FastAPI, HTTPException, Path, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import requests
import io

# 로컬 모듈 임포트
from .data_transformer import transform_naver_article_to_internal_format
from .debug_ppt_elements import generate_presentation, mappings as pptx_mappings # 매핑 규칙도 임포트

app = FastAPI(
    title="PPTX Generation API",
    description="네이버 부동산 매물 정보를 기반으로 PPTX 파일을 생성합니다.",
    version="0.1.0"
)

# --- Pydantic 모델 정의 ---
class ClientDataInput(BaseModel):
    document_title: str = Field(..., example="강남 오피스텔 월세 물건 자료")
    client_name: str = Field(..., example="김철수 고객님")
    company_name: str = Field(default="", example="(주)미래부동산컨설팅")
    remarks: str = Field(default="", example="6월 중 입주 가능, 빠른 문의 바랍니다.") # 참고사항_입력
    notes: str = Field(default="", example="반려동물 동반은 어렵습니다.") # 비고_입력

class PptGenerationRequest(BaseModel):
    article_no: str = Field(..., description="네이버 부동산 매물 번호", example="2523213850")
    client_data: ClientDataInput

# --- API 엔드포인트 ---
# Next.js API URL (실제 환경에 맞게 수정 필요)
NEXTJS_ARTICLE_API_BASE_URL = "http://localhost:3000/api/articles"

@app.post("/generate_ppt_from_article/", 
            summary="매물번호와 클라이언트 정보로 PPT 생성",
            response_description="생성된 PPTX 파일",
            tags=["PPTX Generation"])
async def create_ppt_from_article(request_data: PptGenerationRequest = Body(...)):
    """
    매물 번호(article_no)와 사용자 정의 데이터(client_data)를 받아
    PPTX 파일을 생성하여 반환합니다.
    """
    article_no = request_data.article_no
    client_input = request_data.client_data

    # 1. Next.js API에서 매물 정보 가져오기
    try:
        article_api_url = f"{NEXTJS_ARTICLE_API_BASE_URL}/{article_no}"
        print(f"Fetching article data from: {article_api_url}")
        response = requests.get(article_api_url, timeout=15) # 타임아웃 설정
        response.raise_for_status()  # HTTP 오류 발생 시 예외 발생
        naver_article_data = response.json()
        print(f"Successfully fetched article data for {article_no}")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching article data from Next.js API: {e}")
        raise HTTPException(status_code=503, detail=f"매물 정보 조회 중 오류 발생: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while fetching article data: {e}")
        raise HTTPException(status_code=500, detail=f"매물 정보 처리 중 예상치 못한 오류: {e}")

    # 2. 가져온 데이터를 내부 형식으로 변환
    try:
        internal_article_data = transform_naver_article_to_internal_format(naver_article_data)
        print("Successfully transformed Naver data to internal format.")
    except Exception as e:
        print(f"Error transforming Naver data: {e}")
        raise HTTPException(status_code=500, detail=f"매물 데이터 변환 중 오류 발생: {e}")

    # 3. PPTX 생성 함수에 전달할 client_data 준비
    # debug_ppt_elements.generate_presentation 함수는 다음 키들을 기대:
    # "문서명", "고객명", "회사명", "참고사항_입력", "비고_입력"
    prepared_client_data = {
        "문서명": client_input.document_title,
        "고객명": client_input.client_name,
        "회사명": client_input.company_name,
        "참고사항_입력": client_input.remarks,
        "비고_입력": client_input.notes
    }

    # 4. PPTX 생성
    try:
        print("Generating PPTX file...")
        ppt_bytes_io = generate_presentation(
            client_data_input=prepared_client_data,
            article_json_data_input=internal_article_data, 
            매핑규칙=pptx_mappings # debug_ppt_elements에서 임포트한 매핑 규칙 사용
        )
        print("PPTX file generated successfully.")
    except FileNotFoundError as e:
        print(f"PPTX template file not found: {e}")
        raise HTTPException(status_code=500, detail=f"PPT 생성 오류: 템플릿 파일을 찾을 수 없습니다. {e}")
    except Exception as e:
        print(f"Error during PPTX generation: {e}")
        # 개발 중에는 상세 오류를 클라이언트에게 전달할 수 있으나, 운영 환경에서는 일반적인 메시지로 대체하는 것이 좋음
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PPT 생성 중 내부 오류 발생: {e}")

    # 5. 생성된 PPTX 파일을 스트리밍 응답으로 반환
    output_filename = f"물건자료_{article_no}_{client_input.client_name.replace(' ', '_')}.pptx"
    
    # StreamingResponse 사용
    return StreamingResponse(
        ppt_bytes_io, 
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{output_filename}"}
    )

# FastAPI 앱 실행 (개발용)
# uvicorn pptx_gen.main:app --reload --port 8008
if __name__ == "__main__":
    import uvicorn
    # 현재 작업 디렉토리가 pptx_gen의 부모 디렉토리라고 가정하고 실행합니다.
    # 실제 실행은 프로젝트 루트에서 uvicorn pptx_gen.main:app --reload --port 8008 와 같이 합니다.
    print("FastAPI 앱을 실행하려면 프로젝트 루트에서 다음 명령을 사용하세요:")
    print("uvicorn pptx_gen.main:app --reload --port 8008")
    # uvicorn.run("main:app", host="0.0.0.0", port=8008, reload=True) # 이 방식은 pptx_gen 폴더에서 실행 시 