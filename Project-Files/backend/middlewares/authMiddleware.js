const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    console.log("Authorization Header:", authorizationHeader);

    if (!authorizationHeader) {
      return res.status(401).send({
        message: "Authorization header missing",
        success: false,
      });
    }

    const token = authorizationHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .send({ message: "Token is not valid", success: false });
      }

      req.user = decoded; // Add decoded user information to req.user
      console.log("JWT Decode:", decoded);
      next();
    });
    
  } catch (error) {
    console.error("Error in authMiddleware:", error.message || error);
    res.status(500).send({
      message: "Internal server error",
      success: false,
    });
  }
};
