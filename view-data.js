const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベース接続
const dbPath = path.join(__dirname, 'hospital_faq.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
        return;
    }
    console.log('SQLiteデータベースに接続しました。');
});

// インシデントレポートテーブルの構造を確認
db.all("PRAGMA table_info(incident_reports)", [], (err, rows) => {
    if (err) {
        console.error('テーブル構造取得エラー:', err.message);
        return;
    }
    
    console.log('\n=== インシデントレポートテーブル構造 ===');
    rows.forEach(row => {
        console.log(`${row.name}: ${row.type} ${row.notnull ? '(NOT NULL)' : ''} ${row.pk ? '(PRIMARY KEY)' : ''}`);
    });
});

// インシデントレポートの全データを表示
db.all("SELECT * FROM incident_reports", [], (err, rows) => {
    if (err) {
        console.error('インシデントレポート取得エラー:', err.message);
        return;
    }
    
    console.log('\n=== インシデントレポートデータ ===');
    if (rows.length === 0) {
        console.log('データがありません。');
    } else {
        rows.forEach((row, index) => {
            console.log(`\n--- レポート ${index + 1} (ID: ${row.id}) ---`);
            console.log(`患者氏名: ${row.patient_name}`);
            console.log(`性別: ${row.gender}`);
            console.log(`報告者職種: ${row.reporter_job}`);
            console.log(`部署: ${row.department}`);
            console.log(`発生日時: ${row.incident_datetime}`);
            console.log(`発生場所: ${row.incident_location}`);
            console.log(`影響度レベル: ${row.impact_level}`);
            console.log(`作成日時: ${row.created_at}`);
        });
    }
    
    // データベース接続を閉じる
    db.close((err) => {
        if (err) {
            console.error('データベース切断エラー:', err.message);
        } else {
            console.log('\nデータベース接続を閉じました。');
        }
    });
});