// Firebase 설정 (firebase-config.js에서 가져옴)
const firebaseConfig = window.firebaseConfig || {
    apiKey: "AIzaSyC5N-5bXkPzzXkZYBkznlbXWzrd3snGXB0",
    authDomain: "stw-voting-system.firebaseapp.com",
    databaseURL: "https://stw-voting-system-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "stw-voting-system",
    storageBucket: "stw-voting-system.firebasestorage.app",
    messagingSenderId: "859381962769",
    appId: "1:859381962769:web:1401c0e7c71e5feeacf9b0",
    measurementId: "G-2H02P62CSZ"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 투표 데이터 구조
let votes = {
    see: {},
    think: {},
    wonder: {}
};

// 관리자 상태
let isAdmin = false;
const ADMIN_PASSWORD = "1004";

// 페이지 로드 시 투표 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    loadVotes();
    setupRealtimeListeners();
});

// 실시간 리스너 설정
function setupRealtimeListeners() {
    database.ref('votes').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            votes = data;
            updateResults();
        }
    });
}

// 투표 데이터 로드
function loadVotes() {
    database.ref('votes').once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                votes = data;
                updateResults();
            }
        })
        .catch((error) => {
            console.error('투표 데이터 로드 실패:', error);
        });
}

// 투표 함수
function vote(category, optionNumber, rank = null) {
    if (!rank) {
        alert('순위를 선택해주세요!');
        return;
    }

    const voteKey = `${optionNumber}_${rank}`;
    
    // 기존 투표 데이터가 없으면 초기화
    if (!votes[category]) {
        votes[category] = {};
    }
    
    if (!votes[category][voteKey]) {
        votes[category][voteKey] = 0;
    }
    
    // 투표 수 증가
    votes[category][voteKey]++;
    
    // Firebase에 저장
    database.ref(`votes/${category}/${voteKey}`).set(votes[category][voteKey])
        .then(() => {
            console.log(`${category} 카테고리 ${optionNumber}번 옵션 ${rank}순위 투표 완료`);
        })
        .catch((error) => {
            console.error('투표 저장 실패:', error);
        });
}

// 결과 업데이트
function updateResults() {
    updateCategoryResults('see');
    updateCategoryResults('think');
    updateCategoryResults('wonder');
}

