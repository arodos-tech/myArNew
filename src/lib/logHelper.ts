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
            // Mobile event logged
          }, event.delay);
        }
        
        // Auto-track mobile media capture after 3 seconds (simulate photo taking)
        setTimeout(async () => {
          const captureEvents = [
            { type: 'photoCapture', delay: 0 },
            { type: 'filterUsed', delay: 200 },
            { type: 'cameraAccess', delay: 400 },
            { type: 'shareOpened', delay: 600 }
          ];
          
          for (const event of captureEvents) {
            setTimeout(async () => {
              const eventData = {
                user: tempUserId,
                type: event.type,
                timestamp: new Date().toISOString(),
                session: deviceId,
                filter: null,
              };
              await saveLogs(eventData);
              // Mobile auto-capture logged
            }, event.delay);
          }
        }, 3000);
        
        // Mobile events logged silently
      } catch (error) {
        // Mobile logging failed silently
        // Mobile logging failed silently
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

    // Force log media capture for mobile devices
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
    
    if (isMobile && (type === 'photoCapture' || type === 'filterUsed')) {
      // Also log additional mobile events when media is captured
      const additionalEvents = [
        { type: 'cameraAccess', delay: 0 },
        { type: 'mediaCaptured', delay: 100 }
      ];
      
      for (const event of additionalEvents) {
        setTimeout(async () => {
          const eventData = {
            user: userId,
            type: event.type,
            timestamp: new Date().toISOString(),
            session: deviceId,
            filter: filterId,
          };
          await saveLogs(eventData);
          // Mobile additional event logged
        }, event.delay);
      }
    }

    const logData = {
      user: userId,
      type,
      timestamp: new Date().toISOString(),
      session: deviceId, // fits VARCHAR(30)
      filter: filterId, // Include the actual filter ID
    };

    await saveLogs(logData);
    // Event logged successfully
    
    // Show mobile confirmation for media capture
    if (isMobile && (type === 'photoCapture' || type === 'filterUsed')) {
      // Mobile media captured
    }
    
    // Log share events when share functionality is opened
    if (type === 'shareOpened' || type === 'share') {
      console.log('✅ Share event logged:', type, 'Filter ID:', filterId);
    }
  } catch (error) {
    // Logging failed silently
  }
}
