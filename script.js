// Configuration
const API_URL = "http://localhost:8000";
const GEMSTONE_EMOJIS = {
  Emerald: "💚",
  Fake_Emerald: "🟢",
  Fake_Ruby: "🔴",
  Fake_Turquoise: "🔵",
  Ruby: "❤️",
  Turquoise: "💙",
};

// Gemstone Descriptions
const GEMSTONE_DESCRIPTIONS = {
  Emerald:
    "Natural green beryllium aluminum silicate. Highly valued for its vibrant green color.",
  Fake_Emerald:
    "Imitation or synthetic emerald. Often made from glass or other materials to mimic natural emerald.",
  Ruby: "Natural deep red corundum. One of the most precious gemstones, valued for its intense red hue.",
  Fake_Ruby:
    "Imitation or synthetic ruby. Artificially created to replicate the appearance of natural ruby.",
  Turquoise:
    "Natural blue-green phosphate mineral. Known for its distinctive turquoise color and unique patterns.",
  Fake_Turquoise:
    "Synthetic or imitation turquoise. Often made from resin, plastic, or dyed materials.",
};

// Gemstone Categories
const GEMSTONE_CATEGORIES = {
  REAL: ["Emerald", "Ruby", "Turquoise"],
  FAKE: ["Fake_Emerald", "Fake_Ruby", "Fake_Turquoise"],
};

// State
let currentMode = "single";
let isProcessing = false;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners();
  checkAPIStatus();
  // loadSupportedClasses(); // Removed - no longer displayed on UI
});

// Check API Status
async function checkAPIStatus() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      updateAPIStatus(true);
    } else {
      updateAPIStatus(false);
    }
  } catch (error) {
    updateAPIStatus(false);
  }
}

// Update API Status
function updateAPIStatus(isActive) {
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");

  if (isActive) {
    statusIndicator.classList.remove("bg-red-500", "animate-pulse");
    statusIndicator.classList.add("bg-green-500");
    statusText.textContent = "API Connected";
    statusText.classList.remove("text-red-600");
    statusText.classList.add("text-green-600");
  } else {
    statusIndicator.classList.remove("bg-green-500");
    statusIndicator.classList.add("bg-red-500", "animate-pulse");
    statusText.textContent = "API Disconnected";
    statusText.classList.remove("text-green-600");
    statusText.classList.add("text-red-600");
    showToast(
      "API is not connected. Make sure the server is running.",
      "warning",
    );
  }
}

// Load Supported Classes
async function loadSupportedClasses() {
  try {
    const response = await fetch(`${API_URL}/classes`);
    const data = await response.json();

    const classesGrid = document.getElementById("classesGrid");
    classesGrid.innerHTML = "";

    data.classes.forEach((className) => {
      const classCard = document.createElement("div");
      const isReal = GEMSTONE_CATEGORIES.REAL.includes(className);
      const borderColor = isReal
        ? "border-green-400 hover:border-green-500"
        : "border-red-400 hover:border-red-500";
      const bgColor = isReal
        ? "from-green-50 to-emerald-50"
        : "from-red-50 to-pink-50";
      const badgeColor = isReal
        ? "bg-green-200 text-green-800"
        : "bg-red-200 text-red-800";

      classCard.className = `bg-gradient-to-br ${bgColor} p-6 rounded-xl text-center border-2 border-transparent ${borderColor} transition-all duration-300 hover:scale-105 hover:shadow-lg`;
      classCard.innerHTML = `
        <div class="mb-3">
          <span class="text-4xl">${GEMSTONE_EMOJIS[className] || "💎"}</span>
        </div>
        <div class="font-bold text-gray-800 text-base mb-2">${className.replace(/_/g, " ")}</div>
        <span class="inline-block ${badgeColor} px-3 py-1 rounded-full text-xs font-semibold mb-3">${isReal ? "AUTHENTIC" : "IMITATION"}</span>
        <div class="text-gray-600 text-xs leading-relaxed h-12 overflow-hidden">${GEMSTONE_DESCRIPTIONS[className] || ""}</div>
      `;
      classCard.setAttribute(
        "title",
        GEMSTONE_DESCRIPTIONS[className] || className,
      );
      classesGrid.appendChild(classCard);
    });
  } catch (error) {
    console.error("Error loading classes:", error);
  }
}

