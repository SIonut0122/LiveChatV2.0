
import { USER              } from "../constants/action-types";
import { OPEN_SIGN_IN_UP   } from "../constants/action-types";
import { USER_LOADED       } from "../constants/action-types";
import { ANONYMOUS_USER    } from "../constants/action-types";
import { USER_KEY          } from "../constants/action-types";
import { GET_ONLINE_USERS  } from "../constants/action-types";
import { GET_CHAT_MSG      } from "../constants/action-types";
import { GET_CONN_TIME     } from "../constants/action-types";
import { OPEN_USER_CP      } from "../constants/action-types";
import { OPEN_MOBILE_MENU  } from "../constants/action-types";
import { INACTIVE_USER     } from "../constants/action-types";
import { OPEN_WELCOME_PAGE } from "../constants/action-types";
import { USER_COUNTRY_FLAG } from "../constants/action-types";
import { GET_USER_IP       } from "../constants/action-types";




export function openWelcomePage(payload) {
  return { type: OPEN_WELCOME_PAGE, payload };
}
export function userInfo(payload) {
  return { type: USER, payload };
}
export function setAnonymousUser(payload) {
  return { type: ANONYMOUS_USER, payload };
}
export function openSigninup(payload) {
  return { type: OPEN_SIGN_IN_UP, payload };
}
export function userIsLoaded(payload) {
  return { type: USER_LOADED, payload };
}
 export function getUserKey(payload) {
  return { type: USER_KEY, payload };
}
 export function getOnlineUsers(payload) {
  return { type: GET_ONLINE_USERS, payload };
}
export function getChatMsg(payload) {
  return { type: GET_CHAT_MSG, payload };
}
export function getConnectedTime(payload) {
  return { type: GET_CONN_TIME, payload };
}
export function openUserCP(payload) {
  return { type: OPEN_USER_CP, payload };
}
export function openMobileMenu(payload) {
  return { type: OPEN_MOBILE_MENU, payload };
}
export function setInactiveUser(payload) {
  return { type: INACTIVE_USER, payload };
}
export function setCountryAndFlag(payload) {
  return { type: USER_COUNTRY_FLAG, payload };
}
export function getUserIP(payload) {
  return { type: GET_USER_IP, payload };
}

 