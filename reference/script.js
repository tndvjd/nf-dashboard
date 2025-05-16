// script.js

// 서울시 행정구역 데이터
const SEOUL_DISTRICTS = {
    "강남구": ["개포동", "논현동", "대치동", "도곡동", "삼성동", "세곡동", "수서동", "신사동", "압구정동", "역삼동", "율현동", "일원동", "자곡동", "청담동"],
    "강동구": ["강일동", "고덕동", "길동", "둔촌동", "명일동", "상일동", "성내동", "암사동", "천호동"],
    "강북구": ["미아동", "번동", "수유동", "우이동"],
    "강서구": ["가양동", "개화동", "공항동", "과해동", "내발산동", "등촌동", "마곡동", "방화동", "염창동", "오곡동", "오쇠동", "외발산동", "화곡동"],
    "관악구": ["남현동", "봉천동", "신림동"],
    "광진구": ["광장동", "구의동", "군자동", "능동", "자양동", "중곡동", "화양동"],
    "구로구": ["가리봉동", "개봉동", "고척동", "구로동", "궁동", "신도림동", "오류동", "온수동", "천왕동", "항동"],
    "금천구": ["가산동", "독산동", "시흥동"],
    "노원구": ["공릉동", "상계동", "월계동", "중계동", "하계동"],
    "도봉구": ["도봉동", "방학동", "쌍문동", "창동"],
    "동대문구": ["답십리동", "신설동", "용두동", "이문동", "장안동", "전농동", "제기동", "청량리동", "회기동", "휘경동"],
    "동작구": ["노량진동", "대방동", "동작동", "본동", "사당동", "상도동", "신대방동", "흑석동"],
    "마포구": ["공덕동", "구수동", "노고산동", "당인동", "대흥동", "도화동", "동교동", "마포동", "망원동", "상수동", "서교동", "성산동", "신공덕동", "신수동", "신정동", "아현동", "연남동", "염리동", "용강동", "중동", "창전동", "토정동", "하중동", "합정동", "현석동"],
    "서대문구": ["남가좌동", "냉천동", "대신동", "대현동", "미근동", "봉원동", "북가좌동", "북아현동", "신촌동", "연희동", "영천동", "옥천동", "창천동", "천연동", "충정로2가", "충정로3가", "합동", "현저동", "홍은동", "홍제동"],
    "서초구": ["내곡동", "반포동", "방배동", "서초동", "신원동", "양재동", "염곡동", "우면동", "원지동", "잠원동"],
    "성동구": ["금호동1가", "금호동2가", "금호동3가", "금호동4가", "도선동", "마장동", "사근동", "상왕십리동", "성수동1가", "성수동2가", "송정동", "옥수동", "용답동", "응봉동", "하왕십리동", "행당동", "홍익동"],
    "성북구": ["길음동", "돈암동", "동선동1가", "동선동2가", "동선동3가", "동선동4가", "동선동5가", "동소문동1가", "동소문동2가", "동소문동3가", "동소문동4가", "동소문동5가", "동소문동6가", "동소문동7가", "보문동1가", "보문동2가", "보문동3가", "보문동4가", "보문동5가", "보문동6가", "보문동7가", "삼선동1가", "삼선동2가", "삼선동3가", "삼선동4가", "삼선동5가", "상월곡동", "석관동", "성북동", "성북동1가", "안암동1가", "안암동2가", "안암동3가", "안암동4가", "안암동5가", "장위동", "정릉동", "종암동", "하월곡동"],
    "송파구": ["가락동", "거여동", "마천동", "문정동", "방이동", "삼전동", "석촌동", "송파동", "신천동", "오금동", "잠실동", "장지동", "풍납동"],
    "양천구": ["목동", "신월동", "신정동"],
    "영등포구": ["당산동", "당산동1가", "당산동2가", "당산동3가", "당산동4가", "당산동5가", "당산동6가", "대림동", "도림동", "문래동1가", "문래동2가", "문래동3가", "문래동4가", "문래동5가", "문래동6가", "신길동", "양평동", "양평동1가", "양평동2가", "양평동3가", "양평동4가", "양평동5가", "양평동6가", "양화동", "여의도동", "영등포동", "영등포동1가", "영등포동2가", "영등포동3가", "영등포동4가", "영등포동5가", "영등포동6가", "영등포동7가", "영등포동8가"],
    "용산구": ["갈월동", "남영동", "도원동", "동빙고동", "동자동", "문배동", "보광동", "산천동", "서계동", "서빙고동", "신계동", "신창동", "용문동", "용산동1가", "용산동2가", "용산동3가", "용산동4가", "용산동5가", "용산동6가", "원효로1가", "원효로2가", "원효로3가", "원효로4가", "이촌동", "이태원동", "주성동", "청암동", "청파동1가", "청파동2가", "청파동3가", "한강로1가", "한강로2가", "한강로3가", "한남동", "효창동", "후암동"],
    "은평구": ["갈현동", "구산동", "녹번동", "대조동", "불광동", "수색동", "신사동", "역촌동", "응암동", "증산동", "진관동"],
    "종로구": ["가회동", "견지동", "경운동", "계동", "공평동", "관수동", "관철동", "관훈동", "교남동", "교북동", "구기동", "궁정동", "권농동", "낙원동", "내수동", "내자동", "누상동", "누하동", "당주동", "도렴동", "돈의동", "동숭동", "명륜1가", "명륜2가", "명륜3가", "명륜4가", "묘동", "무악동", "봉익동", "부암동", "사직동", "삼청동", "서린동", "세종로", "소격동", "송월동", "송현동", "수송동", "숭인동", "신교동", "신문로1가", "신문로2가", "안국동", "연건동", "연지동", "예지동", "옥인동", "와룡동", "운니동", "원남동", "원서동", "이화동", "익선동", "인사동", "인의동", "장사동", "재동", "적선동", "종로1가", "종로2가", "종로3가", "종로4가", "종로5가", "종로6가", "중학동", "창성동", "창신동", "청운동", "청진동", "체부동", "충신동", "통의동", "통인동", "팔판동", "평동", "평창동", "필운동", "행촌동", "혜화동", "홍지동", "홍파동", "화동", "효자동", "효제동", "훈정동"],
    "중구": ["광희동1가", "광희동2가", "남대문로1가", "남대문로2가", "남대문로3가", "남대문로4가", "남대문로5가", "남산동1가", "남산동2가", "남산동3가", "남학동", "다동", "만리동1가", "만리동2가", "명동1가", "명동2가", "무교동", "무학동", "묵정동", "방산동", "봉래동1가", "봉래동2가", "북창동", "산림동", "삼각동", "서소문동", "소공동", "수표동", "수하동", "순화동", "신당동", "쌍림동", "오장동", "을지로1가", "을지로2가", "을지로3가", "을지로4가", "을지로5가", "을지로6가", "을지로7가", "의주로1가", "의주로2가", "인현동1가", "인현동2가", "입정동", "장교동", "장충동1가", "장충동2가", "저동1가", "저동2가", "정동", "주교동", "주자동", "중림동", "초동", "충무로1가", "충무로2가", "충무로3가", "충무로4가", "충무로5가", "태평로1가", "태평로2가", "필동1가", "필동2가", "필동3가", "황학동", "회현동1가", "회현동2가", "회현동3가", "흥인동"],
    "중랑구": ["망우동", "면목동", "묵동", "상봉동", "신내동", "중화동"]
};

