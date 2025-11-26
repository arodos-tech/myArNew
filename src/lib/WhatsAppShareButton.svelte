<script>
  import whatsappIcon from '$lib/assets/whatsapp.png';
  import { logEvent } from './logHelper';
  
  export let text = "Check this out!";

  export let imageBlob = null;
  export let filename = "photo.jpg";

  const handleShare = async () => {
    // Log share event
    await logEvent('shareOpened');
    // Skip Web Share API - go directly to WhatsApp
    if (imageBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(imageBlob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }
    
    // Share caption + current filter URL
    const filterUrl = window.location.href;
    const message = `${text}\n\nTry this AR filter: ${filterUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    // Try multiple methods to open WhatsApp
    try {
      // Method 1: Direct navigation (works on mobile)
      window.location.href = whatsappUrl;
    } catch (error) {
      // Method 2: New window (works on desktop)
      window.open(whatsappUrl, "_blank");
    }
  };
</script>

<button class="action-btn share-btn" on:click={handleShare} style="background: transparent; border: none;">
  <span class="btn-icon"><img src={whatsappIcon} alt="WhatsApp" style="width: 58%; height: 58%; background: transparent;" /></span>
  <span class="btn-text">WhatsApp</span>
</button>