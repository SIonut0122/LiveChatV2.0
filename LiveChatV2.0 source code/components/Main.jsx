import   React              from 'react';
import { connect         }  from "react-redux";
import { openWelcomePage,
         userInfo,
         openSigninup,
         openMobileMenu,
         setInactiveUser,
         getChatMsg       } from '../actions/index';
import   WelcomePage        from '../components/WelcomePage';
import   Header             from '../components/Header';
import   SignInUp           from '../components/SignInUp';
import   MobileMenu         from '../components/MobileMenu';
import   dbRef              from '../firebase';
import   getdbRefData       from '../firebase';
import * as firebase        from 'firebase/app';
import '../css/Main.css';
 
 

const mapStateToProps = state => {
  return {  
            displayWelcomePage : state.displayWelcomePage,
            user               : state.user,
            userIP             : state.userIP,
            displaySignInUp    : state.displaySignInUp,
            userKey            : state.userKey,
            userLoaded         : state.userLoaded,
            inactiveUser       : state.inactiveUser,
            anonymousUser      : state.anonymousUser,
            fetchedOnlineUsers : state.fetchedOnlineUsers,
            fetchedChatMsg     : state.fetchedChatMsg,
            displayMobileMenu  : state.displayMobileMenu,
            onlineUsers        : state.onlineUsers
        };
      };



function mapDispatchToProps(dispatch) {
  return {
        userInfo        : user => dispatch(userInfo(user)),
        openSigninup    : bol  => dispatch(openSigninup(bol)),
        openMobileMenu  : bol  => dispatch(openMobileMenu(bol)),
        setInactiveUser : bol  => dispatch(setInactiveUser(bol)),
        openWelcomePage : bol  => dispatch(openWelcomePage(bol)),
        getChatMsg      : arr  => dispatch(getChatMsg(arr)),
  };
}


 
class ConnectedMain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        inputMessage      : '',
        replyToMsg        : false,
        replyUsername     : '',
        firstTextPart     : '',
        secondTextPart    : '',
        user              : this.props.user,
        chatMessages      : this.props.fetchedChatMsg,
        msgAudio          : new Audio(),
        fetchedMessages   : false,
        dataMsgFetchError : false,
        onlineUsers       : this.props.fetchedOnlineUsers,
        onlineUserKey     : '',
        emoticons         : ['😀','😁','😂','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😚','🙂','🤔','🤨','😐','😶','🙄','😛','😒','😓','😔','😕','🙃','🤑','😲','☹️','😭','😦','😧','😡','😠','🤬','🤢','🤮','🤡','🥺','🤥','🤫','😈','💀','👽','💩','😺','👍','👎','🙏','🤜','🤞','✌️','🤟','🤘','👌','👋'],
        renderEmoticons   : false,
        lastMsgIsInView   : true,      
        timer             : 0,
        interval          : undefined,
        botMessageSent    : false,
        alreadyConnected  : false,

    }
    this.cancelReplyMsg = this.cancelReplyMsg.bind(this);
    this.sendMessage    = this.sendMessage.bind(this);
  }

 
componentDidMount() {

  // Display welcome loading text
  setTimeout(() => {
  // Display loading text on welcome page
   document.querySelector('.wp_wrap_loading_txt').style.opacity = '1';
   document.querySelector('.wp_round_ico').style.opacity = '1';
  },1500);
  // Hide welcome loading container and call function to fetch chat messages
  setTimeout(() => {
    this.props.openWelcomePage({ displayWelcomePage: false })
    this.fetchChatMessages();
  },5000);
  // Delete online user before unload
  window.addEventListener('beforeunload', (e) => this.handleWindowBeforeUnload(e));
  window.addEventListener('resize', (e) => this.handleWindowResize(e));
  // Fetch chat messages
 
  // Add event listeners to window to handle user activity
  let actions = ['click', 'mousemove', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'focus'];
  actions.forEach((act) => { window.addEventListener(act, () => this.stopTimer()); })
  // If user is not inactive, start timer
  if(!this.props.inactiveUser) {
    this.startTimer();
  }
  // Set default audio for submitted message  
  let url       = require('../images/chat/message.mp3'),
      audio     = this.state.msgAudio;
      audio.src = url;

   // Handle focus outline on mouse / keyboard
    // If mouse is detected, remove focus outline
    document.body.addEventListener('mousedown', function() {
      document.body.classList.add('using-mouse');
    });
    // If keyboard is detect, add focus outline
    document.body.addEventListener('keydown', function() {
      document.body.classList.remove('using-mouse');
    });
}


// TRACK USER ACTIVITY / INACTIVITY //

startTimer() {
  let interval = this.state.interval;
      interval = setInterval(() =>{ this.countActivity();},1000);
      this.setState({ interval: interval})
}

