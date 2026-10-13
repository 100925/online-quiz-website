const express = require("express");
const mongoose = require("mongoose");
const Question = require("../models/Question");
const QuizResult = require("../models/QuizResult");

const router = express.Router();

/**
 * POST /api/submit
 * Submits quiz answers, verifies them against the database,
 * calculates score, saves QuizResult, and returns detailed result.
 */
router.post("/", async (req, res, next) => {
  try {
    const { answers, timeTaken, category, difficulty } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission: 'answers' must be a non-empty array."
      });
    }

    // Extract and validate question IDs
    const submittedIds = answers.map((a) => a.questionId);
    const validObjectIds = submittedIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validObjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid question IDs provided in answers array."
      });
    }

    // Fetch original questions with correct answers from DB
    const dbQuestions = await Question.find({
      _id: { $in: validObjectIds }
    });

    const questionMap = new Map();
    dbQuestions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const selectedAnswersDetail = [];

    // Evaluate each submitted question
    answers.forEach((submitted) => {
      const q = questionMap.get(String(submitted.questionId));
      if (!q) {
        // If question not found in DB, count as unanswered / skip
        unansweredCount++;
        return;
      }

      const selected =
        submitted.selectedOption !== null &&
        submitted.selectedOption !== undefined &&
        Number.isInteger(Number(submitted.selectedOption))
          ? Number(submitted.selectedOption)
          : null;

      const isUnanswered = selected === null || selected < 0 || selected > 3;
      const isCorrect = !isUnanswered && selected === q.correctAnswer;

      if (isUnanswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      selectedAnswersDetail.push({
        questionId: q._id,
        questionText: q.question,
        selectedOption: selected,
        correctAnswer: q.correctAnswer,
        isCorrect: isCorrect,
        explanation: q.explanation || ""
      });
    });

    const totalQuestions = answers.length;
    const score = correctCount * 10;
    const maxScore = totalQuestions * 10;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const safeTimeTaken = typeof timeTaken === "number" && timeTaken >= 0 ? Math.round(timeTaken) : 0;

    // Persist result in MongoDB
    const quizResult = new QuizResult({
      category: category || "All",
      difficulty: difficulty || "All",
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unansweredQuestions: unansweredCount,
      score,
      maxScore,
      percentage,
      timeTaken: safeTimeTaken,
      selectedAnswers: selectedAnswersDetail
    });

    await quizResult.save();

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      result: quizResult
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/results/:id
 * Retrieve a saved quiz result by resultId or MongoDB _id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    let result = await QuizResult.findOne({ resultId: id });

    if (!result && mongoose.Types.ObjectId.isValid(id)) {
      result = await QuizResult.findById(id);
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Quiz result not found"
      });
    }

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
