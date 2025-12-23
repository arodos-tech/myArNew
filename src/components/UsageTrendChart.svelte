<script>
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";

  export let userId = null;
  
  let chart;
  let activeTab = "daily";
  let chartData = [];
  let loading = true;

  // Sample data structure for your logs_data table
  const sampleLogsData = [
    { id: 3720017, user: 930001, filter: 0, session: "863a4d84922741e499bff3a361f12c", type: "photoShare", timestamp: "2025-12-16T20:14:27.011Z" },
    { id: 3720016, user: 930001, filter: 0, session: "863a4d84922741e499bff3a361f12c", type: "webShare", timestamp: "2025-12-16T20:14:26.576Z" },
    { id: 3720015, user: 930001, filter: 0, session: "863a4d84922741e499bff3a361f12c", type: "shareOpened", timestamp: "2025-12-16T20:14:21.758Z" },
    { id: 3720014, user: 930001, filter: 0, session: "863a4d84922741e499bff3a361f12c", type: "filterUsed", timestamp: "2025-12-16T20:14:13.549Z" },
    { id: 3720013, user: 930001, filter: 0, session: "863a4d84922741e499bff3a361f12c", type: "photoCapture", timestamp: "2025-12-16T20:14:12.553Z" },
    { id: 3720012, user: 930001, filter: 0, session: "863a4d84922741e499bff3a361f12c", type: "cameraAccessAttempt", timestamp: "2025-12-16T20:13:50.732Z" },
    { id: 3720011, user: 930001, filter: 0, session: "863a4d84922741e499bff3a361f12c", type: "openLink", timestamp: "2025-12-16T20:13:50.054Z" },
    { id: 3720010, user: 930001, filter: 0, session: "863a4d84922741e499bff3a361f12c", type: "mobile_open", timestamp: "2025-12-16T20:13:49.227Z" },
    { id: 3720009, user: 300001, filter: 0, session: "e0b05fa9fca0445f89b1432fdf9770", type: "qrOpen", timestamp: "2025-12-16T20:10:32.092Z" },
    { id: 3720008, user: 300001, filter: 1950001, session: "34489774fca8458e85687d2abb08eb", type: "twitterShare", timestamp: "2025-12-16T19:45:15.123Z" }
  ];

  // Process real API data
  function processApiData(apiData, period) {
    if (!apiData || !apiData.result) return [];
    
    const timestamps = apiData.result.map(item => new Date(item.timestamp));
    
    if (period === "daily") {
      const hourlyData = {};
      timestamps.forEach(date => {
        const hour = date.getHours();
        const dateKey = date.toDateString();
        const key = `${hour}:00`;
        hourlyData[key] = (hourlyData[key] || 0) + 1;
      });
      
      const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
      return hours.map(hour => ({
        label: hour,
        count: hourlyData[hour] || 0
      }));
    }
    
    return [];
  }

  // Simulate database queries
  async function fetchUsageData(period) {
    loading = true;
    
    try {
      chartData = generateSampleData(period);
      updateChart();
    } catch (error) {
      console.error("Error fetching usage data:", error);
      chartData = generateSampleData(period);
      updateChart();
    } finally {
      loading = false;
    }
  }

  // Function to update chart with real API data
  export function updateWithApiData(apiData) {
    if (apiData) {
      chartData = processApiData(apiData, activeTab);
      updateChart();
    }
  }

  // Simulate daily usage query
  async function getDailyUsage() {
    // SQL: SELECT DATE(timestamp) as date, COUNT(*) as usage_count FROM logs_data WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(timestamp) ORDER BY date;
    
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate counting logs for each day
      const dayLogs = sampleLogsData.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === date.toDateString();
      });
      
      last7Days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        count: dayLogs.length + Math.floor(Math.random() * 50) + 20 // Add some variation
      });
    }
    
    return last7Days;
  }

  // Simulate weekly usage query
  async function getWeeklyUsage() {
    // SQL: SELECT YEARWEEK(timestamp) as week, COUNT(*) as usage_count FROM logs_data WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK) GROUP BY YEARWEEK(timestamp) ORDER BY week;
    
    const last8Weeks = [];
    const today = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      
      last8Weeks.push({
        label: `Week ${8 - i}`,
        date: weekStart.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 200) + 100
      });
    }
    
    return last8Weeks;
  }

  // Simulate monthly usage query
  async function getMonthlyUsage() {
    // SQL: SELECT DATE_FORMAT(timestamp, '%Y-%m') as month, COUNT(*) as usage_count FROM logs_data WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(timestamp, '%Y-%m') ORDER BY month;
    
    const last12Months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      last12Months.push({
        label: month.toLocaleDateString('en-US', { month: 'short' }),
        date: month.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 800) + 400
      });
    }
    
    return last12Months;
  }

  function generateSampleData(period) {
    switch (period) {
      case "daily":
        return [
          { label: "Mon", count: 65 },
          { label: "Tue", count: 85 },
          { label: "Wed", count: 95 },
          { label: "Thu", count: 120 },
          { label: "Fri", count: 135 },
          { label: "Sat", count: 210 },
          { label: "Sun", count: 175 }
        ];
      case "weekly":
        return [
          { label: "Week 1", count: 450 },
          { label: "Week 2", count: 520 },
          { label: "Week 3", count: 380 },
          { label: "Week 4", count: 680 },
          { label: "Week 5", count: 590 },
          { label: "Week 6", count: 720 },
          { label: "Week 7", count: 650 },
          { label: "Week 8", count: 780 }
        ];
      case "monthly":
        return [
          { label: "Jan", count: 1200 },
          { label: "Feb", count: 1450 },
          { label: "Mar", count: 1100 },
          { label: "Apr", count: 1680 },
          { label: "May", count: 1590 },
          { label: "Jun", count: 1820 },
          { label: "Jul", count: 1750 },
          { label: "Aug", count: 1980 },
          { label: "Sep", count: 1650 },
          { label: "Oct", count: 1890 },
          { label: "Nov", count: 2100 },
          { label: "Dec", count: 2250 }
        ];
      default:
        return [];
    }
  }

  function updateChart() {
    if (!chart || !chartData.length) return;

    const data = chartData.map(item => item.count);
    const maxValue = Math.max(...data);
    
    chart.data.labels = chartData.map(item => item.label);
    chart.data.datasets[0].data = data;
    
    // Update Y-axis scale
    if (maxValue <= 20) {
      chart.options.scales.y.max = 20;
      chart.options.scales.y.ticks.stepSize = 5;
    } else {
      chart.options.scales.y.max = Math.ceil(maxValue / 20) * 20;
      chart.options.scales.y.ticks.stepSize = 20;
    }
    
    chart.update();
  }

  function switchTab(tab) {
    activeTab = tab;
    fetchUsageData(tab);
  }

  onMount(async () => {
    Chart.register(...registerables);

    const ctx = document.getElementById("usageTrendChart");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Usage",
          data: [],
          borderColor: "#3b82f6",
          backgroundColor: "transparent",
          borderWidth: 2,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#3b82f6",
          pointRadius: 4,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function(context) {
                return chartData[context[0].dataIndex]?.date || context[0].label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "#e5e7eb",
              borderDash: [2, 2],
            },
            ticks: {
              color: "#6b7280",
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#6b7280",
            },
          },
        },
      },
    });

    // Load initial data
    await fetchUsageData(activeTab);
  });