// HTML 요소 참조
const openFilterModalButton = document.getElementById('open-filter-modal-button');
const filterModal = document.getElementById('filter-modal');
const closeFilterModalButtonHeader = document.getElementById('close-filter-modal-button-header');
const closeFilterModalButtonFooter = document.getElementById('close-filter-modal-button-footer');
const resetFiltersButtonModal = document.getElementById('reset-filters-button-modal');

const complexKeywordInputModal = document.getElementById('complex-keyword-input-modal');
const searchByKeywordButtonModal = document.getElementById('search-by-keyword-button-modal');
const guSelectModal = document.getElementById('gu-select-modal');
const dongSelectModal = document.getElementById('dong-select-modal');
const searchComplexButtonModal = document.getElementById('search-complex-button-modal');

const appliedFiltersDisplay = document.getElementById('applied-filters-display');

const complexListContainer = document.getElementById('complex-list-container');
const complexPaginationControls = document.getElementById('complex-pagination-controls');
const propertyDetailSection = document.getElementById('property-detail-section');
const propertyDetailContainer = document.getElementById('property-detail-container');

// 매물 상세 정보 모달 관련 요소 (기존 ID 유지)
const propertyModal = document.getElementById('property-modal'); // 이름 변경: 기존 property-modal
const closePropertyModalButton = document.getElementById('close-property-modal-button'); // 이름 변경: 기존 close-modal-button
const modalActionCloseButton = document.getElementById('modal-action-close-button');
const modalTitleText = document.getElementById('modal-title-text');
let currentModalComplexName = '';

const modalTabList = document.getElementById('modal-tab-list');
const modalPropertyListContainer = document.getElementById('modal-property-list-container');
const modalTabDetail = document.getElementById('modal-tab-detail');
const modalPropertyDetailContainer = document.getElementById('modal-property-detail-container');
const modalBackToListButton = document.getElementById('modal-back-to-list-button');


// 필터값 저장을 위한 전역 변수 (모달 내부 값 사용)
let currentSelectedGuModal = '';
let currentSelectedDongModal = '';
let currentComplexKeywordModal = '';
let currentSelectedPropertyTypeModal = "APT:OPST:ABYG:OBYG";
let currentSelectedTradeTypeModal = "A1:B1:B2:B3";
let currentMainPriceMinModal = null;
let currentMainPriceMaxModal = null;
let currentMonthlyRentMinModal = null;
let currentMonthlyRentMaxModal = null;
let currentAreaMinModal = null;
let currentAreaMaxModal = null;

// 현재 선택된 행 추적
let selectedComplexRow = null;
let selectedPropertyRowInModal = null;

// 단지 목록 페이지네이션 관련 변수
let allFetchedComplexes = [];
let currentPageComplexes = 1;
const complexesPerPage = 5;

