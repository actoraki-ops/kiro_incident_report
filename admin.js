// 管理画面のJavaScript

let editingFAQId = null;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadAdminFAQs();
    setupForm();
});

// フォームの設定
function setupForm() {
    const form = document.getElementById('addFaqForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const category = document.getElementById('category').value;
        const question = document.getElementById('question').value.trim();
        const answer = document.getElementById('answer').value.trim();
        
        if (!category || !question || !answer) {
            alert('すべての項目を入力してください。');
            return;
        }
        
        try {
            if (editingFAQId) {
                // 編集モード
                await updateFAQ(editingFAQId, category, question, answer);
            } else {
                // 新規追加モード
                await addNewFAQ(category, question, answer);
            }
        } catch (error) {
            console.error('フォーム送信エラー:', error);
            alert('操作に失敗しました。もう一度お試しください。');
        }
    });
}

// 新しいFAQを追加
async function addNewFAQ(category, question, answer) {
    try {
        const newFAQ = await faqDB.addFAQ(category, question, answer);
        if (newFAQ) {
            alert('FAQが正常に追加されました。');
            clearForm();
            await loadAdminFAQs();
        }
    } catch (error) {
        console.error('FAQ追加エラー:', error);
        alert('FAQの追加に失敗しました。');
    }
}

// FAQを更新
async function updateFAQ(id, category, question, answer) {
    try {
        const updatedFAQ = await faqDB.updateFAQ(id, category, question, answer);
        if (updatedFAQ) {
            alert('FAQが正常に更新されました。');
            clearForm();
            await loadAdminFAQs();
            exitEditMode();
        }
    } catch (error) {
        console.error('FAQ更新エラー:', error);
        alert('FAQの更新に失敗しました。');
    }
}

// 管理画面用FAQ一覧を読み込み
async function loadAdminFAQs() {
    try {
        showLoading(true);
        const faqs = await faqDB.getAllFAQs();
        displayAdminFAQs(faqs);
    } catch (error) {
        console.error('FAQ読み込みエラー:', error);
        showError('FAQの読み込みに失敗しました。');
    } finally {
        showLoading(false);
    }
}

// 管理画面用FAQ表示
function displayAdminFAQs(faqs) {
    const container = document.getElementById('adminFaqList');
    
    if (faqs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>FAQがありません。</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = faqs.map(faq => `
        <div class="admin-faq-item">
            <div class="admin-faq-header">
                <div>
                    <strong>${escapeHtml(faq.category)}</strong>
                    <div style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">
                        作成: ${formatDate(faq.created_at)} | 更新: ${formatDate(faq.updated_at)}
                    </div>
                </div>
                <div class="admin-faq-actions">
                    <button class="edit-btn" onclick="editFAQ(${faq.id})">編集</button>
                    <button class="delete-btn" onclick="deleteFAQ(${faq.id})">削除</button>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">質問:</div>
                <div style="margin-bottom: 1rem; padding: 0.5rem; background: #f8f9fa; border-radius: 3px;">
                    ${escapeHtml(faq.question)}
                </div>
                <div style="font-weight: bold; margin-bottom: 0.5rem;">回答:</div>
                <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 3px;">
                    ${escapeHtml(faq.answer).replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
    `).join('');
}

// FAQを編集
async function editFAQ(id) {
    try {
        const faq = await faqDB.getFAQById(id);
        if (!faq) {
            alert('FAQが見つかりません。');
            return;
        }
        
        // フォームに値を設定
        document.getElementById('category').value = faq.category;
        document.getElementById('question').value = faq.question;
        document.getElementById('answer').value = faq.answer;
        
        // 編集モードに切り替え
        editingFAQId = id;
        
        // フォームのタイトルと送信ボタンを変更
        const formTitle = document.querySelector('.admin-section h2');
        formTitle.textContent = 'FAQを編集';
        
        const submitButton = document.querySelector('#addFaqForm button[type="submit"]');
        submitButton.textContent = '更新';
        
        // キャンセルボタンを追加
        if (!document.getElementById('cancelEditBtn')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.id = 'cancelEditBtn';
            cancelBtn.textContent = 'キャンセル';
            cancelBtn.style.background = '#6c757d';
            cancelBtn.onclick = exitEditMode;
            submitButton.parentNode.insertBefore(cancelBtn, submitButton.nextSibling);
        }
        
        // フォームまでスクロール
        document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('FAQ編集エラー:', error);
        alert('FAQの取得に失敗しました。');
    }
}

// 編集モードを終了
function exitEditMode() {
    editingFAQId = null;
    
    // フォームのタイトルと送信ボタンを元に戻す
    const formTitle = document.querySelector('.admin-section h2');
    formTitle.textContent = '新しいFAQを追加';
    
    const submitButton = document.querySelector('#addFaqForm button[type="submit"]');
    submitButton.textContent = '追加';
    
    // キャンセルボタンを削除
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.remove();
    }
    
    clearForm();
}

// FAQを削除
async function deleteFAQ(id) {
    try {
        const faq = await faqDB.getFAQById(id);
        if (!faq) {
            alert('FAQが見つかりません。');
            return;
        }
        
        if (confirm(`「${faq.question}」を削除しますか？\nこの操作は取り消せません。`)) {
            const result = await faqDB.deleteFAQ(id);
            if (result) {
                alert('FAQが正常に削除されました。');
                await loadAdminFAQs();
                
                // 編集中のFAQが削除された場合は編集モードを終了
                if (editingFAQId === id) {
                    exitEditMode();
                }
            }
        }
    } catch (error) {
        console.error('FAQ削除エラー:', error);
        alert('FAQの削除に失敗しました。');
    }
}

// フォームをクリア
function clearForm() {
    document.getElementById('category').value = '';
    document.getElementById('question').value = '';
    document.getElementById('answer').value = '';
}

// ローディング表示
function showLoading(show) {
    const container = document.getElementById('adminFaqList');
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
    const container = document.getElementById('adminFaqList');
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// HTMLエスケープ関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}