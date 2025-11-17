import Api from "../Api";

export async function getFilterUsage() {
  const response = await Api.sql("/filter-usage", {
    body: {
      sql: "SELECT type, COUNT(*) AS total_logs FROM log_datas GROUP BY type",
    },
  });

  return response;
}