// --- 필터 모달 제어 ---
function openFilterModal() {
    filterModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeFilterModal() {
    filterModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    updateAppliedFiltersDisplay(); // 모달 닫을 때 적용된 필터 표시 업데이트
}

// --- 초기화 및 UI 헬퍼 함수 ---
function populateGuSelect(selectElement) {
    selectElement.innerHTML = '<option value="">-- 구 선택 --</option>'; // 기존 옵션 초기화
    const guNames = Object.keys(SEOUL_DISTRICTS).sort();
    guNames.forEach(guName => {
        const option = document.createElement('option');
        option.value = guName;
        option.textContent = guName;
        selectElement.appendChild(option);
    });
}

function updateDongSelect(guValue, dongSelectElement, searchButtonElement) {
    dongSelectElement.innerHTML = '<option value="">-- 동 선택 --</option>';
    dongSelectElement.disabled = true;
    if(searchButtonElement) searchButtonElement.disabled = true;

    if (guValue && SEOUL_DISTRICTS[guValue]) {
        const dongNames = SEOUL_DISTRICTS[guValue].sort();
        dongNames.forEach(dongName => {
            const option = document.createElement('option');
            option.value = dongName;
            option.textContent = dongName;
            dongSelectElement.appendChild(option);
        });
        dongSelectElement.disabled = false;
    }
}

function updatePriceFilterUIModal(tradeType) {
    const mainPriceSectionModal = document.getElementById('main-price-filter-section-modal');
    const mainPriceLabelModal = document.getElementById('main-price-label-modal');
    const monthlyRentSectionModal = document.getElementById('monthly-rent-filter-section-modal');

    if (tradeType.includes('A1')) { // 매매
        mainPriceSectionModal.style.display = 'block';
        mainPriceLabelModal.textContent = '매매가';
        monthlyRentSectionModal.style.display = 'none';
    } else if (tradeType.includes('B1')) { // 전세
        mainPriceSectionModal.style.display = 'block';
        mainPriceLabelModal.textContent = '전세금';
        monthlyRentSectionModal.style.display = 'none';
    } else if (tradeType.includes('B2') || tradeType.includes('B3')) { // 월세 또는 단기임대
        mainPriceSectionModal.style.display = 'block';
        mainPriceLabelModal.textContent = '보증금';
        monthlyRentSectionModal.style.display = 'block';
    } else { // 전체 또는 기타
        mainPriceSectionModal.style.display = 'block';
        mainPriceLabelModal.textContent = '매매/전세/보증금';
        monthlyRentSectionModal.style.display = 'none';
    }
}

function clearComplexList() {
    complexListContainer.innerHTML = '<p class="text-gray-500 text-center py-10">검색 조건을 설정하고 필터 버튼을 눌러 검색해주세요.</p>';
    complexPaginationControls.innerHTML = '';
    if (selectedComplexRow) {
        selectedComplexRow.classList.remove('selected-row');
        selectedComplexRow = null;
    }
}

function clearMainPropertyDetails() {
    propertyDetailContainer.innerHTML = '<p class="text-gray-500 text-center py-10">매물을 선택하면 상세 정보가 여기에 표시됩니다.</p>';
    propertyDetailSection.style.display = 'none';
}

function updateAppliedFiltersDisplay() {
    let filtersText = [];
    if (currentComplexKeywordModal) {
        filtersText.push(`단지명: "${currentComplexKeywordModal}"`);
    }
    if (currentSelectedGuModal) {
        let locationFilter = `지역: ${currentSelectedGuModal}`;
        if (currentSelectedDongModal) {
            locationFilter += ` ${currentSelectedDongModal}`;
        }
        filtersText.push(locationFilter);
    }

    const propTypeRadio = document.querySelector('input[name="propertyTypeModal"]:checked');
    if (propTypeRadio && propTypeRadio.value !== "APT:OPST:ABYG:OBYG") {
         const label = document.querySelector(`label[for="${propTypeRadio.id}"]`);
         if(label) filtersText.push(`매물종류: ${label.textContent}`);
    }

    const tradeTypeRadio = document.querySelector('input[name="tradeTypeModal"]:checked');
    if (tradeTypeRadio && tradeTypeRadio.value !== "A1:B1:B2:B3") {
        const label = document.querySelector(`label[for="${tradeTypeRadio.id}"]`);
        if(label) filtersText.push(`거래유형: ${label.textContent}`);
    }
    
    if (currentMainPriceMinModal || currentMainPriceMaxModal) {
        let priceText = "가격: ";
        if (currentMainPriceMinModal) priceText += `${currentMainPriceMinModal}만원 ~ `;
        else priceText += "최소 없음 ~ ";
        if (currentMainPriceMaxModal) priceText += `${currentMainPriceMaxModal}만원`;
        else priceText += "최대 없음";
        filtersText.push(priceText);
    }
    if ((currentSelectedTradeTypeModal.includes('B2') || currentSelectedTradeTypeModal.includes('B3')) && (currentMonthlyRentMinModal || currentMonthlyRentMaxModal)) {
        let rentText = "월세: ";
        if (currentMonthlyRentMinModal) rentText += `${currentMonthlyRentMinModal}만원 ~ `;
        else rentText += "최소 없음 ~ ";
        if (currentMonthlyRentMaxModal) rentText += `${currentMonthlyRentMaxModal}만원`;
        else rentText += "최대 없음";
        filtersText.push(rentText);
    }
     if (currentAreaMinModal || currentAreaMaxModal) {
        let areaText = "면적: ";
        if (currentAreaMinModal) areaText += `${currentAreaMinModal}㎡ ~ `;
        else areaText += "최소 없음 ~ ";
        if (currentAreaMaxModal) areaText += `${currentAreaMaxModal}㎡`;
        else areaText += "최대 없음";
        filtersText.push(areaText);
    }

    if (filtersText.length > 0) {
        appliedFiltersDisplay.textContent = "적용된 필터: " + filtersText.join(' | ');
    } else {
        appliedFiltersDisplay.textContent = ''; // 내용이 없으면 placeholder가 CSS로 표시됨
    }
}


// --- 이벤트 리스너 설정 ---
openFilterModalButton.addEventListener('click', openFilterModal);
closeFilterModalButtonHeader.addEventListener('click', closeFilterModal);
closeFilterModalButtonFooter.addEventListener('click', closeFilterModal);

guSelectModal.addEventListener('change', function() {
    currentSelectedGuModal = this.value;
    currentSelectedDongModal = ''; // 구가 바뀌면 동 선택 초기화
    updateDongSelect(this.value, dongSelectModal, searchComplexButtonModal);
    if(searchComplexButtonModal) searchComplexButtonModal.disabled = true; // 구만 선택 시 동 검색 버튼 비활성화
});

dongSelectModal.addEventListener('change', function() {
    currentSelectedDongModal = this.value;
    if(searchComplexButtonModal) searchComplexButtonModal.disabled = !this.value;
});

// 모달 내 필터 값 변경 시 전역 변수 업데이트
complexKeywordInputModal.addEventListener('input', (e) => currentComplexKeywordModal = e.target.value.trim());
document.querySelectorAll('input[name="propertyTypeModal"]').forEach(radio => {
    radio.addEventListener('change', function() { currentSelectedPropertyTypeModal = this.value; });
});
document.querySelectorAll('input[name="tradeTypeModal"]').forEach(radio => {
    radio.addEventListener('change', function() {
        currentSelectedTradeTypeModal = this.value;
        updatePriceFilterUIModal(currentSelectedTradeTypeModal);
    });
});
document.getElementById('main-price-min-modal').addEventListener('input', (e) => currentMainPriceMinModal = e.target.value === '' ? null : parseInt(e.target.value));
document.getElementById('main-price-max-modal').addEventListener('input', (e) => currentMainPriceMaxModal = e.target.value === '' ? null : parseInt(e.target.value));
document.getElementById('monthly-rent-min-modal').addEventListener('input', (e) => currentMonthlyRentMinModal = e.target.value === '' ? null : parseInt(e.target.value));
document.getElementById('monthly-rent-max-modal').addEventListener('input', (e) => currentMonthlyRentMaxModal = e.target.value === '' ? null : parseInt(e.target.value));
document.getElementById('area-min-modal').addEventListener('input', (e) => currentAreaMinModal = e.target.value === '' ? null : parseInt(e.target.value));
document.getElementById('area-max-modal').addEventListener('input', (e) => currentAreaMaxModal = e.target.value === '' ? null : parseInt(e.target.value));


// 모달 내 검색 버튼 이벤트 리스너
searchComplexButtonModal.addEventListener('click', async function() {
    if (!currentSelectedGuModal || !currentSelectedDongModal) {
        alert('구와 동을 모두 선택해주세요.');
        return;
    }
    clearComplexList();
    clearMainPropertyDetails();
    complexListContainer.innerHTML = '<p class="text-gray-500 text-center py-10 animate-pulse">단지 목록을 불러오는 중...</p>';
    this.disabled = true;
    searchByKeywordButtonModal.disabled = true;
    document.body.style.cursor = 'wait'; 

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/complexes?gu_name=${currentSelectedGuModal}&dong_name=${currentSelectedDongModal}&propertyType=${currentSelectedPropertyTypeModal}`);
        // ... (이하 기존 searchButton 로직과 유사하게 처리) ...
        if (!response.ok) { /* ... 에러 처리 ... */ allFetchedComplexes = []; }
        else {
            const data = await response.json();
            if (data.error) { /* ... 에러 처리 ... */ allFetchedComplexes = []; }
            else if (data.complexes) { allFetchedComplexes = data.complexes; }
            else { allFetchedComplexes = []; }
        }
        currentPageComplexes = 1;
        displayComplexes();
        closeFilterModal(); // 검색 후 모달 닫기
    } catch (error) { /* ... 에러 처리 ... */ }
    finally {
        this.disabled = false;
        searchByKeywordButtonModal.disabled = false;
        document.body.style.cursor = 'default'; 
    }
});

searchByKeywordButtonModal.addEventListener('click', async function() {
    if (currentComplexKeywordModal.length < 2) {
        alert('단지명을 2글자 이상 입력해주세요.');
        return;
    }
    clearComplexList();
    clearMainPropertyDetails();
    complexListContainer.innerHTML = `<p class="text-gray-500 text-center py-10 animate-pulse">단지명 '${currentComplexKeywordModal}' 검색 중...</p>`;
    this.disabled = true;
    searchComplexButtonModal.disabled = true;
    document.body.style.cursor = 'wait';

    try {
        let apiUrl = `http://127.0.0.1:8000/api/complexes/search_by_name?name_keyword=${encodeURIComponent(currentComplexKeywordModal)}`;
        if (currentSelectedPropertyTypeModal && currentSelectedPropertyTypeModal !== "APT:OPST:ABYG:OBYG") {
            apiUrl += `&propertyType=${currentSelectedPropertyTypeModal}`;
        }
        // ... (이하 기존 searchByKeywordButton 로직과 유사하게 처리) ...
        const response = await fetch(apiUrl);
        if (!response.ok) { /* ... 에러 처리 ... */ allFetchedComplexes = []; }
        else {
            const data = await response.json();
            if (data.error) { /* ... 에러 처리 ... */ allFetchedComplexes = []; }
            else if (data.complexes && data.complexes.length > 0) { allFetchedComplexes = data.complexes; }
            else {
                complexListContainer.innerHTML = `<p class="text-gray-500 text-center py-10">${data.message || `'${currentComplexKeywordModal}'에 대한 검색 결과가 없습니다.`}</p>`;
                allFetchedComplexes = [];
            }
        }
        currentPageComplexes = 1;
        displayComplexes();
        closeFilterModal(); // 검색 후 모달 닫기
    } catch (error) { /* ... 에러 처리 ... */ }
    finally {
        this.disabled = false;
        searchComplexButtonModal.disabled = !currentSelectedDongModal || !currentSelectedGuModal;
        document.body.style.cursor = 'default';
    }
});

