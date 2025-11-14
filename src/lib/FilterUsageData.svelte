<script>
  const filterData = [
    {
      name: "Vintage",
      timesUsed: 150,
      users: 120,
      mediaCaptured: 100,
      thumbnail: "vintage"
    },
    {
      name: "Black & White",
      timesUsed: 200,
      users: 180,
      mediaCaptured: 160,
      thumbnail: "bw"
    },
    {
      name: "Sepia",
      timesUsed: 100,
      users: 90,
      mediaCaptured: 80,
      thumbnail: "sepia"
    }
  ];
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
    
    {#each filterData as filter, index}
      <div class="table-row" class:last-row={index === filterData.length - 1}>
        <div class="data-cell filter-name">
          <div class="thumbnail {filter.thumbnail}"></div>
          <span>{filter.name}</span>
        </div>
        <div class="data-cell">{filter.timesUsed}</div>
        <div class="data-cell">{filter.users}</div>
        <div class="data-cell">{filter.mediaCaptured}</div>
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

  .thumbnail.vintage {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
  }

  .thumbnail.bw {
    background: linear-gradient(135deg, #000000, #ffffff);
  }

  .thumbnail.sepia {
    background: linear-gradient(135deg, #8b4513, #daa520);
  }


</style>