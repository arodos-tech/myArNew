<script>
  export let trendData = [];
  
  function transformToPeakUsage(data) {
    if (!data || data.length === 0) return [];
    
    const hourlyUsage = {};
    
    data.forEach(point => {
      const hour = new Date(point.timestamp).getHours();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
    });
    
    const peakHours = [
      { time: '9 AM', hour: 9 },
      { time: '12 PM', hour: 12 },
      { time: '3 PM', hour: 15 },
      { time: '6 PM', hour: 18 },
      { time: '9 PM', hour: 21 }
    ];
    
    const maxUsage = Math.max(...Object.values(hourlyUsage), 1);
    
    return peakHours.map(({ time, hour }) => ({
      time,
      usage: hourlyUsage[hour] || 0,
      width: Math.max(20, ((hourlyUsage[hour] || 0) / maxUsage) * 100)
    }));
  }
  
  $: peakData = transformToPeakUsage(trendData);
</script>

<div class="peak-usage">
  <h3>Peak Usage Time</h3>
  <div class="legend">
    <span class="bar"></span> Usages
  </div>
  {#each peakData as { time, usage, width }}
    <div class="usage-row">
      <span class="time">{time}</span>
      <div class="bar" style="width: {width}%"></div>
    </div>
  {/each}
</div>

<style>
  .peak-usage {
    font-family: Arial, sans-serif;
    padding: 16px;
  }
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .legend {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .usage-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }
  
  .time {
    width: 50px;
    font-size: 14px;
  }
  
  .bar {
    height: 20px;
    background-color: #4285f4;
    border-radius: 2px;
    min-width: 20px;
  }
</style>