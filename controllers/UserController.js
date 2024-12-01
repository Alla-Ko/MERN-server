import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import UserModel from "../models/User.js";
//import checkAuth from "../utils/checkAuth.js";
//import { registerValidation } from "./validations/auth.js";

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const doc = new UserModel({
      email: req.body.email,
      fullname: req.body.fullname,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secredxgdfbzczgzdgfdg454546fgdfgdf5585t123",
      {
        expiresIn: "30d",
      }
    );
    const { passwordHash, ...userData } = user._doc;
    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Помилка. Не вдалося зареєструватися" });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "Немає такого користувача в базі даних",
      });
    }
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!isValidPassword) {
      return res.status(400).json({
        message: "Неправильний логін або пароль",
      });
    }
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secredxgdfbzczgzdgfdg454546fgdfgdf5585t123",
      {
        expiresIn: "30d",
      }
    );
    const { passwordHash, ...userData } = user._doc;
    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Помилка. Не вдалося авторизуватися" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "Немає такого користувача в базі даних",
      });
    }
    const { passwordHash, ...userData } = user._doc;
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Помилка. Не вдалося знайти дані" });
  }
};
export const update = async (req, res) => {
  try {
    console.log(`оновлюємо аватарку`);
    const userId = req.params.id;
    const updates = req.body;

    // Приклад MongoDB:
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: `Не вдалося оновити профіль ${error}` });
  }
};
