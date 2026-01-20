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

// テーブル一覧を取得
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
        console.error('テーブル一覧取得エラー:', err.message);
        return;
    }
    
    console.log('\n=== データベース内のテーブル ===');
    rows.forEach(row => {
        console.log('- ' + row.name);
    });
    
    // FAQテーブルの件数確認
    db.get("SELECT COUNT(*) as count FROM faqs", [], (err, row) => {
        if (err) {
            console.error('FAQ件数取得エラー:', err.message);
        } else {
            console.log(`\nFAQテーブル: ${row.count}件`);
        }
        
        // インシデントレポートテーブルの確認
        db.get("SELECT COUNT(*) as count FROM incident_reports", [], (err, row) => {
            if (err) {
                console.error('インシデントレポートテーブルが存在しません:', err.message);
                console.log('\n⚠️ インシデントレポートテーブルを作成する必要があります。');
            } else {
                console.log(`インシデントレポートテーブル: ${row.count}件`);
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
    });
});