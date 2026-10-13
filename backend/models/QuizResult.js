const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const selectedAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    questionText: {
      type: String,
      default: ""
    },
    selectedOption: {
      type: Number,
      default: null // null if unanswered
    },
    correctAnswer: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    explanation: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    resultId: {
      type: String,
      default: () => randomUUID(),
      unique: true,
      index: true
    },
    category: {
      type: String,
      default: "All"
    },
    difficulty: {
      type: String,
      default: "All"
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0
    },
    wrongAnswers: {
      type: Number,
      required: true,
      min: 0
    },
    unansweredQuestions: {
      type: Number,
      required: true,
      min: 0
    },
    score: {
      type: Number,
      required: true,
      min: 0
    },
    maxScore: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0
    },
    selectedAnswers: {
      type: [selectedAnswerSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
