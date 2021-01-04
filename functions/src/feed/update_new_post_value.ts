import admin = require("firebase-admin");
import * as functions from "firebase-functions";

const updateNewPostValue = functions.firestore
  .document("users/{userId}/timeline/{timelineId}")
  .onCreate(async (snap, context) => {
    try {
      const userId = context.params.userId;
      if (typeof userId !== "undefined") {
        const userRef = admin.firestore().doc(`users/${userId}`);

        await userRef.update({
          new_posts: true,
        });
        console.log("Success: Updating value of new post");
      }
    } catch (error) {
      console.log("Error!!!: Updating value of new post", error);
    }
  });

export default updateNewPostValue;
