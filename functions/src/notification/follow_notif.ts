import admin = require("firebase-admin");
import * as functions from "firebase-functions";

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

            const notifRef = admin
              .firestore()
              .collection("users")
              .doc(userId)
              .collection("notifications");

            const notifData = {
              user_data: {
                uid: id,
                name,
                photoUrl,
              },
              type: 0,
            };

            await notifRef.add(notifData);
            await admin
              .firestore()
              .collection("users")
              .doc(userId)
              .update({
                notification_count: admin.firestore.FieldValue.increment(1),
              });
          }
        }
      }
    } catch (error) {
      console.log("Error!!! sending follow notification", error);
    }
  });

export default followNotif;
