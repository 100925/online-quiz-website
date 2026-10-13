/**
 * QuizMaster - Frontend Application Logic
 * Integrates with Node.js Express backend and MongoDB Atlas
 */

// Determine API base URL dynamically based on current origin
const API_BASE = (() => {
  if (window.QUIZMASTER_API_URL) return window.QUIZMASTER_API_URL;
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";
  return isLocal ? "http://localhost:5000/api" : "/api";
})();

// DOM Elements
const apiStatusBadge = document.getElementById("api-status-badge");
const apiStatusText = document.getElementById("api-status-text");
const alertBanner = document.getElementById("alert-banner");
const alertMessage = document.getElementById("alert-message");
const alertCloseBtn = document.getElementById("alert-close-btn");

// Screens
const startScreen = document.getElementById("start-screen");
const loadingScreen = document.getElementById("loading-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

// Config inputs
const categorySelect = document.getElementById("category-select");
const difficultySelect = document.getElementById("difficulty-select");

// Buttons
const startBtn = document.getElementById("start-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const restartBtn = document.getElementById("restart-btn");
const homeBtn = document.getElementById("home-btn");

// Quiz screen elements
const badgeCategory = document.getElementById("badge-category");
const badgeDifficulty = document.getElementById("badge-difficulty");
const questionCount = document.getElementById("question-count");
const timerElement = document.getElementById("timer");
const timerText = document.getElementById("timer-text");
const progressBar = document.getElementById("progress-bar");
const answeredCountText = document.getElementById("answered-count-text");
const questionTitle = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const answerMessage = document.getElementById("answer-message");

// Modal elements
const confirmModal = document.getElementById("confirm-modal");
const modalSummary = document.getElementById("modal-summary");
const modalUnansweredWarning = document.getElementById("modal-unanswered-warning");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalConfirmBtn = document.getElementById("modal-confirm-btn");

// Review elements
const toggleReviewBtn = document.getElementById("toggle-review-btn");
const reviewContainer = document.getElementById("review-container");

// Application State
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = []; // Array of selected option indexes (or null)
let timeLeft = 300; // 5 minutes in seconds
let timerInterval = null;
let quizStartTime = null;
let isSubmitting = false;
let currentCategory = "All";
let currentDifficulty = "All";

// --- Alert & Notification Helpers ---
function showAlert(message, isError = true) {
  alertMessage.textContent = message;
  alertBanner.className = `alert-banner ${isError ? "" : "alert-success"}`;
  alertBanner.classList.remove("hidden");
}

function hideAlert() {
  alertBanner.classList.add("hidden");
}

if (alertCloseBtn) {
  alertCloseBtn.addEventListener("click", hideAlert);
}

// --- Check Backend Health ---
async function checkBackendHealth() {
  apiStatusBadge.className = "api-status checking";
  apiStatusText.textContent = "Connecting to backend...";

  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.status === "healthy") {
      apiStatusBadge.className = "api-status connected";
      apiStatusText.textContent = "Backend Connected";
    } else {
      apiStatusBadge.className = "api-status offline";
      apiStatusText.textContent = `Backend ${data.database || "Degraded"}`;
    }
  } catch (error) {
    apiStatusBadge.className = "api-status offline";
    apiStatusText.textContent = "Backend Offline";
    console.warn("Backend connection check failed:", error.message);
  }
}

