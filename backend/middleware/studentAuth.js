const jwt = require('jsonwebtoken');

function protectStudent(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.student = null;
    return next(); // not logged in — allow request through, just mark as anonymous
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.student = decoded;
  } catch (err) {
    req.student = null; // invalid/expired token — treat as anonymous, don't block
  }

  next();
}

module.exports = protectStudent;