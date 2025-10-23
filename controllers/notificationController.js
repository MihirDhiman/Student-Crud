import { sendToDevice } from "../utils/fcm.js";

export const sendNotification = async (req, res) => {
  try {
    const { token, title, body, data } = req.body;

    if (!token || !title || !body) {
      return res
        .status(400)
        .json({ error: "Fields required: token, title, body" });
    }

    const response = await sendToDevice(token, { title, body }, data || {});
    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      messageId: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

