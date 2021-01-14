import * as functions from "firebase-functions";
import { updateNotifCounter } from "./notif_helper";

const notifCounter = functions.firestore
  .document("users/{userId}/notifications/{notificationId}")
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    await updateNotifCounter(userId);
  });

export default notifCounter;
