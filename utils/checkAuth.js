import jwt from "jsonwebtoken";
export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (token) {
    try {
      const decoder = jwt.verify(
        token,
        "secredxgdfbzczgzdgfdg454546fgdfgdf5585t123"
      );
      req.userId = decoder._id;

      next();
    } catch (err) {
      console.log(err);
      return res.status(403).json({
        message: "Помилка доступа",
      });
    }
  } else {
    return res.status(403).json({
      message: "Нема доступа до приватної інформації",
    });
  }
};
