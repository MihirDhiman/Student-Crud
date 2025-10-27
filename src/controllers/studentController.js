import { db } from "../db.js";

export const getStatus = (req, res) => {
  const studentId = req.user.id;

  db.query(
    "SELECT status FROM students WHERE id = ?",
    [studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!results.length)
        return res.status(404).json({ message: "Student not found" });

      const status = results[0].status;
      let message = "pending";
      if (status === "accepted") message = "Congratulation! you are selected";
      else if (status === "rejected") message = "You are rejected";

      res.json({ status: message });
    }
  );
};
