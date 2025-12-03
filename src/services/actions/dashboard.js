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

export async function getClientAllFilterUsage(user) {
  const response = await Api.sql("/filter-usage-client-all", {
    body: {
      sql: "SELECT f.name, SUM(CASE WHEN ld.type = 'photoCapture' THEN 1 ELSE 0 END) AS photo_capture_count, SUM(CASE WHEN ld.type = 'filterUsed' THEN 1 ELSE 0 END) AS total_used_count, COUNT(*) AS total_logs FROM log_datas ld LEFT JOIN filters f ON ld.filter = f.id WHERE ld.user= ? GROUP BY f.name ORDER BY total_logs DESC",
      params: [user],
    },
  });

  return response;
}

export async function logMobileAccess(user, type = 'mobile_open') {
  const response = await Api.post("/log-datas", {
    body: {
      user: user,
      type: type,
      timestamp: new Date().toISOString(),
      session: 'mobile_session',
      filter: null
    },
  });
  return response;
}
