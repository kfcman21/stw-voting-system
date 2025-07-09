// Firebase 초기화
if (!window.firebaseConfig) {
    console.error('Firebase 설정을 찾을 수 없습니다. firebase-config.js 파일을 확인하세요.');
}

firebase.initializeApp(window.firebaseConfig);
const database = firebase.database();



// 하트 데이터 구조
let hearts = {
    see: {},
    think: {},
    wonder: {}
};

// 공감 데이터 구조
let empathy = {
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
    console.log('실시간 리스너 설정 시작');
    
    database.ref('hearts').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('하트 데이터 수신:', data);
        if (data) {
            hearts = data;
            updateHeartCounts();
        }
    });

    database.ref('empathy').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('Firebase 공감 데이터 수신:', data);
        if (data) {
            empathy = data;
            updateEmpathyCounts();
            updateEmpathyRankings();
        }
    });
}

// 데이터 로드
function loadVotes() {
    database.ref('hearts').once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                hearts = data;
                updateHeartCounts();
            }
        })
        .catch((error) => {
            console.error('하트 데이터 로드 실패:', error);
        });

    database.ref('empathy').once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                empathy = data;
                updateEmpathyCounts();
                updateEmpathyRankings();
            }
        })
        .catch((error) => {
            console.error('공감 데이터 로드 실패:', error);
        });
}

// 공감 투표 함수
function empathyVote(category, optionNumber) {
    console.log(`공감 투표 시작: ${category}, ${optionNumber}`);
    
    // 기존 공감 데이터가 없으면 초기화
    if (!empathy[category]) {
        empathy[category] = {};
    }
    
    if (!empathy[category][optionNumber]) {
        empathy[category][optionNumber] = 0;
    }
    
    // 공감 수 증가
    empathy[category][optionNumber]++;
    
    console.log(`공감 수 증가: ${empathy[category][optionNumber]}`);
    
    // 즉시 UI 업데이트
    const empathyCountElement = document.getElementById(`empathy-count-${category}-${optionNumber}`);
    if (empathyCountElement) {
        empathyCountElement.textContent = empathy[category][optionNumber];
        console.log(`UI 업데이트: ${empathyCountElement.textContent}`);
    }
    
    // 공감 순위 즉시 업데이트
    updateEmpathyRankingOnOptions(category);
    
    // 공감 아이콘 애니메이션
    const empathyIcon = document.querySelector(`#empathy-count-${category}-${optionNumber}`).closest('.empathy-option').querySelector('.empathy-heart-icon');
    if (empathyIcon) {
        empathyIcon.style.animation = 'heartBeat 0.6s ease-in-out';
        setTimeout(() => {
            empathyIcon.style.animation = '';
        }, 600);
    }
    
    // Firebase에 저장
    database.ref(`empathy/${category}/${optionNumber}`).set(empathy[category][optionNumber])
        .then(() => {
            console.log(`${category} 카테고리 ${optionNumber}번 옵션 공감 투표 완료`);
        })
        .catch((error) => {
            console.error('공감 투표 저장 실패:', error);
            // 저장 실패 시 로컬 데이터 되돌리기
            empathy[category][optionNumber]--;
            if (empathyCountElement) {
                empathyCountElement.textContent = empathy[category][optionNumber];
            }
        });
}

// 하트 토글 함수
function toggleHeart(category, optionNumber) {
    const heartKey = `${optionNumber}`;
    
    // 기존 하트 데이터가 없으면 초기화
    if (!hearts[category]) {
        hearts[category] = {};
    }
    
    if (!hearts[category][heartKey]) {
        hearts[category][heartKey] = 0;
    }
    
    // 하트 수 증가
    hearts[category][heartKey]++;
    
    // Firebase에 저장
    database.ref(`hearts/${category}/${heartKey}`).set(hearts[category][heartKey])
        .then(() => {
            console.log(`${category} 카테고리 ${optionNumber}번 옵션 하트 완료`);
            // 하트 아이콘 애니메이션
            const heartIcon = document.getElementById(`heart-${category}-${optionNumber}`);
            if (heartIcon) {
                heartIcon.classList.add('liked');
                setTimeout(() => {
                    heartIcon.classList.remove('liked');
                }, 600);
            }
        })
        .catch((error) => {
            console.error('하트 저장 실패:', error);
        });
}



// 공감 카운트 업데이트
function updateEmpathyCounts() {
    updateCategoryEmpathyCounts('see');
    updateCategoryEmpathyCounts('think');
    updateCategoryEmpathyCounts('wonder');
}

// 공감 순위 업데이트
function updateEmpathyRankings() {
    updateEmpathyRankingOnOptions('see');
    updateEmpathyRankingOnOptions('think');
    updateEmpathyRankingOnOptions('wonder');
}

// 하트 카운트 업데이트
function updateHeartCounts() {
    updateCategoryHeartCounts('see');
    updateCategoryHeartCounts('think');
    updateCategoryHeartCounts('wonder');
}



