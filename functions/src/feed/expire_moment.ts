import admin = require("firebase-admin");
import * as functions from "firebase-functions";

const expireMoment = functions.pubsub
  .schedule("* * * * *")
  .onRun(async (context) => {
    try {
      const currentDate = Date.now();

      const ref = admin.firestore();

      const momentsRef = ref
        .collection("moments")
        .where("expires_at", "<=", currentDate);
      const momentSnap = await momentsRef.get();

      if (!momentSnap.empty) {
        for (let i = 0; i < momentSnap.docs.length; i++) {
          const doc = momentSnap.docs[i];
          await doc.ref.delete();
          console.log("Success: Expiring moment");
        }
      } else {
        console.log("No moments to expire");
      }
    } catch (error) {
      console.log("Error!!!: Expiring moment", error);
    }
  });

export default expireMoment;
