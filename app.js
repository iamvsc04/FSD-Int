const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(cors());
app.use(express.json());
const User = require("./models/user");
const Task = require("./models/task");
mongoose
  .connect("mongodb://127.0.0.1:27017/sripaada")
  .then(() => console.log("Mongodb connected"))
  .catch((err) => console.error(err));

const verifyToken = require("./middlewares/auth");
app.post("/user/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const flag = await User.find({ email });
    if (!flag) return res.status(400).json({ message: "email already exists" });
    const hashpw = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashpw });
    const token = jwt.sign({ id: user._id }, "fullstack", { expiresIn: "1h" });
    res.send({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(404).json({ message: "invalid password" });
    const token = jwt.sign({ id: user._id }, "fullstack", { expiresIn: "1h" });
    res.send({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/tasks", verifyToken, async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user.id });
  res.json(tasks);
});
app.get("/tasks/:id", verifyToken, async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    assignedTo: req.user.id,
  });
  res.json(task);
});
app.post("/tasks", verifyToken, async (req, res) => {
  const { title, description, status, dueDate, assignedTo } = req.body;
  try {
    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      assignedTo,
    });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: "error creating tasks" });
  }
});
app.put("/tasks/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user.id },
      req.body,
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: "error updating task" });
  }
});
app.delete("/tasks/:id", verifyToken, async (req, res) => {
  const deltedTask = await User.findOneAndDelete({
    _id: req.params.id,
    assignedTo: req.user.id,
  });
});

app.listen(3000, () => {
  console.log("app listening at port 3000");
});