// 각 카테고리별 결과 업데이트
function updateCategoryResults(category) {
    const resultsDiv = document.getElementById(`${category}-results`);
    if (!resultsDiv) return;

    const categoryVotes = votes[category] || {};
    const results = calculateResults(categoryVotes);
    
    let html = `
        <h3>${getCategoryTitle(category)} 투표 결과</h3>
        <table class="ranking-table">
            <thead>
                <tr>
                    <th>순위</th>
                    <th>답변</th>
                    <th>1순위</th>
                    <th>2순위</th>
                    <th>3순위</th>
                    <th>총점</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach((result, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        html += `
            <tr class="${rankClass}">
                <td>${index + 1}</td>
                <td>${result.text}</td>
                <td class="vote-count">${result.rank1 || 0}</td>
                <td class="vote-count">${result.rank2 || 0}</td>
                <td class="vote-count">${result.rank3 || 0}</td>
                <td class="vote-count">${result.totalScore}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div class="total-votes">
            총 투표 수: ${getTotalVotes(categoryVotes)}표
        </div>
    `;

    resultsDiv.innerHTML = html;
}

// 결과 계산
function calculateResults(categoryVotes) {
    const results = [];
    
    // 각 옵션별로 투표 수 집계
    for (let i = 1; i <= 10; i++) {
        const rank1 = categoryVotes[`${i}_1`] || 0;
        const rank2 = categoryVotes[`${i}_2`] || 0;
        const rank3 = categoryVotes[`${i}_3`] || 0;
        
        // 총점 계산 (1순위: 3점, 2순위: 2점, 3순위: 1점)
        const totalScore = (rank1 * 3) + (rank2 * 2) + (rank3 * 1);
        
        results.push({
            optionNumber: i,
            text: getOptionText(i),
            rank1: rank1,
            rank2: rank2,
            rank3: rank3,
            totalScore: totalScore
        });
    }
    
    // 총점 기준으로 내림차순 정렬
    results.sort((a, b) => b.totalScore - a.totalScore);
    
    return results;
}

// 옵션 텍스트 가져오기
function getOptionText(optionNumber) {
    const optionTexts = {
        see: {
            1: "교사가 아닌 학생들의 활발한 토론과 상호작용이 눈에 띕니다.",
            2: "학생들이 질문하고 답을 찾아가는 과정이 영상의 중심을 이룹니다.",
            3: "교사가 학생들에게 정답을 알려주기보다, 생각을 촉진하는 질문을 던지는 모습이 인상적입니다.",
            4: "다양한 자료나 도구를 활용하여 학생들이 스스로 무언가를 '조사'하고 '탐구'하는 활동이 두드러집니다.",
            5: "수업의 초점이 특정 '개념'이나 '큰 아이디어'에 맞춰져 있음을 시사하는 시각 자료나 활동이 보입니다.",
            6: "학생들이 개인별 활동보다는 소그룹으로 협력하여 과제를 해결하는 모습이 많이 관찰됩니다.",
            7: "학생들이 자신의 생각이나 결과물을 발표하고 공유하는 시간이 할애되어 있습니다.",
            8: "교실 분위기가 경쟁적이기보다는 협력적이고 자유로운 분위기로 느껴집니다.",
            9: "단순 지식 암기가 아닌, 심층적인 사고나 문제 해결 과정을 거치는 활동이 눈에 들어옵니다.",
            10: "학생들의 표정에서 호기심과 주도적인 참여 의지가 느껴집니다."
        },
        think: {
            1: "교사는 '질문 촉진자'로서 정답이 아닌 사고를 자극하는 본질적 질문을 지속적으로 던집니다.",
            2: "교사는 학습 내용의 단순 전달자가 아닌, 학생들의 탐구를 돕는 '탐구 조력자' 역할을 수행합니다.",
            3: "개념 중심의 학습 활동을 설계하여 단편적 지식보다는 개념 간의 연결성과 맥락을 강조합니다.",
            4: "협력적 탐구 활동을 구조화하여 소그룹 활동을 통해 학생들이 자연스럽게 관계 역량을 함양하도록 유도합니다.",
            5: "학생들의 '의미 구성'을 돕기 위해 다양한 맥락에서 개념을 직접 경험하고 적용해볼 기회를 제공합니다.",
            6: "학생들의 사고 과정과 활동에 대한 피드백을 제공하여, 단순히 맞고 틀림을 넘어선 심층적 사고를 유도합니다.",
            7: "지식의 유통기한이 짧아지는 시대에 맞춰 단순 지식 암기보다 개념적 사고 함양에 중점을 둡니다.",
            8: "학생들은 교사의 본질적 질문에 대해 정답을 찾기보다, 스스로 탐구하고 사고하는 과정에 적극적으로 참여합니다.",
            9: "학생들은 사실과 기능을 개념 형성 및 원리 탐구에 활용하며 깊이 있는 사고를 함양합니다.",
            10: "학생들은 학습한 개념을 다른 상황에 적용하며, 맥락이 바뀌어도 전이 가능한 이해를 발달시킵니다."
        },
        wonder: {
            1: "단순 암기를 넘어선 깊이 있는 개념적 이해를 형성하여, 지식이 오래 지속되고 유용하게 활용될 수 있습니다.",
            2: "학생들은 새로운 상황과 문제에 배운 개념을 적용하고 응용하는 '전이 가능성'을 효과적으로 기를 수 있습니다.",
            3: "자신이 직접 탐구하고 의미를 구성하는 경험을 통해 학습에 대한 흥미와 동기가 높아질 것입니다.",
            4: "'왜?', '어떻게?'와 같은 본질적 질문을 통해 비판적 사고력과 문제 해결 능력이 크게 향상될 것입니다.",
            5: "교과 간의 연결성을 파악하고 통합적인 관점을 형성하는 능력을 기를 수 있어, 지식의 폭과 깊이가 확장될 것입니다.",
            6: "협력적인 학습을 통해 의사소통 능력, 팀워크, 타인의 관점을 이해하는 사회적 역량이 발달할 것입니다.",
            7: "빠르게 변화하는 지식 사회에서 새로운 지식을 끊임없이 학습하고 활용할 수 있는 역량을 갖추게 될 것입니다.",
            8: "이 수업 방식을 내 교실에서도 실천하기 위해서는 교사의 역할이 '지식 전달자'에서 '질문 촉진자' 및 '학습 설계자'로 재정의되는 노력이 필요할 것입니다.",
            9: "기존의 교과 내용을 단순히 암기하는 방식에서 벗어나, 각 단원의 '핵심 개념'과 '본질적 질문'을 중심으로 수업을 재구성하는 전략이 중요할 것입니다.",
            10: "당장 큰 변화를 시도하기보다는, 소그룹 탐구 활동을 늘리거나 특정 주제에 대한 본질적 질문을 도입하는 등 점진적인 방식으로 접근해 볼 수 있을 것 같습니다."
        }
    };

    // 현재 카테고리 결정
    let currentCategory = 'see';
    if (document.getElementById('think-results')) {
        currentCategory = 'think';
    } else if (document.getElementById('wonder-results')) {
        currentCategory = 'wonder';
    }

    return optionTexts[currentCategory][optionNumber] || `옵션 ${optionNumber}`;
}

// 카테고리 제목 가져오기
function getCategoryTitle(category) {
    const titles = {
        see: 'SEE (관찰)',
        think: 'THINK (분석)',
        wonder: 'WONDER (궁금증/성찰)'
    };
    return titles[category] || category;
}

// 총 투표 수 계산
function getTotalVotes(categoryVotes) {
    let total = 0;
    for (const key in categoryVotes) {
        total += categoryVotes[key];
    }
    return total;
}

// 관리자 확인
function checkAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('resetBtn').style.display = 'inline-block';
        document.getElementById('adminPassword').value = '';
        alert('관리자 로그인 성공!');
    } else {
        alert('비밀번호가 올바르지 않습니다.');
    }
}

// 투표 초기화
function resetVotes() {
    if (!isAdmin) {
        alert('관리자만 초기화할 수 있습니다.');
        return;
    }

    if (confirm('모든 투표를 초기화하시겠습니까?')) {
        database.ref('votes').remove()
            .then(() => {
                votes = {
                    see: {},
                    think: {},
                    wonder: {}
                };
                updateResults();
                alert('투표가 초기화되었습니다.');
            })
            .catch((error) => {
                console.error('투표 초기화 실패:', error);
                alert('투표 초기화에 실패했습니다.');
            });
    }
}

// 키보드 이벤트 처리
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'adminPassword') {
            checkAdmin();
        }
    }
}); 