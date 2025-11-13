<script>
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  
  let selectedFilter = 'Vintage';
  let lineChart, pieChart, barChart, deviceChart;
  
  const filters = [
    { name: 'Vintage', created: '1/12/2024', uses: 1250, users: 850 },
    { name: 'Black & White', created: '2/15/2024', uses: 890, users: 620 },
    { name: 'Sepia', created: '3/10/2024', uses: 450, users: 320 }
  ];
  
  // Adjustable data
  let deviceData = { mobile: 65, desktop: 25, tablet: 10 };
  let peakUsageData = [
    { time: '12 AM', percentage: 20 },
    { time: '3 AM', percentage: 10 },
    { time: '6 AM', percentage: 30 },
    { time: '9 AM', percentage: 60 },
    { time: '12 PM', percentage: 80 },
    { time: '3 PM', percentage: 90 },
    { time: '6 PM', percentage: 100 },
    { time: '9 PM', percentage: 70 }
  ];
  let locationData = [
    { name: 'United States', users: 320, percentage: 35 },
    { name: 'United Kingdom', users: 240, percentage: 26 },
    { name: 'Canada', users: 180, percentage: 20 },
    { name: 'Germany', users: 100, percentage: 11 },
    { name: 'Others', users: 72, percentage: 8 }
  ];
  
  onMount(() => {
    Chart.register(...registerables);
    
    // Line Chart
    const lineCtx = document.getElementById('lineChart');
    lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Usage',
          data: [20, 35, 45, 60, 75, 85, 90],
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
    
    // Pie Chart
    const pieCtx = document.getElementById('pieChart');
    pieChart = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: ['Facebook', 'WhatsApp', 'Instagram', 'Others'],
        datasets: [{
          data: [35, 40, 15, 10],
          backgroundColor: ['#2196f3', '#4caf50', '#f44336', '#9c27b0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
    
    // Bar Chart removed - now using custom HTML/CSS
    
    // Device Chart
    const deviceCtx = document.getElementById('deviceChart');
    deviceChart = new Chart(deviceCtx, {
      type: 'bar',
      data: {
        labels: ['Mobile', 'Desktop', 'Tablet'],
        datasets: [{
          data: [deviceData.mobile, deviceData.desktop, deviceData.tablet],
          backgroundColor: ['#4285F4', '#AECBFA', '#7BAAF7']
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
          x: { beginAtZero: true, max: 100 },
          y: { grid: { display: false } }
        }
      }
    });
  });
</script>

<div class="container">
  <!-- Sidebar -->
  <div class="sidebar">
    <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">Filter Reports</h2>
    
    <!-- Search -->
    <input 
      type="text" 
      placeholder="Search filters..." 
      style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 12px; font-size: 12px;"
    />
    
    <!-- Filter List -->
    {#each filters as filter}
      <div 
        class="filter-card {selectedFilter === filter.name ? 'active' : ''}"
        on:click={() => selectedFilter = filter.name}
      >
        <div class="filter-thumbnail">
          <div class="thumbnail-icon" style="background: {filter.name === 'Vintage' ? 'linear-gradient(135deg, #ff9800, #f57c00)' : filter.name === 'Black & White' ? '#424242' : '#8d6e63'};"></div>
        </div>
        <div class="filter-content">
          <h3 class="filter-title">{filter.name}</h3>
          <p class="filter-date">Created {filter.created}</p>
          <div class="filter-stats">
            <span>👥 {filter.users}</span>
            <span>📈 {filter.uses}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Main Content -->
  <div class="main">
    <div style="padding: 12px;">
      <!-- Header Card -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <h2 style="font-size: 18px; font-weight: bold;">{selectedFilter}</h2>
              <span style="background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 8px; font-size: 10px;">Rank #1</span>
            </div>
            <div style="font-size: 12px; color: #666;">
              <p>Created by: Client Admin • Created: 1/12/2024</p>
              <div style="margin-top: 2px;">
                <span>⭐⭐⭐⭐☆</span>
                <span style="color: #999;">(4.5/5.0)</span>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="btn btn-secondary">Export</button>
            <button class="btn btn-secondary">Edit</button>
            <button class="btn" style="background: #ffebee; color: #c62828;">Delete</button>
          </div>
        </div>
        
        <!-- User Activity Metrics -->
        <div class="metrics">
          <div>
            <div class="metric-value">2,450</div>
            <div class="metric-label">Link Opens</div>
          </div>
          <div>
            <div class="metric-value">1,850</div>
            <div class="metric-label">Camera Access</div>
          </div>
          <div>
            <div class="metric-value">1,250</div>
            <div class="metric-label">Photos Taken</div>
          </div>
          <div>
            <div class="metric-value">680</div>
            <div class="metric-label">Videos Taken</div>
          </div>
          <div>
            <div class="metric-value">420</div>
            <div class="metric-label">Media Shared</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts">
        <!-- Usage Trend -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="font-size: 14px; font-weight: 600;">Usage Trend</h3>
            <select style="padding: 2px 4px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px;">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <canvas id="lineChart"></canvas>
        </div>

        <!-- Sharing Breakdown -->
        <div class="card">
          <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Sharing Breakdown</h3>
          <canvas id="pieChart"></canvas>
        </div>
      </div>

      <!-- User Activity Analytics -->
      <div class="analytics">
        <!-- Device Type -->
        <div class="device-type-card">
          <h3 class="device-type-title">Device Type</h3>
          <div class="device-chart">
            <div class="device-bar-item">
              <span class="device-label">Mobile</span>
              <div class="device-bar">
                <div class="device-bar-fill mobile" style="width: {deviceData.mobile}%;"></div>
              </div>
            </div>
            <div class="device-bar-item">
              <span class="device-label">Desktop</span>
              <div class="device-bar">
                <div class="device-bar-fill desktop" style="width: {deviceData.desktop}%;"></div>
              </div>
            </div>
            <div class="device-bar-item">
              <span class="device-label">Tablet</span>
              <div class="device-bar">
                <div class="device-bar-fill tablet" style="width: {deviceData.tablet}%;"></div>
              </div>
            </div>
          </div>
          <div class="device-summary">
            <div class="device-summary-item">
              <div class="device-icon">📱</div>
              <div class="device-percentage">{deviceData.mobile}%</div>
              <div class="device-name">Mobile</div>
            </div>
            <div class="device-summary-item">
              <div class="device-icon">💻</div>
              <div class="device-percentage">{deviceData.desktop}%</div>
              <div class="device-name">Desktop</div>
            </div>
            <div class="device-summary-item">
              <div class="device-icon">📲</div>
              <div class="device-percentage">{deviceData.tablet}%</div>
              <div class="device-name">Tablet</div>
            </div>
          </div>
        </div>

        <!-- Peak Usage Time -->
        <div class="peak-usage-card">
          <h3 class="peak-usage-title">Peak Usage Time</h3>
          <div class="peak-usage-list">
            {#each peakUsageData as usage, index}
              <div class="usage-row">
                <div class="usage-info">
                  <span class="usage-time">{usage.time}</span>
                </div>
                <span class="usage-percentage">{usage.percentage}%</span>
              </div>
              <div class="usage-progress-bar">
                <div class="usage-progress-fill" style="width: {usage.percentage}%;"></div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Top Locations -->
        <div class="top-locations-card">
          <h3 class="locations-title">Top Locations</h3>
          <div class="locations-list">
            {#each locationData as location}
              <div class="location-item">
                <div class="location-header">
                  <div class="location-left">
                    <div class="location-icon">📍</div>
                    <span class="location-name">{location.name}</span>
                  </div>
                  <div class="location-right">
                    <span class="location-count">{location.users} users</span>
                    <span class="location-percentage">{location.percentage}%</span>
                  </div>
                </div>
                <div class="location-progress-bar">
                  <div class="location-progress-fill" style="width: {location.percentage}%;"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Export Section -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 14px; font-weight: 600;">Export & Share</h3>
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-primary">Export PDF</button>
            <button class="btn btn-secondary">Export CSV</button>
            <button class="btn" style="background: none; color: #2196f3;">🔗 Share Link</button>
          </div>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 8px;">powered by MYAR</p>
      </div>
    </div>
  </div>
</div>

<style>
  .container { display: flex; height: 100vh; background: #f8f9fb; }
  .sidebar { width: 200px; background: white; border-right: 1px solid #e0e0e0; padding: 12px; }
  .main { flex: 1; overflow: auto; }
  .card { background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 12px; margin-bottom: 12px; }
  .small-card { background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 8px; margin-bottom: 8px; }
  .metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; text-align: center; }
  .metric-value { font-size: 18px; font-weight: bold; color: #333; }
  .metric-label { font-size: 12px; color: #666; }
  .charts { display: grid; grid-template-columns: 0.35fr 1.65fr; gap: 12px; align-items: start; overflow: hidden; }
  .charts .card:first-child { max-width: 320px; }
  .analytics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .filter-card { 
    width: 100%; 
    height: 50px; 
    padding: 6px; 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    border-radius: 8px; 
    border: 1px solid #e5e7eb; 
    background: #ffffff; 
    cursor: pointer; 
    margin-bottom: 6px; 
    transition: all 0.3s ease;
  }
  .filter-card:hover { background: #f9fafb; }
  .filter-card.active { border: 2px solid #3b82f6; box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1); }
  .filter-thumbnail { width: 28px; height: 28px; }
  .thumbnail-icon { width: 100%; height: 100%; border-radius: 6px; }
  .filter-content { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .filter-title { font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 1px 0; }
  .filter-date { font-size: 9px; color: #6b7280; margin: 0 0 1px 0; }
  .filter-stats { display: flex; gap: 8px; font-size: 9px; color: #111827; }
  .filter-stats span { display: flex; align-items: center; gap: 1px; }
  .btn { padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; font-size: 12px; }
  .btn-primary { background: #2196f3; color: white; }
  .btn-secondary { background: #f5f5f5; color: #333; }
  canvas { height: 200px !important; max-height: 200px; }
  #lineChart { height: 300px !important; max-height: 300px; }
  #pieChart { height: 300px !important; max-height: 300px; width: 100% !important; }
  
  /* Top Locations Card Styles */
  .top-locations-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(31, 41, 55, 0.06);
    padding: 8px;
    margin-bottom: 8px;
    width: 180px;
    height: 220px;
    display: flex;
    flex-direction: column;
  }
  
  .locations-title {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #1F2937;
    margin: 0 0 4px 0;
    text-align: left;
  }
  
  .locations-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    justify-content: space-evenly;
    padding: 1px 0;
  }
  
  .location-item {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  
  .location-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .location-left {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  .location-right {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  .location-icon {
    width: 8px;
    height: 8px;
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .location-name {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 7px;
    font-weight: 500;
    color: #374151;
  }
  
  .location-count {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 6px;
    font-weight: 400;
    color: #6B7280;
  }
  
  .location-percentage {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 7px;
    font-weight: 700;
    color: #111827;
  }
  
  .location-progress-bar {
    width: 100%;
    height: 4px;
    background-color: #E5E7EB;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .location-progress-fill {
    height: 100%;
    background-color: #2563EB;
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  
  /* Peak Usage Time Card Styles */
  .peak-usage-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(31, 41, 55, 0.06);
    padding: 8px;
    margin-bottom: 8px;
    width: 180px;
    height: 220px;
    display: flex;
    flex-direction: column;
  }
  
  .peak-usage-title {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #1F2937;
    margin: 0 0 4px 0;
    text-align: left;
  }
  
  .peak-usage-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    justify-content: space-evenly;
    padding: 1px 0;
  }
  
  .usage-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }
  
  .usage-info {
    display: flex;
    align-items: center;
  }
  
  .usage-time {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 7px;
    font-weight: 500;
    color: #374151;
  }
  
  .usage-progress-container {
    width: 100%;
  }
  
  .usage-progress-bar {
    width: 100%;
    height: 4px;
    background-color: #E5E7EB;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 1px;
  }
  
  .usage-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  
  .usage-percentage {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 7px;
    font-weight: 700;
    color: #374151;
  }
  
  /* Device Type Card Styles */
  .device-type-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(31, 41, 55, 0.06);
    padding: 8px;
    margin-bottom: 8px;
    width: 180px;
    height: 220px;
    display: flex;
    flex-direction: column;
  }
  
  .device-type-title {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #1F2937;
    margin: 0 0 4px 0;
    text-align: left;
  }
  
  .device-chart {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    margin-bottom: 6px;
  }
  
  .device-bar-item {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  
  .device-label {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 7px;
    font-weight: 500;
    color: #9CA3AF;
    margin-bottom: 1px;
  }
  
  .device-bar {
    width: 100%;
    height: 8px;
    background-color: #F3F4F6;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .device-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  
  .device-bar-fill.mobile {
    background-color: #2563EB;
  }
  
  .device-bar-fill.desktop {
    background-color: #93C5FD;
  }
  
  .device-bar-fill.tablet {
    background-color: #3B82F6;
  }
  
  .device-summary {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-top: 4px;
    border-top: 1px solid #E5E7EB;
  }
  
  .device-summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }
  
  .device-icon {
    font-size: 10px;
    color: #3B82F6;
  }
  
  .device-percentage {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 8px;
    font-weight: 700;
    color: #111827;
  }
  
  .device-name {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 6px;
    font-weight: 400;
    color: #6B7280;
  }
  
  @media (max-width: 1200px) {
    .analytics { grid-template-columns: repeat(2, 1fr); }
  }
  
  @media (max-width: 768px) {
    .container { flex-direction: column; }
    .sidebar { width: 100%; height: auto; max-height: 200px; }
    .charts { grid-template-columns: 1fr; }
    .analytics { grid-template-columns: 1fr; }
    .metrics { grid-template-columns: repeat(3, 1fr); }
    
    .top-locations-card {
      width: 100%;
      height: auto;
      min-height: 400px;
    }
    
    .peak-usage-card {
      width: 100%;
      height: auto;
      min-height: 400px;
    }
    
    .usage-progress-bar {
      width: 100%;
    }
    
    .peak-usage-card {
      width: 100%;
      height: auto;
      min-height: 400px;
    }
    
    .device-type-card {
      width: 100%;
      height: auto;
      min-height: 400px;
    }
    
    .device-summary {
      gap: 20px;
    }
  }
</style>