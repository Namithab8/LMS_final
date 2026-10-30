// Backend/controllers/userController.js
import User from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select(
      "name email course avatar role membershipType maxBorrowLimit"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, email, course, avatar } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (course !== undefined) update.course = course;
    if (avatar !== undefined) update.avatar = avatar;

    const updated = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
      select: "name email course avatar role membershipType maxBorrowLimit",
    });

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("updateMe error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