resetFiltersButtonModal.addEventListener('click', function() {
    // 모달 내 모든 입력 필드 초기화
    complexKeywordInputModal.value = '';
    guSelectModal.value = '';
    dongSelectModal.innerHTML = '<option value="">-- 동 선택 --</option>';
    dongSelectModal.disabled = true;
    searchComplexButtonModal.disabled = true;

    document.getElementById('prop-all-modal').checked = true;
    document.getElementById('trade-all-modal').checked = true;

    document.getElementById('main-price-min-modal').value = '';
    document.getElementById('main-price-max-modal').value = '';
    document.getElementById('monthly-rent-min-modal').value = '';
    document.getElementById('monthly-rent-max-modal').value = '';
    document.getElementById('area-min-modal').value = '';
    document.getElementById('area-max-modal').value = '';

    // 전역 필터 변수들도 초기화
    currentComplexKeywordModal = '';
    currentSelectedGuModal = '';
    currentSelectedDongModal = '';
    currentSelectedPropertyTypeModal = "APT:OPST:ABYG:OBYG";
    currentSelectedTradeTypeModal = "A1:B1:B2:B3";
    currentMainPriceMinModal = null;
    currentMainPriceMaxModal = null;
    currentMonthlyRentMinModal = null;
    currentMonthlyRentMaxModal = null;
    currentAreaMinModal = null;
    currentAreaMaxModal = null;
    
    updatePriceFilterUIModal(currentSelectedTradeTypeModal); // 가격 필터 UI 업데이트
    updateAppliedFiltersDisplay(); // 적용된 필터 표시 업데이트
    console.log("모달 내 필터가 초기화되었습니다.");
});


