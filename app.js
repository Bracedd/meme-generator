document.addEventListener("DOMContentLoaded", () => {
  const memeCreator = document.getElementById("meme-creator");
  const topTextInput = document.getElementById("top-text");
  const bottomTextInput = document.getElementById("bottom-text");
  const generateBtn = document.getElementById("generate-btn");
  const downloadBtn = document.getElementById("download-btn");
  const lockBtn = document.getElementById("lock-btn");

  const IMGFLIP_USERNAME = "DivpreetSingh";
  const IMGFLIP_PASSWORD = "hellodude";

  let templates = [];
  let isLocked = false;
  let currentMemeUrl = null;
  let currentTemplateId = null; // Store template ID of the locked meme

  // Load templates from Imgflip API
  async function loadTemplates() {
      try {
          const response = await fetch("https://api.imgflip.com/get_memes");
          const data = await response.json();

          if (data.success) {
              templates = data.data.memes; // Store templates globally
          } else {
              console.error("Failed to load templates:", data.error_message);
          }
      } catch (error) {
          console.error("Error fetching templates:", error);
      }
  }

  // Select a random template
  function selectRandomTemplate() {
      const randomIndex = Math.floor(Math.random() * templates.length);
      return templates[randomIndex].id;
  }

  // Generate meme using Imgflip API
  async function generateMeme() {
      const topText = topTextInput.value;
      const bottomText = bottomTextInput.value;

      let selectedTemplateId = null;

      // If image is unlocked, select a new random template
      if (!isLocked) {
          selectedTemplateId = selectRandomTemplate();
          currentMemeUrl = null; // Reset the current meme URL if image is not locked
          currentTemplateId = selectedTemplateId; // Update with new template
      } else {
          // If image is locked, reuse the locked template ID
          selectedTemplateId = currentTemplateId;
      }

      try {
          const params = new URLSearchParams({
              template_id: selectedTemplateId,
              username: IMGFLIP_USERNAME,
              password: IMGFLIP_PASSWORD,
              text0: topText,
              text1: bottomText,
          });

          const response = await fetch(`https://api.imgflip.com/caption_image?${params.toString()}`, {
              method: "POST",
          });

          const data = await response.json();

          if (data.success) {
              const memeUrl = data.data.url;
              displayMeme(memeUrl, selectedTemplateId);
          } else {
              console.error("Failed to generate meme:", data.error_message);
          }
      } catch (error) {
          console.error("Error generating meme:", error);
      }
  }

  // Display generated meme
  function displayMeme(memeUrl, templateId) {
      currentMemeUrl = memeUrl;
      currentTemplateId = templateId; // Update the template ID of the displayed meme

      const memeImg = document.createElement("img");
      memeImg.src = memeUrl;
      memeImg.alt = "Generated Meme";
      memeImg.classList.add("generated-meme");

      const memePreview = document.getElementById("meme-preview");
      memePreview.innerHTML = ""; // Clear previous content
      memePreview.appendChild(memeImg);

      downloadBtn.classList.remove("hidden");
      downloadBtn.onclick = () => downloadMeme(memeUrl);
  }

  // Download the meme
  function downloadMeme(memeUrl) {
      fetch(memeUrl)
          .then((response) => response.blob())
          .then((blob) => {
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = blobUrl;
              link.download = "meme.jpg"; // Ensure the filename
              document.body.appendChild(link); // Append link to body
              link.click();
              link.remove(); // Remove link after download
              URL.revokeObjectURL(blobUrl); // Clean up URL object

          })
          .catch((error) => {
              console.error("Error downloading meme:", error);
              showToast("Failed to download the meme.");
          });
  }

  // Show toast notification
  function showToast(message) {
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = message;

      document.body.appendChild(toast);

      setTimeout(() => {
          toast.classList.add("fade-out");
          toast.addEventListener("transitionend", () => toast.remove());
      }, 3000);
  }

  // Lock the image
  function lockImage() {
      isLocked = !isLocked;
      lockBtn.textContent = isLocked ? "Unlock Image" : "Lock Image";

      if (!isLocked && currentMemeUrl) {
          // If unlocked, clear the previous meme to let the user generate a new one
          currentMemeUrl = null;
      }
  }

  // Generate meme when "Generate Meme" is clicked
  generateBtn.addEventListener("click", generateMeme);

  // Lock/Unlock button functionality
  lockBtn.addEventListener("click", lockImage);

  // Load templates on page load
  loadTemplates();
});
