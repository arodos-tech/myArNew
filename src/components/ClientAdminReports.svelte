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
  let activeTimeRange = "daily";

  import {
    getClientFilterUsage,
    getFilterUsageByPeriod,
    createTestOpenLinkData,
    getDeviceAnalytics,
    getShareOpenedCount,
  } from "/src/services/actions/dashboard.js";

  let filters = [];
  let loading = true;
  let shareCount = 0;

  // Function to get user name from localStorage
  function getUserNameFromLocalStorage() {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.name || "Client Admin";
      }
      return "Client Admin";
    } catch (err) {
      return "Client Admin";
    }
  }

  // Function to get selected filter's shares
  function getSelectedFilterShares() {
    return shareCount.toLocaleString();
  }

  // Function to get selected filter's uses
  function getSelectedFilterUses() {
    const selectedFilterObj = filters.find((f) => f.name === selectedFilter);
    return selectedFilterObj?.uses?.toLocaleString() || "0";
  }

  // Function to get selected filter's users
  function getSelectedFilterUsers() {
    const selectedFilterObj = filters.find((f) => f.name === selectedFilter);
    return selectedFilterObj?.users?.toLocaleString() || "0";
  }

  // Function to get selected filter's created date
  function getSelectedFilterCreatedDate() {
    const selectedFilterObj = filters.find((f) => f.name === selectedFilter);
    return selectedFilterObj?.created || "1/12/2024";
  }

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

      // Load filters and analytics in parallel
      const [filtersResponse, analyticsResponse, sessionsResponse] = await Promise.all([
        import("../services/actions/filter.js").then(({ getFilters }) => 
          getFilters({ search: `user:${userId}` })
        ),
        import("/src/services/actions/dashboard.js").then(({ getClientAllFilterUsage }) => 
          getClientAllFilterUsage(userId)
        ),
        import("/src/services/actions/dashboard.js").then(({ getFilterSessionsCount }) => 
          getFilterSessionsCount(userId)
        )
      ]);

      // Create session count map
      const sessionCountMap = {};
      if (sessionsResponse && sessionsResponse.result) {
        sessionsResponse.result.forEach((item) => {
          const filterName = item.name || "Untitled Filter";
          sessionCountMap[filterName] = item.unique_sessions || 0;
        });
      }

      if (!filtersResponse.err && filtersResponse.result) {
        filters = filtersResponse.result.map((filter) => {
          const filterName = filter.name || "Untitled";

          // Find matching analytics data
          const analyticsItem = analyticsResponse.result?.find(
            (item) => (item.name || "Untitled Filter") === filterName,
          );

          return {
            id: filter.id,
            name: filterName,
            created:
              new Date(filter.created_at).toLocaleDateString() || "1/1/2024",
            uses: analyticsItem
              ? Number(analyticsItem.total_used_count || 0)
              : 0, // TIMES USED
            users: sessionCountMap[filterName] || 0, // USERS
            filter_url: filter.filter_url,
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

  // Dynamic device data based on filter
  let deviceData = { mobile: 0, desktop: 0, tablet: 0 };

  // Function to fetch real device analytics
  async function fetchDeviceAnalytics(userId, filterId) {
    console.log("fetchDeviceAnalytics called with:", { userId, filterId });
    try {
      const response = await getDeviceAnalytics(filterId);
      console.log("Device analytics response:", response);

      if (!response.err && response.result) {
        const deviceCounts = response.result;
        let mobileCount = 0;
        let desktopCount = 0;
        let tabletCount = 0;

        // Process the device analytics data
        deviceCounts.forEach((item) => {
          if (item.type === "mobile_open") {
            mobileCount = item.count;
          } else if (item.type === "desktop_open") {
            desktopCount = item.count;
          } else if (item.type === "tablet_open") {
            tabletCount = item.count;
          }
        });

        const totalCount = mobileCount + desktopCount + tabletCount;

        if (totalCount > 0) {
          const mobilePercent = Math.round((mobileCount / totalCount) * 100);
          const desktopPercent = Math.round((desktopCount / totalCount) * 100);
          const tabletPercent = Math.round((tabletCount / totalCount) * 100);

          return {
            mobile: mobilePercent,
            desktop: desktopPercent,
            tablet: tabletPercent,
            counts: {
              mobile: mobileCount,
              desktop: desktopCount,
              tablet: tabletCount,
            },
          };
        }
      }
    } catch (error) {
      console.error("Error fetching device analytics:", error);
    }

    // Fallback to default values if no data or API fails
    return {
      mobile: 65,
      desktop: 25,
      tablet: 10,
      counts: { mobile: 65, desktop: 25, tablet: 10 },
    };
  }
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

    // Register Chart.js datalabels plugin
    if (window.ChartDataLabels) {
      Chart.register(window.ChartDataLabels);
    }

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
            label: "Usages",
            data: [65, 85, 95, 120, 135, 210, 175],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            fill: true,
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
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 50,
            grid: {
              color: "#e5e7eb",
              borderDash: [2, 2],
            },
            ticks: {
              stepSize: 10,
              color: "#6b7280",
            },
          },
          x: {
            grid: {
              display: true,
              color: "rgba(59, 130, 246, 0.1)",
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
        labels: ["Mobile", "Desktop"],
        datasets: [
          {
            data: [deviceData.mobile, deviceData.desktop],
            backgroundColor: ["#3b82f6", "#93c5fd"],
            borderRadius: 4,
            barThickness: 12,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.parsed.x + " users";
              },
            },
          },
        },
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
    window.peakChart = new Chart(peakUsageCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "#3b82f6",
            borderRadius: 4,
            barThickness: 12,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: "end",
            align: "right",
            color: "white",
            font: { weight: "bold", size: 10 },
            formatter: (value) => value,
          },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { display: false },
            ticks: { color: "#666", font: { size: 10 } },
          },
        },
      },
    });
  });

  async function updateTimeRange(range) {
    activeTimeRange = range;

    if (selectedFilter) {
      await updateChartForFilter(selectedFilter, range);
    }
  }

  let currentTrendData = [];
  let peakUsageForFilter = []; // Store peak usage data per filter
  let currentFilterForPeak = null; // Track which filter the peak data belongs to

  async function updateChartForFilter(filterName, period = activeTimeRange) {
    const selectedFilterObj = filters.find((f) => f.name === filterName);

    // Fetch share count for selected filter
    if (selectedFilterObj?.id) {
      try {
        const shareResponse = await getShareOpenedCount(selectedFilterObj.id);
        if (
          !shareResponse.err &&
          shareResponse.result &&
          shareResponse.result.length > 0
        ) {
          shareCount = shareResponse.result[0].share_opened_count || 0;
        } else {
          shareCount = 0;
        }
      } catch (error) {
        console.error("Error fetching share count:", error);
        shareCount = 0;
      }
    }

    // Fetch real device data for selected filter
    if (selectedFilterObj?.id) {
      const userId = getUserIdFromLocalStorage();
      if (userId) {
        deviceData = await fetchDeviceAnalytics(userId, selectedFilterObj.id);
      }
    } else {
      // Fallback for demo purposes
      deviceData = { mobile: 65, desktop: 25, tablet: 10 };
    }

    // Update device chart
    if (deviceChart) {
      deviceChart.data.datasets[0].data = [
        deviceData.counts?.mobile || deviceData.mobile,
        deviceData.counts?.desktop || deviceData.desktop,
      ];
      deviceChart.update();
    }

    try {
      const userId = getUserIdFromLocalStorage();
      console.log(
        "Updating chart for:",
        filterName,
        "Period:",
        period,
        "User:",
        userId,
        "Filter ID:",
        selectedFilterObj?.id,
      );

      if (userId && selectedFilterObj?.id) {
        const response = await getFilterUsageByPeriod(
          userId,
          selectedFilterObj.id,
          period,
        );
        console.log("API Response:", response);

        if (
          response &&
          !response.err &&
          response.result &&
          response.result.length > 0
        ) {
          currentTrendData = response.result;

          // Always update peak usage data when filter changes (always use daily data for peak usage)
          if (currentFilterForPeak !== filterName) {
            // Get daily data for peak usage calculation
            const dailyResponse = await getFilterUsageByPeriod(
              userId,
              selectedFilterObj.id,
              "daily",
            );
            if (dailyResponse && !dailyResponse.err && dailyResponse.result) {
              peakUsageForFilter = transformToPeakUsage(dailyResponse.result);
            }
            currentFilterForPeak = filterName;
          }

          const { labels, data } = formatChartData(response, period);
          const maxValue = Math.max(...data);
          lineChart.data.labels = labels;
          lineChart.data.datasets[0].data = data;

          // Update Y-axis scale
          if (maxValue === 0) {
            lineChart.options.scales.y.max = 10;
            lineChart.options.scales.y.ticks.stepSize = 2;
          } else if (maxValue <= 20) {
            lineChart.options.scales.y.max = 20;
            lineChart.options.scales.y.ticks.stepSize = 5;
          } else {
            lineChart.options.scales.y.max = Math.ceil(maxValue / 20) * 20;
            lineChart.options.scales.y.ticks.stepSize = 20;
          }

          const totalUsages = data.reduce((sum, val) => sum + val, 0);
          document.getElementById("totalUsages").textContent = totalUsages;
          console.log("Using real data:", { labels, data });
        } else {
          console.log("No real data found, using sample data");
          const sampleData = getSampleData(period);
          lineChart.data.labels = sampleData.labels;
          lineChart.data.datasets[0].data = sampleData.data;
          const totalUsages = sampleData.data.reduce(
            (sum, val) => sum + val,
            0,
          );
          document.getElementById("totalUsages").textContent = totalUsages;
        }
      } else {
        console.log("Missing user or filter, using sample data");
        const sampleData = getSampleData(period);
        lineChart.data.labels = sampleData.labels;
        lineChart.data.datasets[0].data = sampleData.data;
        const totalUsages = sampleData.data.reduce((sum, val) => sum + val, 0);
        document.getElementById("totalUsages").textContent = totalUsages;
      }
    } catch (error) {
      console.error("Error updating chart:", error);
      // For debugging, let's use your actual data structure
      const testData = {
        err: false,
        result: [
          { timestamp: "2025-12-17T16:07:44.099Z" },
          { timestamp: "2025-12-17T16:07:12.167Z" },
          { timestamp: "2025-12-17T16:00:52.145Z" },
          { timestamp: "2025-12-16T14:53:19.992Z" },
          { timestamp: "2025-12-15T13:52:32.568Z" },
          { timestamp: "2025-12-15T09:47:42.294Z" },
          { timestamp: "2025-12-15T08:22:11.902Z" },
        ],
      };
      const { labels, data } = formatChartData(testData, period);
      lineChart.data.labels = labels;
      lineChart.data.datasets[0].data = data;
      console.log("Using test data:", { labels, data });
    }

    lineChart.update();

    // Update peak usage chart only with stored data for this filter
    if (window.peakChart && peakUsageForFilter.length > 0) {
      window.peakChart.data.labels = peakUsageForFilter.map((d) => d.time);
      window.peakChart.data.datasets[0].data = peakUsageForFilter.map(
        (d) => d.usage,
      );
      window.peakChart.update();
    }
  }

  function formatChartData(data, period) {
    if (!data || !data.result) return { labels: [], data: [] };

    // Check if data has date/count structure
    if (
      data.result[0] &&
      data.result[0].date &&
      data.result[0].count !== undefined
    ) {
      if (period === "monthly") {
        const monthlyData = {};
        data.result.forEach((item) => {
          const date = new Date(item.date);
          const monthName = date.toLocaleDateString("en-US", {
            month: "short",
          });
          monthlyData[monthName] = (monthlyData[monthName] || 0) + item.count;
        });

        const allMonths = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        return {
          labels: allMonths,
          data: allMonths.map((month) => monthlyData[month] || 0),
        };
      }
    }

    const timestamps = data.result.map(
      (item) => new Date(item.timestamp || item.date),
    );

    if (period === "daily") {
      const now = new Date();
      const last12Hours = timestamps.filter((date) => {
        const hoursDiff = (now - date) / (1000 * 60 * 60);
        return hoursDiff <= 12;
      });

      const hourlyData = {};
      last12Hours.forEach((date) => {
        const timeStr = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const dateStr = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const key = `${timeStr} ${dateStr}`;
        hourlyData[key] = (hourlyData[key] || 0) + 1;
      });

      const sortedEntries = Object.entries(hourlyData).sort((a, b) => {
        const [hourA] = a[0].split(" ");
        const [hourB] = b[0].split(" ");
        return parseInt(hourA) - parseInt(hourB);
      });

      return {
        labels: sortedEntries.map(([key]) => key),
        data: sortedEntries.map(([, count]) => count),
      };
    } else if (period === "weekly") {
      // Handle weekly data with date and count structure
      if (
        data.result[0] &&
        data.result[0].date &&
        data.result[0].count !== undefined
      ) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const currentWeek = data.result.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= startOfWeek && itemDate <= endOfWeek;
        });
        const last7Days = data.result.filter((item) => {
          const itemDate = new Date(item.date);
          const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });

        const weeklyData = {};
        currentWeek.forEach((item) => {
          const date = new Date(item.date);
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          weeklyData[dayName] = item.count;
        });

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return {
          labels: daysOfWeek,
          data: daysOfWeek.map((day) => weeklyData[day] || 0),
        };
      } else {
        // Fallback for timestamp-only data
        const weeklyData = {};
        timestamps.forEach((date) => {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split("T")[0];
          weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
        });

        const weeks = Object.keys(weeklyData).sort().reverse().slice(0, 4);
        return {
          labels: weeks.map((week) => `Week ${weeks.indexOf(week) + 1}`),
          data: weeks.map((week) => weeklyData[week]),
        };
      }
    } else {
      const monthlyData = {};
      timestamps.forEach((date) => {
        const monthName = date.toLocaleDateString("en-US", { month: "short" });
        monthlyData[monthName] = (monthlyData[monthName] || 0) + 1;
      });

      const allMonths = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      return {
        labels: allMonths,
        data: allMonths.map((month) => monthlyData[month] || 0),
      };
    }
  }

  function transformToPeakUsage(data) {
    console.log("Transform Peak Usage Data:", data);
    if (!data || data.length === 0) return [];

    const hourlyUsage = {};

    data.forEach((point) => {
      const hour = new Date(point.timestamp).getHours();
      console.log("Timestamp:", point.timestamp, "Hour:", hour);
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
    });

    console.log("Hourly Usage:", hourlyUsage);

    // Get top 5 hours with most usage
    const sortedHours = Object.entries(hourlyUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, usage]) => ({
        time: formatHour(parseInt(hour)),
        usage: usage,
        width: Math.max(
          15,
          (usage / Math.max(...Object.values(hourlyUsage))) * 80,
        ),
      }));

    return sortedHours;
  }

  function formatHour(hour) {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  }

  function getSampleData(period) {
    const selectedFilterObj = filters.find((f) => f.name === selectedFilter);
    const filterIndex = filters.findIndex((f) => f.name === selectedFilter);

    // Different patterns for each filter
    const patterns = {
      daily: [
        [12, 19, 8, 15, 25, 32, 18], // Filter 1
        [5, 12, 18, 22, 15, 8, 10], // Filter 2
        [25, 30, 15, 35, 40, 45, 28], // Filter 3
        [8, 15, 12, 18, 20, 25, 14], // Filter 4
        [35, 42, 28, 50, 55, 60, 38], // Filter 5
      ],
      weekly: [
        [85, 120, 95, 140],
        [45, 65, 55, 80],
        [150, 180, 125, 200],
        [70, 95, 80, 110],
        [200, 240, 180, 280],
      ],
      monthly: [
        [320, 450, 280, 520, 380, 610],
        [180, 250, 150, 290, 210, 340],
        [500, 650, 420, 750, 580, 880],
        [280, 380, 240, 420, 320, 520],
        [650, 800, 550, 950, 720, 1100],
      ],
    };

    const patternIndex = Math.min(filterIndex, patterns.daily.length - 1);

    if (period === "daily") {
      return {
        labels: ["9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM", "3 AM"],
        data: patterns.daily[patternIndex] || patterns.daily[0],
      };
    } else if (period === "weekly") {
      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: patterns.weekly[patternIndex] || patterns.weekly[0],
      };
    } else {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: patterns.monthly[patternIndex] || patterns.monthly[0],
      };
    }
  }

  async function createTestData() {
    try {
      const userId = getUserIdFromLocalStorage();
      const selectedFilterObj = filters.find((f) => f.name === selectedFilter);

      if (userId && selectedFilterObj?.id) {
        await createTestOpenLinkData(userId, selectedFilterObj.id);
        alert(
          "Test data created! Click on the filter again to see the chart update.",
        );
      } else {
        alert("Please select a filter first.");
      }
    } catch (error) {
      console.error("Error creating test data:", error);
      alert("Error creating test data.");
    }
  }

  function exportToPDF() {
    window.print();
  }

  function exportToCSV() {
    const selectedFilterObj = filters.find((f) => f.name === selectedFilter);
    const csvData = [
      ["Filter Name", "Total Uses", "Users", "Total Shares"],
      [
        selectedFilter,
        getSelectedFilterUses(),
        getSelectedFilterUsers(),
        shareCount || 0,
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedFilter}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
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
          on:click={() => {
            selectedFilter = filter.name;
            updateChartForFilter(filter.name);
          }}
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
              <p>
                Created by: {getUserNameFromLocalStorage()} • Created: {getSelectedFilterCreatedDate()}
              </p>
              <div style="margin-top: 2px;">
                <span>⭐⭐⭐⭐☆</span>
                <span style="color: #999;">(4.5/5.0)</span>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 4px;">
            <!-- <button class="btn btn-secondary" on:click={createTestData}
              >Create Test Data</button
            > -->
            <!-- <button class="btn btn-secondary">Export</button>
            <button class="btn btn-secondary">Edit</button>
            <button class="btn" style="background: #ffebee; color: #c62828;"
              >Delete</button
            > -->
          </div>
        </div>

        <!-- User Activity Metrics -->
        <div class="metrics-horizontal">
          <div class="metric-item">
            <div class="metric-row">
              <TrendingUp class="metric-icon" size={16} />
              <div class="metric-number">{getSelectedFilterUses()}</div>
            </div>
            <div class="metric-text">Total Uses</div>
          </div>
          <div class="metric-item">
            <div class="metric-row">
              <Users class="metric-icon" size={16} />
              <div class="metric-number">{getSelectedFilterUsers()}</div>
            </div>
            <div class="metric-text">Users</div>
          </div>
          <div class="metric-item">
            <div class="metric-row">
              <Share class="metric-icon" size={16} />
              <div class="metric-number">{shareCount || 0}</div>
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
            <button
              class="tab-btn {activeTimeRange === 'daily' ? 'active' : ''}"
              on:click={() => updateTimeRange("daily")}>Daily</button
            >
            <button
              class="tab-btn {activeTimeRange === 'weekly' ? 'active' : ''}"
              on:click={() => updateTimeRange("weekly")}>Weekly</button
            >
            <button
              class="tab-btn {activeTimeRange === 'monthly' ? 'active' : ''}"
              on:click={() => updateTimeRange("monthly")}>Monthly</button
            >
          </div>
          <canvas id="lineChart"></canvas>
          <div class="chart-summary">
            <div class="summary-item">
              <span class="summary-label">Total Usages:</span>
              <span class="summary-value" id="totalUsages">0</span>
            </div>
          </div>
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
            <!-- <div class="legend-item">
              <Tablet class="legend-icon" size={16} />
              <span class="legend-percent">{deviceData.tablet}%</span>
              <span class="legend-label">Tablet</span>
            </div> -->
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
            <button class="btn btn-primary" on:click={exportToPDF}
              >Export PDF</button
            >
            <button class="btn btn-secondary" on:click={exportToCSV}
              >Export CSV</button
            >
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
    height: 180px !important;
    max-height: 180px;
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

  .chart-summary {
    margin-top: 16px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .summary-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }

  .summary-value {
    font-size: 16px;
    color: #1f2937;
    font-weight: 600;
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

  .peak-usage {
    font-family: Arial, sans-serif;
    padding: 16px;
  }

  .peak-usage h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .peak-usage .legend {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .peak-usage .usage-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .peak-usage .time {
    font-size: 10px;
    font-weight: 500;
  }

  .peak-usage .usage-number {
    font-size: 10px;
    font-weight: 600;
    color: #1f2937;
  }
</style>
