import * as functions from "firebase-functions";
import admin = require("firebase-admin");
import {
  getToken,
  prepareNotification,
  sendNotification,
  sendNotifToCol,
  updateNotifCol,
  updateNotifCounter,
} from "./notif_helper";

const reactNotif = functions.firestore
  .document("posts/{postId}/reactions/{reactionId}")
  .onCreate(async (snap, context) => {
    try {
      const ref = admin.firestore();
      const reactedById = context.params.reactionId;
      const postId = context.params.postId;

      const postRef = ref.doc(`posts/${postId}`);
      const reactedByRef = ref.doc(`users/${reactedById}`);

      const postSnap = await postRef.get();
      const reactedBySnap = await reactedByRef.get();

      if (postSnap.exists && reactedBySnap.exists) {
        const postData = postSnap.data();
        const reactedByData = reactedBySnap.data();

        if (
          typeof postData !== "undefined" &&
          typeof reactedByData !== "undefined"
        ) {
          const { owner_id, caption, photos } = postData;
          const { name, photoUrl, uid } = reactedByData;

          if (owner_id !== uid) {
            // prepare notification
            const notif = prepareNotification(
              caption,
              `${name} reacted to your post.`,
              {
                screen: "post-screen",
                id: postId,
              }
            );

            // get tokens
            const tokens = await getToken(owner_id);

            // send notification
            await sendNotification(tokens, notif);
            console.log(
              `Success: Sending react notification to user ${owner_id}`
            );

            // send notification to notifications collection in user document
            const currentDate = Date.now();
            const notifRef = ref.doc(
              `users/${owner_id}/notifications/${postId}_reaction`
            );
            const notifSnap = await notifRef.get();
            if (!notifSnap.exists) {
              const notifData = {
                id: `${postId}_reaction`,
                type: 1,
                updated_at: currentDate,
                post_data: {
                  id: postId,
                  photos: photos,
                },
                reacted_by: [
                  {
                    uid: reactedById,
                    name,
                    photoUrl,
                  },
                ],
              };
              await sendNotifToCol(owner_id, notifData);
            } else {
              const userData = {
                uid: reactedById,
                name,
                photoUrl,
              };

              const notifData = {
                id: `${postId}_reaction`,
                updated_at: currentDate,
                reacted_by: admin.firestore.FieldValue.arrayUnion(userData),
                is_read: false,
              };
              await updateNotifCol(owner_id, notifData);

              // update notification count
              await updateNotifCounter(owner_id);
            }
          }
        }
      }
    } catch (error) {
      console.log("Error!!!: Sending react notification", error);
    }
  });

export default reactNotif;
