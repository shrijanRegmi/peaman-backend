import admin = require("firebase-admin");
import * as functions from "firebase-functions";

const deleteFeed = functions.firestore
  .document("posts/{postId}")
  .onDelete(async (snap, context) => {
    try {
      const postData = snap.data();
      const ref = admin.firestore();

      if (typeof postData !== "undefined") {
        const { id, owner_ref, photos } = postData;

        await owner_ref.update({
          photos: admin.firestore.FieldValue.increment(-photos.length),
        });

        const followersRef: FirebaseFirestore.CollectionReference = owner_ref.collection(
          "followers"
        );

        const followersSnap = await followersRef.get();

        if (!followersSnap.empty) {
          for (let i = 0; i < followersSnap.docs.length; i++) {
            const doc = followersSnap.docs[i];

            if (doc.exists) {
              const followerData = doc.data();
              if (typeof followerData !== "undefined") {
                const followerId = followerData.id;
                const followerTimelineRef = ref.doc(
                  `users/${followerId}/timeline/${id}`
                );

                await followerTimelineRef.delete();
                console.log(
                  `Success: Deleting post ${id} from ${followerId}'s timeline`
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error!!!: Deleting post from followers's timeline", error);
    }
  });

export default deleteFeed;