</script>

<div class="usage-trend-container">
  <div class="header">
    <h3>Usage Trend</h3>
    <div class="tab-buttons">
      <button 
        class="tab-btn {activeTab === 'daily' ? 'active' : ''}"
        on:click={() => switchTab('daily')}
        disabled={loading}
      >
        Daily
      </button>
      <button 
        class="tab-btn {activeTab === 'weekly' ? 'active' : ''}"
        on:click={() => switchTab('weekly')}
        disabled={loading}
      >
        Weekly
      </button>
      <button 
        class="tab-btn {activeTab === 'monthly' ? 'active' : ''}"
        on:click={() => switchTab('monthly')}
        disabled={loading}
      >
        Monthly
      </button>
    </div>
  </div>

  <div class="chart-container">
    {#if loading}
      <div class="loading">Loading...</div>
    {/if}
    <canvas id="usageTrendChart"></canvas>
  </div>

  <!-- Data Summary -->
  {#if chartData.length > 0 && !loading}
    <div class="summary">
      <div class="summary-item">
        <span class="label">Total:</span>
        <span class="value">{chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}</span>
      </div>
      <div class="summary-item">
        <span class="label">Average:</span>
        <span class="value">{Math.round(chartData.reduce((sum, item) => sum + item.count, 0) / chartData.length).toLocaleString()}</span>
      </div>
      <div class="summary-item">
        <span class="label">Peak:</span>
        <span class="value">{Math.max(...chartData.map(item => item.count)).toLocaleString()}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .usage-trend-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .tab-buttons {
    display: flex;
    gap: 0;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
  }

  .tab-btn {
    background: transparent;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tab-btn.active {
    background: white;
    color: #1f2937;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .chart-container {
    position: relative;
    height: 300px;
    margin-bottom: 20px;
  }

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #6b7280;
    font-size: 14px;
  }

  canvas {
    height: 100% !important;
  }

  .summary {
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  .value {
    font-size: 16px;
    color: #1f2937;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .tab-buttons {
      justify-content: center;
    }

    .summary {
      flex-direction: column;
      gap: 12px;
    }

    .summary-item {
      flex-direction: row;
      justify-content: space-between;
    }
  }
</style>