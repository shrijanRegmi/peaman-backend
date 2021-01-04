import admin = require("firebase-admin");
import deleteFeed from "./feed/delete_feed";
import sendFeedToTimeline from "./feed/send_feed_to_timeline";
import updateNewPostValue from "./feed/update_new_post_value";
import followNotif from "./notification/follow_notif";
import sendMsgNotif from "./notification/send_msg_notif";
import addSearchKey from "./user/add_search_key";
import sendUser from "./user/send_user";

admin.initializeApp();

exports.followNotif = followNotif;

// send user to firebase when they create account on app
exports.sendUser = sendUser;

// add feeds to user timeline if they follow new user
exports.sendFeedToTimeline = sendFeedToTimeline;

// update the value of new_post field on user document
exports.updateNewPostValue = updateNewPostValue;

// trigger this when user deletes a feed
exports.deleteFeed = deleteFeed;

// add search key to user document when they create account
exports.addSearchKey = addSearchKey;

// send message notification
exports.sendMsgNotif = sendMsgNotif;
