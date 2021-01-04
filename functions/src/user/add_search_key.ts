import admin = require("firebase-admin");
import * as functions from "firebase-functions";

const addSearchKey = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    try {
      const ref = admin.firestore();
      const userId = context.params.userId;

      if (typeof userId !== "undefined") {
        const userRef = ref.doc(`users/${userId}`);
        const userSnap = snap;

        if (userSnap.exists) {
          const userData = userSnap.data();

          if (typeof userData !== "undefined") {
            const { name } = userData;

            const searchKeys = generateSearchKey(name);

            await userRef.update({
              search_keys: searchKeys,
            });

            console.log(`Success: Updating search key ${searchKeys}`);
          }
        }
      }
    } catch (error) {
      console.log(`Error: Updating search key`, error);
    }
  });

function generateSearchKey(name: String) {
  const list = [];
  for (let i = 0; i < name.length; i++) {
    const val = name.substring(0, i + 1);
    list.push(val.toUpperCase());
  }
  return list;
}

export default addSearchKey;