// Initialize Event Listeners
function initializeEventListeners() {
  // Mode switching
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", switchMode);
  });

  // Single image upload
  const uploadArea = document.getElementById("uploadArea");
  const singleImageInput = document.getElementById("singleImageInput");

  uploadArea.addEventListener("click", () => singleImageInput.click());
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleSingleDrop);
  singleImageInput.addEventListener("change", handleSingleImageSelect);

  // Batch upload
  const batchUploadArea = document.getElementById("batchUploadArea");
  const batchImageInput = document.getElementById("batchImageInput");

  batchUploadArea.addEventListener("click", () => batchImageInput.click());
  batchUploadArea.addEventListener("dragover", handleDragOver);
  batchUploadArea.addEventListener("dragleave", handleDragLeave);
  batchUploadArea.addEventListener("drop", handleBatchDrop);
  batchImageInput.addEventListener("change", handleBatchImageSelect);

  // Upload another buttons
  document
    .getElementById("uploadAnotherBtn")
    .addEventListener("click", resetSingleMode);
  document
    .getElementById("uploadAnotherBatchBtn")
    .addEventListener("click", resetBatchMode);
}

// Mode Switching
function switchMode(e) {
  const newMode =
    e.target.dataset.mode || e.target.closest(".mode-btn").dataset.mode;
  currentMode = newMode;

  // Update buttons
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.remove("border-indigo-600", "text-indigo-600");
    btn.classList.add("border-transparent", "text-gray-600");
  });
  e.target
    .closest(".mode-btn")
    .classList.remove("border-transparent", "text-gray-600");
  e.target
    .closest(".mode-btn")
    .classList.add("border-indigo-600", "text-indigo-600");

  // Update sections
  document.querySelectorAll(".mode-section").forEach((section) => {
    section.classList.remove("active");
  });

  if (newMode === "single") {
    document.getElementById("singleMode").classList.add("active");
  } else {
    document.getElementById("batchMode").classList.add("active");
  }
}

// Drag and Drop
function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("border-indigo-300", "bg-indigo-50");
  e.currentTarget.classList.add("border-indigo-600", "bg-indigo-100");
}

function handleDragLeave(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("border-indigo-600", "bg-indigo-100");
  e.currentTarget.classList.add("border-indigo-300", "bg-indigo-50");
}

function handleSingleDrop(e) {
  e.preventDefault();
  document.getElementById("uploadArea").classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith("image/")) {
      processSingleImage(file);
    } else {
      showToast("Please drop an image file", "warning");
    }
  }
}

function handleBatchDrop(e) {
  e.preventDefault();
  document.getElementById("batchUploadArea").classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (imageFiles.length > 0) {
      processBatchImages(imageFiles);
    } else {
      showToast("Please drop image files", "warning");
    }
  }
}

// Single Image Selection
function handleSingleImageSelect(e) {
  if (e.target.files.length > 0) {
    processSingleImage(e.target.files[0]);
  }
}

async function processSingleImage(file) {
  if (isProcessing) return;
  isProcessing = true;

  // Show loading state
  document.getElementById("uploadArea").style.display = "none";
  document.getElementById("singleLoadingContainer").style.display = "flex";

  try {
    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    // Send to API
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Prediction failed");
    }

    const result = await response.json();
    displaySingleResult(file, result);
  } catch (error) {
    console.error("Error:", error);
    showToast("Error processing image: " + error.message, "danger");
    resetSingleMode();
  } finally {
    isProcessing = false;
  }
}

function displaySingleResult(file, result) {
  // Hide loading, show results
  document.getElementById("singleLoadingContainer").style.display = "none";
  document.getElementById("singleResultContainer").style.display = "grid";

  // Display image
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("resultImage").src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Display prediction
  const className = result.predicted_class;
  const confidence = (result.confidence * 100).toFixed(2);

  document.getElementById("predictedClassName").textContent = className.replace(
    "_",
    " ",
  );
  document.getElementById("predictedClassName").style.color = "white";
  document.getElementById("confidence").textContent = `${confidence}%`;

  // Display probabilities
  const probabilityList = document.getElementById("probabilityList");
  probabilityList.innerHTML = "";

  // Sort predictions by probability
  const sorted = Object.entries(result.all_predictions).sort(
    (a, b) => b[1] - a[1],
  );

  sorted.forEach(([classLabel, probability]) => {
    const percentage = (probability * 100).toFixed(1);
    const item = document.createElement("div");
    item.className = "flex items-center gap-3";
    item.innerHTML = `
            <div class="flex-shrink-0 w-32 font-semibold text-gray-700">${classLabel.replace("_", " ")}</div>
            <div class="flex-grow h-6 bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-end pr-2" style="width: ${percentage}%">
                    <span class="text-xs font-bold text-white">${percentage}%</span>
                </div>
            </div>
            <div class="flex-shrink-0 w-16 text-right font-bold text-indigo-600">${percentage}%</div>
        `;
    probabilityList.appendChild(item);
  });

  showToast("✓ Prediction complete!", "success");
}

function resetSingleMode() {
  document.getElementById("uploadArea").style.display = "block";
  document.getElementById("singleResultContainer").style.display = "none";
  document.getElementById("singleLoadingContainer").style.display = "none";
  document.getElementById("singleImageInput").value = "";
}

