import admin = require("firebase-admin");
import * as functions from "firebase-functions";

const assignInitReactor = functions.firestore
  .document("posts/{postId}/reactions/{reactionId}")
  .onUpdate(async (snap, context) => {
    try {
      if (snap.after.exists) {
        const ref = admin.firestore();
        const postId = context.params.postId;

        const snapData = snap.after.data();
        if (typeof snapData !== "undefined") {
          const unreacted: boolean = snapData.unreacted;

          if (typeof unreacted !== "undefined" && unreacted) {
            const postRef = ref.doc(`posts/${postId}`);
            const postSnap = await postRef.get();

            if (postSnap.exists) {
              const postData = postSnap.data();

              if (typeof postData !== "undefined") {
                const { init_reactor } = postData;

                if (init_reactor === null) {
                  const reactionRef = postRef
                    .collection("reactions")
                    .where("unreacted", "==", false)
                    .limit(1);
                  const reactionSnap = await reactionRef.get();

                  if (!reactionSnap.empty) {
                    const reactionData = reactionSnap.docs[0].data();

                    if (typeof reactionData !== "undefined") {
                      const { uid } = reactionData;
                      const userRef = ref.doc(`users/${uid}`);
                      const userSnap = await userRef.get();

                      if (userSnap.exists) {
                        const userData = userSnap.data();

                        if (typeof userData !== "undefined") {
                          const { email, name, photoUrl } = userData;

                          const data = {
                            init_reactor: {
                              email,
                              name,
                              photoUrl,
                              uid,
                            },
                          };

                          console.log(`The data to update is::::: ${data}`);

                          await postRef.update(data);
                          console.log(
                            `Success: Assinging user details of user ${uid} as initial reactor of post ${postId}`
                          );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      console.log("Error!!!: Assinging user details as initial reactor");
    }
  });

export default assignInitReactor;
