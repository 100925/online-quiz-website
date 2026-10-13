const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true
    },
    options: {
      type: [String],
      required: [true, "Four answer options are required"],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length === 4;
        },
        message: "Question must have exactly 4 options"
      }
    },
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: [0, "Answer index must be between 0 and 3"],
      max: [3, "Answer index must be between 0 and 3"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: {
        values: ["Easy", "Medium", "Hard"],
        message: "{VALUE} is not a valid difficulty (Easy, Medium, Hard)"
      },
      index: true
    },
    explanation: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Question", questionSchema);
