// インシデントレポート一覧画面のJavaScript

let currentReports = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadAllReports();
});

// 全レポートを読み込み
async function loadAllReports() {
    try {
        showLoading(true);
        currentReports = await faqDB.getAllIncidents();
        displayReports(currentReports);
        updateStats(currentReports);
    } catch (error) {
        console.error('レポート読み込みエラー:', error);
        showError('レポートの読み込みに失敗しました。');
    } finally {
        showLoading(false);
    }
}

// レポートを表示
function displayReports(reports) {
    const container = document.getElementById('reportsContainer');
    
    if (reports.length === 0) {
        container.innerHTML = `
            <div class="loading-message">
                <p>レポートがありません。</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reports.map(report => `
        <div class="report-item">
            <div class="report-header">
                <div class="report-title">
                    <h3>患者: ${escapeHtml(report.patient_name)}</h3>
                    <span class="impact-level impact-level-${report.impact_level}">
                        レベル ${report.impact_level}
                    </span>
                </div>
                <div class="report-meta">
                    <div class="report-meta-item">
                        <span class="report-meta-label">発生日時</span>
                        <span>${formatDateTime(report.incident_datetime)}</span>
                    </div>
                    <div class="report-meta-item">
                        <span class="report-meta-label">発生場所</span>
                        <span>${escapeHtml(report.incident_location)}</span>
                    </div>
                    <div class="report-meta-item">
                        <span class="report-meta-label">報告者</span>
                        <span>${escapeHtml(report.reporter_job)} (${escapeHtml(report.department)})</span>
                    </div>
                    <div class="report-meta-item">
                        <span class="report-meta-label">報告日</span>
                        <span>${formatDateTime(report.created_at)}</span>
                    </div>
                </div>
            </div>
            <div class="report-content">
                <div class="report-section">
                    <h4>発生状況</h4>
                    <p>${escapeHtml(report.incident_situation).replace(/\n/g, '<br>')}</p>
                </div>
                <div class="report-section">
                    <h4>対応</h4>
                    <p>${escapeHtml(report.response_action).replace(/\n/g, '<br>')}</p>
                </div>
                <div class="report-section">
                    <h4>要因</h4>
                    <p>${escapeHtml(report.cause_factor).replace(/\n/g, '<br>')}</p>
                </div>
                <div style="text-align: right; margin-top: 1rem;">
                    <button onclick="deleteReport(${report.id})" class="delete-btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        削除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 統計情報を更新
function updateStats(reports) {
    const totalReports = reports.length;
    
    // 今月のレポート数
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyReports = reports.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
    }).length;
    
    // 高レベル事例（レベル3b以上）
    const highLevelReports = reports.filter(report => {
        const level = report.impact_level;
        return level === '3b' || level === '4' || level === '5';
    }).length;
    
    document.getElementById('totalReports').textContent = totalReports;
    document.getElementById('monthlyReports').textContent = monthlyReports;
    document.getElementById('highLevelReports').textContent = highLevelReports;
}

// レポート検索
async function searchReports() {
    const keyword = document.getElementById('searchInput').value.trim();
    
    try {
        showLoading(true);
        let results;
        
        if (keyword) {
            results = await faqDB.searchIncidents(keyword);
        } else {
            results = await faqDB.getAllIncidents();
        }
        
        // フィルターを適用
        results = applyFilters(results);
        
        currentReports = results;
        displayReports(currentReports);
        updateStats(currentReports);
        
    } catch (error) {
        console.error('検索エラー:', error);
        showError('検索に失敗しました。');
    } finally {
        showLoading(false);
    }
}

// フィルターを適用
function applyFilters(reports) {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const impactLevelFilter = document.getElementById('impactLevelFilter').value;
    
    let filtered = reports;
    
    if (departmentFilter) {
        filtered = filtered.filter(report => report.department === departmentFilter);
    }
    
    if (impactLevelFilter) {
        filtered = filtered.filter(report => report.impact_level === impactLevelFilter);
    }
    
    return filtered;
}

// フィルターでレポートを絞り込み
async function filterReports() {
    try {
        showLoading(true);
        const allReports = await faqDB.getAllIncidents();
        const filtered = applyFilters(allReports);
        
        currentReports = filtered;
        displayReports(currentReports);
        updateStats(currentReports);
        
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
    document.getElementById('departmentFilter').value = '';
    document.getElementById('impactLevelFilter').value = '';
    loadAllReports();
}

// レポートを削除
async function deleteReport(id) {
    if (!confirm('このインシデントレポートを削除しますか？\nこの操作は取り消せません。')) {
        return;
    }
    
    try {
        const result = await faqDB.deleteIncident(id);
        if (result) {
            alert('レポートが正常に削除されました。');
            await loadAllReports();
        }
    } catch (error) {
        console.error('レポート削除エラー:', error);
        alert('レポートの削除に失敗しました。');
    }
}

// ローディング表示
function showLoading(show) {
    const container = document.getElementById('reportsContainer');
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
    const container = document.getElementById('reportsContainer');
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// 日時フォーマット
function formatDateTime(dateString) {
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

// Enterキーで検索
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchReports();
        }
    });
});