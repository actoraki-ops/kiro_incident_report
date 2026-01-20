// APIを使用したデータベース操作クラス

class FAQDatabase {
    constructor() {
        this.baseURL = '/api/faqs';
    }

    // 全FAQを取得
    async getAllFAQs() {
        try {
            const response = await fetch(this.baseURL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('FAQ取得エラー:', error);
            return [];
        }
    }

    // 新しいFAQを追加
    async addFAQ(category, question, answer) {
        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: category,
                    question: question,
                    answer: answer
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('FAQ追加エラー:', error);
            throw error;
        }
    }

    // FAQを更新
    async updateFAQ(id, category, question, answer) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: category,
                    question: question,
                    answer: answer
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('FAQ更新エラー:', error);
            throw error;
        }
    }

    // FAQを削除
    async deleteFAQ(id) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('FAQ削除エラー:', error);
            throw error;
        }
    }

    // IDでFAQを取得
    async getFAQById(id) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('FAQ取得エラー:', error);
            return null;
        }
    }

    // カテゴリでフィルタリング
    async getFAQsByCategory(category) {
        try {
            if (!category) {
                return await this.getAllFAQs();
            }
            
            const response = await fetch(`${this.baseURL}/category/${encodeURIComponent(category)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('カテゴリ別FAQ取得エラー:', error);
            return [];
        }
    }

    // キーワード検索
    async searchFAQs(keyword) {
        try {
            if (!keyword) {
                return await this.getAllFAQs();
            }
            
            const response = await fetch(`${this.baseURL}/search/${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('FAQ検索エラー:', error);
            return [];
        }
    }

    // インシデントレポート関連メソッド
    
    // 全インシデントレポートを取得
    async getAllIncidents() {
        try {
            const response = await fetch('/api/incidents');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('インシデントレポート取得エラー:', error);
            return [];
        }
    }

    // 新しいインシデントレポートを追加
    async addIncident(incidentData) {
        try {
            console.log('API呼び出し - インシデントレポート追加:', incidentData);
            
            const response = await fetch('/api/incidents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(incidentData)
            });

            console.log('APIレスポンス status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('APIエラーレスポンス:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('APIレスポンス成功:', result);
            return result;
        } catch (error) {
            console.error('インシデントレポート追加エラー:', error);
            throw error;
        }
    }

    // インシデントレポートを削除
    async deleteIncident(id) {
        try {
            const response = await fetch(`/api/incidents/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('インシデントレポート削除エラー:', error);
            throw error;
        }
    }

    // IDでインシデントレポートを取得
    async getIncidentById(id) {
        try {
            const response = await fetch(`/api/incidents/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('インシデントレポート取得エラー:', error);
            return null;
        }
    }

    // インシデントレポートを検索
    async searchIncidents(keyword) {
        try {
            if (!keyword) {
                return await this.getAllIncidents();
            }
            
            const response = await fetch(`/api/incidents/search/${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('インシデントレポート検索エラー:', error);
            return [];
        }
    }
}

// グローバルインスタンス
const faqDB = new FAQDatabase();