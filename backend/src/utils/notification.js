const User = require("../models/User");

// Send notification to user (in-app notification system)
const sendNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error("User not found for notification:", userId);
      return;
    }

    // Add notification to user's notifications array
    const newNotification = {
      title: notification.title,
      message: notification.message,
      type: notification.type || "general",
      data: notification.data || {},
      isRead: false,
      createdAt: new Date(),
    };

    // Add reference fields based on notification type
    if (notification.appointmentId) {
      newNotification.appointmentId = notification.appointmentId;
    }
    if (notification.healthRecordId) {
      newNotification.healthRecordId = notification.healthRecordId;
    }

    user.notifications.push(newNotification);

    // Keep only last 50 notifications to prevent array from growing too large
    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(-50);
    }

    await user.save();

    // Here you could integrate with real-time notification services like:
    // - Socket.IO for real-time web notifications
    // - Firebase Cloud Messaging for mobile push notifications
    // - Email notifications for important alerts

    console.log(`Notification sent to user ${userId}: ${notification.title}`);

    return newNotification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Send bulk notifications
const sendBulkNotifications = async (userIds, notification) => {
  try {
    const promises = userIds.map((userId) =>
      sendNotification(userId, notification)
    );
    await Promise.all(promises);
    console.log(`Bulk notifications sent to ${userIds.length} users`);
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    throw error;
  }
};

// Mark notification as read
const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const notification = user.notifications.id(notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await user.save();
    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.notifications.forEach((notification) => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
      }
    });

    await user.save();
    return user.notifications;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { limit = 20, unreadOnly = false } = options;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    let notifications = user.notifications;

    // Filter for unread only if requested
    if (unreadOnly) {
      notifications = notifications.filter(
        (notification) => !notification.isRead
      );
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit results
    if (limit > 0) {
      notifications = notifications.slice(0, limit);
    }

    return notifications;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (userId, notificationId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const notificationIndex = user.notifications.findIndex(
      (notification) => notification._id.toString() === notificationId
    );

    if (notificationIndex === -1) {
      throw new Error("Notification not found");
    }

    user.notifications.splice(notificationIndex, 1);
    await user.save();

    return { message: "Notification deleted successfully" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Get notification statistics for a user
const getNotificationStats = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const notifications = user.notifications;
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const totalCount = notifications.length;

    // Count by type
    const typeCount = {};
    notifications.forEach((notification) => {
      const type = notification.type || "general";
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return {
      total: totalCount,
      unread: unreadCount,
      read: totalCount - unreadCount,
      byType: typeCount,
    };
  } catch (error) {
    console.error("Error getting notification stats:", error);
    throw error;
  }
};

// Send notification based on appointment events
const sendAppointmentNotification = async (
  appointmentId,
  event,
  recipientRole = "patient"
) => {
  const Appointment = require("../models/Appointment");

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "name")
      .populate("doctor", "name");

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const recipient =
      recipientRole === "patient" ? appointment.patient : appointment.doctor;
    const other =
      recipientRole === "patient" ? appointment.doctor : appointment.patient;

    let notification = {};

    switch (event) {
      case "created":
        notification = {
          title: "New Appointment Request",
          message: `New appointment request from ${other.name}`,
          type: "appointment",
          appointmentId,
        };
        break;
      case "confirmed":
        notification = {
          title: "Appointment Confirmed",
          message: `Your appointment with Dr. ${appointment.doctor.name} has been confirmed`,
          type: "appointment",
          appointmentId,
        };
        break;
      case "cancelled":
        notification = {
          title: "Appointment Cancelled",
          message: `Your appointment has been cancelled`,
          type: "appointment",
          appointmentId,
        };
        break;
      case "reminder":
        notification = {
          title: "Appointment Reminder",
          message: `Your appointment is scheduled in 1 hour`,
          type: "appointment",
          appointmentId,
        };
        break;
      default:
        notification = {
          title: "Appointment Update",
          message: "Your appointment has been updated",
          type: "appointment",
          appointmentId,
        };
    }

    await sendNotification(recipient._id, notification);
  } catch (error) {
    console.error("Error sending appointment notification:", error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  sendBulkNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserNotifications,
  deleteNotification,
  getNotificationStats,
  sendAppointmentNotification,
};