countActivity() {
  let timer = this.state.timer;
      timer++;

  this.setState({ timer: timer})
  // If user activity seconds === 180s (3 min), call function.
  if(timer === 180) {
    // Call function to disconnect user  
    this.disconnectUser();
  }
}

stopTimer() {
 let interval = this.state.interval;
  // On event trigger clear interval and timer
  clearInterval(interval);
  this.setState({ interval: interval})
  // Check if timer !== 0 to avoid changing state on every event trigger
  if(this.state.timer !== 0) {
    this.setState({ timer: 0 })
  }
   // If user is not inactive, start timer (avoid infinite counter)
  if(!this.props.inactiveUser) {
    this.startTimer();
  }
}

disconnectUser() {
  let interval = this.state.interval;
  // Clear interval and timer
  clearInterval(interval);
  this.setState({ interval: interval, timer:0 })
  // Set inactiveUser to true to display 'Inactive user' modal
  this.props.setInactiveUser({ inactiveUser: true })
  // If user was signed in, sign out
  if(this.props.user !== undefined) {
    firebase.auth().signOut()
  } 
  // Call function to remove user
  this.handleWindowBeforeUnload();
  console.log('Used disconnected due to inactivity.');
}

componentWillUnmount() {
  // Add event listener to send request to db after user close tab/browser
  window.removeEventListener('beforeunload', this.handleWindowBeforeUnload);
}

handleWindowBeforeUnload() {
    // Delete user with this key before closing the tab/window/page
  if(this.props.userKey.length > 0) {
     let request = dbRef.child('onlineUsers').child(this.props.userKey).remove();
     navigator.sendBeacon(request, null);
   } else {
    console.log('Invalid user key to remove');
   }
}
 
fetchChatMessages() {
  let fetchedChatMessages = [],
      self                = this,
      today               = new Date(),
      todayDate           = today.getDate()  + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();

   getdbRefData.child('chatMessages').on('value', gotData, errData);

    function gotData(data) {
    // the real value of data key
    let chatMessages = data.val();
    // if there is data to retrive, retrieve
    if (chatMessages !== null) {
      // Hide 'No data to fetch' error message
      self.setState({ dataMsgFetchError: false })

      let keys = Object.keys(chatMessages);
      let key, username, imgLetter, date, time, message,id, originDate;

      // Assign value for every variable
        // Map through object, assing variable with all info about messages and push them into fetchedChatMessages
      for (let i = 0; i < keys.length; i++) {
        let k      = keys[i];
        key        = chatMessages[k].key;
        username   = chatMessages[k].username;
        imgLetter  = chatMessages[k].imgLetter;
        date       = chatMessages[k].date;
        time       = chatMessages[k].time;
        message    = chatMessages[k].message;
        id         = chatMessages[k].id;
        originDate = chatMessages[k].originDate;


        // Push all info about the online user inside array to be displayed
        fetchedChatMessages.push({
          key        : key,
          username   : username,
          imgLetter  : imgLetter,
          date       : date === todayDate ? 'today' : date,
          time       : time,
          message    : message,
          id         : id,
          originDate : originDate,
        });
      }

    } else {
      console.log('Errro: No chat message data to fetch'); 
      self.setState({ dataMsgFetchError: true })
    }
    
    // Get only the unique values from object array (info from firebase is comming duplicated every time, dunno why)
    let uniqueKey = Array.from(new Set(fetchedChatMessages.map(a => a.key)))
      .map(key => {
        return fetchedChatMessages.find(a => a.key === key)
      });

    // Remove 'active' id from all the messages and add 'active' id to the last element of array
    for(let i=0;i<uniqueKey.length;i++) {
      if(uniqueKey.indexOf(uniqueKey[i]) !== uniqueKey.length - 1) {
        uniqueKey[i].id = '';
      }
    }
    
   // If fetched messages array length is higher than the old state fetchedMsg (when a new messages is recieved), play sound every time
    if(self.props.fetchedChatMsg.length < uniqueKey.length) {
       let audio = self.state.msgAudio;
             audio.load();
             audio.play();
    }
   // Send welcome bot message if user is not connected
    setTimeout(() => {
       self.sendBotMessage(uniqueKey);
    },2000);
   // Set fetched message and fetchedMessages to true to hide loading chat ring 
    self.setState({ chatMessages: uniqueKey, fetchedMessages: true })
    self.props.getChatMsg({ fetchedChatMsg: uniqueKey})
   // If last message is in view (user didn't scrolled up), scroll to bottom of chat
     if (self.state.lastMsgIsInView) {
        self.scrollToLastMsg();
      }
  }

  function errData(err) {
    console.log(err);
    self.setState({ dataMsgFetchError: true })
  }
}

