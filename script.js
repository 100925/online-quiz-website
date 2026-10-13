
const questions = [
  {
    question: "Which language is used to structure a web page?",
    options: ["CSS", "HTML", "Java", "SQL"],
    answer: 1
  },
  {
    question: "Which language styles a web page?",
    options: ["Python", "HTML", "CSS", "C"],
    answer: 2
  },
  {
    question: "Which keyword declares a block-scoped variable in JavaScript?",
    options: ["let", "print", "echo", "define"],
    answer: 0
  },
  {
    question: "Which HTML tag creates a hyperlink?",
    options: ["<p>", "<img>", "<div>", "<a>"],
    answer: 3
  },
  {
    question: "Which method adds an item to the end of a JavaScript array?",
    options: ["shift()", "push()", "pop()", "join()"],
    answer: 1
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Computer Style Syntax",
      "Creative System Software",
      "Cascading Style Sheets",
      "Colorful Style System"
    ],
    answer: 2
  },
  {
    question: "Which symbol is used for strict equality in JavaScript?",
    options: ["=", "==", "!=", "==="],
    answer: 3
  },
  {
    question: "Which HTML tag is used for the largest heading?",
    options: ["<h6>", "<head>", "<h1>", "<title>"],
    answer: 2
  },
  {
    question: "Which method selects an element by its ID?",
    options: [
      "document.getElementById()",
      "document.getByClass()",
      "document.getTag()",
      "document.selectAllId()"
    ],
    answer: 0
  },
  {
    question: "Which Git command saves a snapshot of staged changes?",
    options: ["git push", "git pull", "git clone", "git commit"],
    answer: 3
  }
];

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const questionCount = document.getElementById("question-count");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const timerElement = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const answerMessage = document.getElementById("answer-message");

let currentQuestion = 0;
let selectedAnswers = [];
let timeLeft = 300;
let timerId = null;
let quizFinished = false;

function startQuiz() {
  clearInterval(timerId);

  currentQuestion = 0;
  selectedAnswers = new Array(questions.length).fill(null);
  timeLeft = 300;
  quizFinished = false;

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  nextBtn.disabled = true;
  nextBtn.textContent = "Next Question →";

  renderQuestion();
  updateTimer();

  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      finishQuiz(true);
    }
  }, 1000);
}

function renderQuestion() {
  const q = questions[currentQuestion];

  questionCount.textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  questionElement.textContent = q.question;

  progressBar.style.width =
    `${((currentQuestion + 1) / questions.length) * 100}%`;

  optionsElement.replaceChildren();
  answerMessage.textContent = "";
  nextBtn.disabled = true;

  nextBtn.textContent =
    currentQuestion === questions.length - 1
      ? "Submit Quiz"
      : "Next Question →";

  q.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "option";
    button.textContent =
      `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => {
      selectAnswer(index);
    });

    optionsElement.appendChild(button);
  });
}

function selectAnswer(index) {
  if (quizFinished) return;

  selectedAnswers[currentQuestion] = index;

  const buttons = optionsElement.querySelectorAll(".option");

  buttons.forEach((button, i) => {
    button.classList.toggle("selected", i === index);
  });

  answerMessage.textContent = "Answer selected. You can change it before moving on.";
  answerMessage.style.color = "#5b45d6";

  nextBtn.disabled = false;
}

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timerElement.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function finishQuiz(timeUp = false) {
  if (quizFinished) return;

  quizFinished = true;
  clearInterval(timerId);

  const correctCount = questions.reduce((total, q, index) => {
    return total + (selectedAnswers[index] === q.answer ? 1 : 0);
  }, 0);

  const unansweredCount = selectedAnswers.filter(
    answer => answer === null
  ).length;

  const wrongCount = questions.length - correctCount - unansweredCount;
  const score = correctCount * 10;
  const percentage = Math.round(
    (correctCount / questions.length) * 100
  );

  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  document.getElementById("result-title").textContent =
    timeUp ? "Time's Up!" : "Quiz Completed!";

  document.getElementById("result-message").textContent =
    percentage >= 80
      ? "Excellent work! You know your basics well."
      : percentage >= 50
        ? "Good effort! Keep practising to improve."
        : "Keep learning and try again!";

  document.getElementById("score").textContent =
    `${score}/${questions.length * 10}`;

  document.getElementById("correct").textContent = correctCount;

  document.getElementById("wrong").textContent =
    `${wrongCount} / ${unansweredCount}`;

  document.getElementById("percentage").textContent =
    `${percentage}%`;

  document.getElementById("result-message").textContent +=
    ` ${unansweredCount} unanswered question(s).`;
}

startBtn.addEventListener("click", startQuiz);

nextBtn.addEventListener("click", () => {
  if (quizFinished || selectedAnswers[currentQuestion] === null) {
    return;
  }

  if (currentQuestion === questions.length - 1) {
    finishQuiz();
  } else {
    currentQuestion++;
    renderQuestion();
  }
});

restartBtn.addEventListener("click", startQuiz);
