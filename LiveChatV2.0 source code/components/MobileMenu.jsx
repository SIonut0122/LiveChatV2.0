import React              from 'react';
import { connect        } from "react-redux";
import { userInfo,
         openMobileMenu,
         openSigninup   } from '../actions/index';
import * as firebase      from 'firebase/app';
import '../css/Mobilemenu.css';


const mapStateToProps = state => {
  return {  user               : state.user,
            onlineUsers        : state.fetchedOnlineUsers,
            displayMobileMenu  : state.displayMobileMenu,
            connectedTime      : state.connectedTime,
            userCountryAndFlag : state.userCountryAndFlag
        };
      };


function mapDispatchToProps(dispatch) {
  return {
    userInfo       : user => dispatch(userInfo(user)),
    openMobileMenu : bol  => dispatch(openMobileMenu(bol)),
    openSigninup   : bol  => dispatch(openSigninup(bol)),
  };
}


class ConnectedMobileMenu extends React.Component {
  constructor(props) {
    super();

    this.displayMobileMenu = this.displayMobileMenu.bind(this);
    this.mobSignInUp       = this.mobSignInUp.bind(this);
  }


displayMobileMenu() {
  // Open mobmenu when clicking 'Open mobmenu' button
  // Close mobmenu when clicking outside the Menu;

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

handleMobmenuClick(e) {
  // Avoid closing mobmenu when clicking inside menu mobile
  e.stopPropagation();
}

mobSignInUp() {
  // Hide displayMobileMenu box and destroy it
    document.querySelector('.mobmenu_menu').classList.remove('mobmenu_open');
    document.querySelector('.mobmenu_container').style.opacity = '0';
    setTimeout(() => {
     this.props.openMobileMenu({ displayMobileMenu: false })
    },850);

  // Open Sign in / Sign up container
    this.props.openSigninup({ displaySignInUp: true })
}

mobMenuLeaveChat() {
  firebase.auth().signOut()
  .then(() => {
    console.log('Signed out.')
    window.location.reload();
  })
  .catch(error => console.log('Error: ' + error));
}

  render() {
    const user = this.props.user !== undefined;
    return (
        <div>
          <div className='col-12 mobmenu_container' onClick={this.displayMobileMenu}>
            <div className='row'>
              <div className='mobmenu_menu' onClick={(e)=>this.handleMobmenuClick(e)}>
                <span className='close_mmobmenu' onClick={this.displayMobileMenu}>&times;</span>
                <div className='row justify-content-center'>
                  {!user ? (
                  <div className='mob_signinup_div'>
                    <div className='row'>
                      <span className='mob_signinup_button' onClick={this.mobSignInUp}>Sign In / Sign Up</span>
                    </div>
                  </div>
                  ):(
                  <div className='mobmenu_userinfo'>
                    <div className='row justify-content-center'>
                      <ul>
                        <li>S</li>
                        <li className='mobmenu_info_tit'>Username:</li>
                        <li className='mobmenu_info_subtit'>{this.props.user.displayName}</li>
                        <li className='mobmenu_info_tit'>Email:</li>
                        <li className='mobmenu_info_subtit'>{this.props.user.email}</li>
                        <li className='mobmenu_info_tit'>Connected at: 
                          <span className='mobmenu_info_subtit'> {user && this.props.connectedTime}</span>
                        </li>
                        <li className='mobmenu_leavechat'>
                          <span></span>
                          <span onClick={this.mobMenuLeaveChat}>Leave chat</span>
                        </li>

                      </ul>
                    </div>
                  </div>
                  )}

                </div>
                <div className='row justify-content-center'>
                  <span className='mobmenu_onusers_title'>
                    <span className='mobchat_online_dot'></span>
                    Online users ({this.props.onlineUsers.length - 1})
                  </span>
                </div>
                <div className='row justify-content-center'>
                  <div className='mobmenu_wrap_onusers'>
                    <div className='row'>
                      <div className='mobmenu_wraponuser_scroll'>
                        <div className='row'>

                        {/* ONLINE USERS BOX */}
                        {this.props.onlineUsers.length > 0 && this.props.onlineUsers.map((onuser,ind) => 
                          <div className='mobon_user' key={ind}>
                            <div className='row justify-content-center'>
                              <div className='mobuser_img'>
                                <span className='mobuser_wrap_img'>{onuser.username === 'BOT' ? <img src={require('../images/chat/bot_img.png')} alt=''/> : <span className='mobonuser_imglett'>{onuser.imgLetter}</span>}</span>
                              </div>
                              <div className='mobuser_details'>
                                <span className='mobuser_det_child' id={onuser.username === 'BOT' ? 'bot_on_user' : null}>{onuser.username}</span>
                                <span className='mobuser_det_child'>Connected at {onuser.connectedTime}</span>
                                {onuser.username !== 'BOT' && (
                                <span className='mobuser_det_child mdc_country'>
                                  <img src={this.props.userCountryAndFlag[1]} alt=''/>
                                  <span>{this.props.userCountryAndFlag[0]}</span>
                                </span>
                                )}
                              </div>
                            </div>
                          </div>
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
      )
  }
}

  
const MobileMenu = connect(mapStateToProps,mapDispatchToProps)(ConnectedMobileMenu);
export default MobileMenu;