sendBotMessage(fetchedMessages) {
  let today  = new Date(),
      time   = today.getHours() + ":" + today.getMinutes(),
      user   = this.props.user !== undefined ? this.props.user.displayName : this.props.anonymousUser.username,
      self   = this,
      audio  = this.state.msgAudio,
      botMsg = "Hello "+user+"! Welcome to the live chat. You can create an account by clicking the Sign Up button. If you have already an account, you can Sign In and start chatting. Enjoy! 🙂";


  if(!this.state.botMessageSent && this.props.user === undefined) {
     fetchedMessages.push({
          username  : 'BOT',
          imgLetter : 'B',
          id        : 'active',
          date      : 'today',
          time      : time,
          message   : botMsg,
    })
    self.setState({ chatMessages: fetchedMessages, botMessageSent: true })
    this.props.getChatMsg({ fetchedChatMsg: fetchedMessages})
    // Play chat sound
    audio.play();
    // If last message is in view (user didn't scrolled up), scroll to bottom of chat
    if (self.state.lastMsgIsInView) {
        self.scrollToLastMsg();
      }
  }
}

muteUnmuteChat() {
  let chatVolume = document.querySelector('.mute_chat_button'),
      chatSound  = this.state.msgAudio;

  if(chatVolume.classList.contains('mute_chat_button_muted')) {
    chatVolume.classList.remove('mute_chat_button_muted');
    chatSound.volume = '0.9';
  } else {
    chatVolume.classList.add('mute_chat_button_muted');
    chatSound.volume = '0.0';
  }

}


openEmotiList(e) {
    // Clicking inside chat cause hiding emoticons box
      // Avoid this by stopping propagation
    e.stopPropagation();
    // Focus on input chat after rendering the emotilist to continue displaying the virtual keyboard on mobile
    document.querySelector('.input_txt_value').focus();
    // On mobile size, scroll to last message when rendering emoticons list
    if(window.innerWidth <= 550) {
      if(document.contains(document.getElementById('active'))) {
        document.getElementById('active').scrollIntoView();
      }
    }
    this.setState({ renderEmoticons: !this.state.renderEmoticons});
}

selectEmoji(e) {
  // Push selected emoji inside text
    // Concat from index 0 of text to the cursor position + emoji + cursor index position to the end.
  let chatInput       = document.querySelector('.input_txt_value'),
      inputSendButton = document.querySelector('.input_send_button'),
      inputMessage    = this.state.inputMessage,
      firstTextPart   = this.state.firstTextPart,
      secondTextPart  = this.state.secondTextPart,
      newText;

  // Check where focus text position is and insert emoticons there
  if(firstTextPart.length === 0 && secondTextPart.length > 0) {
    newText = e+inputMessage;
  } else if(secondTextPart.length === 0 && firstTextPart.length > 0) {
    newText = inputMessage+e;
  } else if(firstTextPart.length === 0 && secondTextPart.length === 0) {
    newText = inputMessage+e;
  } else {
    newText = firstTextPart+e+secondTextPart;
  }
  // Set newtxt to input value and state
  chatInput.value = newText;
  this.setState({inputMessage: newText });
  // Make input send button active
  inputSendButton.classList.remove('inactive_sendbutt');
  // Focus on input chat after rendering the emotilist to continue displaying the virtual keyboard on mobile
  document.querySelector('.input_txt_value').focus();
  // Close emoji list
  setTimeout(() => { 
      this.setState({ firstTextPart: '', secondTextPart: ''})
    },200);
}

handleChatClick() {
  // Hide emoticons box when clicking anywhere inside the chat
 this.setState({ renderEmoticons: false })
  // If any 'Delete' box from chat messages is displayed, hide it
   let chatDelMessages = document.querySelectorAll('.msgusercp_conf_msg');
    chatDelMessages.forEach((msg) => {
        if(msg.style.display === 'block') {
          msg.setAttribute('style','display:none');
        }
    })

     // If connected user name is found, set to true
    if(this.props.user === undefined) {
    // Check if connected user name was not removed 
      // (usually happens when user is already connected from somewhere else, or name was removed
        // due to user inactivity)
      let onUsers = this.props.fetchedOnlineUsers;
      let founded = false;

      if(onUsers.length > 0) {
        onUsers.forEach((el) => {
          if(el.username === this.props.anonymousUser.username) {
            founded = true;
          }
        })
      }

    // If founded remains false, user does not exists inside online users box
    if(!founded) {
     this.setState({ alreadyConnected: true })
     // Set inactive user to disable sending messages if inspect->hide already connected modal
     this.props.setInactiveUser({ inactiveUser: true })

    }
  }
}

