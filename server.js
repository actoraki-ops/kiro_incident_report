const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 現在のディレクトリから静的ファイルを配信

// データベース接続
const dbPath = path.join(__dirname, 'hospital_faq.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
    } else {
        console.log('SQLiteデータベースに接続しました。');
    }
});

// 静的ファイルの提供
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/incident-report', (req, res) => {
    res.sendFile(path.join(__dirname, 'incident-report.html'));
});

app.get('/incident-list', (req, res) => {
    res.sendFile(path.join(__dirname, 'incident-list.html'));
});

// API エンドポイント

// 全FAQを取得
app.get('/api/faqs', (req, res) => {
    const sql = 'SELECT * FROM faqs ORDER BY created_at DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('FAQ取得エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        res.json(rows);
    });
});

// IDでFAQを取得
app.get('/api/faqs/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM faqs WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('FAQ取得エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'FAQが見つかりません' });
            return;
        }
        
        res.json(row);
    });
});

// FAQを検索
app.get('/api/faqs/search/:keyword', (req, res) => {
    const keyword = req.params.keyword;
    const sql = `
        SELECT * FROM faqs 
        WHERE question LIKE ? OR answer LIKE ? OR category LIKE ?
        ORDER BY created_at DESC
    `;
    const searchTerm = `%${keyword}%`;
    
    db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error('FAQ検索エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        res.json(rows);
    });
});

// カテゴリでFAQを取得
app.get('/api/faqs/category/:category', (req, res) => {
    const category = req.params.category;
    const sql = 'SELECT * FROM faqs WHERE category = ? ORDER BY created_at DESC';
    
    db.all(sql, [category], (err, rows) => {
        if (err) {
            console.error('FAQ取得エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        res.json(rows);
    });
});

// 新しいFAQを追加
app.post('/api/faqs', (req, res) => {
    const { category, question, answer } = req.body;
    
    if (!category || !question || !answer) {
        res.status(400).json({ error: '必要な項目が不足しています' });
        return;
    }
    
    const sql = `
        INSERT INTO faqs (category, question, answer, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [category, question, answer], function(err) {
        if (err) {
            console.error('FAQ追加エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        
        // 追加されたFAQを取得して返す
        db.get('SELECT * FROM faqs WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                console.error('FAQ取得エラー:', err.message);
                res.status(500).json({ error: 'データベースエラー' });
                return;
            }
            res.status(201).json(row);
        });
    });
});

// FAQを更新
app.put('/api/faqs/:id', (req, res) => {
    const id = req.params.id;
    const { category, question, answer } = req.body;
    
    if (!category || !question || !answer) {
        res.status(400).json({ error: '必要な項目が不足しています' });
        return;
    }
    
    const sql = `
        UPDATE faqs 
        SET category = ?, question = ?, answer = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [category, question, answer, id], function(err) {
        if (err) {
            console.error('FAQ更新エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'FAQが見つかりません' });
            return;
        }
        
        // 更新されたFAQを取得して返す
        db.get('SELECT * FROM faqs WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('FAQ取得エラー:', err.message);
                res.status(500).json({ error: 'データベースエラー' });
                return;
            }
            res.json(row);
        });
    });
});

// FAQを削除
app.delete('/api/faqs/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM faqs WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('FAQ削除エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'FAQが見つかりません' });
            return;
        }
        
        res.json({ message: 'FAQが正常に削除されました', deletedId: id });
});

// インシデントレポート API エンドポイント

// 全インシデントレポートを取得
app.get('/api/incidents', (req, res) => {
    const sql = 'SELECT * FROM incident_reports ORDER BY created_at DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('インシデントレポート取得エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        res.json(rows);
    });
});

// IDでインシデントレポートを取得
app.get('/api/incidents/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM incident_reports WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('インシデントレポート取得エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'インシデントレポートが見つかりません' });
            return;
        }
        
        res.json(row);
    });
});

// インシデントレポートを検索
app.get('/api/incidents/search/:keyword', (req, res) => {
    const keyword = req.params.keyword;
    const sql = `
        SELECT * FROM incident_reports 
        WHERE patient_name LIKE ? OR department LIKE ? OR incident_location LIKE ?
        ORDER BY created_at DESC
    `;
    const searchTerm = `%${keyword}%`;
    
    db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error('インシデントレポート検索エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        res.json(rows);
    });
});

// 新しいインシデントレポートを追加
app.post('/api/incidents', (req, res) => {
    const {
        patient_id, patient_name, birth_date, gender, reporter_job, department,
        experience_years, reporter_type, incident_datetime, incident_location,
        incident_situation, response_action, cause_factor, impact_level
    } = req.body;
    
    if (!patient_name || !gender || !reporter_job || !department || !reporter_type ||
        !incident_datetime || !incident_location || !incident_situation ||
        !response_action || !cause_factor || impact_level === undefined) {
        res.status(400).json({ error: '必要な項目が不足しています' });
        return;
    }
    
    const sql = `
        INSERT INTO incident_reports (
            patient_id, patient_name, birth_date, gender, reporter_job, department,
            experience_years, reporter_type, incident_datetime, incident_location,
            incident_situation, response_action, cause_factor, impact_level,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [
        patient_id, patient_name, birth_date, gender, reporter_job, department,
        experience_years, reporter_type, incident_datetime, incident_location,
        incident_situation, response_action, cause_factor, impact_level
    ], function(err) {
        if (err) {
            console.error('インシデントレポート追加エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        
        // 追加されたレポートを取得して返す
        db.get('SELECT * FROM incident_reports WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                console.error('インシデントレポート取得エラー:', err.message);
                res.status(500).json({ error: 'データベースエラー' });
                return;
            }
            res.status(201).json(row);
        });
    });
});

// インシデントレポートを削除
app.delete('/api/incidents/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM incident_reports WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('インシデントレポート削除エラー:', err.message);
            res.status(500).json({ error: 'データベースエラー' });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'インシデントレポートが見つかりません' });
            return;
        }
        
        res.json({ message: 'インシデントレポートが正常に削除されました', deletedId: id });
    });
    });
});

// エラーハンドリング
app.use((err, req, res, next) => {
    console.error('サーバーエラー:', err.stack);
    res.status(500).json({ error: 'サーバー内部エラー' });
});

// 404ハンドリング
app.use((req, res) => {
    res.status(404).json({ error: 'ページが見つかりません' });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
    console.log(`メイン画面: http://localhost:${PORT}`);
    console.log(`管理画面: http://localhost:${PORT}/admin`);
});

// プロセス終了時にデータベース接続を閉じる
process.on('SIGINT', () => {
    console.log('\nサーバーを終了しています...');
    db.close((err) => {
        if (err) {
            console.error('データベース切断エラー:', err.message);
        } else {
            console.log('データベース接続を閉じました。');
        }
        process.exit(0);
    });
});