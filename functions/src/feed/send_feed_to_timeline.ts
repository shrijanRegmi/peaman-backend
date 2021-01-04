import admin = require("firebase-admin");
import * as functions from "firebase-functions";

const sendFeedToTimeline = functions.firestore
  .document("users/{userId}/following/{followingId}")
  .onCreate(async (snap, context) => {
    try {
      const myId = context.params.userId;
      const friendId = context.params.followingId;

      const myRef = admin.firestore().doc(`users/${myId}`);

      const friendPostsRef = admin
        .firestore()
        .collection("posts")
        .limit(3)
        .where("owner_id", "==", friendId);

      const friendPostsSnap = await friendPostsRef.get();
      if (!friendPostsSnap.empty) {
        for (let i = 0; i < friendPostsSnap.docs.length; i++) {
          const doc = friendPostsSnap.docs[i];

          if (doc.exists) {
            const postData = doc.data();

            if (typeof postData !== "undefined") {
              const { id, updated_at } = postData;
              const post_ref = doc.ref;

              const timelineData = {
                id,
                post_ref,
                updated_at,
              };

              const myTimelineRef = myRef.collection("timeline").doc(id);

              await myTimelineRef.set(timelineData);
              console.log(`Success: Sending feed to timeline of user ${myId}`);
            }
          }
        }
      }
    } catch (error) {
      console.log("Error!!!: Sending feed to timeline", error);
    }
  });

export default sendFeedToTimeline;
