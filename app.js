// データストレージ
let records = [];

// LocalStorageからデータを読み込み
function loadData() {
    const savedData = localStorage.getItem('streamingRecords');
    if (savedData) {
        records = JSON.parse(savedData);
    }
    updateDashboard();
    updateCalendar();
}

// データを保存
function saveData() {
    localStorage.setItem('streamingRecords', JSON.stringify(records));
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 今日の日付をデフォルトに設定
    document.getElementById('date').valueAsDate = new Date();
    
    // 星評価の初期化
    updateStarDisplay('health', 3);
    updateStarDisplay('motivation', 3);
    
    // データ読み込み
    loadData();
    
    // フォーム送信
    document.getElementById('recordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveRecord();
    });
});

// タブ切り替え
function showTab(tabName) {
    // すべてのタブを非表示
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // すべてのタブボタンを非アクティブ
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 選択されたタブを表示
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // タブボタンをアクティブ化
    event.target.classList.add('active');
    
    // 統計タブの場合はグラフを更新
    if (tabName === 'stats') {
        updateCharts();
    }
}

// 星評価の設定
function setRating(field, event) {
    if (event.target.tagName === 'SPAN') {
        const value = parseInt(event.target.getAttribute('data-value'));
        document.getElementById(field).value = value;
        updateStarDisplay(field, value);
    }
}

// 星評価の表示更新
function updateStarDisplay(field, value) {
    const container = document.getElementById(field + 'Rating');
    const stars = container.querySelectorAll('span');
    stars.forEach((star, index) => {
        if (index < value) {
            star.textContent = '★';
        } else {
            star.textContent = '☆';
        }
    });
}

