import { USER              } from "./constants/action-types";
import { OPEN_SIGN_IN_UP   } from "./constants/action-types";
import { USER_LOADED       } from "./constants/action-types";
import { ANONYMOUS_USER    } from "./constants/action-types";
import { USER_KEY          } from "./constants/action-types";
import { GET_ONLINE_USERS  } from "./constants/action-types";
import { GET_CHAT_MSG      } from "./constants/action-types";
import { GET_CONN_TIME     } from "./constants/action-types";
import { OPEN_USER_CP      } from "./constants/action-types";
import { OPEN_MOBILE_MENU  } from "./constants/action-types";
import { INACTIVE_USER     } from "./constants/action-types";
import { OPEN_WELCOME_PAGE } from "./constants/action-types";
import { USER_COUNTRY_FLAG } from "./constants/action-types";
import { GET_USER_IP       } from "./constants/action-types";


 const initialState = {
              displayWelcomePage : true,
         			user               : undefined,
              anonymousUser      : {},
              userCountryAndFlag : [],
              fetchedOnlineUsers : {},
              fetchedChatMsg     : {},
              connectedTime      : '',
              userKey            : '',
              userLoaded         : false,
              displaySignInUp    : false,
              displayUserCP      : false,
              displayMobileMenu  : false,
              inactiveUser       : false,
              userIP             : null
  				}


 function rootReducer(state = initialState, action) {
      if (action.type === OPEN_WELCOME_PAGE) {
        return Object.assign({}, state, {
          displayWelcomePage: action.payload.displayWelcomePage
        });
      }
      if (action.type === USER) {
        return Object.assign({}, state, {
          user: action.payload.user
        });
      }
      if (action.type === OPEN_SIGN_IN_UP) {
        return Object.assign({}, state, {
          displaySignInUp: action.payload.displaySignInUp
        });
      }
      if (action.type === USER_LOADED) {
        return Object.assign({}, state, {
          userLoaded: action.payload.userLoaded
        });
      }
      if (action.type === ANONYMOUS_USER) {
        return Object.assign({}, state, {
          anonymousUser: action.payload.anonymousUser
        });
      }
      if (action.type === USER_KEY) {
        return Object.assign({}, state, {
          userKey: action.payload.userKey
        });
      }
      if (action.type === GET_ONLINE_USERS) {
        return Object.assign({}, state, {
          fetchedOnlineUsers: action.payload.fetchedOnlineUsers
        });
      }
      if (action.type === GET_CHAT_MSG) {
        return Object.assign({}, state, {
          fetchedChatMsg: action.payload.fetchedChatMsg
        });
      }
      if (action.type === GET_CONN_TIME) {
        return Object.assign({}, state, {
          connectedTime: action.payload.connectedTime
        });
      }
      if (action.type === OPEN_USER_CP) {
        return Object.assign({}, state, {
          displayUserCP: action.payload.displayUserCP
        });
      }

      if (action.type === OPEN_MOBILE_MENU) {
        return Object.assign({}, state, {
          displayMobileMenu: action.payload.displayMobileMenu
        });
      }
      if (action.type === INACTIVE_USER) {
        return Object.assign({}, state, {
          inactiveUser: action.payload.inactiveUser
        });
      }
      if (action.type === USER_COUNTRY_FLAG) {
        return Object.assign({}, state, {
          userCountryAndFlag: action.payload.userCountryAndFlag
        });
      }
       if (action.type === GET_USER_IP) {
        return Object.assign({}, state, {
          userIP: action.payload.userIP
        });
      }
      return state;
    }

    
  export default rootReducer;