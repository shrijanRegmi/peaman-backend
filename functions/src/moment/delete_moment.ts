import * as functions from "firebase-functions";

const deleteMoment = functions.firestore
  .document("moments/{momentId}")
  .onDelete(async (snap, context) => {
    try {
      const referencesRef = snap.ref.collection("references");
      const refSnap = await referencesRef.get();

      if (!refSnap.empty) {
        for (const doc of refSnap.docs) {
          const data = doc.data();

          if (typeof data !== "undefined") {
            const momentRef: FirebaseFirestore.DocumentReference =
              data.moment_ref;

            await momentRef.delete();
            console.log(`Success: Deleting moment from reference ${doc.ref}`);
          }
        }
      }
    } catch (error) {
      console.log("Error!!!: Deleting moment from reference", error);
    }
  });

export default deleteMoment;
