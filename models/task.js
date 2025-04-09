const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, require: true },
  description: { type: String, require: true },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  dueDate: Date,
  assignedTo: { type: mongoose.Schema.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Task", taskSchema);