// --- Populate Categories ---
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/questions/categories`);
    if (!res.ok) return;
    const data = await res.json();

    if (data.categories && Array.isArray(data.categories)) {
      // Preserve "All" and append backend categories if different
      const existingOptions = Array.from(categorySelect.options).map(
        (o) => o.value
      );
      data.categories.forEach((cat) => {
        if (!existingOptions.includes(cat)) {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.textContent = cat;
          categorySelect.appendChild(opt);
        }
      });
    }
  } catch (err) {
    console.log("Could not load dynamic categories, using defaults.");
  }
}

// --- Start Quiz ---
async function handleStartQuiz() {
  hideAlert();
  currentCategory = categorySelect.value;
  currentDifficulty = difficultySelect.value;

  startScreen.classList.add("hidden");
  loadingScreen.classList.remove("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");

  try {
    const queryParams = new URLSearchParams();
    if (currentCategory !== "All") queryParams.append("category", currentCategory);
    if (currentDifficulty !== "All") queryParams.append("difficulty", currentDifficulty);

    const res = await fetch(`${API_BASE}/questions?${queryParams.toString()}`);
    if (!res.ok) throw new Error(`Server returned status ${res.status}`);

    const data = await res.json();
    const loadedQuestions = Array.isArray(data) ? data : (data.questions || []);

    if (!loadedQuestions || loadedQuestions.length === 0) {
      throw new Error(
        `No questions found for ${currentCategory} (${currentDifficulty}). Try selecting "All" or a different category.`
      );
    }

    questions = loadedQuestions;
    userAnswers = new Array(questions.length).fill(null);
    currentQuestionIndex = 0;
    isSubmitting = false;
    timeLeft = 300;
    quizStartTime = Date.now();

    loadingScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    renderQuestion();
    startTimer();
  } catch (error) {
    loadingScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    const isNetworkError =
      error.message.includes("fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("Failed to fetch");
    const helpfulMsg = isNetworkError
      ? "Backend server is unavailable at http://localhost:5000. Please ensure the backend server is running ('npm start' in the backend folder)."
      : `Failed to load quiz: ${error.message}`;
    showAlert(helpfulMsg);
    console.error("Start quiz error:", error);
  }
}

// --- Timer Management ---
function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleAutoSubmitOnTimeOut();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const safeTime = Math.max(0, timeLeft);
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;

  timerText.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  if (safeTime <= 60) {
    timerElement.classList.add("timer-warning");
  } else {
    timerElement.classList.remove("timer-warning");
  }
}

// --- Render Question ---
function renderQuestion() {
  const q = questions[currentQuestionIndex];
  if (!q) return;

  // Metadata & Progress
  badgeCategory.textContent = q.category || currentCategory;
  badgeDifficulty.textContent = q.difficulty || currentDifficulty;

  badgeDifficulty.className = "badge badge-diff";
  if (q.difficulty === "Easy") badgeDifficulty.classList.add("diff-easy");
  else if (q.difficulty === "Medium") badgeDifficulty.classList.add("diff-medium");
  else if (q.difficulty === "Hard") badgeDifficulty.classList.add("diff-hard");

  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progressPercent}%`;

  updateAnsweredCount();

  // Question Title
  questionTitle.textContent = q.question;

  // Clear options
  optionsContainer.replaceChildren();

  const selectedAnswerIndex = userAnswers[currentQuestionIndex];

  q.options.forEach((optionText, optIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", selectedAnswerIndex === optIndex ? "true" : "false");

    if (selectedAnswerIndex === optIndex) {
      button.classList.add("selected");
    }

    const prefix = document.createElement("span");
    prefix.className = "option-prefix";
    prefix.textContent = String.fromCharCode(65 + optIndex);

    const label = document.createElement("span");
    label.textContent = optionText;

    button.appendChild(prefix);
    button.appendChild(label);

    button.addEventListener("click", () => {
      selectAnswer(optIndex);
    });

    optionsContainer.appendChild(button);
  });

  // Helper Message
  if (selectedAnswerIndex !== null) {
    answerMessage.textContent = "Answer saved. You can change it anytime before final submission.";
    answerMessage.style.color = "var(--primary)";
  } else {
    answerMessage.textContent = "Select an option to answer.";
    answerMessage.style.color = "var(--text-muted)";
  }

  // Navigation Buttons
  prevBtn.disabled = currentQuestionIndex === 0;

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  if (isLastQuestion) {
    nextBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.remove("hidden");
    submitBtn.classList.add("hidden");
  }
}

