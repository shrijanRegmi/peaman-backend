import admin = require("firebase-admin");

function prepareNotification(title: string, body: string, data: Object) {
  return {
    notification: {
      title,
      body,
    },
    data,
    android: {
      notification: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    },
    token: "",
  };
}

async function getToken(userId: string): Promise<string[]> {
  const tokens: string[] = [];
  try {
    const ref = admin.firestore();
    const deviceRef = ref.collection("users").doc(userId).collection("devices");

    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.empty) {
      for (let i = 0; i < deviceSnap.docs.length; i++) {
        const doc = deviceSnap.docs[i];
        if (doc.exists) {
          const data = doc.data();

          if (typeof data !== "undefined") {
            const { token } = data;

            tokens.push(token);
          }
        }
      }
    }

    console.log(`Success: Getting token from user ${userId}`);
  } catch (error) {
    console.log(`Error!!!: Getting token from user ${userId}`, error);
  }
  return tokens;
}

async function sendNotification(tokens: string[], notif: any) {
  try {
    for (const token of tokens) {
      if (typeof notif !== "undefined") {
        notif.token = token;
        await admin.messaging().send(notif);
      }
    }
    console.log("Success: Sending notification");
  } catch (error) {
    console.log("Error!!!: Sending notification", error);
  }
}

async function sendNotifToCol(userId: string, data: any) {
  try {
    const fs = admin.firestore();
    const userRef = fs.doc(`users/${userId}`);
    const notifRef = userRef.collection("notifications").doc(data.id);

    await notifRef.set(data);

    console.log(`Success: Sending to notif collection of ${userId}`);
  } catch (error) {
    console.log(`Error!!!: Sending to notif collection of ${userId}`, error);
  }
}

async function updateNotifCol(userId: string, data: any) {
  try {
    const fs = admin.firestore();
    const userRef = fs.doc(`users/${userId}`);
    const notifRef = userRef.collection("notifications").doc(data.id);

    await notifRef.update(data);

    console.log(`Success: Updating notif collection of ${userId}`);
  } catch (error) {
    console.log(`Error!!!: Updating notif collection of ${userId}`, error);
  }
}

export {
  prepareNotification,
  getToken,
  sendNotification,
  sendNotifToCol,
  updateNotifCol,
};
