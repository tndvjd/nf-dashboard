import { NextRequest, NextResponse } from 'next/server';
import { 
    PPTGenerationRequestData, 
    DataPayloadForPython,
    ArticlePhoto 
} from '@/types/real-estate';

// Python FastAPI 서버 URL (환경 변수로 관리하는 것이 좋음)
const PYTHON_PPT_API_URL = process.env.PYTHON_PPT_API_URL || 'http://localhost:8000/generate-ppt/';
// 외부 지도 API 관련 (예시)
const MAP_API_KEY = process.env.STATIC_MAP_API_KEY; // 예: Google Maps Static API Key

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as PPTGenerationRequestData;
        const { articleDetail, articleAddition, articlePhotos, documentTitle, clientName, companyName, companyLogoUrl, properties } = body;

        // 다중 매물 처리 여부 확인
        const hasMultipleProperties = properties && properties.length > 0;
        
        // 다중 매물이 있으면 그것을 사용하고, 없으면 articleDetail 기본 처리
        if ((!hasMultipleProperties && !articleDetail?.articleNo) || !documentTitle || !clientName) {
            return NextResponse.json({ error: '필수 파라미터가 누락되었습니다: articleDetail.articleNo(또는 properties), documentTitle, clientName' }, { status: 400 });
        }

        let generatedMapImageUrl: string | undefined = undefined;
        if (articleDetail?.latitude && articleDetail?.longitude && MAP_API_KEY) {
            const lat = articleDetail.latitude;
            const lon = articleDetail.longitude;
            // !!! 여기에 실제 지도 API 호출 로직 구현 필요 !!!
            console.warn("지도 API 연동 로직이 구현되지 않았습니다. 위도/경도 정보를 사용한 API 호출이 필요합니다.");
            generatedMapImageUrl = `https://via.placeholder.com/600x400.png?text=Map+for+${lat},${lon}`;
        } else {
            console.warn('지도 이미지 생성을 위한 위도/경도 또는 API 키가 부족합니다.');
        }

        // 다중 매물이 있을 경우 처리
        let dataForPythonAPI: any = {};
        
        if (hasMultipleProperties && properties && properties.length > 0) {
            // 다중 매물을 위한 페이로드 구성
            console.log(`[DEBUG] 다중 매물(${properties.length}개) 처리 중`);
            
            // 각 매물의 상세 정보 처리
            const processedProperties = properties.map(prop => ({
                articleDetail: {
                    ...(prop.articleDetail || {}),
                    // 사진과 도면도 처리
                    articlePhotos: prop.articleDetail?.articlePhotos?.map((photo: any) => ({ photoUrl: photo.imageSrc })).filter((p: any) => !!p.photoUrl) || [],
                    complexPyeongDetailList: prop.articleDetail?.grandPlanList?.map((plan: any) => ({ floorPlanUrl: plan.imageSrc })).filter((p: any) => !!p.floorPlanUrl) || [],
                },
                articleAddition: {
                    ...(prop.articleAddition || {}),
                },
            }));
            
            dataForPythonAPI = {
                // 페이로드 기본 정보
                articleDetail: {
                    ...(articleDetail || {}),
                    articlePhotos: articlePhotos?.map((photo: ArticlePhoto) => ({ photoUrl: photo.imageSrc })).filter(p => !!p.photoUrl) || [],
                    complexPyeongDetailList: articleDetail?.grandPlanList?.map(plan => ({ floorPlanUrl: plan.imageSrc })).filter(p => !!p.floorPlanUrl) || [],
                },
                articleAddition: {...(articleAddition || {})},
                documentTitle,
                clientName,
                companyName,
                mapImageUrl: generatedMapImageUrl,
                companyLogoUrl,
                // 다중 매물 정보 추가
                properties: processedProperties,
            };
        } else {
            // 기존 단일 매물 처리
            dataForPythonAPI = {
                articleDetail: {
                    ...(articleDetail || {}),
                    articlePhotos: articlePhotos?.map((photo: ArticlePhoto) => ({ photoUrl: photo.imageSrc })).filter(p => !!p.photoUrl) || [],
                    complexPyeongDetailList: articleDetail?.grandPlanList?.map(plan => ({ floorPlanUrl: plan.imageSrc })).filter(p => !!p.floorPlanUrl) || [],
                },
                articleAddition: {
                    ...(articleAddition || {}),
                },
                documentTitle: documentTitle,
                clientName: clientName,
                companyName: companyName,
                mapImageUrl: generatedMapImageUrl,
                companyLogoUrl: companyLogoUrl, 
            };
        }

        console.log("[DEBUG] Data being sent to Python API:", JSON.stringify(dataForPythonAPI, null, 2));

        const pythonApiResponse = await fetch(PYTHON_PPT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataForPythonAPI),
        });

        if (!pythonApiResponse.ok) {
            const errorData = await pythonApiResponse.text();
            try {
                const parsedError = JSON.parse(errorData);
                console.error('Python API 오류 (parsed):', parsedError);
            } catch (e) {
                console.error('Python API 오류 (raw):', errorData);
            }
            return NextResponse.json({ error: `PPT 생성 요청 실패. Python API 서버 응답: ${pythonApiResponse.status}`, details: errorData }, { status: pythonApiResponse.status });
        }

        const pptxStream = pythonApiResponse.body;
        if (!pptxStream) {
            return NextResponse.json({ error: 'PPT 생성 후 스트림을 받지 못했습니다.' }, { status: 500 });
        }
        
        const headers = new Headers();
        const contentDisposition = pythonApiResponse.headers.get('content-disposition');
        if (contentDisposition) {
            headers.set('Content-Disposition', contentDisposition);
        }
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');

        return new Response(pptxStream, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error('PPT 생성 API 내부 오류:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류 발생';
        return NextResponse.json({ error: `서버 내부 오류: ${errorMessage}` }, { status: 500 });
    }
}
