import React                 from 'react';
import { connect            } from "react-redux";
import { userInfo           } from '../actions/index';
import { openSigninup       } from '../actions/index';
import { openUserCP         } from '../actions/index';
import { userIsLoaded       } from '../actions/index';
import { getUserKey         } from '../actions/index';
import { setAnonymousUser   } from '../actions/index';
import { getOnlineUsers     } from '../actions/index';
import { getConnectedTime   } from '../actions/index';
import { setCountryAndFlag  } from '../actions/index';
import { getUserIP          } from '../actions/index';
import { v4 as uuidv4       } from 'uuid';
import UserCP                 from '../components/UserCP';
import dbRef                  from '../firebase';
import getdbRefData           from '../firebase';
import * as firebase          from 'firebase/app';
import 'firebase/auth';
import '../css/Header.css';




const mapStateToProps = state => {
  return {  
            displayWelcomePage : state.displayWelcomePage,
            user               : state.user,
            userLoaded         : state.userLoaded,
            inactiveUser       : state.inactiveUser,
            displaySignInUp    : state.displaySignInUp,
            anonymousUser      : state.anonymousUser,
            displayUserCP      : state.displayUserCP,
            fetchedOnlineUsers : state.fetchedOnlineUsers
        };
      };


 function mapDispatchToProps(dispatch) {
  return {
    userInfo           : user          => dispatch(userInfo(user)),
    openSigninup       : bol           => dispatch(openSigninup(bol)),
    openUserCP         : bol           => dispatch(openUserCP(bol)),
    userIsLoaded       : loaded        => dispatch(userIsLoaded(loaded)),
    getUserKey         : userKey       => dispatch(getUserKey(userKey)),
    setAnonymousUser   : anonymousUser => dispatch(setAnonymousUser(anonymousUser)),
    getOnlineUsers     : onlineUsers   => dispatch(getOnlineUsers(onlineUsers)),
    getConnectedTime   : connTime      => dispatch(getConnectedTime(connTime)),
    setCountryAndFlag  : arr           => dispatch(setCountryAndFlag(arr)),
    getUserIP          : ip            => dispatch(getUserIP(ip)),
  };
}


class ConnectedHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
            user            : this.props.user,
            userLoaded      : false,
            userImgLetter   : '',
            displayUserCP   : false,
            userIP          : undefined,
            userCountry     : '',
            userCountryFlag : null,
            

    }

    this.displayUserCp    = this.displayUserCp.bind(this);
    this.openSignInSignUp = this.openSignInSignUp.bind(this);
  }

openSignInSignUp() {
  this.props.openSigninup({ displaySignInUp: !this.props.displaySignInUp })
}


componentDidMount() {
    // GET ON USER IP
  fetch('https://api.ipify.org/?format=json')
  .then(res => res.json())
  .then(data => {
      // Call function to get user's country by user's ip
      this.getUserCountry(data.ip);
      this.setState({ userIP: data.ip })
      this.props.getUserIP({ userIP: data.ip })

      // Check if user is signed in or anonymous after 5 sec (welcome page loading time)
      setTimeout(() => {
      this.authListener();
      },5000);
    })
  .catch((err) => {
    // If unable to find ip, call anyway
      // to check user
      setTimeout(() => {
       this.authListener();
      },5000);
    console.log(err);
    })

  // Update online users every 45 seconds
  setInterval(() => {
    this.fetchOnlineUsers();
  },45000);
}


getUserCountry(ip) {
  // Search for online user's country using his ip
  fetch('https://ipapi.co/'+ip+'/json/')
  .then(data => data.json())
  .then(res => {
    this.setState({ userCountry: res.country_name})   
    this.getAllCountries(res.country_name, res.country_code); 
    // Get visitor users info
    this.trackUsersStats(ip,res.country_name,res.city);
  })
}

getAllCountries(userCountry,countryCode) {
  // Search user's country flag by fetching all countries info
  fetch('https://restcountries.eu/rest/v2/all')
  .then(res => res.json()) 
  .then(data => {
    for(let i=0; i<data.length;i++) {
        // If fetched country match userCountry or countryCode (ro,it,sp,ru), setstate
      if(data[i].name === userCountry || data[i].alpha2Code === countryCode) {
        this.setState({ userCountryFlag: data[i].flag})
       // Send props array with info about online user's country and flag
       this.props.setCountryAndFlag({ userCountryAndFlag: [userCountry, data[i].flag] })
      }
    }
  })
}

