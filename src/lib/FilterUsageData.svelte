<script>
  export let filterUsageData = [];
</script>

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
      <div class="table-row" class:last-row={index === filterUsageData.length - 1}>
        <div class="data-cell filter-name">
          <div class="thumbnail" style="background-image: url({filter.filter_url})"></div>
          <span>{filter.name || 'Untitled Filter'}</span>
        </div>
        <div class="data-cell">{filter.times_used || filter.chart_stat || 0}</div>
        <div class="data-cell">{filter.user_stat || 0}</div>
        <div class="data-cell">{filter.media_captured || 0}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .dashboard-container {
    background: #FFFFFF;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    width: 100%;
    margin: 0 auto;
    border: 1px solid #e2e8f0;
  }

  .dashboard-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 1.5rem 0;
  }

  .table-container {
    width: 100%;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .header-cell {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: left;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #f3f4f6;
    align-items: center;
  }

  .table-row.last-row {
    border-bottom: none;
  }

  .data-cell {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.9rem;
    font-weight: 400;
    color: #374151;
    display: flex;
    align-items: center;
  }

  .filter-name {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .thumbnail {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .thumbnail {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #f7fafc;
  }


</style>