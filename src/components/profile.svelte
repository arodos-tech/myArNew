<script lang="ts">
  import { User, Camera, Save } from "lucide-svelte";
  import { onMount } from "svelte";

  // Profile data - will be loaded from localStorage
  let profileData = {
    firstName: "",
    lastName: "",
    email: "",
    subdomain: "",
    bio: "Create the first file and digit print of this document.",
    profileImage: null,
    profileImageUrl: "",
  };

  let bioCharCount = profileData.bio.length;
  const maxBioChars = 180;

  // Load user data from localStorage on mount
  onMount(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const nameParts = (user.name || "").split(" ");
      profileData.firstName = nameParts[0] || "";
      profileData.lastName = nameParts.slice(1).join(" ") || "";
      profileData.email = user.email || "";
      profileData.subdomain = user.subdomain || "";
      profileData.profileImageUrl = user.prof_picture || "";
    }
  });

  function handleBioChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    profileData.bio = target.value;
    bioCharCount = target.value.length;
  }

  function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      profileData.profileImage = file;

      // Compress and resize image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize to max 200x200
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        profileData.profileImageUrl = canvas.toDataURL('image/jpeg', 0.7);
      };
      
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function saveProfile() {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id;
      
      if (!userId) {
        alert("User not found. Please login again.");
        return;
      }

      const updateData = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        subdomain: profileData.subdomain,
        prof_picture: profileData.profileImageUrl
      };

      // Import and use the dashboard function
      const { updateUserProfile } = await import("/src/services/actions/dashboard.js");
      const response = await updateUserProfile(userId, updateData);
      
      if (response.err) {
        throw new Error(response.err);
      }
      
      userData.name = updateData.name;
      userData.email = updateData.email;
      userData.subdomain = updateData.subdomain;
      userData.prof_picture = updateData.prof_picture;
      localStorage.setItem("user", JSON.stringify(userData));
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    }
  }
</script>

<div class="profile-page">
  <div class="profile-header">
    <div class="header-text">
      <h1>Profile Settings</h1>
      <p>Manage your personal information and account settings.</p>
    </div>
  </div>

  <div class="profile-content">
    <div class="profile-section">
      <h2>Profile Information</h2>
      <p class="section-description">
        Update your personal details and public profile
      </p>

      <div class="profile-image-section">
        <div class="image-upload">
          <div class="image-placeholder">
            {#if profileData.profileImageUrl}
              <img
                src={profileData.profileImageUrl}
                alt="Profile"
              />
            {:else}
              <User size={40} />
            {/if}
            <div class="change-overlay">
              <Camera size={16} />
            </div>
          </div>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif"
            on:change={handleImageUpload}
            class="file-input"
          />
        </div>
        <div class="image-text">
          <div class="avatar-title">Change Avatar</div>
          <p class="image-hint">JPG, PNG or GIF. Max size 2MB</p>
        </div>
      </div>

      <div class="divider"></div>

      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              bind:value={profileData.firstName}
              placeholder="Enter your first name"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              bind:value={profileData.lastName}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            type="email"
            bind:value={profileData.email}
            placeholder="Enter your email address"
            class="email-input"
          />
        </div>

        <div class="form-group">
          <label for="subdomain">Custom Subdomain</label>
          <div class="subdomain-input">
            <input
              id="subdomain"
              type="text"
              bind:value={profileData.subdomain}
              placeholder="Enter your subdomain"
            />
            <span class="domain-suffix">.myar.in</span>
          </div>
          <p class="subdomain-hint">
            Your public profile will be available at: johndoo.filtersapp.com
          </p>
        </div>

        <div class="form-group">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            bind:value={profileData.bio}
            on:input={handleBioChange}
            placeholder="Tell us about yourself"
            maxlength={maxBioChars}
            rows={3}
            class="bio-textarea"
          ></textarea>
          <div class="char-counter">
            {bioCharCount}/{maxBioChars} characters
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-button"> cancel </button>
          <button class="save-button" on:click={saveProfile}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .profile-page {
    width: 100%;
  }

  .profile-header {
    margin-bottom: 2rem;
  }

  .profile-header h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }

  .profile-header p {
    color: #718096;
    font-size: 0.95rem;
    margin: 0;
  }

  .profile-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .profile-section {
    padding: 2rem;
  }

  .profile-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }

  .section-description {
    color: #718096;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  .profile-image-section {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .image-upload {
    display: inline-block;
    position: relative;
    flex-shrink: 0;
  }

  .image-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #f7fafc;
    border: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .image-placeholder:hover {
    border-color: #1a8ef1;
  }

  .image-placeholder img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .change-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: 50%;
  }

  .image-placeholder:hover .change-overlay {
    opacity: 1;
  }

  .file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .image-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.25rem;
  }

  .avatar-title {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.95rem;
  }

  .image-hint {
    font-size: 0.8rem;
    color: #718096;
    margin: 0;
  }

  .divider {
    height: 1px;
    background: #e2e8f0;
    margin: 2rem 0;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 500;
    color: #2d3748;
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group textarea {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
    background: white;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #1a8ef1;
    box-shadow: 0 0 0 3px rgba(26, 142, 241, 0.1);
  }

  .email-input {
    background: #f7fafc;
    color: #718096;
  }

  .bio-textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  .subdomain-input {
    display: flex;
    align-items: center;
  }

  .subdomain-input input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
    flex: 1;
  }

  .domain-suffix {
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-left: none;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    padding: 0.75rem;
    font-size: 0.9rem;
    color: #718096;
    white-space: nowrap;
  }

  .subdomain-hint {
    font-size: 0.8rem;
    color: #718096;
    margin: 0.5rem 0 0 0;
  }

  .char-counter {
    font-size: 0.8rem;
    color: #718096;
    text-align: right;
    margin-top: 0.25rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
    gap: 1rem;
  }

  .save-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #1a8ef1;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 0.9rem;
  }
  .cancel-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f2f4f6;
    color: back;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 0.9rem;
  }
  .cancel-button:hover {
    background: #c8c9ca;
  }
  .save-button:hover {
    background: #1579d1;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .profile-page {
      padding: 0 1rem;
    }

    .profile-section {
      padding: 1.5rem;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .profile-image-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }

  @media (max-width: 480px) {
    .profile-section {
      padding: 1rem;
    }

    .profile-header h1 {
      font-size: 1.5rem;
    }

    .profile-header p {
      font-size: 0.85rem;
    }

    .image-placeholder {
      width: 70px;
      height: 70px;
    }

    .save-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
