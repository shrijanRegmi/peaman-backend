import admin = require("firebase-admin");
import * as functions from "firebase-functions";
import { updateNotifCounter } from "./notif_helper";

const followNotif = functions.firestore
  .document("users/{userId}/requests/{requestId}")
  .onCreate(async (snap, context) => {
    try {
      if (snap.exists) {
        const { id } = snap.data();
        const userId = context.params.userId;

        const userRef = admin.firestore().collection("users").doc(id);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
          const userData = userSnap.data();

          if (typeof userData !== "undefined") {
            const { name, photoUrl } = userData;
            const currentDate = Date.now();

            const notifData = {
              user_data: {
                uid: id,
                name,
                photoUrl,
              },
              type: 0,
              updated_at: currentDate,
            };

            const followRequestRef = admin
              .firestore()
              .doc(`users/${userId}/follow_requests/${id}`);

            await followRequestRef.set(notifData);
            await updateNotifCounter(userId);
            console.log("Success: Sending follow notification");
          }
        }
      }
    } catch (error) {
      console.log("Error!!! Sending follow notification", error);
    }
  });

export default followNotif;
