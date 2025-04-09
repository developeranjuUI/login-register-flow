const db = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "secret123";

exports.register = (req, res) => {
  const { name, email, mobile, password } = req.body;
  console.log(req.body)

  if (!name || !email || !mobile || !password) {
    return res.status(400).send({ message: "All fields are required" });
  }

  const hashed = bcrypt.hashSync(password, 8);

  db.query(
    "INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)",
    [name, email, mobile, hashed],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).send({ message: "Email already exists" });
        return res.status(500).send({ message: "Error registering user" });
      }
      res.send({ message: "User registered successfully" });
    }
  );
};


// exports.login = (req, res) => {
//   const { email, password } = req.body;

//   db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
//     if (err) return res.status(500).send({ message: "Error logging in" });
//     if (results.length === 0) return res.status(404).send({ message: "User not found" });

//     const user = results[0];
//     const passwordIsValid = bcrypt.compareSync(password, user.password);
//     if (!passwordIsValid) return res.status(401).send({ message: "Invalid password" });

//     const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours
//     res.send({ token, user: { id: user.id, name: user.name, email: user.email } });
//   });
// };

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).send({ message: "Error logging in" });

    if (results.length === 0) {
      // User not found — send a generic message
      return res.status(401).send({ message: "Email or password is incorrect" });
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      // Password incorrect — send the same generic message
      return res.status(401).send({ message: "Email or password is incorrect" });
    }

    // Valid login — send token
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 });
    res.send({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });
};