authListener() {

    // if user is logged in, set state user to user and use the data
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
        // if new user is added to the auth page, set the user to the actually user
        // after setstate, all info for the present user can be used 
        this.props.userInfo({ user: user })
        // Set props to true to hide loading effect from 'Signed as ---' chat and display signed in user or anonymous
        this.props.userIsLoaded({ userLoaded: true })
        this.signedUserOn(user);
        // Call function to get online users after checking if user is logged in
        this.fetchOnlineUsers();
      } else {
        // If user was disconnected due to inactivity, avoid creating new anonymous user after being signed out
        if(!this.props.inactiveUser) {
         this.anonymousUserOn();
        }
        this.props.userInfo({ user: undefined })
        // Call function to get online users after checking if user is logged in
        this.fetchOnlineUsers();
      }   
    });
}

signedUserOn(user) {
   let databaseRef  = dbRef.child('onlineUsers').push(),
      // Get time when user was connected
      today         = new Date(),
      time          = today.getHours() + ":" + today.getMinutes(),
      // Get first letter to be user as a profile img
      userImgLetter = user.displayName.substring(0,1).toUpperCase();

      databaseRef.set({
          key           : databaseRef.key,
          username      : user.displayName,
          imgLetter     : userImgLetter,
          connectedTime : time,
          originDate    : today.toString(),
          userIP        : this.state.userIP ? this.state.userIP : null,
          country       : this.state.userCountry,
          countryFlag   : this.state.userCountryFlag
        }).then(() => {     
          // Key used to be tracked and deleted on user from db
          this.props.getUserKey({ userKey: databaseRef.key })
          // Used to display loading effect
          this.props.userIsLoaded({ userLoaded: true })
          // Connected time - user for user CP
          this.props.getConnectedTime({ connectedTime: time })
          this.setState({ userLoaded: true, userImgLetter: userImgLetter })
       
        })
        .catch((err) => console.log('Error: ' + err))
}


fetchOnlineUsers() {
  let fetchedOnlineUsers = [],
      self               = this;
 
   getdbRefData.child('onlineUsers').on('value', gotData, errData);

   function gotData(data) {
    // the real value of data key
    let onlineUsers = data.val();

    // if there is data to retrive, retrieve
    if (onlineUsers !== null) {

      let keys = Object.keys(onlineUsers);
      let key, username, imgLetter, connectedTime, id, originDate, userIP, country, countryFlag;

      // Assign value for every variable
        // Map through object, assing variable with any info about online user and push the info inside array
      for (let i = 0; i < keys.length; i++) {
          let k         = keys[i];
          key           = onlineUsers[k].key;
          username      = onlineUsers[k].username;
          imgLetter     = onlineUsers[k].imgLetter;
          connectedTime = onlineUsers[k].connectedTime;
          id            = onlineUsers[k].id;
          originDate    = onlineUsers[k].originDate;
          userIP        = onlineUsers[k].userIP;
          country       = onlineUsers[k].country;
          countryFlag   = onlineUsers[k].countryFlag;


        // Push all info about the online user inside array to be displayed
        fetchedOnlineUsers.push({
          key           : key,
          username      : username,
          imgLetter     : imgLetter,
          connectedTime : connectedTime,
          id            : id ? id : '',
          originDate    : originDate,
          userIP        : userIP,
          country       : country,
          countryFlag   : countryFlag
        });
      }
    } else {
      console.log('No data found'); 
    }
    
    // Get only the unique values from object array (info from firebase is comming duplicated every time, dunno why)
    let uniqueKey =  Array.from(new Set(fetchedOnlineUsers.map(a => a.key)))
      .map(key => {
        return fetchedOnlineUsers.find(a => a.key === key);
      });

       
  // AVOID DUPLICATED SIGNED IN USERS IN 'Online users' div

       // If online user was not deleted ->
      // Create an array with duplicated users
      if(self.props.user !== undefined) {
        let duplArray = [];
        uniqueKey.forEach((msg) => {
          if(msg.username === self.props.user.displayName) {
                duplArray.push(msg);
          } 
        })
        
      // Get first duplicated user and use the key to delete it from database
      if(duplArray.length > 1) {
        // Get key from the first user
        let firstDuplKey = duplArray[0].key;
        // Remove first duplicated online user from database
        dbRef.child('onlineUsers').child(firstDuplKey).remove();
        // Clear duplicated array (to avoid deleting all duplicated user, even the original)
        duplArray = [];

        // If user is logged in, loop through fetched online users, check key of the first
          // duplicated user, and remove it from the online user container
           // (Generally happens when user's browser is closed unusual (not closing tab with click on x))
        let index;
        for(let i=0;i<uniqueKey.length;i++) {
          if(uniqueKey[i].key === firstDuplKey) {
            index = uniqueKey.indexOf(uniqueKey[i])
            uniqueKey.splice(index,1);
          }
        }
      }
    }
    // CALL FUNCTION TO CHECK ONLINE USERS INACTIVITY 
        self.updateUsersOnline(uniqueKey);
  }

  function errData(err) {
      console.log(err);
  }
}

