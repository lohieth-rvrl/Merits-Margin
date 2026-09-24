const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
      if (!admin) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const valid = await admin.checkPassword(password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = jwt.sign(
        { id: admin._id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ token, email: admin.email });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error during login." });
    }
  }
);

module.exports = router;