// --- Select Answer ---
function selectAnswer(optIndex) {
  if (isSubmitting) return;

  userAnswers[currentQuestionIndex] = optIndex;

  const buttons = optionsContainer.querySelectorAll(".option");
  buttons.forEach((btn, idx) => {
    const isSelected = idx === optIndex;
    btn.classList.toggle("selected", isSelected);
    btn.setAttribute("aria-checked", isSelected ? "true" : "false");
  });

  answerMessage.textContent = "Answer saved. You can change it anytime before final submission.";
  answerMessage.style.color = "var(--primary)";

  updateAnsweredCount();
}

function updateAnsweredCount() {
  const answeredCount = userAnswers.filter((ans) => ans !== null).length;
  answeredCountText.textContent = `Answered: ${answeredCount} of ${questions.length}`;
}

// --- Navigation Handlers ---
function goToNextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
}

function goToPrevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
}

// --- Submission & Confirmation ---
function openSubmitModal() {
  const answeredCount = userAnswers.filter((a) => a !== null).length;
  const unansweredCount = questions.length - answeredCount;

  modalSummary.textContent = `You have answered ${answeredCount} of ${questions.length} questions.`;

  if (unansweredCount > 0) {
    modalUnansweredWarning.textContent = `⚠️ You have ${unansweredCount} unanswered question(s). Unanswered questions will receive 0 points.`;
    modalUnansweredWarning.classList.remove("hidden");
  } else {
    modalUnansweredWarning.classList.add("hidden");
  }

  confirmModal.classList.remove("hidden");
}

function closeSubmitModal() {
  confirmModal.classList.add("hidden");
}

function handleAutoSubmitOnTimeOut() {
  closeSubmitModal();
  showAlert("Time's up! Your quiz is being automatically submitted...", false);
  submitQuiz(true);
}

async function submitQuiz(isTimeUp = false) {
  if (isSubmitting) return;
  isSubmitting = true;
  clearInterval(timerInterval);

  closeSubmitModal();
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const timeTaken = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 300 - timeLeft;

  const payload = {
    category: currentCategory,
    difficulty: currentDifficulty,
    timeTaken: Math.max(0, timeTaken),
    answers: questions.map((q, idx) => ({
      questionId: q._id,
      selectedOption: userAnswers[idx]
    }))
  };

  try {
    const res = await fetch(`${API_BASE}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server error (HTTP ${res.status})`);
    }

    const data = await res.json();
    renderResults(data.result, isTimeUp);
  } catch (error) {
    console.error("Submission error:", error);
    showAlert(`Submission failed: ${error.message}. Please check your connection and try again.`);
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Quiz ✓";
    isSubmitting = false;
  }
}

// --- Render Results ---
function renderResults(result, isTimeUp) {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");
  const resultBadgeIcon = document.getElementById("result-badge-icon");

  resultTitle.textContent = isTimeUp ? "Time's Up! Quiz Completed" : "Quiz Completed!";

  if (result.percentage >= 80) {
    resultBadgeIcon.textContent = "🏆";
    resultMessage.textContent = `Outstanding! You scored ${result.percentage}%. You have an impressive grasp of ${currentCategory}!`;
  } else if (result.percentage >= 50) {
    resultBadgeIcon.textContent = "🎉";
    resultMessage.textContent = `Good effort! You scored ${result.percentage}%. Keep practising to reach top marks!`;
  } else {
    resultBadgeIcon.textContent = "💡";
    resultMessage.textContent = `You scored ${result.percentage}%. Great practice session! Review the explanations below and try again.`;
  }

  document.getElementById("score").textContent = `${result.score} / ${result.maxScore}`;
  document.getElementById("percentage").textContent = `${result.percentage}%`;
  document.getElementById("correct").textContent = result.correctAnswers;
  document.getElementById("wrong").textContent = result.wrongAnswers;
  document.getElementById("unanswered").textContent = result.unansweredQuestions;

  // Format time taken
  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;
  document.getElementById("time-taken").textContent =
    minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Reset review section visibility
  if (reviewContainer) reviewContainer.classList.add("hidden");
  if (toggleReviewBtn) toggleReviewBtn.textContent = "Show Breakdown ▼";

  // Reset submit button state for future runs
  submitBtn.disabled = false;
  submitBtn.textContent = "Submit Quiz ✓";

  // Render review items
  renderQuestionReview(result.selectedAnswers);
}

