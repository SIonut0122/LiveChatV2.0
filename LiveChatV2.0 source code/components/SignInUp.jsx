import React             from 'react';
import firebase          from '@firebase/app';
import { connect       } from "react-redux";
import { userInfo,
         openSigninup,
         getChatMsg    } from '../actions/index';
import dbRef             from '../firebase';
import getdbRefData      from '../firebase';
import '../css/Signinup.css';
import 'firebase/auth';




const mapStateToProps = state => {
  return {  user            : state.user,
            displaySignInUp : state.displaySignInUp,
            userKey         : state.userKey,
            fetchedChatMsg  : state.fetchedChatMsg
        };
      };


 function mapDispatchToProps(dispatch) {
    return {
      userInfo     : user => dispatch(userInfo(user)),
      openSigninup : bol  => dispatch(openSigninup(bol)),
      getChatMsg   : arr  => dispatch(getChatMsg(arr))
    };
}


class ConnectedSignInUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
                    user                    : this.props.user,
                    displaySignInUp         : this.props.displaySignInUp,
                    displaySignIn           : true,
                    signinEmail             : '',
                    signinEmailValid        : false,
                    invalidSignInEmail      : false,
                    signinPassword          : '',
                    signinPasswordValid     : false,
                    invalidSignInPass       : false,
                    displaySigninLoading    : false,

                    signupEmail             : '',
                    signupEmailValid        : false,
                    signupUsername          : '',
                    signupUsernameValid     : false,
                    signupPassword          : '',
                    signupPasswordValid     : false,
                    signupInvalidEmail      : false,
                    signupEmailInUse        : false,
                    signupInvalidUsername   : false,
                    signupInvalidPassword   : false,
                    invalidUserOrPassword   : false,
                    fetchSignedUpUsernames  : [],
                    usernameExists          : false,

                    openForgotPass          : false,
                    forgotPassEmail         : '',
                    forgotPassEmailValid    : false,
                    forgotPassEmailSent     : false,
                    forgotPassEmailNotValid : false,
    } 

    this.handleSignUpModalClick = this.handleSignUpModalClick.bind(this);
    this.sendNewPasswordButton  = this.sendNewPasswordButton.bind(this);
    this.openForgotPass         = this.openForgotPass.bind(this);
    this.handleSignInButton     = this.handleSignInButton.bind(this);
    this.handleSignUpButton     = this.handleSignUpButton.bind(this);
  }


componentDidMount() {
  document.querySelector('.signup_b_butt').setAttribute('style', 'box-shadow: inset 8px -7px 2px -7px rgba(0,0,0,0.4);font-size:10px;color:#000');
  // Fetch accounts usernames when sign up/in container is rendered
  this.fetchSignedUpUsernames();
}

// SIGN IN / UP ACTIONS

displaySignIn(e) {
  let signUpButton = document.querySelector('.signup_b_butt');
  // Open signin box, add signin inset shadow and remove signup box inset shadow
  e.target.removeAttribute('style');
  signUpButton.setAttribute('style', 'box-shadow: inset 8px -7px 2px -7px rgba(0,0,0,0.4);font-size:10px;color:#000;');
  this.setState({ displaySignIn: true })
}

displaySignUp(e) {
  let signInButton = document.querySelector('.signin_b_butt');
  // Open signup box, add signup inset shadow and remove signin box inset shadow
  e.target.removeAttribute('style');
  signInButton.setAttribute('style', 'box-shadow: inset -8px -7px 2px -7px rgba(0,0,0,0.4);font-size:10px;color:#000;');
  // Display Sign up box / Close Forgot Password box if it was rendered
  this.setState({ displaySignIn: false, openForgotPass: false })
}


// SIGN IN ACTIONS  //


handleSignInEmail(e) {
   let mailformat = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,
       emailValue = e.target.value;

      // If input mail match, setstate value
    if(emailValue.match(mailformat)) {
        this.setState({signinEmail: emailValue, signinEmailValid: true})
    } else if(emailValue.length === 0) {
      // If input is empty, reset value input
        this.setState({signinEmail: '', signinEmailValid: false})
    } else {
        this.setState({signinEmail: '', signinEmailValid: false})
    }
}

