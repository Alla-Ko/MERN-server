import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
    if (!posts) {
      return res.json({
        message: "Немає статей для відображення",
      });
    }
    return res.json(posts);
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ message: "Помилка. Не вдалося отримати пости" });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: {
          viewsCount: 1,
        },
      },
      {
        returnDocument: "after",
      }
    )
      .populate("user")
      .exec();

    if (!post) {
      return res.status(404).json({
        message: "Стаття не знайдена",
      });
    }
    return res.json(post);
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ message: "Помилка. Не вдалося знайти статтю" });
  }
};

export const create = async (req, res) => {
  try {
    // Перевіряємо, чи файл був переданий
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const tags = req.body.tags
      ? req.body.tags.split(",").map((tag) => tag.trim())
      : [];

    // Створюємо новий пост
    const doc = new PostModel({
      title: req.body.title, // Тема поста
      text: req.body.text, // Текст поста
      tags, // Розбиті теги
      user: req.userId, // Ідентифікатор користувача
      imageUrl, // URL для зображення
    });

    // Збереження поста в базі даних
    const post = await doc.save();

    // Відправка поста у відповідь
    return res.json(post);
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ message: "Помилка. Не вдалося створити пост" });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    // Видалення поста за допомогою асинхронного методу
    const post = await PostModel.findOneAndDelete({ _id: postId });

    if (!post) {
      return res.status(404).json({
        message: "Стаття не знайдена",
      });
    }

    return res.json({
      message: "Стаття видалена",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Помилка. Не вдалося видалити статтю",
    });
  }
};

export const update = async (req, res) => {
  try {
   
    const postId = req.params.id;
    const updates = {};

    // Якщо передано нове зображення
    if (req.file) {
      console.log("Є файл");
      updates.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.removeImage === "true") {
      // Якщо потрібно видалити зображення
      updates.imageUrl = null;
      console.log("Зображення видалено");
    }

    // Оновлення інших полів
    if (req.body.title) updates.title = req.body.title;
    if (req.body.text) updates.text = req.body.text;
    if (req.body.tags) updates.tags = req.body.tags.split(",").map((tag) => tag.trim());

    console.log("Оновлення:", updates);

    // Якщо немає даних для оновлення, повертаємо помилку
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Немає даних для оновлення",
      });
    }

    // Знайти і оновити пост
    const post = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $set: updates },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        message: "Стаття не знайдена",
      });
    }

    return res.json(post);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Помилка. Не вдалося оновити статтю",
    });
  }
};

export const getTags = async (req, res) => {
  try {
    const posts = await PostModel.find().exec();
    if (!posts || posts.length === 0) {
      return res.json({
        message: "Немає тегів для відображення",
      });
    }
    const allTags = posts.flatMap((post) => post.tags);
    const uniqueTags = [...new Set(allTags)];
    return res.json(uniqueTags);
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ message: "Помилка. Не вдалося отримати теги" });
  }
};

export const getPostsByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const posts = await PostModel.find({ tags: tag }).populate("user").exec(); // Фільтруємо за хештегом
    res.json(posts);
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ message: "Не вдалося завантажити пости за хештегом" });
  }
};
