<script>
  import { onMount } from "svelte";

  export let filterUsageData = [];

  // Get user ID from localStorage
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

  // Load analytics data directly
  async function loadFilterData() {
    try {
      const userId = getUserIdFromLocalStorage();
      if (!userId) {
        console.error("❌ No user found in localStorage");
        return;
      }

      console.log("📌 User ID:", userId);

      // --- Load analytics directly ---
      const { getClientAllFilterUsage } = await import(
        "/src/services/actions/dashboard.js"
      );

      const analyticsResponse = await getClientAllFilterUsage(userId);

      console.log("📌 Filter Usage Response:", analyticsResponse);

      // Assign real data
      filterUsageData = analyticsResponse.result.map((item) => ({
        name: item.name || "Untitled Filter",
        times_used: item.total_used_count ? Number(item.total_used_count) : 0,
        user_stat: 0, // static for now
        media_captured: item.photo_capture_count
          ? Number(item.photo_capture_count)
          : 0,
      }));

      console.log("📌 Final filterUsageData:", filterUsageData);
    } catch (error) {
      console.error("❌ Error loading filter usage:", error);
    }
  }

  onMount(loadFilterData);
</script>

<!-- ============================= -->
<!--          UI TABLE            -->
<!-- ============================= -->

<div class="dashboard-container">
  <h2 class="dashboard-title">Filter Usage Data</h2>

  <div class="table-container">
    <div class="table-header">
      <div class="header-cell filter-name">FILTER NAME</div>
      <div class="header-cell">TIMES USED</div>
      <div class="header-cell">USERS</div>
      <div class="header-cell">MEDIA CAPTURED</div>
    </div>

    {#each filterUsageData as filter, index}
      <div
        class="table-row"
        class:last-row={index === filterUsageData.length - 1}
      >
        <div class="data-cell filter-name">
          <span>{filter.name}</span>
        </div>

        <div class="data-cell">{filter.times_used}</div>
        <div class="data-cell">{filter.user_stat}</div>
        <div class="data-cell">{filter.media_captured}</div>
      </div>
    {/each}
  </div>
</div>

<!-- ============================= -->
<!--              CSS              -->
<!-- ============================= -->

<style>
  .dashboard-container {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }

  .table-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .table-container::-webkit-scrollbar {
    width: 8px;
  }

  .table-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .table-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .table-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .dashboard-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 1.5rem 0;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .header-cell {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
    align-items: center;
  }

  .table-row.last-row {
    border-bottom: none;
  }

  .data-cell {
    font-size: 0.9rem;
    color: #374151;
    display: flex;
    align-items: center;
  }

  .filter-name {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
</style>