// Batch Image Selection
function handleBatchImageSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    processBatchImages(files);
  }
}

async function processBatchImages(files) {
  if (isProcessing) return;
  if (files.length === 0) {
    showToast("Please select at least one image", "warning");
    return;
  }

  isProcessing = true;
  const startTime = Date.now();

  // Show loading state
  document.getElementById("batchUploadArea").style.display = "none";
  document.getElementById("batchLoadingContainer").style.display = "flex";
  document.getElementById("totalImages").textContent = files.length;
  document.getElementById("processedImages").textContent = "0";

  try {
    // Create FormData
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Send to API
    const response = await fetch(`${API_URL}/predict-batch`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Batch prediction failed");
    }

    const result = await response.json();
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

    displayBatchResults(result.results, files, timeTaken);
  } catch (error) {
    console.error("Error:", error);
    showToast("Error processing batch: " + error.message, "danger");
    resetBatchMode();
  } finally {
    isProcessing = false;
  }
}

function displayBatchResults(predictions, files, timeTaken) {
  // Hide loading, show results
  document.getElementById("batchLoadingContainer").style.display = "none";
  document.getElementById("batchResultsContainer").style.display = "block";

  // Update stats
  document.getElementById("processedImages").textContent = predictions.filter(
    (p) => !p.error,
  ).length;
  document.getElementById("timeTaken").textContent = `${timeTaken}s`;

  // Display results
  const resultsGrid = document.getElementById("batchResultsGrid");
  resultsGrid.innerHTML = "";

  predictions.forEach((result, index) => {
    const file = files[index];
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105";

    if (result.error) {
      card.innerHTML = `
                <div class="w-full h-48 flex items-center justify-center bg-red-100">
                    <span class="text-4xl">❌</span>
                </div>
                <div class="p-4">
                    <div class="font-semibold text-gray-800 truncate text-sm">${result.filename}</div>
                    <div class="text-red-600 font-semibold text-sm mt-2">Error: ${result.error}</div>
                </div>
            `;
    } else {
      const confidence = (result.confidence * 100).toFixed(1);
      const emoji = GEMSTONE_EMOJIS[result.predicted_class] || "💎";

      card.innerHTML = `
                <img class="w-full h-48 object-cover" src="${URL.createObjectURL(file)}" alt="${result.filename}">
                <div class="p-4">
                    <div class="font-semibold text-gray-800 truncate text-sm mb-2">${result.filename}</div>
                    <div class="text-lg font-bold text-indigo-600 mb-2">${emoji} ${result.predicted_class.replace("_", " ")}</div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">Confidence:</span>
                        <span class="font-bold text-green-600">${confidence}%</span>
                    </div>
                </div>
            `;

      // Add click to see details
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        showDetailedResult(result, file);
      });
    }

    resultsGrid.appendChild(card);
  });

  showToast("✓ Batch processing complete!", "success");
}

function showDetailedResult(result, file) {
  // Create a modal or expanded view
  alert(`
Gemstone: ${result.predicted_class}
Confidence: ${(result.confidence * 100).toFixed(2)}%

Full Predictions:
${Object.entries(result.all_predictions)
  .map(([name, prob]) => `${name}: ${(prob * 100).toFixed(2)}%`)
  .join("\n")}
    `);
}

function resetBatchMode() {
  document.getElementById("batchUploadArea").style.display = "block";
  document.getElementById("batchResultsContainer").style.display = "none";
  document.getElementById("batchLoadingContainer").style.display = "none";
  document.getElementById("batchImageInput").value = "";
}

// Toast Notifications
function showToast(message, type = "info") {
  const toast = document.getElementById("errorToast");
  toast.textContent = message;

  // Set base classes
  toast.className =
    "toast fixed bottom-0 left-1/2 -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl transition-all duration-300 text-white font-semibold";

  // Set color based on type
  if (type === "success") {
    toast.classList.add("bg-green-500");
  } else if (type === "warning") {
    toast.classList.add("bg-amber-500");
  } else if (type === "danger") {
    toast.classList.add("bg-red-500");
  } else {
    toast.classList.add("bg-blue-500");
  }

  // Show toast
  toast.classList.remove("pointer-events-none", "opacity-0", "-translate-y-32");
  toast.classList.add("pointer-events-auto", "opacity-100", "-translate-y-6");

  setTimeout(() => {
    toast.classList.remove(
      "pointer-events-auto",
      "opacity-100",
      "-translate-y-6",
    );
    toast.classList.add("pointer-events-none", "opacity-0", "-translate-y-32");
  }, 3000);
}

// Keep API status updated
setInterval(checkAPIStatus, 10000);
