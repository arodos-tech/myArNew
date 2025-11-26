import Api from "../Api";

export async function getFilterUsage() {
  const response = await Api.sql("/filter-usage", {
    body: {
      sql: "SELECT type, COUNT(*) AS total_logs FROM log_datas GROUP BY type",
    },
  });

  return response;
}

export async function getClientFilterUsage(user) {
  const response = await Api.sql("/filter-usage-client", {
    body: {
      sql: "SELECT type, COUNT(*) AS total_logs FROM log_datas where user= ? GROUP BY type",
      params: [user],
    },
  });

  return response;
}
