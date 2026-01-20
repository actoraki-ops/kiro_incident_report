// インシデントレポート作成画面のJavaScript

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    setupForm();
    loadDraftIfExists();
});

// フォームの設定
function setupForm() {
    const form = document.getElementById('incidentReportForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitReport();
    });
}

// レポートを提出
async function submitReport() {
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    try {
        showLoading(true);
        const result = await faqDB.addIncident(formData);
        
        if (result) {
            alert('インシデントレポートが正常に提出されました。\nレポートID: ' + result.id);
            clearForm();
            clearDraft();
            // レポート一覧画面に移動するか確認
            if (confirm('レポート一覧画面を表示しますか？')) {
                window.location.href = 'incident-list.html';
            }
        }
    } catch (error) {
        console.error('レポート提出エラー:', error);
        alert('レポートの提出に失敗しました。もう一度お試しください。');
    } finally {
        showLoading(false);
    }
}

// フォームデータを取得
function getFormData() {
    return {
        patient_id: document.getElementById('patientId').value.trim(),
        patient_name: document.getElementById('patientName').value.trim(),
        birth_date: document.getElementById('birthDate').value,
        gender: document.getElementById('gender').value,
        reporter_job: document.getElementById('reporterJob').value,
        department: document.getElementById('department').value.trim(),
        experience_years: document.getElementById('experienceYears').value ? parseInt(document.getElementById('experienceYears').value) : null,
        reporter_type: document.getElementById('reporterType').value,
        incident_datetime: document.getElementById('incidentDatetime').value,
        incident_location: document.getElementById('incidentLocation').value.trim(),
        incident_situation: document.getElementById('incidentSituation').value.trim(),
        response_action: document.getElementById('responseAction').value.trim(),
        cause_factor: document.getElementById('causeFactor').value.trim(),
        impact_level: document.getElementById('impactLevel').value
    };
}

// フォームバリデーション
function validateForm(data) {
    const requiredFields = [
        { field: 'patient_name', name: '患者氏名' },
        { field: 'gender', name: '性別' },
        { field: 'reporter_job', name: '報告者職種' },
        { field: 'department', name: '部署' },
        { field: 'reporter_type', name: '報告者区分' },
        { field: 'incident_datetime', name: '発生日時' },
        { field: 'incident_location', name: '発生場所' },
        { field: 'incident_situation', name: '発生状況' },
        { field: 'response_action', name: '対応' },
        { field: 'cause_factor', name: '要因' },
        { field: 'impact_level', name: '影響度分類レベル' }
    ];
    
    for (const { field, name } of requiredFields) {
        if (!data[field] || data[field] === '') {
            alert(`${name}は必須項目です。`);
            document.getElementById(field.replace('_', '')).focus();
            return false;
        }
    }
    
    // 発生日時が未来でないかチェック
    const incidentDate = new Date(data.incident_datetime);
    const now = new Date();
    if (incidentDate > now) {
        alert('発生日時は現在時刻より前の時刻を入力してください。');
        document.getElementById('incidentDatetime').focus();
        return false;
    }
    
    return true;
}

// フォームをクリア
function clearForm() {
    document.getElementById('incidentReportForm').reset();
}

// 下書き保存
function saveDraft() {
    const formData = getFormData();
    localStorage.setItem('incident_draft', JSON.stringify(formData));
    alert('下書きを保存しました。');
}

// 下書きを読み込み
function loadDraftIfExists() {
    const draft = localStorage.getItem('incident_draft');
    if (draft) {
        if (confirm('保存された下書きがあります。読み込みますか？')) {
            const data = JSON.parse(draft);
            loadFormData(data);
        }
    }
}

// フォームにデータを読み込み
function loadFormData(data) {
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key.replace('_', ''));
        if (element && data[key] !== null && data[key] !== '') {
            element.value = data[key];
        }
    });
}

// 下書きをクリア
function clearDraft() {
    localStorage.removeItem('incident_draft');
}

// ローディング表示
function showLoading(show) {
    const submitButton = document.querySelector('button[type="submit"]');
    if (show) {
        submitButton.disabled = true;
        submitButton.textContent = '提出中...';
    } else {
        submitButton.disabled = false;
        submitButton.textContent = 'レポートを提出';
    }
}

// 自動保存機能（5分ごと）
setInterval(() => {
    const formData = getFormData();
    // 何かしらの入力があれば自動保存
    if (formData.patient_name || formData.incident_situation) {
        localStorage.setItem('incident_draft_auto', JSON.stringify(formData));
    }
}, 5 * 60 * 1000); // 5分

// ページ離脱時の警告
window.addEventListener('beforeunload', function(e) {
    const formData = getFormData();
    // フォームに入力があり、まだ提出していない場合
    if (formData.patient_name || formData.incident_situation) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});