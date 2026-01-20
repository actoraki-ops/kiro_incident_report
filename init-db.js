const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベースファイルのパス
const dbPath = path.join(__dirname, 'hospital_faq.db');

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
        return;
    }
    console.log('SQLiteデータベースに接続しました。');
});

// テーブル作成
const createFAQTableSQL = `
    CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

const createIncidentTableSQL = `
    CREATE TABLE IF NOT EXISTS incident_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT,
        patient_name TEXT NOT NULL,
        birth_date DATE,
        gender TEXT NOT NULL,
        reporter_job TEXT NOT NULL,
        department TEXT NOT NULL,
        experience_years INTEGER,
        reporter_type TEXT NOT NULL,
        incident_datetime DATETIME NOT NULL,
        incident_location TEXT NOT NULL,
        incident_situation TEXT NOT NULL,
        response_action TEXT NOT NULL,
        cause_factor TEXT NOT NULL,
        impact_level INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

// 初期データ
const initialData = [
    {
        category: 'インシデント分類',
        question: 'インシデントとアクシデントの違いは何ですか？',
        answer: 'インシデントは「患者に害を与えることなく、医療上望ましくない事象」で、アクシデントは「患者に実害が生じた事象」です。インシデントには「ヒヤリハット」も含まれます。'
    },
    {
        category: 'レポート作成方法',
        question: 'インシデントレポートはいつまでに提出すべきですか？',
        answer: 'インシデント発生から24時間以内の提出が原則です。緊急度の高い事例については、発見次第速やかに口頭で報告し、その後書面での報告を行ってください。'
    },
    {
        category: '緊急時対応',
        question: '重大なインシデントが発生した場合の対応手順は？',
        answer: '1. 患者の安全確保 2. 医師・看護師長への即座の報告 3. 必要に応じて医療安全管理者への連絡 4. 事実の記録と保存 5. 24時間以内のインシデントレポート提出'
    },
    {
        category: 'システム操作',
        question: 'インシデントレポートシステムにログインできません',
        answer: 'システム管理者に連絡してください。一時的にシステムが利用できない場合は、紙媒体での報告を行い、システム復旧後に入力してください。'
    },
    {
        category: 'レポート作成方法',
        question: '匿名でのレポート提出は可能ですか？',
        answer: 'はい、可能です。ただし、詳細な調査が必要な場合は、後日ヒアリングをお願いする場合があります。医療安全の向上が目的であり、個人の責任追及が目的ではありません。'
    }
];

// データベース初期化
db.serialize(() => {
    // FAQテーブル作成
    db.run(createFAQTableSQL, (err) => {
        if (err) {
            console.error('FAQテーブル作成エラー:', err.message);
            return;
        }
        console.log('FAQテーブルを作成しました。');
    });

    // インシデントレポートテーブル作成
    db.run(createIncidentTableSQL, (err) => {
        if (err) {
            console.error('インシデントレポートテーブル作成エラー:', err.message);
            return;
        }
        console.log('インシデントレポートテーブルを作成しました。');
    });

    // 既存データの確認
    db.get("SELECT COUNT(*) as count FROM faqs", (err, row) => {
        if (err) {
            console.error('データ確認エラー:', err.message);
            db.close();
            return;
        }

        if (row.count === 0) {
            // 初期データの挿入
            const insertSQL = `
                INSERT INTO faqs (category, question, answer)
                VALUES (?, ?, ?)
            `;

            const stmt = db.prepare(insertSQL);
            let insertCount = 0;
            
            initialData.forEach((faq, index) => {
                stmt.run([faq.category, faq.question, faq.answer], (err) => {
                    if (err) {
                        console.error('データ挿入エラー:', err.message);
                    }
                    insertCount++;
                    
                    // 全てのデータ挿入が完了したらデータベースを閉じる
                    if (insertCount === initialData.length) {
                        stmt.finalize((err) => {
                            if (err) {
                                console.error('ステートメント終了エラー:', err.message);
                            } else {
                                console.log('初期データを挿入しました。');
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
                    }
                });
            });
        } else {
            console.log(`既存のFAQデータが${row.count}件見つかりました。`);
            // データベース接続を閉じる
            db.close((err) => {
                if (err) {
                    console.error('データベース切断エラー:', err.message);
                } else {
                    console.log('データベース接続を閉じました。');
                }
            });
        }
    });
});

// 最後のデータベース接続を閉じる処理は上記のコールバック内で実行されるため削除