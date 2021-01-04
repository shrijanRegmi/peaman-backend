import * as functions from "firebase-functions";
import admin = require("firebase-admin");
import {
  getToken,
  prepareNotification,
  sendNotification,
} from "./notif_helper";

const sendMsgNotif = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    try {
      const ref = admin.firestore();
      const messageSnap = snap;
      const chatId = context.params.chatId;

      if (messageSnap.exists) {
        const messageData = messageSnap.data();

        if (typeof messageData !== "undefined") {
          const { senderId, receiverId, text } = messageData;
          const senderRef = ref.doc(`users/${senderId}`);

          const senderSnap = await senderRef.get();

          if (senderSnap.exists) {
            const senderData = senderSnap.data();

            if (typeof senderData !== "undefined") {
              const senderName = senderData.name;

              // prepare notification
              const notif = prepareNotification(senderName, text, {
                screen: "chat-screen",
                id: chatId,
              });

              // get tokens
              const tokens = await getToken(receiverId);

              // send notification
              await sendNotification(tokens, notif);
            }
          }
        }
      }
    } catch (error) {
      console.log("Error!!!: Sending message notification", error);
    }
  });

export default sendMsgNotif;