// --- 매물 상세 정보 모달 관련 (기존 로직 유지, ID만 확인) ---
closePropertyModalButton.addEventListener('click', () => propertyModal.classList.add('hidden'));
modalActionCloseButton.addEventListener('click', () => propertyModal.classList.add('hidden'));
modalBackToListButton.addEventListener('click', showPropertyModalListView); // 함수명 변경

propertyModal.addEventListener('click', (event) => {
    if (event.target === propertyModal) {
        propertyModal.classList.add('hidden');
    }
});

function openPropertyModalForListings() { // 함수명 변경
    propertyModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    showPropertyModalListView(); // 처음엔 목록 뷰
}

function showPropertyModalListView() { // 함수명 변경
    modalTabList.classList.remove('hidden');
    modalTabDetail.classList.add('hidden');
    modalTitleText.innerHTML = `매물 목록: <span class="text-indigo-600">${currentModalComplexName}</span>`;
    modalPropertyDetailContainer.innerHTML = '';
}

function showPropertyModalDetailView() { // 함수명 변경
    modalTabList.classList.add('hidden');
    modalTabDetail.classList.remove('hidden');
    modalTitleText.textContent = '매물 상세 정보';
}


// --- 데이터 표시 함수 (단지 목록 및 페이지네이션) ---
function displayComplexes() {
    complexListContainer.innerHTML = '';
    if (!allFetchedComplexes || allFetchedComplexes.length === 0) {
        complexListContainer.innerHTML = `<p class="text-gray-500 text-center py-10">조건에 맞는 단지가 없습니다.</p>`;
        complexPaginationControls.innerHTML = '';
        updateAppliedFiltersDisplay(); // 필터 표시 업데이트
        return;
    }

    const startIndex = (currentPageComplexes - 1) * complexesPerPage;
    const endIndex = startIndex + complexesPerPage;
    const paginatedComplexes = allFetchedComplexes.slice(startIndex, endIndex);

    if (paginatedComplexes.length === 0 && currentPageComplexes > 1) {
        currentPageComplexes--;
        displayComplexes();
        return;
    }
     if (paginatedComplexes.length === 0 && currentPageComplexes === 1) {
         complexListContainer.innerHTML = `<p class="text-gray-500 text-center py-10">표시할 단지가 없습니다.</p>`;
         complexPaginationControls.innerHTML = '';
         updateAppliedFiltersDisplay(); // 필터 표시 업데이트
         return;
    }

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200 shadow-sm border border-gray-200 rounded-lg'; 

    const thead = document.createElement('thead');
    thead.className = 'bg-gray-100'; // 테이블 헤더 배경색 변경
    thead.innerHTML = `
        <tr>
            <th scope="col" class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">단지명</th>
            <th scope="col" class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">주소</th>
            <th scope="col" class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">종류</th>
            <th scope="col" class="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">동작</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';

    paginatedComplexes.forEach(complex => {
        const tr = document.createElement('tr');
        tr.dataset.complexNo = complex.complexNo;
        tr.dataset.complexName = complex.complexName || '이름 없음';
        tr.classList.add('cursor-pointer', 'hover:bg-indigo-50');

        tr.innerHTML = `
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${complex.complexName || '이름 없음'}</div>
            </td>
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">${complex.cortarAddress || '주소 없음'}</td>
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">${complex.realEstateTypeName || '타입 미정'}</td>
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-800 transition-colors duration-150 focus:outline-none property-search-button" title="이 단지의 매물 검색">
                    매물 보기
                    <span aria-hidden="true">&rarr;</span>
                </button>
            </td>
        `;
        
        const viewPropertiesButton = tr.querySelector('.property-search-button');
        viewPropertiesButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (selectedComplexRow) selectedComplexRow.classList.remove('selected-row');
            tr.classList.add('selected-row');
            selectedComplexRow = tr; 
            handleComplexClickForModal(tr.dataset.complexNo, tr.dataset.complexName); // 함수명 변경
        });
        tr.addEventListener('click', function() {
            if (selectedComplexRow) selectedComplexRow.classList.remove('selected-row');
            this.classList.add('selected-row');
            selectedComplexRow = this;
            handleComplexClickForModal(this.dataset.complexNo, this.dataset.complexName); // 함수명 변경
        });
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    complexListContainer.appendChild(table);
    renderComplexPaginationControls();
    updateAppliedFiltersDisplay(); // 필터 표시 업데이트
}

function renderComplexPaginationControls() {
    complexPaginationControls.innerHTML = '';
    const totalComplexes = allFetchedComplexes.length;
    if (totalComplexes <= complexesPerPage) {
        return;
    }
    const totalPages = Math.ceil(totalComplexes / complexesPerPage);
    const prevButton = document.createElement('button');
    prevButton.textContent = '이전';
    prevButton.className = 'pagination-button';
    prevButton.disabled = currentPageComplexes === 1;
    prevButton.addEventListener('click', () => {
        if (currentPageComplexes > 1) {
            currentPageComplexes--;
            displayComplexes();
            // complexListContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    complexPaginationControls.appendChild(prevButton);
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `${currentPageComplexes} / ${totalPages}`;
    complexPaginationControls.appendChild(pageInfo);
    const nextButton = document.createElement('button');
    nextButton.textContent = '다음';
    nextButton.className = 'pagination-button';
    nextButton.disabled = currentPageComplexes === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPageComplexes < totalPages) {
            currentPageComplexes++;
            displayComplexes();
            // complexListContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    complexPaginationControls.appendChild(nextButton);
}

// 단지 클릭 -> 매물 목록 모달 열기
async function handleComplexClickForModal(complexNo, complexName) {
    console.log(`매물 목록 모달용: 단지 번호: ${complexNo}, 단지명: ${complexName}`);
    currentModalComplexName = complexName; // 매물 목록 모달의 제목에 사용될 단지명
    modalPropertyListContainer.innerHTML = `<p class="text-gray-500 text-center py-10 animate-pulse">단지번호 ${complexNo}의 매물 목록을 불러오는 중...</p>`;
    openPropertyModalForListings(); // 매물 목록/상세 모달 열기
    document.body.style.cursor = 'wait';

    // 모달에서 설정된 필터값을 사용
    let apiUrl = `http://127.0.0.1:8000/api/complexes/${complexNo}/properties?tradeType=${currentSelectedTradeTypeModal}&realEstateType=${currentSelectedPropertyTypeModal}`;
    if (currentMainPriceMinModal !== null) apiUrl += `&priceMin=${currentMainPriceMinModal}`;
    if (currentMainPriceMaxModal !== null) apiUrl += `&priceMax=${currentMainPriceMaxModal}`;
    if (currentSelectedTradeTypeModal.includes('B2') || currentSelectedTradeTypeModal.includes('B3')) {
        if (currentMonthlyRentMinModal !== null) apiUrl += `&rentMin=${currentMonthlyRentMinModal}`;
        if (currentMonthlyRentMaxModal !== null) apiUrl += `&rentMax=${currentMonthlyRentMaxModal}`;
    }
    if (currentAreaMinModal !== null) apiUrl += `&areaMin=${currentAreaMinModal}`;
    if (currentAreaMaxModal !== null) apiUrl += `&areaMax=${currentAreaMaxModal}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) { /* ... 에러 처리 ... */ return; }
        const data = await response.json();
        if (data.error) { /* ... 에러 처리 ... */ }
        else if (data.properties && data.properties.length > 0) {
            const filteredProperties = filterPropertiesByExclusiveArea(data.properties, currentAreaMinModal, currentAreaMaxModal); 
            if (filteredProperties.length > 0) {
                displayPropertiesInModal(filteredProperties, complexNo);
            } else {
                 modalPropertyListContainer.innerHTML = `<p class="text-gray-500 text-center py-10">해당 단지에 현재 선택된 조건(전용면적 포함)의 매물이 없습니다.</p>`;
            }
        } else {
            modalPropertyListContainer.innerHTML = `<p class="text-gray-500 text-center py-10">${data.message || `해당 단지에 현재 선택된 조건의 매물이 없습니다.`}</p>`;
        }
    } catch (error) { /* ... 에러 처리 ... */ }
    finally { document.body.style.cursor = 'default'; }
}

// 면적 필터링 함수 (매물 목록 모달용)
function filterPropertiesByExclusiveArea(properties, areaMin, areaMax) {
    if (areaMin === null && areaMax === null) {
        return properties;
    }
    return properties.filter(property => {
        const exclusiveSpace = parseFloat(property.exclusiveSpace);
        if (isNaN(exclusiveSpace)) return true;
        let passMin = true;
        let passMax = true;
        if (areaMin !== null && exclusiveSpace < areaMin) passMin = false;
        if (areaMax !== null && exclusiveSpace > areaMax) passMax = false;
        return passMin && passMax;
    });
}

// 매물 목록 모달 내 매물 리스트 표시
function displayPropertiesInModal(properties, complexNoForLink) {
    modalPropertyListContainer.innerHTML = ''; 
    if (!properties || properties.length === 0) { 
        modalPropertyListContainer.innerHTML = `<p class="text-gray-500 text-center py-10">조건에 맞는 매물이 없습니다.</p>`;
        return;
    }
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    thead.innerHTML = `
        <tr>
            <th scope="col" class="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">거래/종류</th>
            <th scope="col" class="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">가격(만원)</th>
            <th scope="col" class="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">면적(㎡)</th>
            <th scope="col" class="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">층</th>
            <th scope="col" class="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">특징</th>
            <th scope="col" class="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">상세</th>
        </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    properties.forEach(property => {
        const tr = document.createElement('tr');
        tr.dataset.articleNo = property.articleNo;
        tr.dataset.complexNo = complexNoForLink;
        tr.classList.add('cursor-pointer', 'hover:bg-indigo-50');
        const formatPrice = (priceInput) => { /* ... 가격 포맷팅 ... */ 
            if (priceInput === null || typeof priceInput === 'undefined' || String(priceInput).trim() === '-' || String(priceInput).trim() === '') return '-';
            let priceStr = String(priceInput).replace(/,/g, ''); let num = 0; const eokPattern = /(\d+)\s*억/; const cheonPattern = /(\d+)\s*천/;
            let eokMatch = priceStr.match(eokPattern);
            if (eokMatch) { num += parseInt(eokMatch[1]) * 10000; let remainingStr = priceStr.substring(eokMatch[0].length).trim();
                if (remainingStr) { let cheonMatchInRemaining = remainingStr.match(cheonPattern); if (cheonMatchInRemaining) num += parseInt(cheonMatchInRemaining[1]) * 100; else if (!isNaN(parseInt(remainingStr))) num += parseInt(remainingStr);}}
            else { let cheonMatchGlobal = priceStr.match(cheonPattern); if (cheonMatchGlobal) num += parseInt(cheonMatchGlobal[1]) * 100; else if (!isNaN(parseInt(priceStr))) num = parseInt(priceStr); else return priceInput; }
            return num > 0 ? num.toLocaleString() : priceInput;
        };
        const dealPrcRaw = property.dealOrWarrantPrc; const rentPrcRaw = property.rentPrc; const tradeType = property.tradeTypeName || '';
        let priceDisplayStr = ''; if (tradeType === '월세' || tradeType === '단기임대') { priceDisplayStr = `${formatPrice(dealPrcRaw)} / ${formatPrice(rentPrcRaw)}`; } else { priceDisplayStr = formatPrice(dealPrcRaw); }
        const supplyArea = property.supplySpace ? `${parseFloat(property.supplySpace).toFixed(1)}` : '-'; const exclusiveArea = property.exclusiveSpace ? `${parseFloat(property.exclusiveSpace).toFixed(1)}` : '-';
        const areaStr = `${exclusiveArea} / ${supplyArea}`; const floorInfo = property.floorInfo || '-/-'; const articleFeatureDesc = property.articleFeatureDesc || '특징 없음'; const propertyTypeDisplay = property.realEstateTypeName || '';
        let statusBadgeHtml = ''; if (tradeType === '매매') statusBadgeHtml = `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700">${tradeType}</span>`;
        else if (tradeType === '전세') statusBadgeHtml = `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700">${tradeType}</span>`;
        else if (tradeType === '월세' || tradeType === '단기임대') statusBadgeHtml = `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-700">${tradeType}</span>`;
        else statusBadgeHtml = `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">${tradeType || '기타'}</span>`;
        tr.innerHTML = `
            <td class="px-3 sm:px-4 py-4 whitespace-nowrap"><div>${statusBadgeHtml}</div><div class="text-xs text-gray-500 mt-1">${propertyTypeDisplay}</div></td>
            <td class="px-3 sm:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">${priceDisplayStr}</td>
            <td class="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">${areaStr}</td>
            <td class="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">${floorInfo}</td>
            <td class="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px] hidden lg:table-cell" title="${articleFeatureDesc}">${articleFeatureDesc.substring(0, 25)}${articleFeatureDesc.length > 25 ? '...' : ''}</td>
            <td class="px-3 sm:px-4 py-4 whitespace-nowrap text-center text-sm font-medium"><button class="text-indigo-600 hover:text-indigo-800 property-detail-button-modal" title="이 매물 상세 정보 보기">상세보기 <span aria-hidden="true">&rarr;</span></button></td>`;
        const detailButtonInModal = tr.querySelector('.property-detail-button-modal');
        detailButtonInModal.addEventListener('click', function(event) { /* ... 상세 보기 로직 ... */
            event.stopPropagation(); if (selectedPropertyRowInModal) selectedPropertyRowInModal.classList.remove('selected-row');
            tr.classList.add('selected-row'); selectedPropertyRowInModal = tr;
            showPropertyDetailsInModalTab(tr.dataset.articleNo, tr.dataset.complexNo); // 함수명 변경
        });
        tr.addEventListener('click', function() { /* ... 상세 보기 로직 ... */
            if (selectedPropertyRowInModal) selectedPropertyRowInModal.classList.remove('selected-row');
            this.classList.add('selected-row'); selectedPropertyRowInModal = this;
            showPropertyDetailsInModalTab(this.dataset.articleNo, this.dataset.complexNo); // 함수명 변경
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    modalPropertyListContainer.appendChild(table);
}

// 매물 목록 모달 내 '상세보기' 클릭 -> 모달 내 상세 탭으로 전환
async function showPropertyDetailsInModalTab(articleNo, complexNo) {
    showPropertyModalDetailView(); // 상세 탭으로 전환
    modalPropertyDetailContainer.innerHTML = `<p class="text-gray-500 text-center py-10 animate-pulse">매물번호 ${articleNo}의 상세 정보를 불러오는 중...</p>`;
    // ... (이하 기존 showPropertyDetailsInModal 로직과 유사하게 API 호출 및 displayPropertyDetailsContent 호출)
    document.body.style.cursor = 'wait';
    try {
        let fetchUrl = `http://127.0.0.1:8000/api/articles/${articleNo}?complex_no=${complexNo}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) { /* ... */ return; }
        const data = await response.json();
        if (data.error) { /* ... */ }
        else if (data.details) { displayPropertyDetailsContent(data.details, complexNo, modalPropertyDetailContainer); }
        else { /* ... */ }
    } catch (error) { /* ... */ }
    finally { document.body.style.cursor = 'default'; modalTabDetail.scrollTop = 0; }
}

// 매물 상세 정보 내용을 특정 컨테이너에 표시 (공통 함수 - 기존과 거의 동일)
function displayPropertyDetailsContent(details, complexNoForLink, targetContainer) {
    targetContainer.innerHTML = ''; 
    const article = details.articleDetail || {}; const price = details.articlePrice || {}; const space = details.articleSpace || {};
    const floor = details.articleFloor || {}; const facility = details.articleFacility || {}; const realtor = details.articleRealtor || {};
    const addition = details.articleAddition || {}; const actualComplexNo = complexNoForLink || article.complexNo;
    let priceDisplayStr = ''; const tradeTypeName = article.tradeTypeName || '-';
    if (tradeTypeName === "월세" || tradeTypeName === "단기임대") { priceDisplayStr = `보증금 ${price.warrantPrice?.toLocaleString() || '-'} / 월세 ${price.rentPrice?.toLocaleString() || '-'}`; }
    else if (tradeTypeName === "전세") { priceDisplayStr = `전세 ${price.warrantPrice?.toLocaleString() || '-'}`; }
    else if (tradeTypeName === "매매") { priceDisplayStr = `매매 ${price.dealPrice?.toLocaleString() || '-'}`; }
    const detailCard = document.createElement('div'); detailCard.className = 'space-y-6 p-1'; 
    const createSectionTitle = (title) => `<h3 class="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">${title}</h3>`;
    const createInfoItem = (label, value) => `<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 py-2 border-b border-gray-100 last:border-b-0"><dt class="text-sm font-medium text-gray-500">${label}</dt><dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${value || '-'}</dd></div>`;
    let basicInfoHtml = createSectionTitle('기본 정보'); basicInfoHtml += '<dl class="space-y-1">';
    basicInfoHtml += createInfoItem('매물번호', article.articleNo); basicInfoHtml += createInfoItem('매물명', article.articleName);
    if (article.aptName) basicInfoHtml += createInfoItem('단지명', article.aptName);
    basicInfoHtml += createInfoItem('거래조건', `[${tradeTypeName}] ${priceDisplayStr} <span class="text-xs text-gray-500 ml-1">(${article.realEstateTypeName || ''})</span>`);
    if (addition.maintenanceCost) basicInfoHtml += createInfoItem('관리비', `${addition.maintenanceCost.toLocaleString()}원`); basicInfoHtml += '</dl>'; detailCard.innerHTML += basicInfoHtml;
    let spaceInfoHtml = createSectionTitle('면적 및 구조'); spaceInfoHtml += '<dl class="space-y-1">';
    spaceInfoHtml += createInfoItem('공급면적', `${space.supplySpace || '-'} ㎡`); spaceInfoHtml += createInfoItem('전용면적', `${space.exclusiveSpace || '-'} ㎡ (전용률: ${space.exclusiveRate || '-'}%)`);
    spaceInfoHtml += createInfoItem('방수/욕실수', `${article.roomCount || '-'}개 / ${article.bathroomCount || '-'}개`); spaceInfoHtml += createInfoItem('해당층/총층', `${floor.correspondingFloorCount || '-'}층 / ${floor.totalFloorCount || '-'}층`);
    spaceInfoHtml += createInfoItem('방향', `${facility.directionTypeName || '-'} (기준: ${facility.directionBaseTypeName || '-'})`);
    if (article.buildingName) spaceInfoHtml += createInfoItem('동 정보', article.buildingName); if (article.householdCountByPyeong) spaceInfoHtml += createInfoItem('해당면적 세대수', `${article.householdCountByPyeong} 세대`);
    spaceInfoHtml += '</dl>'; detailCard.innerHTML += spaceInfoHtml;
    let descriptionHtml = createSectionTitle('매물 특징 및 설명');
    if (article.articleFeatureDescription) { descriptionHtml += `<div class="p-3 bg-gray-50 rounded-md text-sm text-gray-700 whitespace-pre-wrap"><strong>특징:</strong> ${article.articleFeatureDescription}</div>`; }
    if (article.detailDescription) { descriptionHtml += `<div class="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700 whitespace-pre-wrap"><strong>상세설명:</strong> ${article.detailDescription}</div>`; }
    if (!article.articleFeatureDescription && !article.detailDescription) { descriptionHtml += `<p class="text-sm text-gray-500">제공된 설명이 없습니다.</p>`; }
    detailCard.innerHTML += descriptionHtml;
    if (realtor && realtor.realtorName) {
        let realtorInfoHtml = createSectionTitle('중개업소 정보'); realtorInfoHtml += '<dl class="space-y-1">';
        realtorInfoHtml += createInfoItem('상호명', realtor.realtorName); if (realtor.representativeName) realtorInfoHtml += createInfoItem('대표자', realtor.representativeName);
        if (realtor.representativeTelNo) realtorInfoHtml += createInfoItem('대표번호', `<a href="tel:${realtor.representativeTelNo}" class="text-indigo-600 hover:underline">${realtor.representativeTelNo}</a>`);
        if (realtor.address) realtorInfoHtml += createInfoItem('주소', realtor.address); realtorInfoHtml += '</dl>'; detailCard.innerHTML += realtorInfoHtml;
    }
    if (actualComplexNo && article.articleNo) {
        const naverLinkButton = document.createElement('a'); naverLinkButton.href = `https://new.land.naver.com/complexes/${actualComplexNo}?articleNo=${article.articleNo}`; naverLinkButton.target = '_blank'; naverLinkButton.rel = 'noopener noreferrer';
        naverLinkButton.className = 'mt-8 w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center space-x-2 no-underline';
        naverLinkButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg><span>네이버 부동산에서 매물 보기</span>`;
        detailCard.appendChild(naverLinkButton);
    } else { /* ... 링크 생성 불가 메시지 ... */ }
    targetContainer.appendChild(detailCard);
}

// 메인 화면의 매물 상세 정보 표시 (이 함수는 이제 사용되지 않을 수 있음, 매물 상세는 property-modal에서 처리)
// async function handlePropertyClickOnMainPage(articleNo, complexNo) { ... }


// --- 페이지 로드 시 초기화 ---
document.addEventListener('DOMContentLoaded', function() {
    populateGuSelect(guSelectModal); // 모달 내 구 선택 채우기
    updatePriceFilterUIModal(currentSelectedTradeTypeModal); // 모달 내 가격 필터 UI 초기화
    clearComplexList(); 
    clearMainPropertyDetails(); 
    updateAppliedFiltersDisplay(); // 적용된 필터 표시 초기화
    if(searchComplexButtonModal) searchComplexButtonModal.disabled = true; // 초기에는 동 검색 버튼 비활성화
});
