import admin = require("firebase-admin");
import * as functions from "firebase-functions";

const sendMomentsToTimeline = functions.firestore
  .document("moments/{momentId}")
  .onCreate(async (snap, context) => {
    try {
      if (snap.exists) {
        const ref = admin.firestore();
        const momentId = context.params.momentId;
        const momentData = snap.data();

        if (typeof momentData !== "undefined") {
          const { owner_id } = momentData;
          const followersRef = ref
            .collection("users")
            .doc(owner_id)
            .collection("followers");
          const followersSnap = await followersRef.get();

          if (!followersSnap.empty) {
            for (var followerDoc of followersSnap.docs) {
              const followerData = followerDoc.data();

              if (typeof followerData !== "undefined") {
                const { id } = followerData;

                const followerRef = ref.doc(`users/${id}`);
                const momentRef = followerRef
                  .collection("moments")
                  .doc(momentId);

                await momentRef.set({
                  moment_ref: snap.ref,
                  updated_at: Date.now(),
                });
                await snap.ref.collection("references").add({
                  moment_ref: momentRef,
                });

                console.log(`Success: Sending moment to user ${id}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error!!!: Sending moment to user", error);
    }
  });

export default sendMomentsToTimeline;
