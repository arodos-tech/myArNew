<script>
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import {
    TrendingUp,
    Users,
    Share,
    Zap,
    Smartphone,
    Monitor,
    Tablet,
  } from "lucide-svelte";

  let selectedFilter = "Vintage";
  let lineChart, pieChart, barChart, deviceChart;

  import { getClientFilterUsage } from "/src/services/actions/dashboard.js";

  let filters = [];
  let loading = true;

  // Function to get user ID from localStorage
  function getUserIdFromLocalStorage() {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || null;
      }
      return null;
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  }

  // Load real filter data
  async function loadFilterData() {
    try {
      const userId = getUserIdFromLocalStorage();
      if (!userId) return;

      // Load filters
      const { getFilters } = await import("../services/actions/filter.js");
      const filtersResponse = await getFilters({ search: `user:${userId}` });

      // Load analytics
      const analyticsResponse = await getClientFilterUsage(userId);
      console.log('Analytics Response:', analyticsResponse);

      if (!filtersResponse.err && filtersResponse.result) {
        filters = filtersResponse.result.map((filter) => {
          // Calculate usage stats from analytics
          const analytics = analyticsResponse.result || [];
          const appOpens = analytics.find((item) => item.type === "appOpen")?.total_logs || 0;
          const mobileOpens = analytics.find((item) => item.type === "mobileOpen")?.total_logs || 0;
          const cameraAccess = analytics.find((item) => item.type === "cameraAccess")?.total_logs || 0;
          const photoCaptures = analytics.find((item) => item.type === "photoCapture")?.total_logs || 0;
          const appShares = analytics.find((item) => item.type === "appShare")?.total_logs || 0;

          return {
            name: filter.name || "Untitled",
            created:
              new Date(filter.created_at).toLocaleDateString() || "1/1/2024",
            uses: appOpens,
            users: Math.floor(appOpens * 0.7),
            filter_url: filter.filter_url,
            analytics: {
              appOpens,
              mobileOpens,
              cameraAccess,
              photoCaptures,
              appShares
            }
          };
        });

        if (filters.length > 0) {
          selectedFilter = filters[0].name;
        }
      }
    } catch (error) {
      console.error("Error loading filter data:", error);
      // Fallback to sample data
      filters = [
        { name: "Vintage", created: "1/12/2024", uses: 1250, users: 850 },
        { name: "Black & White", created: "2/15/2024", uses: 890, users: 620 },
        { name: "Sepia", created: "3/10/2024", uses: 450, users: 320 },
      ];
    } finally {
      loading = false;
    }
  }

  // Adjustable data
  let deviceData = { mobile: 65, desktop: 25, tablet: 10 };
  let peakUsageData = [
    { time: "9 AM", percentage: 60 },
    { time: "12 PM", percentage: 80 },
    { time: "3 PM", percentage: 90 },
    { time: "6 PM", percentage: 100 },
    { time: "9 PM", percentage: 70 },
  ];
  let locationData = [
    { name: "United States", users: 320, percentage: 35 },
    { name: "United Kingdom", users: 240, percentage: 26 },
    { name: "Canada", users: 180, percentage: 20 },
    { name: "Germany", users: 100, percentage: 11 },
    { name: "Others", users: 72, percentage: 8 },
  ];

  onMount(async () => {
    Chart.register(...registerables);

    // Load real filter data first
    await loadFilterData();

    // Line Chart
    const lineCtx = document.getElementById("lineChart");
    lineChart = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Usage",
            data: [65, 85, 95, 120, 135, 210, 175],
            borderColor: "#3b82f6",
            backgroundColor: "transparent",
            borderWidth: 2,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#3b82f6",
            pointRadius: 4,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 260,
            grid: {
              color: "#e5e7eb",
              borderDash: [2, 2],
            },
            ticks: {
              stepSize: 65,
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

    // Pie Chart
    const pieCtx = document.getElementById("pieChart");
    pieChart = new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: ["Facebook", "WhatsApp", "Instagram", "Others"],
        datasets: [
          {
            data: [35, 40, 15, 10],
            backgroundColor: ["#2196f3", "#4caf50", "#f44336", "#9c27b0"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });

    // Bar Chart removed - now using custom HTML/CSS

    // Device Chart
    const deviceCtx = document.getElementById("deviceChart");
    deviceChart = new Chart(deviceCtx, {
      type: "bar",
      data: {
        labels: ["Mobile", "Desktop", "Tablet"],
        datasets: [
          {
            data: [deviceData.mobile, deviceData.desktop, deviceData.tablet],
            backgroundColor: ["#3b82f6", "#93c5fd", "#60a5fa"],
            borderRadius: 4,
            barThickness: 12,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            max: 70,
            display: false,
          },
          y: {
            grid: { display: false },
            ticks: {
              color: "#6b7280",
              font: { size: 12 },
            },
          },
        },
        layout: {
          padding: { right: 20 },
        },
      },
    });

    // Peak Usage Chart
    const peakUsageCtx = document.getElementById("peakUsageChart");
    new Chart(peakUsageCtx, {
      type: "bar",
      data: {
        labels: peakUsageData.map((item) => item.time),
        datasets: [
          {
            data: peakUsageData.map((item) => item.percentage),
            backgroundColor: "#3b82f6",
            borderRadius: 12,
            barThickness: 16,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            display: false,
            max: 100,
          },
          y: {
            grid: { display: false },
            ticks: {
              color: "#666",
              font: { size: 9 },
            },
          },
        },
        layout: {
          padding: { left: 10, right: 10 },
        },
        plugins: [
          {
            afterDatasetsDraw: (chart) => {
              const { ctx } = chart;
              chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                  const data = dataset.data[index];
                  ctx.fillStyle = "white";
                  ctx.font = "bold 10px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText(`${data}%`, bar.x - 15, bar.y + 3);
                });
              });
            },
          },
        ],
      },
    });
  });
