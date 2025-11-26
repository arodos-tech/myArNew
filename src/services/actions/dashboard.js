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
