const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token missing" });
  try {
    const real = jwt.verify(token, "fullstack");
    req.user = real;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = verifyToken;