</script>

<div class="container">
  <!-- Sidebar -->
  <div class="sidebar">
    <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">
      Filter Reports
    </h2>

    <!-- Search -->
    <input
      type="text"
      placeholder="Search filters..."
      style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 12px; font-size: 12px;"
    />

    <!-- Filter List -->
    {#if loading}
      <div style="text-align: center; padding: 20px; color: #666;">
        Loading filters...
      </div>
    {:else}
      {#each filters as filter}
        <div
          class="filter-card {selectedFilter === filter.name ? 'active' : ''}"
          on:click={() => (selectedFilter = filter.name)}
        >
          <div class="filter-thumbnail">
            <img
              src={filter.filter_url || "/placeholder-filter.png"}
              alt={filter.name}
              class="thumbnail-image"
            />
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
    {/if}
  </div>

  <!-- Main Content -->
  <div class="main">
    <div style="padding: 12px;">
      <!-- Header Card -->
      <div class="card">
        <div
          style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;"
        >
          <div>
            <div
              style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;"
            >
              <h2 style="font-size: 18px; font-weight: bold;">
                {selectedFilter}
              </h2>
              <span
                style="background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 8px; font-size: 10px;"
                >Rank #1</span
              >
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
            <button class="btn" style="background: #ffebee; color: #c62828;"
              >Delete</button
            >
          </div>
        </div>

        <!-- User Activity Metrics -->
        <div class="metrics-horizontal">
          <div class="metric-item">
            <div class="metric-row">
              <TrendingUp class="metric-icon" size={16} />
              <div class="metric-number">1,250</div>
            </div>
            <div class="metric-text">Total Uses</div>
          </div>
          <div class="metric-item">
            <div class="metric-row">
              <Users class="metric-icon" size={16} />
              <div class="metric-number">850</div>
            </div>
            <div class="metric-text">Unique Users</div>
          </div>
          <div class="metric-item">
            <div class="metric-row">
              <Share class="metric-icon" size={16} />
              <div class="metric-number">420</div>
            </div>
            <div class="metric-text">Total Shares</div>
          </div>
          <div class="metric-item">
            <div class="metric-row">
              <Zap class="metric-icon" size={16} />
              <div class="metric-number">33.6%</div>
            </div>
            <div class="metric-text">Engagement Rate</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts">
        <!-- Usage Trend -->
        <div class="card">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">
            Usage Trend
          </h3>
          <div class="tab-buttons">
            <button class="tab-btn active">Daily</button>
            <button class="tab-btn">Weekly</button>
            <button class="tab-btn">Monthly</button>
          </div>
          <canvas id="lineChart"></canvas>
        </div>

        <!-- Sharing Breakdown -->
        <!-- <div class="card">
          <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Sharing Breakdown</h3>
          <canvas id="pieChart"></canvas>
        </div> -->
      </div>

      <!-- User Activity Analytics -->
      <div class="analytics">
        <!-- Device Type -->
        <div class="device-type-card">
          <h3 class="device-type-title">Device Type</h3>
          <canvas id="deviceChart"></canvas>
          <div class="device-legend">
            <div class="legend-item">
              <Smartphone class="legend-icon" size={16} />
              <span class="legend-percent">{deviceData.mobile}%</span>
              <span class="legend-label">Mobile</span>
            </div>
            <div class="legend-item">
              <Monitor class="legend-icon" size={16} />
              <span class="legend-percent">{deviceData.desktop}%</span>
              <span class="legend-label">Desktop</span>
            </div>
            <div class="legend-item">
              <Tablet class="legend-icon" size={16} />
              <span class="legend-percent">{deviceData.tablet}%</span>
              <span class="legend-label">Tablet</span>
            </div>
          </div>
        </div>

        <!-- Peak Usage Time -->
        <div class="peak-usage-card">
          <h3 class="peak-usage-title">Peak Usage Time</h3>
          <canvas id="peakUsageChart"></canvas>
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
                    <span class="location-percentage"
                      >{location.percentage}%</span
                    >
                  </div>
                </div>
                <div class="location-progress-bar">
                  <div
                    class="location-progress-fill"
                    style="width: {location.percentage}%;"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Export Section -->
      <div class="card">
        <div
          style="display: flex; justify-content: space-between; align-items: center;"
        >
          <h3 style="font-size: 14px; font-weight: 600;">Export & Share</h3>
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-primary">Export PDF</button>
            <button class="btn btn-secondary">Export CSV</button>
            <button class="btn" style="background: none; color: #2196f3;"
              >🔗 Share Link</button
            >
          </div>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 8px;">
          powered by MYAR
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    height: 100vh;
    background: #f8f9fb;
  }
  .sidebar {
    width: 200px;
    background: white;
    border-right: 1px solid #e0e0e0;
    padding: 12px;
  }
  .main {
    flex: 1;
    overflow: auto;
  }
  .card {
    background: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 12px;
    margin-bottom: 12px;
  }
  .small-card {
    background: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 8px;
    margin-bottom: 8px;
  }
  .metrics-horizontal {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 0;
  }
  .metric-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .metric-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .metric-icon {
    font-size: 16px;
    color: #3b82f6;
  }
  .metric-number {
    font-size: 20px;
    font-weight: bold;
    color: #1f2937;
  }
  .metric-text {
    font-size: 12px;
    color: #6b7280;
  }
  .charts {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    align-items: start;
    overflow: hidden;
  }
  .charts .card:first-child {
    max-width: 100%;
  }
  .analytics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
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
  .filter-card:hover {
    background: #f9fafb;
  }
  .filter-card.active {
    border: 2px solid #3b82f6;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
  }
  .filter-thumbnail {
    width: 28px;
    height: 28px;
  }
  .thumbnail-image {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    object-fit: cover;
    background: #f7fafc;
  }
  .filter-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .filter-title {
    font-size: 12px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 1px 0;
  }
  .filter-date {
    font-size: 9px;
    color: #6b7280;
    margin: 0 0 1px 0;
  }
  .filter-stats {
    display: flex;
    gap: 8px;
    font-size: 9px;
    color: #111827;
  }
  .filter-stats span {
    display: flex;
    align-items: center;
    gap: 1px;
  }
  .btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 12px;
  }
  .btn-primary {
    background: #2196f3;
    color: white;
  }
  .btn-secondary {
    background: #f5f5f5;
    color: #333;
  }
  canvas {
    height: 200px !important;
    max-height: 200px;
  }
  #deviceChart {
    height: 120px !important;
    max-height: 120px;
  }
  #peakUsageChart {
    height: 140px !important;
    max-height: 140px;
  }
  #lineChart {
    height: 300px !important;
    max-height: 300px;
  }

  .tab-buttons {
    display: flex;
    gap: 0;
    margin-bottom: 20px;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
    width: fit-content;
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

  .tab-btn.active {
    background: white;
    color: #1f2937;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  #pieChart {
    height: 300px !important;
    max-height: 300px;
    width: 100% !important;
  }

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
    font-family: "Inter", "Roboto", sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #1f2937;
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
    font-family: "Inter", "Roboto", sans-serif;
    font-size: 7px;
    font-weight: 500;
    color: #374151;
  }

  .location-count {
    font-family: "Inter", "Roboto", sans-serif;
    font-size: 6px;
    font-weight: 400;
    color: #6b7280;
  }

  .location-percentage {
    font-family: "Inter", "Roboto", sans-serif;
    font-size: 7px;
    font-weight: 700;
    color: #111827;
  }

  .location-progress-bar {
    width: 100%;
    height: 4px;
    background-color: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .location-progress-fill {
    height: 100%;
    background-color: #2563eb;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  /* Peak Usage Time Card Styles */
  .peak-usage-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(31, 41, 55, 0.06);
    padding: 16px;
    margin-bottom: 8px;
    width: 180px;
    height: 220px;
    display: flex;
    flex-direction: column;
  }

  .peak-usage-title {
    font-family: "Inter", "Roboto", sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #1f2937;
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
    flex-direction: column;
    gap: 1px;
  }

  .usage-info {
    display: flex;
    align-items: center;
    margin-bottom: 0px;
  }

  .usage-time {
    font-family: "Inter", "Roboto", sans-serif;
    font-size: 7px;
    font-weight: 500;
    color: #374151;
  }

  .usage-progress-container {
    width: 100%;
  }

  .usage-progress-bar {
    width: 100%;
    height: 16px;
    background-color: #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }

  .usage-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 2px;
    min-width: 15px;
  }

  .usage-percentage {
    font-family: "Inter", "Roboto", sans-serif;
    font-size: 6px;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Device Type Card Styles */
  .device-type-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(31, 41, 55, 0.06);
    padding: 16px;
    margin-bottom: 8px;
    width: 180px;
    height: 220px;
    display: flex;
    flex-direction: column;
  }

  .device-type-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
  }

  .device-bars {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bar-label {
    font-size: 12px;
    color: #6b7280;
    width: 50px;
    text-align: right;
  }

  .bar-container {
    flex: 1;
    height: 8px;
    background-color: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .bar-fill.mobile {
    background-color: #3b82f6;
  }

  .bar-fill.desktop {
    background-color: #93c5fd;
  }

  .bar-fill.tablet {
    background-color: #60a5fa;
  }

  .device-legend {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .legend-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .legend-icon {
    color: #3b82f6;
  }

  .legend-percent {
    font-size: 12px;
    font-weight: 600;
    color: #1f2937;
  }

  .legend-label {
    font-size: 10px;
    color: #6b7280;
  }

  @media (max-width: 1200px) {
    .analytics {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .container {
      flex-direction: column;
    }
    .sidebar {
      width: 100%;
      height: auto;
      max-height: 200px;
    }
    .charts {
      grid-template-columns: 1fr;
    }
    .analytics {
      grid-template-columns: 1fr;
    }
    .metrics {
      grid-template-columns: repeat(3, 1fr);
    }

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