handleSignInPassword(e) {
    let passwordValue       = e.target.value,
    // Check password length to be higher than 1 characters
      checkPasswordLength = passwordValue.length >= 1,
    // Check for blank spaces
      checkWhiteSpaces    = passwordValue.trim().length === passwordValue.length;
  
 
      // if password value match, setstate value 
    if(checkPasswordLength && checkWhiteSpaces) {
        this.setState({signinPassword: passwordValue, signinPasswordValid: true})
    } else if(passwordValue.length === 0) {
      // If input is empty, reset value input
        this.setState({signinPassword: '', signinPasswordValid: false})
    } else {
        this.setState({signinPassword: passwordValue, signinPasswordValid: false})
    }
}

showHideSignInPass(e) {
  let showHideButton  = e.target;

  if(showHideButton.classList.contains('hide_sigin_pass')) {
    showHideButton.classList.remove('hide_sigin_pass');
    // Show password and focus on input password
    showHideButton.setAttribute('title', 'Show password');
    document.querySelector('.siu_signin_password_input').setAttribute('type','password');
    document.querySelector('.siu_signin_password_input').focus();
  } else {
    // Hide password and focus on input password
    showHideButton.classList.add('hide_sigin_pass');
    showHideButton.setAttribute('title', 'Hide password');
    document.querySelector('.siu_signin_password_input').setAttribute('type','text');
    document.querySelector('.siu_signin_password_input').focus();
  }
}

handleKeyDownSignIn(e) {

  if(e.keyCode === 13 || e.key === 'Enter') {
    this.handleSignInButton();
  }
}

handleSignInButton() {
  // Clear any error msg
   this.setState({ invalidSignInEmail: false, invalidSignInPass: false })

  if(this.state.signinEmailValid) {
    if(this.state.signinPasswordValid) {
        // Call function if all inputs meets req
        this.signIn();
    } else {
      this.setState({ invalidSignInPass: true })
    }
  } else {
    this.setState({ invalidSignInEmail: true })
  }
}

signIn() {

    // Display loading ring
  this.setState({ displaySigninLoading: true })
    // Hide closing button from Signinup container
  document.querySelector('.signinup_closebox').style.display = 'none';
    // Try to sign in
  firebase.auth().signInWithEmailAndPassword(this.state.signinEmail, this.state.signinPassword)
    .then((u) => {
        // Remove anonymous user after signing in
        dbRef.child('onlineUsers').child(this.props.userKey).remove();
        // Fade ou signin/up container after signing in
        setTimeout(()=> {  
        document.querySelector('.signinup_container').setAttribute('style','transition:0.5s ease-in;top:-550px !important;opacity:0');
        },1000);
        // Hide loading ring after 1.5s
        setTimeout(()=> {
        this.setState({ displaySigninLoading: false })  
        },1500);
        // Hide signin/up container
        setTimeout(()=> {
        this.props.openSigninup({ displaySignInUp: false })  
        },2000);
        // Remove bot chat message after signin
        let chatMsg = [...this.props.fetchedChatMsg];
        chatMsg.forEach((msg) => {
          if(msg.username === 'BOT') {
            let ind = chatMsg.indexOf(msg);
            chatMsg.splice(ind,1);
          }
        })
        this.props.getChatMsg({ fetchedChatMsg: chatMsg })
        
     }).catch((error) => {
      if (error.code === 'auth/invalid-email') {
          // Display 'Invalid email' message
          this.setState({ invalidSignInEmail: true, displaySigninLoading: false })
      } else if(error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          this.setState({ invalidUserOrPassword: true, displaySigninLoading: false  })
      } 
  });  
}


// FORGOT PASSWORD ACTIONS //


openForgotPass() {
   let openForgotPass = this.state.openForgotPass;

    // If forgot pass container is rendered or not
    if(openForgotPass) {
      
      // Hide forgotpass box and destroy it
      document.querySelector('.forgot_password_cont').classList.remove('forgotpass_open');
      setTimeout(() => {
       this.setState({ openForgotPass: false })
      },500);
    } else {
      // Render forgotpass box and display it with delay 
      this.setState({ openForgotPass: true })
      setTimeout(() => {
          document.querySelector('.forgot_password_cont').classList.add('forgotpass_open');
       },350);
    }
}

handleForgotPassInput(e) {
    /* Old one - /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ */
   let mailformat = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,
       emailValue = e.target.value;

      // If input mail match, setstate value
    if(emailValue.match(mailformat)) {
        this.setState({forgotPassEmail: emailValue, forgotPassEmailValid: true})
    } else if(emailValue.length === 0) {
      // If input is empty, reset value input
        this.setState({forgotPassEmail: '', forgotPassEmailValid: false})
    } else {
        this.setState({forgotPassEmail: '', forgotPassEmailValid: false})
    }
}

