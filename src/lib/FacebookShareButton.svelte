<script>
  import facebookIcon from '$lib/assets/facebook.png';
  
  export let quote = "Check this out!";
  export let imageBlob = null;
  export let filename = "photo.jpg";

  const handleShare = async () => {
    // Download photo
    if (imageBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(imageBlob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }
    
    // Share caption + current filter URL on Facebook
    const filterUrl = window.location.href;
    const message = `${quote}\n\nTry this AR filter: ${filterUrl}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(filterUrl)}&quote=${encodeURIComponent(message)}`;
    
    // Try multiple methods to open Facebook
    try {
      window.location.href = shareUrl;
    } catch (error) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };
</script>

<button class="action-btn share-btn" on:click={handleShare} style="background: transparent; border: none;">
  <span class="btn-icon"><img src={facebookIcon} alt="Facebook" style="width: 108%; height: 108%; background: transparent;" /></span>
  <span class="btn-text">Facebook</span>
</button>