// 稼働時間を計算（時間単位）
function calculateWorkingHours(startTime, endTime) {
    const start = new Date('2000-01-01 ' + startTime);
    let end = new Date('2000-01-01 ' + endTime);
    
    // 日を跨ぐ場合
    if (end < start) {
        end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
}

// 記録を保存
function saveRecord() {
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const device = document.getElementById('device').value;
    const health = parseInt(document.getElementById('health').value);
    const motivation = parseInt(document.getElementById('motivation').value);
    
    const totalCustomers = parseInt(document.getElementById('totalCustomers').value);
    const coinUsers = parseInt(document.getElementById('coinUsers').value);
    const regularCustomers = parseInt(document.getElementById('regularCustomers').value);
    const paidUsers = parseInt(document.getElementById('paidUsers').value);
    const highSpenders = parseInt(document.getElementById('highSpenders').value);
    
    const totalSales = parseInt(document.getElementById('totalSales').value);
    const entranceFee = parseInt(document.getElementById('entranceFee').value);
    const tips = parseInt(document.getElementById('tips').value);
    const specialReward = parseInt(document.getElementById('specialReward').value);
    
    const talkTheme = document.getElementById('talkTheme').value;
    const salesApproach = document.getElementById('salesApproach').value;
    const tension = document.getElementById('tension').value;
    const successMemo = document.getElementById('successMemo').value;
    const failureMemo = document.getElementById('failureMemo').value;
    
    const hasEvent = document.getElementById('hasEvent').value === 'true';
    const payday = document.getElementById('payday').value;
    
    // 自動計算
    const workingHours = calculateWorkingHours(startTime, endTime);
    const hourlyWage = workingHours > 0 ? Math.round(totalSales / workingHours) : 0;
    const paidConversionRate = totalCustomers > 0 ? (paidUsers / totalCustomers) : 0;
    const coinUserRate = totalCustomers > 0 ? (coinUsers / totalCustomers) : 0;
    const regularRate = totalCustomers > 0 ? (regularCustomers / totalCustomers) : 0;
    const highSpenderRate = totalCustomers > 0 ? (highSpenders / totalCustomers) : 0;
    const tipRate = totalSales > 0 ? (tips / totalSales) : 0;
    
    const dateObj = new Date(date);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[dateObj.getDay()];
    
    const hour = parseInt(startTime.split(':')[0]);
    let timeCategory;
    if (hour < 6) timeCategory = '深夜';
    else if (hour < 12) timeCategory = '午前';
    else if (hour < 17) timeCategory = '午後';
    else timeCategory = '夜';
    
    const record = {
        date, startTime, endTime, device, health, motivation,
        totalCustomers, coinUsers, regularCustomers, paidUsers, highSpenders,
        totalSales, entranceFee, tips, specialReward,
        talkTheme, salesApproach, tension, successMemo, failureMemo,
        hasEvent, payday,
        workingHours, hourlyWage, paidConversionRate, coinUserRate,
        regularRate, highSpenderRate, tipRate, weekday, timeCategory
    };
    
    records.push(record);
    saveData();
    
    alert('✅ 記録を保存しました！');
    document.getElementById('recordForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    updateStarDisplay('health', 3);
    updateStarDisplay('motivation', 3);
    
    updateDashboard();
    updateCalendar();
    
    showTab('home');
}

// ダッシュボード更新
function updateDashboard() {
    if (records.length === 0) {
        document.getElementById('total-sales').textContent = '¥0';
        document.getElementById('avg-hourly').textContent = '¥0';
        document.getElementById('total-sessions').textContent = '0';
        document.getElementById('avg-customers').textContent = '0';
        return;
    }
    
    const totalSales = records.reduce((sum, r) => sum + r.totalSales, 0);
    const avgHourlyWage = Math.round(records.reduce((sum, r) => sum + r.hourlyWage, 0) / records.length);
    const totalSessions = records.length;
    const avgCustomers = Math.round(records.reduce((sum, r) => sum + r.totalCustomers, 0) / records.length);
    
    document.getElementById('total-sales').textContent = '¥' + totalSales.toLocaleString();
    document.getElementById('avg-hourly').textContent = '¥' + avgHourlyWage.toLocaleString();
    document.getElementById('total-sessions').textContent = totalSessions;
    document.getElementById('avg-customers').textContent = avgCustomers;
    
    // ホーム画面の円グラフ更新
    updateHomePieChart();
}

// ホーム画面の売上内訳円グラフ
function updateHomePieChart() {
    const canvas = document.getElementById('salesPieChart');
    if (!canvas) return;
    
    const totalEntrance = records.reduce((sum, r) => sum + r.entranceFee, 0);
    const totalTips = records.reduce((sum, r) => sum + r.tips, 0);
    const totalSpecial = records.reduce((sum, r) => sum + r.specialReward, 0);
    
    if (window.homePieChart) {
        window.homePieChart.destroy();
    }
    
    window.homePieChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['入場料', 'チップ', '特別報酬'],
            datasets: [{
                data: [totalEntrance, totalTips, totalSpecial],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 14 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ¥${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// カレンダー更新
function updateCalendar() {
    const days = document.querySelectorAll('.calendar-day');
    days.forEach(day => {
        day.classList.remove('has-data');
    });
    
    records.forEach(record => {
        const date = new Date(record.date);
        const dayNum = date.getDate();
        const dayElements = Array.from(days).filter(el => el.textContent == dayNum);
        dayElements.forEach(el => el.classList.add('has-data'));
    });
}

// 日付詳細表示
function showDayDetail(date) {
    const dayRecords = records.filter(r => r.date === date);
    const detailDiv = document.getElementById('dayDetail');
    const contentDiv = document.getElementById('dayDetailContent');
    
    if (dayRecords.length === 0) {
        detailDiv.classList.add('hidden');
        return;
    }
    
    detailDiv.classList.remove('hidden');
    
    const record = dayRecords[0];
    contentDiv.innerHTML = `
        <div class="mb-3">
            <div class="text-gray-600 text-sm">日付</div>
            <div class="text-lg font-bold">${record.date} (${record.weekday})</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
            <div>
                <div class="text-gray-600 text-sm">総売上</div>
                <div class="text-xl font-bold text-indigo-600">¥${record.totalSales.toLocaleString()}</div>
            </div>
            <div>
                <div class="text-gray-600 text-sm">時給</div>
                <div class="text-xl font-bold text-indigo-600">¥${record.hourlyWage.toLocaleString()}</div>
            </div>
            <div>
                <div class="text-gray-600 text-sm">稼働時間</div>
                <div class="text-lg font-semibold">${record.workingHours.toFixed(1)}時間</div>
            </div>
            <div>
                <div class="text-gray-600 text-sm">総客数</div>
                <div class="text-lg font-semibold">${record.totalCustomers}人</div>
            </div>
            <div>
                <div class="text-gray-600 text-sm">体調</div>
                <div class="text-lg">${'★'.repeat(record.health)}${'☆'.repeat(5-record.health)}</div>
            </div>
            <div>
                <div class="text-gray-600 text-sm">モチベ</div>
                <div class="text-lg">${'★'.repeat(record.motivation)}${'☆'.repeat(5-record.motivation)}</div>
            </div>
        </div>
        ${record.hasEvent ? '<div class="mt-3 text-sm text-purple-600 font-semibold">🎉 イベント開催日</div>' : ''}
        ${record.successMemo ? `<div class="mt-3"><div class="text-gray-600 text-sm">成功メモ</div><div class="text-sm">${record.successMemo}</div></div>` : ''}
    `;
}

// グラフ更新
function updateCharts() {
    updateSalesBreakdownChart();
    updateDailySalesChart();
    updateCustomerFunnelChart();
    updateWeekdayChart();
}

// 売上内訳円グラフ
function updateSalesBreakdownChart() {
    const canvas = document.getElementById('salesBreakdownChart');
    if (!canvas) return;
    
    const totalEntrance = records.reduce((sum, r) => sum + r.entranceFee, 0);
    const totalTips = records.reduce((sum, r) => sum + r.tips, 0);
    const totalSpecial = records.reduce((sum, r) => sum + r.specialReward, 0);
    
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    window.salesChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['入場料', 'チップ', '特別報酬'],
            datasets: [{
                data: [totalEntrance, totalTips, totalSpecial],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 14 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ¥${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 日別売上推移グラフ
function updateDailySalesChart() {
    const canvas = document.getElementById('dailySalesChart');
    if (!canvas) return;
    
    const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
    const dates = sortedRecords.map(r => r.date);
    const sales = sortedRecords.map(r => r.totalSales);
    
    if (window.dailyChart) {
        window.dailyChart.destroy();
    }
    
    window.dailyChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '売上（円）',
                data: sales,
                borderColor: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// 客ファネル円グラフ
function updateCustomerFunnelChart() {
    const canvas = document.getElementById('customerFunnelChart');
    if (!canvas) return;
    
    const avgTotal = records.reduce((sum, r) => sum + r.totalCustomers, 0) / records.length || 0;
    const avgCoin = records.reduce((sum, r) => sum + r.coinUsers, 0) / records.length || 0;
    const avgPaid = records.reduce((sum, r) => sum + r.paidUsers, 0) / records.length || 0;
    
    if (window.funnelChart) {
        window.funnelChart.destroy();
    }
    
    window.funnelChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['総客数', 'コインあり', '有料移行'],
            datasets: [{
                data: [avgTotal, avgCoin, avgPaid],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(34, 197, 94, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 14 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.toFixed(1);
                            return `${label}: ${value}人`;
                        }
                    }
                }
            }
        }
    });
}

// 曜日別平均時給グラフ
function updateWeekdayChart() {
    const canvas = document.getElementById('weekdayChart');
    if (!canvas) return;
    
    const weekdays = ['月', '火', '水', '木', '金', '土', '日'];
    const weekdayData = weekdays.map(day => {
        const dayRecords = records.filter(r => r.weekday === day);
        if (dayRecords.length === 0) return 0;
        return dayRecords.reduce((sum, r) => sum + r.hourlyWage, 0) / dayRecords.length;
    });
    
    if (window.weekdayChartObj) {
        window.weekdayChartObj.destroy();
    }
    
    window.weekdayChartObj = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: weekdays,
            datasets: [{
                label: '平均時給（円）',
                data: weekdayData,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Service Worker登録（PWA対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}