handleForgotPassInputKey(e) {
  if(e.key === 'Enter') {
    this.sendNewPasswordButton();
  }
}

sendNewPasswordButton() {
    // If email is valid, proceed
    if(this.state.forgotPassEmailValid) {
      firebase.auth().sendPasswordResetEmail(this.state.forgotPassEmail)
      .then(() => {
        // Display 'Your new password has been sent' message and change 'Send new password' innerHTML
        this.setState({ forgotPassEmailSent: true, forgotPassEmailNotValid: false, forgotPassEmailNotFound: false })
        document.querySelector('.forgotpass_button').innerHTML = 'Resend password';
       })
      .catch((err) => {
        // If email was not found inside database, display message
        if(err.code === 'auth/user-not-found') {
          this.setState({ forgotPassEmailNotFound: true, forgotPassEmailSent: false, forgotPassEmailNotValid: false })
        }
      })
    } else {
            // If email is not valid, send new database
          this.setState({ forgotPassEmailNotValid: true, forgotPassEmailSent: false, forgotPassEmailNotFound: false })
    }   
}


// SIGN UP ACTIONS //


handleSignUpEmail(e) {
  let mailformat = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,
      emailValue = e.target.value;

    // If input mail match, setstate value
  if(emailValue.match(mailformat)) {
      this.setState({signupEmail: emailValue, signupEmailValid: true})
  } else if(emailValue.length === 0) {
    // If input is empty, reset value input
      this.setState({signupEmail: '', signupEmailValid: false})
  } else {
      this.setState({signupEmail: '', signupEmailValid: false})
  }
}

handleSignUpUsername(e) {
   let usernameValue      = e.target.value,
    // Check if username characters matches
      checkUsername       =  usernameValue.split('').every(x => x.match(/[a-zA-Z0-9]+/g)),
    // Check username length to be between 3 and 15 characters
      checkUsernameLength = usernameValue.length >= 3,
    // Check for blank spaces
      checkWhiteSpaces    = usernameValue.trim().length === usernameValue.length;
  
      // if username value match, setstate value 
    if(checkUsername && checkUsernameLength && checkWhiteSpaces) {
        this.setState({signupUsername: usernameValue, signupUsernameValid: true})
    } else if(usernameValue.length === 0) {
      // If input is empty, reset value input
        this.setState({signupUsername: '', signupUsernameValid: false})
    } else {
        this.setState({signupUsername: usernameValue, signupUsernameValid: false})
    }
}

handleSignUpPassword(e) {
    let passwordValue     = e.target.value,
    // Check password length to be higher or equal than 6 characters
      checkPasswordLength = passwordValue.length >= 6,
    // Check for blank spaces
      checkWhiteSpaces    = passwordValue.trim().length === passwordValue.length;
  
 
      // if password value match, setstate value 
    if(checkPasswordLength && checkWhiteSpaces) {
        this.setState({signupPassword: passwordValue, signupPasswordValid: true})
    } else if(passwordValue.length === 0) {
      // If input is empty, reset value input
        this.setState({signupPassword: '', signupPasswordValid: false})
    } else {
        this.setState({signupPassword: passwordValue, signupPasswordValid: false})
    }
}

showHideSignUpPass(e) {
  let showHideButton  = e.target;

  if(showHideButton.classList.contains('hide_sigin_pass')) {
    showHideButton.classList.remove('hide_sigin_pass');
    showHideButton.setAttribute('title', 'Show password');
    // Show password and focus on input password
    document.querySelector('.siu_signup_password_input').setAttribute('type','password');
    document.querySelector('.siu_signup_password_input').focus();
  } else {
    // Hide password and focus on input password
    showHideButton.classList.add('hide_sigin_pass');
    showHideButton.setAttribute('title', 'Hide password');
    document.querySelector('.siu_signup_password_input').setAttribute('type','text');
    document.querySelector('.siu_signup_password_input').focus();
  }
}

