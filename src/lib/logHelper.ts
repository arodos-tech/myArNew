import { saveLogs } from "../services/actions/logs";
import { v4 as uuidv4 } from "uuid";

// Auto-logging disabled to prevent stats inflation
// Only log events when user actually performs actions

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

    // Simplified logging - one event per action
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);

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
