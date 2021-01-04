import admin = require("firebase-admin");
import * as functions from "firebase-functions";

const sendUser = functions.https.onCall(async (data, context) => {
  if (data) {
    try {
      const userData = data;
      const uid = data.uid;
      const docId = `users/${uid}`;
      const userRef = admin.firestore().doc(docId);

      return await userRef.set(userData);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  return null;
});

export default sendUser;