handleSignUpButton() {
  // Clear all sign up errors
  this.setState({ signupInvalidEmail: false, signupInvalidUsername: false ,signupInvalidPassword: false})

  if(this.state.signupEmailValid) {
    // Clear invalid email / email in use messages
    this.setState({ signupInvalidEmail: false, signupEmailInUse: false })
      if(this.state.signupUsernameValid) {
        // Clear invalid username message
        this.setState({ signupInvalidUsername: false })
          if(this.state.signupPasswordValid) {
             this.setState({ signupInvalidPassword: false })
                     // Check if chosen username already exists inside database
                 let usernames = this.state.fetchSignedUpUsernames,
                     arr       = usernames.filter((username) => username.toLowerCase() === this.state.signupUsername.toLowerCase());
                     // Check if username is already taken
                    if(arr.length > 0) {
                     // If username exists, display error message
                      this.setState({ usernameExists: true })
                    } else {
                       // Call function to create account
                      this.createAccount();
                    }
          } else {
            this.setState({ signupInvalidPassword: true })
          }
      } else {
        this.setState({ signupInvalidUsername: true })
      }
  } else {
    // Set invalid email message
    this.setState({ signupInvalidEmail: true })
  }
}

handleKeyDownSignUp(e) {
  if(e.keyCode === 13 || e.key === 'Enter') {
    this.handleSignUpButton();
  }
}

createAccount() {
  // Display loading ring
  this.setState({ displaySigninLoading: true })

  // Hide user section while loading
  document.querySelector('.head_s_sec').style.opacity = '0';
  // Hide closing button from Signinup container
  document.querySelector('.signinup_closebox').style.display = 'none';
  // Send signup email and password to firebase auth
  firebase.auth().createUserWithEmailAndPassword(this.state.signupEmail, this.state.signupPassword)
      .then((u) => {
        // Call function to update user info (username)
        this.updateNewAccountInfo();
        // Display user section after loading
        setTimeout(()=> {
          document.querySelector('.head_s_sec').style.opacity = '1';
        },2000);
        // Fade out signup/in container to top after signing up
        document.querySelector('.signinup_container').setAttribute('style','transition:0.5s ease-in;top:-550px !important;opacity:0');
        // Set states to default / clear inputs if there is any value inside
        this.setState({
            signupEmail          : '',
            signupEmailValid     : false,
            signupUsername       : '',
            signupUsernameValid  : false,
            signupPassword       : '',
            signupPasswordValid  : false,
            signupEmailInUse     : false,
            signupInvalidEmail   : false
        })
      
      }).catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
           this.setState({ signupEmailInUse: true})
        }
    })
}

updateNewAccountInfo() {
    // After account was created, update user info
    let user              = firebase.auth().currentUser,
        signedUpUsernames = dbRef.child('signedUpUsernames').push();

    // Push signed up username to database to check them lately if already exists
      // when new user is signing up
    signedUpUsernames.set({ username:  this.state.signupUsername })

    user.updateProfile({
      // Use displayName to store the Username
      displayName: this.state.signupUsername
    }).then(() => {
      window.location.reload();
    })
}

handleSignUpModalClick() {
  // Close Sign in/Sign up container when clicking outside the box
    this.props.openSigninup({ displaySignInUp: false })
}

