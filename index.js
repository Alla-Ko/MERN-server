import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";

import { PostController, UserController } from "./controllers/index.js";
import { checkAuth, handleValidationErrors } from "./utils/index.js";

import {
  loginValidation,
  postCreateValidation,
  registerValidation,
} from "./validations.js";

mongoose
  .connect(
    "mongodb+srv://ITStepAdmin:zdRilag5seIS7YOi@itstepcluster.og3fq.mongodb.net/blogMERN?retryWrites=true&w=majority&appName=ITStepCluster"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err));

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Завантаження в папку uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Генерація унікального імені
  },
});

const upload = multer({ storage });
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

//роутінг
//---------------------------------USER
//інформація про себе
app.get("/auth/me", checkAuth, UserController.getMe);
//залогінитися
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);
//зареєструватися
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.patch(
  "/auth/update/:id",
  checkAuth,

  handleValidationErrors,
  UserController.update
);
//-------------------------------------завантажити картинку
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Файл не завантажено" });
  }

  return res.json({
    url: `/uploads/${req.file.filename}`, // Відповідь з новим ім'ям файлу
  });
});
//---------------------------------POSTS
//всі пости
app.get("/posts", PostController.getAll);

//пост по ід
app.get("/posts/:id", PostController.getOne);
app.post(
  "/posts",
  checkAuth, // перевірка аутентифікації
  upload.single("image"), // обробка файлу через multer
  postCreateValidation, // валідація даних
  handleValidationErrors, // обробка помилок валідації
  PostController.create // викликаємо функцію для створення поста
);
//всі теги
app.get("/tags", PostController.getTags);

//бажано б дати дозвіл на редагування і видалення тільки авторам і адмінам, але ми не робили ролі
//видалити
app.delete("/posts/:id", checkAuth, PostController.remove);
//редагувати
app.patch(
  "/posts/:id",
  checkAuth,
  upload.single("image"),
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
});
app.get("/posts/tags/:tag", PostController.getPostsByTag);
