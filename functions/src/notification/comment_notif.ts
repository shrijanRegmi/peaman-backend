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

const commentNotif = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onCreate(async (snap, context) => {
    try {
      const ref = admin.firestore();
      const commentSnap = snap;
      if (commentSnap.exists) {
        const commentData = commentSnap.data();

        if (typeof commentData !== "undefined") {
          const postId = context.params.postId;

          const postRef = ref.doc(`posts/${postId}`);
          const commentByRef = commentData.user_ref;

          const postSnap = await postRef.get();
          const reactedBySnap = await commentByRef.get();

          if (postSnap.exists && reactedBySnap.exists) {
            const postData = postSnap.data();
            const commentByData = reactedBySnap.data();

            if (
              typeof postData !== "undefined" &&
              typeof commentByData !== "undefined"
            ) {
              const { owner_id, caption, photos } = postData;
              const { name, uid, photoUrl } = commentByData;

              if (owner_id !== uid) {
                // prepare notification
                const notif = prepareNotification(
                  caption,
                  `${name} commented to your post.`,
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
                  `Success: Sending comment notification to user ${owner_id}`
                );

                // send notification to notifications collection in user document
                const currentDate = Date.now();
                const notifRef = ref.doc(
                  `users/${owner_id}/notifications/${postId}_comment`
                );
                const notifSnap = await notifRef.get();
                if (!notifSnap.exists) {
                  const notifData = {
                    id: `${postId}_comment`,
                    type: 2,
                    updated_at: currentDate,
                    post_data: {
                      id: postId,
                      photos: photos,
                    },
                    commented_by: [
                      {
                        uid,
                        name,
                        photoUrl,
                      },
                    ],
                  };
                  await sendNotifToCol(owner_id, notifData);
                } else {
                  const userData = {
                    uid,
                    name,
                    photoUrl,
                  };

                  const notifData = {
                    id: `${postId}_comment`,
                    updated_at: currentDate,
                    commented_by: admin.firestore.FieldValue.arrayUnion(
                      userData
                    ),
                    is_read: false,
                  };
                  await updateNotifCol(owner_id, notifData);

                  // update notification count
                  await updateNotifCounter(owner_id);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error!!!: Sending comment notification", error);
    }
  });

export default commentNotif;
