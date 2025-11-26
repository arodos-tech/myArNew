<script lang="ts">
  import { onMount } from "svelte";
  import { Plus } from "lucide-svelte";
  import mobile from "$lib/assets/SVG.png";
  import photo from "$lib/assets/SVG (2).png";
  import camera from "$lib/assets/SVG (1).png";
  import cross from "$lib/assets/SVG (3).png";
  import filter from "$lib/assets/Vintage filter preview.png";
  import piechart from "$lib/assets/Container.png";
  import graph from "$lib/assets/SVG (4).png";
  import FilterUsageData from "$lib/FilterUsageData.svelte";
  import { getClientFilterUsage } from "/src/services/actions/dashboard.js";

  let loadingDashboard = false;
  let error: string | null = null;
  let userId: number | null = null;

  // Stats with dynamic data from API
  let stats = {
    appOpens: 0,
    cameraAccess: 0,
    mediaCaptured: 0,
    appShare: 0,
  };

  // Function to get user ID from localStorage
  function getUserIdFromLocalStorage(): number | null {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("👤 User data from localStorage:", user);

        // Extract the id from the user object
        const userId = user.id;
        console.log("🔑 Extracted userId:", userId);

        return userId || null;
      }
      console.warn("⚠️ No user data found in localStorage");
      return null;
    } catch (err) {
      console.error("❌ Error parsing user data from localStorage:", err);
      return null;
    }
  }

  // Process dashboard data and map API response to stats
  function processDashboardData(apiData: any[]) {
    console.log("🔄 Processing dashboard data...", apiData);

    // Initialize counters
    let appOpens = 0;
    let cameraAccess = 0;
    let mediaCaptured = 0;
    let appShare = 0;

    // Map API data to our stats
    apiData.forEach((item) => {
      console.log(`📊 Processing event: ${item.type} with ${item.total_logs} logs`);
      switch (item.type) {
        case "openLink":
          appOpens += item.total_logs;
          break;
        case "cameraAccessAttempt":
          cameraAccess += item.total_logs;
          break;
        case "photoCapture":
        case "photoCaptured":
          mediaCaptured += item.total_logs;
          break;
        case "shareOpened":
        case "share":
          console.log(`🎯 Found share event: ${item.type} with ${item.total_logs} logs`);
          appShare += item.total_logs;
          break;
        default:
          console.log(`❓ Unknown event type: ${item.type}`);
      }
    });

    // Update stats
    stats.appOpens = appOpens;
    stats.cameraAccess = cameraAccess;
    stats.mediaCaptured = mediaCaptured;
    stats.appShare = appShare;

    // Force Svelte to react to the changes
    stats = { ...stats };

    console.log("✅ Mapped Stats:", {
      appOpens: stats.appOpens,
      cameraAccess: stats.cameraAccess,
      mediaCaptured: stats.mediaCaptured,
      appShare: stats.appShare,
    });
    
    console.log("📋 All event types found:", apiData.map(item => item.type));
  }

  // Main function to load filter usage data
  async function loadFilterUsageData() {
    console.log("🟡 Starting to load filter usage data...");

    // Get userId from localStorage
    userId = getUserIdFromLocalStorage();

    if (!userId) {
      console.error("❌ No user ID found in localStorage");
      error = "User not authenticated. Please log in again.";
      loadingDashboard = false;
      return;
    }

    console.log("🟡 Calling getClientFilterUsage API with userId:", userId);
    loadingDashboard = true;
    error = null;

    try {
      const response = await getClientFilterUsage(userId);
      console.log("🟢 getClientFilterUsage API Response:", response);

      if (!response.err) {
        console.log("📊 Filter Usage Data Result:", response.result);

        if (response.result && Array.isArray(response.result)) {
          // Process the data and update dashboard stats
          processDashboardData(response.result);
        } else {
          console.warn("⚠️ No result data in API response");
        }
      } else {
        console.error("❌ Error in getClientFilterUsage:", response.err);
        error =
          "Failed to load dashboard data: " +
          (response.err.message || "Unknown error");
      }
    } catch (err: any) {
      console.error("❌ Exception in getClientFilterUsage:", err);
      error =
        "Failed to load dashboard data: " + (err.message || "Network error");
    }

    loadingDashboard = false;
    console.log("🔚 Finished loading filter usage data");
  }

  // Call the API when component mounts
  onMount(async () => {
    console.log("🚀 Dashboard component mounted, loading data...");
    await loadFilterUsageData();
  });
</script>

