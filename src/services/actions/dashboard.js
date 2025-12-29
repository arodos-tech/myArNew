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


export async function getFilterUsageByPeriod(user, filterId, period = 'daily') {
  let sql;
  let endpoint;

  switch (period) {
    case 'daily':
      sql = "SELECT timestamp FROM log_datas WHERE user = ? AND filter = ? AND type = 'openLink' ORDER BY timestamp DESC";
      endpoint = "/filter-usage-daily";
      break;
    case 'weekly':
      sql = "SELECT DATE(timestamp) as date, COUNT(*) as count FROM log_datas WHERE user = ? AND filter = ? AND type = 'openLink' GROUP BY DATE(timestamp) ORDER BY date DESC";
      endpoint = "/filter-usage-weekly";
      break;
    case 'monthly':
      sql = "SELECT DATE(timestamp) as date, COUNT(*) as count FROM log_datas WHERE user = ? AND filter = ? AND type = 'openLink' GROUP BY DATE(timestamp) ORDER BY date DESC";
      endpoint = "/filter-usage-monthly";
      break;
  }

  const response = await Api.sql(endpoint, {
    body: { sql, params: [user, filterId] }
  });
  return response;
}

export async function getFilterDailyUsage(user, filterId) {
  return getFilterUsageByPeriod(user, filterId, 'daily');
}

export async function createTestOpenLinkData(user, filterId) {
  const events = [];

  // Create 7 days of test data
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const count = Math.floor(Math.random() * 10) + 1; // 1-10 events per day

    for (let j = 0; j < count; j++) {
      events.push({
        user: user,
        filter: filterId,
        type: "openLink",
        timestamp: date.toISOString(),
        session: `session_${Date.now()}_${j}`
      });
    }
  }

  // Insert all events
  for (const event of events) {
    await Api.post("/log-datas", { body: event });
  }

  return { success: true, count: events.length };
}

export async function getDeviceAnalytics(filterId) {
  const response = await Api.sql("/filter-device-stats", {
    body: {
      sql: "SELECT type, COUNT(*) as count FROM log_datas WHERE filter = ? AND type IN ('mobile_open', 'desktop_open') GROUP BY type",
      params: [filterId]
    }
  });
  return response;
}

export async function trackDeviceUsage(userId, filterId, deviceType, sessionId = null) {
  const type = deviceType === 'mobile' ? 'mobile_open' : 'desktop_open';
  const response = await Api.post("/log-datas", {
    body: {
      user: userId,
      filter: filterId,
      session: sessionId || `${deviceType}_${Date.now()}`,
      type: type,
      timestamp: new Date().toISOString()
    }
  });
  return response;
}

export async function getFilterUsersCount() {
  const response = await Api.sql("/filter-users-count", {
    body: {
      sql: "SELECT f.id, f.name, COUNT(DISTINCT ld.user) as unique_users FROM filters f LEFT JOIN log_datas ld ON f.id = ld.filter GROUP BY f.id, f.name ORDER BY unique_users DESC"
    }
  });
  return response;
}

export async function getFilterSessionsCount(userId) {
  const response = await Api.sql("/filter-sessions-count", {
    body: {
      sql: "SELECT f.id, f.name, COUNT(DISTINCT ld.session) as unique_sessions FROM filters f LEFT JOIN log_datas ld ON f.id = ld.filter WHERE f.user = ? GROUP BY f.id, f.name ORDER BY unique_sessions DESC",
      params: [userId]
    }
  });
  return response;
}

export async function getShareOpenedCount(filterId) {
  const response = await Api.sql("/filter-share-count", {
    body: {
      sql: "SELECT COUNT(*) as share_opened_count FROM log_datas WHERE filter = ? AND type = 'shareOpened'",
      params: [filterId]
    }
  });
  return response;
}

export async function getCurrentUserProfile(userId) {
  const response = await Api.sql("/get-user-profile", {
    body: {
      sql: "SELECT prof_picture FROM users WHERE id = ?",
      params: [userId]
    }
  });
  return response;
}

export async function updateUserProfile(userId, userData) {
  const response = await Api.sql("/update-user-prof", {
    body: {
      sql: "UPDATE users SET name = ?, email = ?, subdomain = ?, prof_picture = ?, updated_at = NOW() WHERE id = ?",
      params: [userData.name, userData.email, userData.subdomain, userData.prof_picture, userId],
    },
  });

  return response;
}
