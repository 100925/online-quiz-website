const express = require("express");
const mongoose = require("mongoose");
const Question = require("../models/Question");

const router = express.Router();

/**
 * GET /api/questions/categories
 * Returns distinct categories and available difficulties
 */
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Question.distinct("category");
    res.json({
      categories,
      difficulties: ["Easy", "Medium", "Hard"]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/questions
 * Retrieve questions with optional filtering by category & difficulty
 * Safe: strips out correctAnswer and explanation
 */
router.get("/", async (req, res, next) => {
  try {
    const { category, difficulty, limit } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (difficulty && difficulty !== "All") {
      filter.difficulty = difficulty;
    }

    let query = Question.find(filter).select("-correctAnswer -explanation");

    if (limit && !isNaN(parseInt(limit, 10))) {
      query = query.limit(parseInt(limit, 10));
    }

    const questions = await query.exec();

    res.set("X-Total-Count", questions.length.toString());

    if (req.query.format === "object") {
      return res.json({
        count: questions.length,
        questions
      });
    }

    res.json(questions);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/questions/:id
 * Retrieve a single question safely without revealing the answer
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID format"
      });
    }

    const question = await Question.findById(id).select("-correctAnswer -explanation");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