updateUsersOnline(uniqueKey) {
  // Check online users inactivity
  // Delete inactive users from database

  let userList = uniqueKey;
  // Check user connected time
  for(let i=0; i<userList.length;i++) {
    // Calculate date difference (original first connected date - today's date)
    let connectedTime = new Date(userList[i].originDate),
    // Convert to positive number
    millisec  = Math.abs(new Date() - connectedTime) / 1000,
    // Transform to hours
    hours     = Math.floor(millisec / 3600) % 24;
    millisec -= hours * 3600;
    
    // If user inactivity time is higher than 2 hours, delete user from database
      // When visiting page on mobile, closing page won't send a 'sendBeacon' to delete user 
    if(hours > 1) {
      // Map through online user, find inactive user key and delete it
      userList.forEach((user) => {
        if(user.key === userList[i].key) {
          let ind = userList.indexOf(user.key);
          userList.splice(ind,1);
          dbRef.child('onlineUsers').child(user.key).remove();
        }
      })
    }
  }

  // Check by ip if signed in / anonymous user it's not duplicated
    // inside online users box list
  for(let i=0;i<userList.length;i++) {
    if(userList[i].userIP === this.state.userIP) {
      if(this.props.user !== undefined) {
        if(userList[i].username !== this.props.user.displayName) {
          let signedInd = userList.indexOf(userList[i].username);
          userList.splice(signedInd,1);
        }
      } else {
        if(userList[i].username !== this.props.anonymousUser.username) {
          let anonInd = userList.indexOf(userList[i].username);
          userList.splice(anonInd,1);
        }
      }
    }
  }

  // Render updated list
  this.props.getOnlineUsers({ fetchedOnlineUsers: userList })
}

anonymousUserOn() {

  let databaseRef      = dbRef.child('onlineUsers').push(),
      // Extract some random numbers for the name
      userRandomNumber = uuidv4(),
      randomNumber     = userRandomNumber.substring(8,13),
      // Get time when user was connected
      today            = new Date(),
      time             = today.getHours() + ":" + today.getMinutes();

      databaseRef.set({
          key           : databaseRef.key,
          username      : 'Anonymous'+randomNumber,
          imgLetter     : 'A',
          connectedTime : time,
          originDate    : today.toString(),
          userIP        : this.state.userIP ? this.state.userIP : null,
          country       : this.state.userCountry,
          countryFlag   : this.state.userCountryFlag
        })

      .then(() => {
            // Set anonymous user info
          let anonymousUser = {key: databaseRef.key, username: 'Anonymous'+randomNumber, imgLetter: 'A', connectedTime: time, originDate: today};            
            // Set anonymous user info / Set onlineUserKey
          this.props.getUserKey({ userKey: databaseRef.key })
          this.props.setAnonymousUser({ anonymousUser: anonymousUser })
          this.props.userIsLoaded({ userLoaded: true })
          this.props.userInfo({ user: undefined })
          this.setState({ userLoaded: true })
        })
      .catch((err) => console.log('Error: ' + err))
}


