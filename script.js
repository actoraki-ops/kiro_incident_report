// メイン画面のJavaScript

let currentFAQs = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadAllFAQs();
});

// すべてのFAQを読み込み
async function loadAllFAQs() {
    try {
        showLoading(true);
        currentFAQs = await faqDB.getAllFAQs();
        displayFAQs(currentFAQs);
    } catch (error) {
        console.error('FAQ読み込みエラー:', error);
        showError('FAQの読み込みに失敗しました。');
    } finally {
        showLoading(false);
    }
}

// FAQを表示
function displayFAQs(faqs) {
    const container = document.getElementById('faqContainer');
    
    if (faqs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>該当するFAQが見つかりませんでした。</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = faqs.map(faq => `
        <div class="faq-item">
            <div class="faq-header" onclick="toggleFAQ(${faq.id})">
                <div>
                    <div class="faq-question">${escapeHtml(faq.question)}</div>
                    <div class="faq-category">${escapeHtml(faq.category)}</div>
                </div>
                <div class="faq-toggle" id="toggle-${faq.id}">▼</div>
            </div>
            <div class="faq-answer" id="answer-${faq.id}">
                ${escapeHtml(faq.answer).replace(/\n/g, '<br>')}
            </div>
        </div>
    `).join('');
}

// FAQ項目の開閉
function toggleFAQ(id) {
    const answer = document.getElementById(`answer-${id}`);
    const toggle = document.getElementById(`toggle-${id}`);
    
    if (answer.classList.contains('show')) {
        answer.classList.remove('show');
        toggle.classList.remove('active');
    } else {
        answer.classList.add('show');
        toggle.classList.add('active');
    }
}

// キーワード検索
async function searchFAQ() {
    const keyword = document.getElementById('searchInput').value.trim();
    const category = document.getElementById('categoryFilter').value;
    
    try {
        showLoading(true);
        let results;
        
        if (keyword && category) {
            // キーワードとカテゴリ両方で検索
            const searchResults = await faqDB.searchFAQs(keyword);
            results = searchResults.filter(faq => faq.category === category);
        } else if (keyword) {
            // キーワードのみで検索
            results = await faqDB.searchFAQs(keyword);
        } else if (category) {
            // カテゴリのみで検索
            results = await faqDB.getFAQsByCategory(category);
        } else {
            // 全件表示
            results = await faqDB.getAllFAQs();
        }
        
        currentFAQs = results;
        displayFAQs(currentFAQs);
        
        // 検索結果の表示
        if (keyword || category) {
            const resultCount = results.length;
            const searchInfo = document.createElement('div');
            searchInfo.className = 'search-result-info';
            searchInfo.innerHTML = `検索結果: ${resultCount}件`;
            
            const container = document.getElementById('faqContainer');
            container.insertBefore(searchInfo, container.firstChild);
        }
    } catch (error) {
        console.error('検索エラー:', error);
        showError('検索に失敗しました。');
    } finally {
        showLoading(false);
    }
}

// カテゴリでフィルタリング
async function filterByCategory() {
    const category = document.getElementById('categoryFilter').value;
    const keyword = document.getElementById('searchInput').value.trim();
    
    try {
        showLoading(true);
        let results;
        
        if (keyword && category) {
            // キーワードとカテゴリ両方で検索
            const searchResults = await faqDB.searchFAQs(keyword);
            results = searchResults.filter(faq => faq.category === category);
        } else if (category) {
            // カテゴリのみで検索
            results = await faqDB.getFAQsByCategory(category);
        } else if (keyword) {
            // キーワードのみで検索
            results = await faqDB.searchFAQs(keyword);
        } else {
            // 全件表示
            results = await faqDB.getAllFAQs();
        }
        
        currentFAQs = results;
        displayFAQs(currentFAQs);
    } catch (error) {
        console.error('フィルタリングエラー:', error);
        showError('フィルタリングに失敗しました。');
    } finally {
        showLoading(false);
    }
}

// 検索クリア
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    loadAllFAQs();
}

// ローディング表示
function showLoading(show) {
    const container = document.getElementById('faqContainer');
    if (show) {
        container.innerHTML = `
            <div class="loading-message">
                <p>読み込み中...</p>
            </div>
        `;
    }
}

// エラー表示
function showError(message) {
    const container = document.getElementById('faqContainer');
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// Enterキーで検索
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchFAQ();
        }
    });
});

// HTMLエスケープ関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}