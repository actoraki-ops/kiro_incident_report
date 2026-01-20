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

// インシデントの種類カラムを追加
const addColumnSQL = `
    ALTER TABLE incident_reports 
    ADD COLUMN incident_type TEXT
`;

db.run(addColumnSQL, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('インシデントの種類カラムは既に存在します。');
        } else {
            console.error('カラム追加エラー:', err.message);
        }
    } else {
        console.log('インシデントの種類カラムを追加しました。');
    }
    
    // 既存データに「その他」を設定
    const updateSQL = `
        UPDATE incident_reports 
        SET incident_type = 'その他' 
        WHERE incident_type IS NULL
    `;
    
    db.run(updateSQL, function(err) {
        if (err) {
            console.error('既存データ更新エラー:', err.message);
        } else {
            console.log(`既存の${this.changes}件のレコードにデフォルト値を設定しました。`);
        }
        
        // データベース接続を閉じる
        db.close((err) => {
            if (err) {
                console.error('データベース切断エラー:', err.message);
            } else {
                console.log('データベース接続を閉じました。');
            }
        });
    });
});