displayUserCp() {
  let displayUserCP = this.props.displayUserCP;

    // Check if displayUserCP - If userCp container is rendered or not
    if(displayUserCP) {
      // Hide user cp box and destroy it
      document.querySelector('.usercp_container').classList.remove('usercp_open');
      setTimeout(() => {
       this.props.openUserCP({ displayUserCP: false })
      },500);
    } else {
      // Render user cp box and display it with delay 
      this.props.openUserCP({ displayUserCP: true })
      setTimeout(() => {
          document.querySelector('.usercp_container').classList.add('usercp_open');
       },350);
    }
}

trackUsersStats(ip,country,city) {

 let  fetchedVisitors = [],
      databaseRef     = dbRef.child('visitorsInfo').push();
       
   // Fetch visitorsInfo ref from DB
   getdbRefData.child('visitorsInfo').on('value', gotData, errData);

   function gotData(data) {
    // The real value of data key
    let visitorsInfo = data.val();
    // If there is data to retrive, retrieve
    if (visitorsInfo !== null) {
      let keys = Object.keys(visitorsInfo);
      let key, ip, country, city, date;

      // Assign value for every variable
        // Map through object, assing variable with any info about online user and push the info inside array
      for (let i = 0; i < keys.length; i++) {
          let k         = keys[i];
          key           = visitorsInfo[k].key;
          ip            = visitorsInfo[k].ip;
          country       = visitorsInfo[k].country;
          city          = visitorsInfo[k].city;
          date          = visitorsInfo[k].date;

        // Push all info about the online user inside array to be displayed
        fetchedVisitors.push({ key: key, ip: ip, country: country, city: city, date: date });
      }
    } 
    // Get only the unique values from object array (info from firebase is comming duplicated every time, dunno why)
    let visitors =  Array.from(new Set(fetchedVisitors.map(a => a.key)))
      .map(key => {
        return fetchedVisitors.find(a => a.key === key);
      });

      let newVisitor = true;

    // Loop through visitors while newVisitors remains true
    for(let i=0;i<visitors.length && newVisitor;i++) {
      // If new visitor's ip is found, set to false to stop looping
      if(visitors[i].ip === ip) {
        newVisitor = false;
      } 
    }
    // If newVisitors remains true, add it to database
    if(newVisitor) {
      databaseRef.set({ key: databaseRef.key, ip: ip, country: country, city: city, date: new Date().toString() })
    }

  }
  function errData(err) {
      console.log(err);
  }
}

  render() {
    let user = this.props.user !== undefined;
    
    return (
      <div>
         {user && this.props.displayUserCP &&  (
           <UserCP />
             )}
        <div className='col-12 header_container'>
          <div className='row'>
            <div className='head_sect head_f_sect col-6 col-md-6 col-lg-6'>
              <div className='row'>
                <div className='head_logo'>
                  <a href='https://sionut0122.github.io/LiveChatV2.0/' className='head_logo_img'>.</a>
                  <a href='https://sionut0122.github.io/LiveChatV2.0/' className='head_logo_txt' tabIndex='0'>Live
                    <span>Chat</span>
                    <span>V2.0</span>
                  </a>
                </div>
              </div>
            </div>
            <div className='head_sect head_s_sec col-6 col-md-6 col-lg-6'>
              <div className='row'>

              {/* If user is not signed in, allow render Sign in / Sign up container */}
              
              {!user ? (
                <div className='wrap_signinup ml-auto' onClick={this.openSignInSignUp} tabIndex='0'>
                  <span className='signinup_button'>Sign In / Sign up</span>
                </div>
                ):(
                 <div className='wrap_signedin_user ml-auto'>
                  <div className='row justify-content-center'>
                  {!this.state.userLoaded ? (
                    <div className='si_load_user'>
                      <div></div><div></div><div></div>
                    </div>
                    ):(
                    <div>
                      <span className='head_signedin_user_name'>
                        <div className='row'>
                          <span className='head_signedin_user_icon'>{this.state.userImgLetter}</span>
                          <span className='h_sin_usertxt'>{user && ( this.props.user.displayName )}</span>
                        </div>
                        <div className='row'>
                          <span className='head_view_prof' onClick={this.displayUserCp} tabIndex='0'>View profile</span>
                        </div>
                      </span>
                    </div>
                    )}
                  </div>
                </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

  
const Header = connect(mapStateToProps,mapDispatchToProps)(ConnectedHeader);
export default Header;
