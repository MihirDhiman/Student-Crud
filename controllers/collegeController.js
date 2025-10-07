import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const updateStudentStatus = (req, res) => {
  const { id, action } = req.params;
  if (!["accepted", "rejected"].includes(action))
    return res.status(400).json({ message: "Invalid action" });

  db.query(
    "UPDATE students SET status = ? WHERE id = ?",
    [action, id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: `Student ${action}` });
    }
  );
};

export const getAllStudents = (req, res) => {
  db.query("SELECT id, name, email, status FROM students", (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

// College register login

export const collegeRegister = async (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "SELECT * FROM college_authority WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length)
        return res.status(400).json({ message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO college_authority (name,email,password) VALUES (?,?,?)",
        [name, email, hashedPassword],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: "College authority registered successfully" });
        }
      );
    }
  );
};

export const collegeLogin = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM college_authority WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!results.length)
        return res.status(400).json({ message: "College authority not found" });

      const college = results[0];
      const validPass = await bcrypt.compare(password, college.password);
      if (!validPass)
        return res.status(400).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: college.id, email: college.email, role: "college" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({ token });
    }
  );
};