// --- Question Review Breakdown ---
function renderQuestionReview(selectedAnswers) {
  reviewContainer.replaceChildren();

  if (!selectedAnswers || selectedAnswers.length === 0) {
    reviewContainer.innerHTML = "<p>No detailed review available.</p>";
    return;
  }

  selectedAnswers.forEach((item, index) => {
    const qObj = questions.find((q) => String(q._id) === String(item.questionId));
    const qText = item.questionText || (qObj ? qObj.question : `Question ${index + 1}`);
    const options = (qObj && qObj.options) || [];

    const reviewCard = document.createElement("div");
    let statusClass = "review-unanswered";
    let statusBadge = "⚠️ Unanswered";

    if (item.selectedOption === null || item.selectedOption === undefined) {
      statusClass = "review-unanswered";
      statusBadge = "⚠️ Unanswered";
    } else if (item.isCorrect) {
      statusClass = "review-correct";
      statusBadge = "✓ Correct (+10)";
    } else {
      statusClass = "review-wrong";
      statusBadge = "✗ Incorrect (0)";
    }

    reviewCard.className = `review-item ${statusClass}`;

    const yourAnsText =
      item.selectedOption !== null && options[item.selectedOption]
        ? `${String.fromCharCode(65 + item.selectedOption)}. ${options[item.selectedOption]}`
        : "None (Unanswered)";

    const correctAnsText =
      options[item.correctAnswer] !== undefined
        ? `${String.fromCharCode(65 + item.correctAnswer)}. ${options[item.correctAnswer]}`
        : `Option ${item.correctAnswer + 1}`;

    reviewCard.innerHTML = `
      <div class="review-q-title">Q${index + 1}: ${escapeHtml(qText)}</div>
      <div class="review-meta">
        <div><strong>Status:</strong> ${statusBadge}</div>
        <div><strong>Your Answer:</strong> ${escapeHtml(yourAnsText)}</div>
        <div><strong>Correct Answer:</strong> <span style="color: #059669; font-weight: bold;">${escapeHtml(correctAnsText)}</span></div>
      </div>
      ${
        item.explanation
          ? `<div class="review-explanation"><strong>💡 Explanation:</strong> ${escapeHtml(item.explanation)}</div>`
          : ""
      }
    `;

    reviewContainer.appendChild(reviewCard);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Toggle Review Section ---
if (toggleReviewBtn) {
  toggleReviewBtn.addEventListener("click", () => {
    const isHidden = reviewContainer.classList.contains("hidden");
    reviewContainer.classList.toggle("hidden", !isHidden);
    toggleReviewBtn.textContent = isHidden ? "Hide Breakdown ▲" : "Show Breakdown ▼";
  });
}

// --- Reset to Home ---
function goToHome() {
  clearInterval(timerInterval);
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  loadingScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  hideAlert();
  checkBackendHealth();
}

// --- Event Listeners ---
startBtn.addEventListener("click", handleStartQuiz);
nextBtn.addEventListener("click", goToNextQuestion);
prevBtn.addEventListener("click", goToPrevQuestion);
submitBtn.addEventListener("click", openSubmitModal);
modalCancelBtn.addEventListener("click", closeSubmitModal);
modalConfirmBtn.addEventListener("click", () => submitQuiz(false));
restartBtn.addEventListener("click", handleStartQuiz);
homeBtn.addEventListener("click", goToHome);

// Close modal if user clicks outside modal card
confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) {
    closeSubmitModal();
  }
});

// Keyboard navigation: Escape key closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !confirmModal.classList.contains("hidden")) {
    closeSubmitModal();
  }
});

// Initial boot
document.addEventListener("DOMContentLoaded", () => {
  checkBackendHealth();
  loadCategories();
});