<div class="dashboard">
  <!-- Loading State -->
  {#if loadingDashboard}
    <div class="loading-state">
      <p>📊 Loading dashboard data...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>❌ {error}</p>
      <button on:click={loadFilterUsageData} class="retry-btn">🔄 Retry</button>
    </div>
  {/if}

  <!-- Top Stats -->
  <div class="stats-grid">
    <div class="stat-card blue">
      <div class="stat-content">
        <h3>App Opens</h3>
        <div class="icon-text">
          <img src={mobile} alt="Mobile" class="stat-icon" />
          <p class="stat-number">{stats.appOpens.toLocaleString()}</p>
        </div>
      </div>
    </div>

    <div class="stat-card green">
      <div class="stat-content">
        <h3>Camera Access</h3>
        <div class="icon-text">
          <img src={camera} alt="Camera" class="stat-icon" />
          <p class="stat-number">{stats.cameraAccess.toLocaleString()}</p>
        </div>
      </div>
    </div>

    <div class="stat-card purple">
      <div class="stat-content">
        <h3>Media Captured</h3>
        <div class="icon-text">
          <img src={photo} alt="Photo" class="stat-icon" />
          <p class="stat-number">{stats.mediaCaptured.toLocaleString()}</p>
        </div>
      </div>
    </div>

    <div class="stat-card red">
      <div class="stat-content">
        <h3>App Share</h3>
        <div class="icon-text">
          <img src={cross} alt="Cross" class="stat-icon" />
          <p class="stat-number">{stats.appShare.toLocaleString()}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts Section -->
  <div class="charts-grid">
    <div class="chart-card">
      <h4>Sharing Platforms</h4>
      <div class="chart-content">
        <img src={piechart} alt="Sharing Platforms Chart" class="pie-chart" />
      </div>
    </div>

    <div class="chart-card">
      <h4>User Locations</h4>
      <div class="chart-content">
        <img src={graph} alt="User Locations Chart" class="bar-chart" />
      </div>
    </div>
  </div>

  <!-- Filter Usage Data Component -->
  <FilterUsageData />
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .loading-state,
  .error-state {
    text-align: center;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .error-state {
    background: #ffe6e6;
    color: #d63031;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .retry-btn {
    background: linear-gradient(135deg, #1a8ef1, #0066cc);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(26, 142, 241, 0.3);
  }

  .dashboard-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .action-btn {
    background: linear-gradient(135deg, #1a8ef1, #0066cc);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(26, 142, 241, 0.3);
    text-decoration: none;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 142, 241, 0.4);
  }

  .btn-icon {
    display: flex;
    align-items: center;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    border-radius: 12px;
    padding: 1rem;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-card h3 {
    font-size: 0.85rem;
    font-weight: 500;
    margin: 0;
    opacity: 0.9;
  }

  .icon-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    opacity: 0.8;
  }

  .stat-number {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
  }

  /* Color Themes */
  .stat-card.blue {
    background: linear-gradient(135deg, #1d7fe0, #1565c0);
  }

  .stat-card.green {
    background: linear-gradient(135deg, #28a745, #1e7e34);
  }

  .stat-card.purple {
    background: linear-gradient(135deg, #7e3ff2, #5e35b1);
  }

  .stat-card.red {
    background: linear-gradient(135deg, #e6492d, #c62828);
  }

  /* Charts Grid */
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .chart-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }

  .chart-card h4 {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
  }

  .chart-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .pie-chart,
  .bar-chart {
    width: 100%;
    max-width: 500px;
    height: auto;
  }

  /* Rest of your existing styles remain the same */
  .platform-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 200px;
  }

  .platform-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: #4a5568;
  }

  .platform-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }

  .platform-dot.whatsapp {
    background: #25d366;
  }

  .platform-dot.facebook {
    background: #1877f2;
  }

  .platform-dot.others {
    background: #6b7280;
  }

  .location-labels {
    display: flex;
    justify-content: space-around;
    width: 100%;
    font-size: 0.8rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }

  .location-item {
    text-align: center;
  }

  /* Table Card */
  .table-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }

  .table-card h4 {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
  }

  .usage-table {
    width: 100%;
    border-collapse: collapse;
  }

  .usage-table th {
    background: #f8fafc;
    color: #374151;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.9rem;
  }

  .usage-table td {
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    font-size: 0.9rem;
  }

  .usage-table tr:last-child td {
    border-bottom: none;
  }

  .filter-name-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .filter-img {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    object-fit: cover;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }

    .chart-card {
      padding: 1rem;
    }

    .icon-text {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }

    .stat-number {
      font-size: 1.75rem;
    }

    .platform-list {
      max-width: 100%;
    }

    .location-labels {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .usage-table {
      font-size: 0.8rem;
    }

    .usage-table th,
    .usage-table td {
      padding: 0.75rem 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .dashboard-header {
      justify-content: center;
    }

    .action-btn {
      width: 100%;
      justify-content: center;
    }

    .stat-card {
      padding: 1rem;
    }

    .table-card {
      padding: 1rem;
    }

    .usage-table {
      display: block;
      overflow-x: auto;
    }
  }
</style>