fetchSignedUpUsernames() {
  let self             = this,
      fetchedUsernames = [];

   getdbRefData.child('signedUpUsernames').on('value', gotData, errData);

    function gotData(data) {
    // the real value of data key
    let signedUpUsernames = data.val();
    // if there is data to retrive, retrieve
    if (signedUpUsernames !== null) {
      let keys = Object.keys(signedUpUsernames);
      let username;

      // Assign value for every variable
        // Map through object, assing variable with any info about usernames and push them inside array
      for (let i = 0; i < keys.length; i++) {
        let k     = keys[i];
        username  = signedUpUsernames[k].username;

        // Push all info about the online user inside array to be displayed
        fetchedUsernames.push({ username:  username });
      }
    }

    // Extract usernames as strings and push them inside array
    let usernames = [];
     fetchedUsernames.map((obj) => usernames.push(obj.username));
     self.setState({ fetchSignedUpUsernames: usernames })
  }

  function errData(err) {
    console.log(err);
  }
}
 

  render() {
    return (
        <div>
          <div className='signup_black_modal' onClick={this.handleSignUpModalClick}></div>
            <div className='signinup_container col-11 col-sm-10 col-md-8 col-lg-7 col-xl-5' tabIndex='0'>

              {/* Signin loading effect */}
              {this.state.displaySigninLoading && (
              <div className='signin_loading_eff'>
                <div className='loading_chat_eff'>
                  <div></div><div></div><div></div><div></div>
                  <div></div><div></div><div></div><div></div>
                </div>
              </div>
              )}

              <span className='signinup_closebox'><span onClick={this.handleSignUpModalClick} tabIndex='0'></span></span>
              <div className='row justify-content-center'>

                {/* Sign in / Sign up buttons */}
                <div className='signinup_buttons col-12'>
                  <div className='row'>
                    <div className='siu_b_ signin_b_butt col-6' onClick={(e)=>this.displaySignIn(e)} tabIndex='0' >
                      <span>Sign In</span>
                    </div>
                    <div className='siu_b_ signup_b_butt col-6' onClick={(e)=>this.displaySignUp(e)} tabIndex='0'>
                      <span>Sign Up</span>
                    </div>
                  </div>
                </div>
                
                <div className='signinup_sect col-12'>
                    <div className='row justify-content-center'>
                      {this.state.displaySignIn ? (
                      <div className='signin_box col-12'>

                        {/* Forgot password container */}
                        {this.state.openForgotPass && (
                          <div className='forgot_password_cont col-12'>
                            <div className='row justify-content-center'>
                              <span className='forgotpass_title'>Forgot password</span>
                            </div>
                             <div className='row justify-content-center'>
                              <span className='forgotpass_subtitle'>
                                No Problem! Enter your email below and we will
                                send you an email with the instructions to reset your password.
                              </span>
                            </div>
                             <div className='row justify-content-center'>
                              <span className='forgotpass_inputwrap'>
                                <input type         = 'text' 
                                       tabIndex     = '0'
                                       placeholder  = 'Email' 
                                       autoComplete = 'off'
                                       className    = 'forgotpass_input' 
                                       onClick      = {(e) => {e.target.focus()}}
                                       onChange     = {(e) => this.handleForgotPassInput(e)}
                                       onKeyDown    = {(e) => this.handleForgotPassInputKey(e)}>
                                </input> 
                              </span>
                            </div>
                            {this.state.forgotPassEmailNotValid && (
                            <div className='row justify-content-center'>
                              <span className='forgotpass_invalidemail'>
                                Invalid email.
                              </span>
                            </div>
                            )}
                            {this.state.forgotPassEmailNotFound && (
                            <div className='row justify-content-center'>
                              <span className='forgotpass_emailnotfound'>
                                Email not found. Please sign up.
                              </span>
                            </div>
                            )}
                            {this.state.forgotPassEmailSent && (
                            <div className='row justify-content-center'>
                              <span className='forgotpass_passsentmsg'>
                                Your new password has been sent.
                              </span>
                            </div>
                            )}
                            <div className='row justify-content-center'>
                              <span className='forgotpass_button' onClick={this.sendNewPasswordButton} tabIndex='0'>Send new password</span>
                            </div>
                            <div className='row justify-content-center'>
                              <span className='forgotpass_cancelbutton' onClick={this.openForgotPass} tabIndex='0'>Cancel</span>
                            </div>
                          </div>
                        )}
                        {/* End of Forgot password container */}


                        {/* Sign in & Sign up container */}
                        <div className='row justify-content-center'>
                          <span className='siu_signin_icon'></span>
                        </div>
                        <div className='row justify-content-center'>
                          <span className='siu_signin_title' tabIndex='0'>Sign in</span>
                        </div>
                        <div className='row justify-content-center'>
                          <span className='siu_signin_email_inputwrap'>
                            <input type='text' 
                                   className    = 'siu_signin_email_input' 
                                   placeholder  = 'Email'
                                   tabIndex     = '0'
                                   autoComplete = 'off'
                                   onClick      = {(e) => {e.target.focus()}} 
                                   onChange     = {(e) => this.handleSignInEmail(e)} 
                                   onKeyDown    = {(e) => this.handleKeyDownSignIn(e)}>
                            </input>
                          </span>
                        </div>
                        {this.state.invalidSignInEmail && (
                        <div className='row justify-content-center'>
                          <span className='siu_signin_error'>Invalid email</span>
                        </div>
                        )}
                        <div className='row justify-content-center'>
                          <span className='siu_signin_password_inputwrap'>
                            <input type         = 'password' 
                                   className    = 'siu_signin_password_input' 
                                   placeholder  = 'Password' 
                                   tabIndex     = '0'
                                   autoComplete = 'off'
                                   onChange     = {(e) => this.handleSignInPassword(e)} 
                                   onKeyDown    = {(e) => this.handleKeyDownSignIn(e)}>
                            </input>
                            <span className='siu_pass_showhidepass'>
                              <span className='show_hide_pass_icon' title='Show password' tabIndex='0' onClick={(e)=>this.showHideSignInPass(e)}></span>
                            </span>
                          </span>
                        </div>
                        {this.state.invalidSignInPass && (
                        <div className='row justify-content-center'>
                          <span className='siu_signin_error'>Invalid password</span>
                        </div>
                        )}
                        {this.state.invalidUserOrPassword && (
                        <div className='row justify-content-center'>
                          <span className='siu_signin_error'>User not found or invalid password</span>
                        </div>
                        )}
                        <div className='row justify-content-center'>
                          <span className='siu_forgotpassword' onClick={this.openForgotPass} tabIndex='0'>Forgot password</span>
                        </div>
                        <div className='row justify-content-center'>
                          <span className='siu_signin_button' onClick={this.handleSignInButton} tabIndex='0'>Sign In</span>
                        </div>
                      </div>
                      ):(
                      <div className='signup_box col-12'>
                        
                        <div className='row justify-content-center'>
                          <span className='siu_signup_icon'></span>
                        </div>
                        <div className='row justify-content-center'>
                          <span className='siu_signup_title' tabIndex='0'>Sign Up</span>
                        </div>
                        <div className='row justify-content-center'>
                          <span className='siu_signup_email_inputwrap'>
                            <input type='text' 
                                   className    = 'siu_signup_email_input' 
                                   placeholder  = 'Email' 
                                   tabIndex     = '0'
                                   autoComplete = 'off'
                                   onClick      = {(e) => {e.target.focus()}} 
                                   onChange     = {(e) => this.handleSignUpEmail(e)} 
                                   onKeyDown    = {(e) => this.handleKeyDownSignUp(e)}>
                            </input>
                          </span>
                        </div>
                        {this.state.signupInvalidEmail && (
                        <div className='row justify-content-center'>
                          <span className='siu_signup_emailerror'>Invalid email.</span>
                        </div>
                        )}
                        {this.state.signupEmailInUse && (
                        <div className='row justify-content-center'>
                          <span className='siu_signup_emailinuse'>Email already in use.</span>
                        </div>
                        )}
                        <div className='row justify-content-center'>
                          <span className='siu_signup_username_inputwrap'>
                            <input type='text' 
                                   className    = 'siu_signup_username_input' 
                                   placeholder  = 'Username' 
                                   maxLength    = '40'
                                   tabIndex     = '0'
                                   autoComplete = 'off'
                                   onClick      = {(e) => {e.target.focus()}} 
                                   onChange     = {(e) => this.handleSignUpUsername(e)} 
                                   onKeyDown    = {(e) => this.handleKeyDownSignUp(e)}>
                            </input>
                          </span>
                        </div>
                        {this.state.signupInvalidUsername && (
                        <div className='row justify-content-center'>
                          <span className='siu_signup_usernameerror'>Invalid username. Username must have at least 3 characters</span>
                        </div>
                        )}
                        {this.state.usernameExists && (
                        <div className='row justify-content-center'>
                          <span className='siu_signup_usernameerror'>Username already taken.</span>
                        </div>
                        )}
                        <div className='row justify-content-center'>
                          <span className='siu_signup_password_inputwrap'>
                            <input type         = 'password' 
                                   className    = 'siu_signup_password_input' 
                                   placeholder  = 'Password' 
                                   tabIndex     = '0'
                                   autoComplete = 'off'
                                   onClick      = {(e) => {e.target.focus()}} 
                                   onChange     = {(e) => this.handleSignUpPassword(e)} 
                                   onKeyDown    = {(e) => this.handleKeyDownSignUp(e)}>
                            </input>
                            <span className='siu_pass_showhidepass'>
                              <span className='show_hide_pass_icon' title='Show password' onClick={(e)=>this.showHideSignUpPass(e)}></span>
                            </span>
                          </span>
                        </div>
                        {this.state.signupInvalidPassword && (
                         <div className='row justify-content-center'>
                          <span className='siu_signup_passworderror'>Invalid password. Password must have at least 6 characters</span>
                         </div>
                         )}
                        <div className='row justify-content-center'>
                          <span className='siu_signup_button' onClick={this.handleSignUpButton} tabIndex='0'>Let's chat!</span>
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

const SignInUp = connect(mapStateToProps,mapDispatchToProps)(ConnectedSignInUp);
export default SignInUp;