// 각 카테고리별 공감 카운트 업데이트
function updateCategoryEmpathyCounts(category) {
    const categoryEmpathy = empathy[category] || {};
    console.log(`${category} 카테고리 공감 데이터:`, categoryEmpathy);
    
    for (let i = 1; i <= 10; i++) {
        const empathyCount = categoryEmpathy[i] || 0;
        const empathyCountElement = document.getElementById(`empathy-count-${category}-${i}`);
        
        if (empathyCountElement) {
            empathyCountElement.textContent = empathyCount;
            console.log(`${category}-${i} 공감 수 업데이트: ${empathyCount}`);
        } else {
            console.log(`${category}-${i} 요소를 찾을 수 없음`);
        }
    }
}

// 각 카테고리별 공감 순위를 옵션 옆에 표시
function updateEmpathyRankingOnOptions(category) {
    const categoryEmpathy = empathy[category] || {};
    console.log(`${category} 카테고리 순위 업데이트 시작:`, categoryEmpathy);
    
    // 공감 데이터를 배열로 변환하고 정렬
    const empathyArray = [];
    for (let i = 1; i <= 10; i++) {
        const count = categoryEmpathy[i] || 0;
        empathyArray.push({ number: i, count: count });
    }
    
    // 공감 수 기준으로 내림차순 정렬
    empathyArray.sort((a, b) => b.count - a.count);
    console.log(`${category} 정렬된 공감 배열:`, empathyArray);
    
    // 각 옵션에 순위 표시
    for (let i = 1; i <= 10; i++) {
        const optionElement = document.querySelector(`.empathy-option[onclick*="empathyVote('${category}', ${i})"]`);
        if (optionElement) {
            // 기존 순위 표시 제거
            const existingRank = optionElement.querySelector('.empathy-rank-badge');
            if (existingRank) {
                existingRank.remove();
            }
            
            // 현재 옵션의 순위 찾기
            const rankIndex = empathyArray.findIndex(item => item.number === i);
            if (rankIndex !== -1 && empathyArray[rankIndex].count > 0) {
                const rank = rankIndex + 1;
                const rankBadge = document.createElement('div');
                rankBadge.className = 'empathy-rank-badge';
                rankBadge.textContent = `${rank}위`;
                
                // 순위에 따른 색상 설정
                if (rank === 1) {
                    rankBadge.style.background = '#28a745';
                } else if (rank === 2) {
                    rankBadge.style.background = '#ffc107';
                    rankBadge.style.color = '#000';
                } else if (rank === 3) {
                    rankBadge.style.background = '#dc3545';
                } else {
                    rankBadge.style.background = '#6c757d';
                }
                
                optionElement.appendChild(rankBadge);
                console.log(`${category}-${i} 순위 배지 추가: ${rank}위`);
            }
        } else {
            console.log(`${category}-${i} 옵션 요소를 찾을 수 없음`);
        }
    }
}

// 공감 텍스트 가져오기
function getEmpathyText(category, optionNumber) {
    const empathyTexts = {
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

    return empathyTexts[category][optionNumber] || `옵션 ${optionNumber}`;
}

// 각 카테고리별 하트 카운트 업데이트
function updateCategoryHeartCounts(category) {
    const categoryHearts = hearts[category] || {};
    
    for (let i = 1; i <= 10; i++) {
        const heartCount = categoryHearts[i] || 0;
        const heartCountElement = document.getElementById(`heart-count-${category}-${i}`);
        
        if (heartCountElement) {
            heartCountElement.textContent = heartCount;
        }
    }
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

// 데이터 초기화
function resetVotes() {
    if (!isAdmin) {
        alert('관리자만 초기화할 수 있습니다.');
        return;
    }

    if (confirm('모든 하트, 공감 데이터를 초기화하시겠습니까?')) {
        Promise.all([
            database.ref('hearts').remove(),
            database.ref('empathy').remove()
        ])
        .then(() => {
            hearts = {
                see: {},
                think: {},
                wonder: {}
            };
            empathy = {
                see: {},
                think: {},
                wonder: {}
            };
            updateHeartCounts();
            updateEmpathyCounts();
            updateEmpathyRankings();
            alert('모든 데이터가 초기화되었습니다.');
        })
        .catch((error) => {
            console.error('초기화 실패:', error);
            alert('초기화에 실패했습니다.');
        });
    }
}

// 테스트 공감 투표 함수
function testEmpathyVote() {
    console.log('테스트 공감 투표 실행');
    empathyVote('see', 1);
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

// 전역 함수들을 window 객체에 등록
window.empathyVote = empathyVote;
window.toggleHeart = toggleHeart;
window.checkAdmin = checkAdmin;
window.resetVotes = resetVotes;
window.testEmpathyVote = testEmpathyVote;

 
