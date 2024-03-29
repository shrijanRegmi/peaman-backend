import admin = require("firebase-admin");
import assignInitReactor from "./feed/assign_init_reactor";
import deleteFeed from "./feed/delete_feed";
import expireMoment from "./feed/expire_moment";
import sendFeedToTimeline from "./feed/send_feed_to_timeline";
import updateNewPostValue from "./feed/update_new_post_value";
import deleteMoment from "./moment/delete_moment";
import sendMomentsToTimeline from "./moment/send_moments_to_timeline";
import commentNotif from "./notification/comment_notif";
import followNotif from "./notification/follow_notif";
import notifCounter from "./notification/notif_counter";
import reactNotif from "./notification/react_notification";
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

// react post notification
exports.reactNotif = reactNotif;

// comment post notification
exports.commentNotif = commentNotif;

// increase notification count
exports.notifCounter = notifCounter;

// delete moment after 24 hr of creation
exports.expireMoment = expireMoment;

// if the initial reactor has unreacted a post, assign the value of next reactor to initial reactor of a post
exports.assignInitReactor = assignInitReactor;

// send newly created moment to followers timeline
exports.sendMomentsToTimeline = sendMomentsToTimeline;

// trigger this when moment gets expired
exports.deleteMoment = deleteMoment;
