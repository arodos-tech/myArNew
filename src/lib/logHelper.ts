import { saveLogs } from "../services/actions/logs";
import { v4 as uuidv4 } from "uuid";

// Auto-detect and log mobile access immediately when module loads
if (typeof window !== 'undefined') {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Log mobile access immediately
    setTimeout(async () => {
      try {
        // Extract user ID from URL like desktop does
        const urlParams = window.location.search.substring(1).split("&");
        let tempUserId = 180001; // fallback
        if (urlParams.length >= 2) {
          const secondParam = urlParams[1];
          if (!secondParam.includes("=")) {
            tempUserId = parseInt(secondParam) || 180001;
          }
        }
        const deviceId = 'mobile_' + Math.random().toString(36).substring(7);
        
        const mobileData = {
          user: tempUserId,
          type: 'mobile_open',
          timestamp: new Date().toISOString(),
          session: deviceId,
          filter: null,
        };
        
        // Log the same events that desktop logs
        const mobileEvents = [
          { type: 'openLink', delay: 0 },
          { type: 'cameraAccessAttempt', delay: 500 },
          { type: 'mobile_open', delay: 1000 }
        ];
        
        for (const event of mobileEvents) {
          setTimeout(async () => {
            const eventData = {
              user: tempUserId,
              type: event.type,
              timestamp: new Date().toISOString(),
              session: deviceId,
              filter: null,
            };
            await saveLogs(eventData);
            console.log(`✅ Mobile logged ${event.type}`);
          }, event.delay);
        }
        
        alert('📱 MOBILE: Logged openLink + cameraAccessAttempt + mobile_open');
      } catch (error) {
        console.error('❌ Mobile logging failed:', error);
        alert('❌ Mobile logging failed: ' + error.message);
      }
    }, 1000);
  }
}

/**
 * Logs user activity (QRscan, capture, share, etc.)
 * Always sends: user, type, timestamp, session (unique per device)
 * Optional: filter ID when a filter is used
 */
export async function logEvent(type: string, filterId: string | null = null) {
  try {
    // Check if we've already logged device type for this session
    const deviceLogged = localStorage.getItem('deviceTypeLogged');
    
    let userData = localStorage.getItem("user");
    let userId: string | null = null;

    if (userData) {
      userData = JSON.parse(userData);
      userId = (userData as any)?.id;
    }

    // If no user exists, use or create a temporary UUID for user
    if (!userId) {
      let tempUserId = localStorage.getItem("tempUserId");
      if (!tempUserId) {
        tempUserId = uuidv4();
        localStorage.setItem("tempUserId", tempUserId);
      }
      userId = tempUserId;
    }

    // Generate or retrieve persistent unique device ID (<= 30 chars)
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      // Create a compact version of UUID (remove dashes and trim to 30 chars)
      deviceId = uuidv4().replace(/-/g, "").substring(0, 30);
      localStorage.setItem("deviceId", deviceId);
    }

    // Auto-log mobile events on first call
    if (!deviceLogged) {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Force log all the events that should happen on mobile
        const events = [
          { type: 'openLink', delay: 0 },
          { type: 'cameraAccessAttempt', delay: 100 },
          { type: 'mobile_open', delay: 200 }
        ];
        
        for (const event of events) {
          setTimeout(async () => {
            const eventData = {
              user: userId,
              type: event.type,
              timestamp: new Date().toISOString(),
              session: deviceId,
              filter: filterId,
            };
            await saveLogs(eventData);
            console.log(`✅ Mobile auto-logged ${event.type}`);
          }, event.delay);
        }
      }
      
      localStorage.setItem('deviceTypeLogged', 'true');
    }

    const logData = {
      user: userId,
      type,
      timestamp: new Date().toISOString(),
      session: deviceId, // fits VARCHAR(30)
      filter: filterId, // Include the actual filter ID
    };

    await saveLogs(logData);
    console.log(`✅ Logged ${type}:`, logData);
  } catch (error) {
    console.error(`❌ Failed to log ${type}:`, error);
  }
}
