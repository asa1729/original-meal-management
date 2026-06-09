// --------------------------------------------------------------------------
// 状態管理（データの初期化）
// --------------------------------------------------------------------------
// LocalStorageからデータを読み込む、空なら初期オブジェクトを設定
let appData = JSON.parse(localStorage.getItem('mealAppData')) || {
    logs: {},    // 日付ごとの記録群 例: { "2026-06-09": [{name: "昼食", calories: 500, protein: 25}] }
    mymeals: []  // お気に入りメニューの配列 例: [{id: 1, name: "鶏胸肉", calories: 200, protein: 40}]
};

// データをLocalStorageに保存する共通関数
function saveToLocalStorage() {
    localStorage.setItem('mealAppData', JSON.stringify(appData));
}

// --------------------------------------------------------------------------
// DOM要素の取得
// --------------------------------------------------------------------------
const recordForm = document.getElementById('record-form');
const mealNameInput = document.getElementById('meal-name');
const mealCaloriesInput = document.getElementById('meal-calories');
const mealProteinInput = document.getElementById('meal-protein');

const mymealForm = document.getElementById('mymeal-form');
const mymealNameInput = document.getElementById('mymeal-name');
const mymealCaloriesInput = document.getElementById('mymeal-calories');
const mymealProteinInput = document.getElementById('mymeal-protein');

const mymealListContainer = document.getElementById('mymeal-list');
const logListContainer = document.getElementById('log-list');
const historyDateInput = document.getElementById('history-date');

const totalCaloriesEl = document.getElementById('total-calories');
const totalProteinEl = document.getElementById('total-protein');

// --------------------------------------------------------------------------
// 初期化処理 (アプリ起動時に動く処理)
// --------------------------------------------------------------------------
// 本日の日付（YYYY-MM-DD形式）をデフォルトに設定
const today = new Date().toISOString().split('T')[0];
historyDateInput.value = today;

// 画面の初期描画
renderMymeals();
renderDayLogs(today);

// --------------------------------------------------------------------------
// 機能1: 食事記録の追加
// --------------------------------------------------------------------------
recordForm.addEventListener('submit', function(e) {
    e.preventDefault(); // 画面リロードを防ぐ

    const date = historyDateInput.value; // 現在選択されている日付
    const name = mealNameInput.value || "無題の食事";
    const calories = parseInt(mealCaloriesInput.value, 10) || 0;
    const protein = parseFloat(mealProteinInput.value) || 0.0;

    // その日の配列がなければ作成
    if (!appData.logs[date]) {
        appData.logs[date] = [];
    }

    // データを追加
    appData.logs[date].push({ name, calories, protein });
    saveToLocalStorage();

    // フォームをクリア
    recordForm.reset();

    // 再描画
    renderDayLogs(date);
});

// --------------------------------------------------------------------------
// 機能2: mymeal (お気に入り) の登録
// --------------------------------------------------------------------------
mymealForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = mymealNameInput.value;
    const calories = parseInt(mymealCaloriesInput.value, 10) || 0;
    const protein = parseFloat(mymealProteinInput.value) || 0.0;

    // 新しいIDを発行して追加
    const newMymeal = {
        id: Date.now(), // タイムスタンプを簡易IDとして利用
        name,
        calories,
        protein
    };

    appData.mymeals.push(newMymeal);
    saveToLocalStorage();

    // フォームクリアと再描画
    mymealForm.reset();
    renderMymeals();
});

// --------------------------------------------------------------------------
// 機能3: mymeal を画面に表示する
// --------------------------------------------------------------------------
function renderMymeals() {
    mymealListContainer.innerHTML = ''; // 一旦空にする

    if (appData.mymeals.length === 0) {
        mymealListContainer.innerHTML = '<p class="help-text">登録されたmymealはありません</p>';
        return;
    }

    appData.mymeals.forEach(meal => {
        const item = document.createElement('div');
        item.className = 'mymeal-item';
        item.textContent = `${meal.name} (${meal.calories}kcal)`;
        
        // クリックした時に上の記録フォームに値をセットする処理
        item.addEventListener('click', function() {
            mealNameInput.value = meal.name;
            mealCaloriesInput.value = meal.calories;
            mealProteinInput.value = meal.protein;
        });

        mymealListContainer.appendChild(item);
    });
}

// --------------------------------------------------------------------------
// 機能4: 特定の日のログと合計値を表示する
// --------------------------------------------------------------------------
function renderDayLogs(date) {
    logListContainer.innerHTML = ''; // 一旦クリア
    
    const dayLogs = appData.logs[date] || [];
    let totalCalories = 0;
    let totalProtein = 0;

    if (dayLogs.length === 0) {
        logListContainer.innerHTML = '<li>記録がありません</li>';
    } else {
        dayLogs.forEach(log => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${log.name}</strong></span>
                <span>${log.calories} kcal / ${log.protein.toFixed(1)} g</span>
            `;
            logListContainer.appendChild(li);

            // 合計を加算
            totalCalories += log.calories;
            totalProtein += log.protein;
        });
    }

    // ダッシュボードの数値を更新
    totalCaloriesEl.textContent = totalCalories;
    totalProteinEl.textContent = totalProtein.toFixed(1);
}

// 履歴の日付を変更したときに表示を切り替える
historyDateInput.addEventListener('change', function() {
    renderDayLogs(historyDateInput.value);
});