fullChatWidth() {
  // Expand chat to full width and scroll to last msg 
  document.querySelector('.chat_cont').classList.toggle('full_chat_width');
  this.scrollToLastMsg();
}

handleChatInput(e) {
   let msgValue           = e.target.value,
    // Check value length
      checkMsgValueLength = msgValue.length > 0,
    // Check for blank spaces
      checkWhiteSpaces    = msgValue.trim().length === msgValue.length,
    // Input send message button
      inputSendButton     = document.querySelector('.input_send_button');
  
      // if username value match, setstate value 
    if(checkMsgValueLength && checkWhiteSpaces) {
        this.setState({inputMessage: msgValue})
        inputSendButton.classList.remove('inactive_sendbutt');
    } else if(msgValue.length === 0) {
      // If input is empty, reset value input
      // Clear first and sec part if user had selected some emoji first
        this.setState({inputMessage: '', firstTextPart: '', secondTextPart: ''})
        inputSendButton.classList.add('inactive_sendbutt');
    } else {
        this.setState({inputMessage: '',firstTextPart: '', secondTextPart: ''})
        inputSendButton.classList.add('inactive_sendbutt');
    }
}

handleChatInputClick(input) {
  // Get cursor position and split input message in half.
    // In this way, an emoji can be inserted inside the text after click

  let cursorPosition = input.target.selectionStart;
  let selectionEnd   = input.target.value.length;

  if (input.setSelectionRange) {
    input.focus();
    // Select counted text range (cursorpositon, end of text)
    input.setSelectionRange(cursorPosition, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', cursorPosition);
    range.select();
  }

  let inputMessage = this.state.inputMessage;
  // Get first part of input mesasge (from the beginning to the cursor position)
  let firstTextPart  = inputMessage.substring(0,cursorPosition);
  // Get second part of input message (from the cursor index position 'til the end )
  let secondTextPart = inputMessage.substring(cursorPosition, inputMessage.length);
  // Set new text parts / Close emoticons list if rendered
  this.setState({ firstTextPart: firstTextPart, secondTextPart: secondTextPart, renderEmoticons: false })
  // Scroll to last message when clicking on input (handle pushing content to top - on mobile size)
  document.querySelector('.input_txt_value').scrollIntoView();
  this.scrollToLastMsg();
}

handleChatKey(e) {
  if(e.key === 'Enter') {
    this.sendMessage(e);
  }
}

handleChatScroll(el) {
 let lastMessage = document.getElementById('active');

    // Check if element is InView
   const DivIsInView    = el => {
        const scroll    = window.scrollY || window.pageYOffset
        const boundsTop = el.getBoundingClientRect().top + scroll
        const viewport  = {
          top    : scroll,
          bottom : scroll + window.innerHeight,
        }
        const bounds = {
          top    : boundsTop,
          bottom : boundsTop + el.clientHeight,
        }
        return ( bounds.bottom >= viewport.top && bounds.bottom <= viewport.bottom ) 
          ||   ( bounds.top <= viewport.bottom && bounds.top >= viewport.top );
    }

      // If last message setstate to true / false
    let lastMsgInView = DivIsInView(lastMessage);
    if(lastMsgInView) {
      this.setState({ lastMsgIsInView: true })
    } else {
      this.setState({ lastMsgIsInView: false })
    }
}

chatMsgHover(e) {
  // Display reply message icon
  e.target.firstElementChild.childNodes[0].firstChild.setAttribute('style','display:block !important');
} 

chatMsgHoverOut(e) {
  // Hide reply message icon when hovering out the chat msg
e.target.firstElementChild.childNodes[0].firstChild.removeAttribute('style');
}

sendMessage() {
  let messages         = [...this.props.fetchedChatMsg],
      anonymousUser    = this.props.anonymousUser,
      user             = this.props.user,
      inputSendButton  = document.querySelector('.input_send_button'),
      chatInput        = document.querySelector('.input_txt_value'),
      today            = new Date(),
      date             = today.getDate()  + '/' + (today.getMonth() + 1) + '/' + today.getFullYear(),
      time             = today.getHours() + ":" + today.getMinutes(),
      databaseRef      = dbRef.child('chatMessages').push();


      // Focus on input after submit
      setTimeout(() => {
      chatInput.focus();
      },200);
      // Remove 'No data to fetch' chat error message if chatMessages was empty
      if(messages.length === 0) {
        this.setState({ dataMsgFetchError: false})
      }
      // If input chat message is valid and if user was not disconnected due to inactivity
        // Avoid Inactivity Modal - inspect page -> display:none -> Send message as 'Nobody' (because was disconnected)
    if(this.state.inputMessage.length > 0 && !this.props.inactiveUser) {       
          databaseRef.set({
            key        : databaseRef.key,
            username   : user ? user.displayName : anonymousUser.username,
            imgLetter  : user ? user.displayName.substring(0,1).toUpperCase() : 'A',
            date       : date,
            time       : time,
            originDate : today.toString(),
            message    : this.state.replyToMsg ? this.state.replyUsername+" "+this.state.inputMessage : this.state.inputMessage,
            id         : 'active'
          })
          .then(() => {
            // Scroll to the bottom of chat
            this.scrollToLastMsg();
          })
          .catch((err) => {
            console.log('Message not sent: '+err);
          })
       
        // Clear input text value
        document.querySelector('.input_txt_value').value = '';
        // Focus on input text 
        document.querySelector('.input_txt_value').focus();
        // Disable send message button
        inputSendButton.classList.add('inactive_sendbutt');
        // Clear input values and close emoji list if opened
        this.setState({messages: messages, inputMessage:'', renderEmoticons: false, firstTextPart:'', secondTextPart:''})
        // Call function to scroll to bottom on every new message
        this.scrollToLastMsg();

        if(this.state.replyToMsg) {
          this.setState({ replyToMsg: false, replyUsername: ''})
          document.querySelector('.input_reply_name').innerHTML = '';
          document.querySelector('.input_reply_name').removeAttribute('style');
          document.querySelector('.input_txt_value').removeAttribute('style');
        }
    } else {
      if(window.innerWidth <= 549.5) { document.getElementById('active').scrollIntoView()}
    }
}

handleMsgThreeDots(e) {
  e.stopPropagation();
  // Select next sibling ('Delete' box text)
  let chatDelMsg = e.target.nextSibling;

 // Toggle 'Delete' msg box display  
  if(chatDelMsg.style.display === 'block') {
   chatDelMsg.setAttribute('style','display:none');
  } else {
    chatDelMsg.setAttribute('style','display:block');
  }
  
// Loop through all 'Delete' msg box; If msg is not equal with clicked target, hide it
  document.querySelectorAll('.msgusercp_conf_msg').forEach((msg) => {
      if(msg !== chatDelMsg) {
         msg.setAttribute('style','display:none');
      }
  })

}

removeThisMsg(e,msg) {
  let chatMsg = [...this.props.fetchedChatMsg];

  chatMsg.forEach((el) => {
    if(el.key === msg.key) {
      // Inner html to deleted msg
      el.message = 'Your message was deleted';
      // Hide 'Delete' txt user msg cp
      e.target.style.display = 'none';
      // Hide user msg cp dots
       e.target.previousSibling.style.display = 'none';
      // Remove msg from db
      dbRef.child('chatMessages').child(msg.key).remove();
    }
  })
  this.setState({ chatMsg: chatMsg })
  this.props.getChatMsg({ fetchedChatMsg: chatMsg })
}

replyToThisMsg(msg) {
  // Call function to restore all defaults
  this.cancelReplyMsg();

  let inputReplyName = document.querySelector('.input_reply_name'),
      inputChat      = document.querySelector('.input_txt_value');

    inputReplyName.innerHTML = '';
    // Insert username + cancel reply button
    inputReplyName.innerHTML = '@'+msg.username + `<span>&times;</span>`;
     // Set reply username box style padding to fit inside input chat
    inputReplyName.setAttribute('style','padding:10px 20px 0 5px;');
    // Get input reply name width + 8 px
    let replyNameWidth = window.innerWidth <= 549.5 ? inputReplyName.offsetWidth + 53 : inputReplyName.offsetWidth + 5;
    // Focus on chat input , set padding chat input due to name reply width
    inputChat.focus();
    let paddingLeft = 'padding-left:'+replyNameWidth+'px !important';

    inputChat.setAttribute('style',paddingLeft);
    // Clear chat input value and set the replyUsername
    inputChat.value = '';
    this.setState({ replyUsername: '@'+msg.username, replyToMsg: true });

    if(window.innerWidth <= 549.5) {
      inputReplyName.style.left = '45px';
    }
}

handleWindowResize(e) {
  let inputReplyName = document.querySelector('.input_reply_name'),
      inputChat      = document.querySelector('.input_txt_value');
    
    // Keep the last message in view while resizing the window
  this.scrollToLastMsg();
    // Handle reply name padding and left px on mobile or normal size
  if(this.state.replyToMsg) {
    if(window.innerWidth <= 549.5) {
        // If input reply name left px on mobile !== 45px (let space for emoticon icon) 
      if(inputReplyName.style.left !== '45px') {
        inputReplyName.style.left = '45px';
        let replyNameWidthMob = inputReplyName.offsetWidth + 53;
        let paddingLeftMob    = 'padding-left:'+replyNameWidthMob+'px !important';

        inputChat.removeAttribute('style');
        inputChat.setAttribute('style',paddingLeftMob);
      }
    } else {
        inputReplyName.style.left = '0';
        let replyNameWidth = inputReplyName.offsetWidth + 5;
        let paddingLeft    = 'padding-left:'+replyNameWidth+'px !important';

        inputChat.removeAttribute('style');
        inputChat.setAttribute('style',paddingLeft);
    }
  }
}
cancelReplyMsg() {
  let inputReplyUsername = document.querySelector('.input_reply_name'),
      inputChat          = document.querySelector('.input_txt_value');

      this.setState({ replyToMsg: false, replyUsername: '' })
      // Clear reply username box from chat input and remove padding from it
      inputReplyUsername.innerHTML = '';
      inputReplyUsername.removeAttribute('style');
      // Remove style (padding) from input chat and focus on it
      inputChat.removeAttribute('style');
      inputChat.focus();
}

scrollToLastMsg() {
 let lastMessage = document.getElementById('active');
 // If lastMessage is inView (scrollbar is at bottom), scroll to bottom (get last message inview)
  if(document.contains(lastMessage)) {
    if(this.state.lastMsgIsInView) {
      setTimeout(function() {
        lastMessage.scrollIntoView();
      },200);
    }  
  }
}

handleScrollToChatBottom() {
  let lastMessage = document.getElementById('active');
  // If document contains last message with id 'active'
  if(document.contains(lastMessage)) {
   lastMessage.scrollIntoView({behavior:'smooth'});
  }
}

clearAllActivity() {
  // Fetch all original data about online users from database

  let fetchedOnlineUsers = [],
      self               = this;
 
   getdbRefData.child('onlineUsers').on('value', gotData, errData);

   function gotData(data) {
    // the real value of data key
    let onlineUsers = data.val();
    // if there is data to retrive, retrieve
    if (onlineUsers !== null) {
      let keys = Object.keys(onlineUsers);
      let key, userIP;

      // Assign value for every variable
        // Map through object, assing variable with any info about online user and push the info inside array
      for (let i = 0; i < keys.length; i++) {
          let k         = keys[i];
          key           = onlineUsers[k].key;
          userIP        = onlineUsers[k].userIP;

        // Push all info about the online user inside array to be displayed
        fetchedOnlineUsers.push({ key: key, userIP: userIP });
      }
    } 
    // Get only the unique values from object array (info from firebase is comming duplicated every time, dunno why)
    let onUsers =  Array.from(new Set(fetchedOnlineUsers.map(a => a.key)))
      .map(key => {
        return fetchedOnlineUsers.find(a => a.key === key);
      });

    // Find all identical IP users and delete them all from db
    for(let i=0; i<onUsers.length;i++) {
      if(onUsers[i].userIP === self.props.userIP) {
        let userKey = onUsers[i].key;
        dbRef.child('onlineUsers').child(userKey).remove();
      }
    }
    // Refresh page after 2 sec
    setTimeout(() => {
      window.location.reload();
    },2000);
  }

  function errData(err) {
      console.log(err);
  } 
}


// Mobile menu //

displayMobileMenu() {
  let displayMobileMenu = this.props.displayMobileMenu;

    // Check if displayMobileMenu - If userCp container is rendered or not
    if(displayMobileMenu) {
      // Hide displayMobileMenu box and destroy it
      document.querySelector('.mobmenu_menu').classList.remove('mobmenu_open');
      document.querySelector('.mobmenu_container').style.opacity = '0';
      setTimeout(() => {
       this.props.openMobileMenu({ displayMobileMenu: false })
      },850);
    } else {
      // Render displayMobileMenu box and display it with delay 
      this.props.openMobileMenu({ displayMobileMenu: true })
      setTimeout(() => {
          document.querySelector('.mobmenu_container').style.opacity = '1';
          document.querySelector('.mobmenu_menu').classList.add('mobmenu_open');
       },350);
    }
}

  render() {
  let user = this.props.user !== undefined;

    return (
        <div>

          {/* Welcome page */}
          {this.props.displayWelcomePage && ( <WelcomePage />)}
          
          <Header />

          {/* Inactive user message modal - render only when 'Already conn modal' is off */}
          {this.props.inactiveUser && !this.state.alreadyConnected && (
            <div className='user_inactive_modal'>
              <div>
              <span>Sorry. You were disconnected due to your inactivity.</span>
              <span>Please refresh the page.</span>
              <span onClick={() => {window.location.reload()}}>Click to refresh</span>
              </div>
            </div>
          )}

          {/* Main container */}

          <div className='container-fluid main_container'>
            <div className='row'>

              {this.props.displaySignInUp && ( <SignInUp /> )}
                {this.props.displayMobileMenu && ( <MobileMenu /> )}

              {/* CHAT CONTAINER */}
              <div className='wrap_main_cont col-12'>
                <div className='row justify-content-center'>
                  <div className='main_sec main_f_sec col-12 col-md-12 col-lg-8'>
                    <div className='row justify-content-center'>
                      <div className='chat_cont'>

                        {/* If user is already connected, render this modal */}
                        {this.state.alreadyConnected && (
                        <div className='already_connected_modal'>
                          <div className='row justify-content-center'>
                            <span className='alr_connmodal_wrap'>
                              <span>It looks like you are already connected from somewhere else.</span>
                              <span>Please sign out and refresh the page.</span>
                              <span className='mt-3'>If you think this is our fault, <span onClick={()=>this.clearAllActivity()}>click here</span> to clear all your activity</span>
                            </span> 
                          </div>  
                        </div>
                        )}
                        {/* Chat signed as _ wrapper */}
                        <div className='chat_signed_name'>
                             <span className='chat_online_dot'></span>
                             Signed as 
                             <div className='chat_display_user'>
                              {!this.props.userLoaded ? (
                              <div className='c_load_anon'><div></div><div></div><div></div></div> 
                              ):(
                              <span className='chat_signedname_txt'> {user ? ( this.props.user.displayName ):( this.props.anonymousUser.username )}
                              </span>
                              )}
                             </div>
                             <span className='mute_chat_button'   title='Mute / Unmute chat sound' onClick={()=>this.muteUnmuteChat()} tabIndex='0'></span>
                             <span className='toggle_mobile_menu' onClick={()=>this.displayMobileMenu()}></span>
                             <span className='fullwidth_button'   title='Full / Normal chat width' onClick={()=>this.fullChatWidth()} tabIndex='0'></span>
                          </div>


                          <div className='row justify-content-center'>
                            <div className='chat_wrapper'>

                              {/* Chat loading */}
                              {!this.state.fetchedMessages && (
                              <div className='chat_loading_msg'>
                                <div className='loading_chat_eff'>
                                  <div></div><div></div><div></div><div></div>
                                  <div></div><div></div><div></div><div></div>
                                </div>
                              </div>
                              )}

                              {this.state.dataMsgFetchError && (
                                <span className='no_data_found_msg'>
                                  No data to fetch or an error occurred :(
                                </span>   
                              )}
                              
                              {!this.state.lastMsgIsInView && (
                                <span className='chat_scroll_tobottom' onClick={this.handleScrollToChatBottom}>&#65516;</span>
                              )}

                              {/* Chat scroll wrapper + fetched messages */}
                              <div className = 'chat_wrapper_scroll' 
                                   id        = 'chat_wrapper_scroll' 
                                   tabIndex  = '0'
                                   onClick   = {()  => this.handleChatClick()}
                                   onScroll  = {(e) => this.handleChatScroll(e)}>

                                {/* Chat messages */}
                                <ul className='ul_chat_txt_wrap'>
                                  {this.props.fetchedChatMsg.length > 0 && this.props.fetchedChatMsg.map((msg,ind) =>
                                    <li key={ind}>
                                        <span>
                                        <span className='li_msg_img'> {msg.username === 'BOT' ? <img src={require('../images/chat/bot_img.png')} alt=''/> : msg.imgLetter}</span>
                                        <span className='li_msg_name_date'>
                                          <span id='li_msg_username' className={msg.username === 'BOT' ? 'bot_msg_n' : null}>
                                            {msg.username}
                                            {this.props.user !== undefined && this.props.user.displayName === msg.username && (
                                            <span className='msguser_cp'>
                                              <span className='msguser_cp_dots'    onClick={(e) => this.handleMsgThreeDots(e)}>&#8942;</span>
                                              <span className='msgusercp_conf_msg' onClick={(e) => this.removeThisMsg(e,msg)}>Remove</span>
                                            </span>
                                            )}
                                            {this.props.user === undefined && this.props.anonymousUser.username === msg.username && (
                                              <span className='msguser_cp'>
                                              <span className='msguser_cp_dots'    onClick={(e) => this.handleMsgThreeDots(e)}>&#8942;</span>
                                              <span className='msgusercp_conf_msg' onClick={(e) => this.removeThisMsg(e,msg)}>Remove</span>
                                            </span>
                                            )}
                                            {this.props.user !== undefined && this.props.user.email === 'sionut0122@yahoo.com' && (
                                              <span className='msguser_cp'>
                                              <span className='msguser_cp_dots'    onClick={(e) => this.handleMsgThreeDots(e)}>&#8942;</span>
                                              <span className='msgusercp_conf_msg' onClick={(e) => this.removeThisMsg(e,msg)}>Remove</span>
                                            </span>
                                            )}
                                          </span>
                                          <span id='li_usertimedate'>{msg.time} {msg.date}</span>
                                        </span>
                                        </span>
                                        <span className='li_msg_cont' id={msg.id}>
                                          {msg.message} 
                                        {/* Display reply icon if msg username !== BOT && !== User name !== msg username */}
                                          {msg.username !== 'BOT' && (
                                            <span>
                                              {this.props.user !== undefined ? (
                                                <span className='li_msg_reply_wrap'>
                                                  {this.props.user.displayName !== msg.username && (
                                                    <span className='li_msg_reply' title='Reply' onClick={(e)=>this.replyToThisMsg(msg)}></span>
                                                  )}
                                                </span>
                                              ):(
                                                <span className='li_msg_reply_wrap'>
                                                  {this.props.anonymousUser.username !== msg.username && (
                                                    <span className='li_msg_reply' title='Reply' onClick={(e)=>this.replyToThisMsg(msg)}></span>
                                                  )}
                                                </span>                          
                                              )}
                                            </span>
                                          )}

                                        </span>
                                    </li>
                                    )}
                                </ul>
                              </div>

                              {/* Emoticons box */}
                              {this.state.renderEmoticons && (
                              <div className='emoticons_box' tabIndex='0'>
                                <ul>
                                 {this.state.emoticons.map((emoji,ind) =>
                                    <li key={ind}
                                        tabIndex = '0'
                                        onClick  = {(e) => this.selectEmoji(emoji)}>
                                        {emoji}
                                    </li>
                                  )}
                                </ul>
                              </div>
                              )}
                            </div>
                          </div> 

                        <div className='row justify-content-center'>
                          <div className='chat_input_wrapper'>
                            <div className='row justify-content-center'>
                              <div className='input_emoticons mr-auto' onClick={(e) => this.openEmotiList(e)} tabIndex='0'></div>
                              <div className='input_text_wrapper'>
                                <span className='input_reply_name' title='Cancel' onClick={this.cancelReplyMsg}></span>
                                <input type='text' 
                                       className  = 'input_txt_value'
                                       tabIndex   = '0'
                                       onClick    = {(e) => this.handleChatInputClick(e)} 
                                       onChange   = {(e) => this.handleChatInput(e)}
                                       onKeyPress = {(e) => this.handleChatKey(e)}
                                       >
                                </input>
                              </div>
                              <div className = 'input_send_button ml-auto inactive_sendbutt' 
                                   tabIndex  = '0'
                                   onClick   = {this.sendMessage}>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                 {/* ONLINE USERS BOX */}
                  <div className='main_sec main_s_sec d-none d-lg-block col-12 col-md-6 col-lg-4'>
                    <div className='row justify-content-center'>
                      <div className='wrap_ms_onlineusers'>
                        <span className='mainsc_onusers_title'>
                              <span></span>
                              Online users
                              <span className='on_users_no'> ({this.props.fetchedOnlineUsers.length > 0 && (this.props.fetchedOnlineUsers.length - 1 )})</span>
                        </span>

                        <div className='row justify-content-center'>
                          <div className='wrap_onusers_box'>
                            <div className='row justify-content-center'>
                              <div className='wrap_onusers_scroll'>

                                {this.props.fetchedOnlineUsers.length > 0 && 
                                  this.props.fetchedOnlineUsers.map((user,ind) => 
                                  <span className='on_user' key={ind} tabIndex='0'>
                                    <span className='row'>
                                      <span className='on_user_img'>{user.username === 'BOT' ? <img src={require('../images/chat/bot_img.png')} alt=''/> : <span className='user_on_imglett'>{user.imgLetter}</span>} </span>
                                      <span className='on_user_data'>
                                        <span className='onuser_name' id={user.username === 'BOT' ? 'bot_on_user' : null}>{user.username}</span> 
                                        <span className='onuser_conn'>
                                          <span className='onuser_on_dot'></span>
                                          <span className='onuser_conntime'>Connected {user.id !== 'bot_online' && (<span>at {user.connectedTime}</span>)}</span>
                                        </span> {/* Hide connected time for BOT */}
                                        {user.country !== undefined && user.countryFlag !== undefined && (
                                          <span className='onusser_country'>
                                            <img className='user_flag_icon' src={user.countryFlag} alt={user.country} title={user.country}/>
                                            <span className='user_country_onname'>{user.country}</span>
                                          </span>
                                        )}
                                      </span>
                                    </span>
                                  </span> 
                                  )}
                               
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span className='footer_t col-12'>&#169;Livechat - ionutdev.com</span>
          </div>
        </div>
      )
  }
}


const Main = connect(mapStateToProps,mapDispatchToProps)(ConnectedMain);
export default Main;
