import React          from 'react';
import { connect }    from "react-redux";
import { openUserCP } from '../actions/index';
import * as firebase  from 'firebase/app';
import '../css/Usercp.css';


const mapStateToProps = state => {
  return {  user               : state.user,
            connectedTime      : state.connectedTime,
            displayUserCP      : state.displayUserCP,
            userCountryAndFlag : state.userCountryAndFlag
        };
      };

 function mapDispatchToProps(dispatch) {
  return {
      openUserCP : bol => dispatch(openUserCP(bol))
  };
}


class ConnectedUserCP extends React.Component {
  constructor(props) {
    super();

    this.signOut            = this.signOut.bind(this);
    this.handleCPModalClick = this.handleCPModalClick.bind(this);
  }


signOut() {
  firebase.auth().signOut()
  .then(() => {
    console.log('Signed out.')
    window.location.reload();
  })
  .catch(error => console.log('Error: ' + error));
}


handleCPModalClick() {
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




  render() {
    let user = this.props.user !== undefined;

    return (
        <div>
        <div className='usercp_modal' onClick={this.handleCPModalClick}></div>
          {user && (
          <div className='col-12 usercp_container' tabIndex='0'> 
            <div className='row justify-content-center'>
              <div className='wrap_usercp col-11'>
                <div className='row justify-content-center'>
                  <span className='usercp_wrap_img'>
                    <span>{user && ( this.props.user.displayName.substring(0,1))}</span>
                  </span>
                </div>

              {/* Render only if info about user's country and flag are found */}
                {this.props.userCountryAndFlag.length > 0 && (
                <div className='row justify-content-center'>
                  <span className='usercp_info usercp_location'>
                    <span>Location: </span>
                    <span>
                      <img src={this.props.userCountryAndFlag[1]} alt={this.props.userCountryAndFlag[0]} title={this.props.userCountryAndFlag[0]}/>
                      <span>{this.props.userCountryAndFlag[0]}</span>
                    </span>
                  </span>
                </div>
                )}

                <div className='row justify-content-center'>
                  <span className='usercp_info usercp_displayname'>
                    <span>Username: </span>
                    <span>{user && (this.props.user.displayName)}</span>
                  </span>
                </div>

                <div className='row justify-content-center'>
                  <span className='usercp_info usercp_email'>
                    <span>Email: </span>
                    <span>{user && (this.props.user.email)}</span>
                  </span>
                </div>

                <div className='row justify-content-center'>
                  <span className='usercp_info usercp_lastsee'>
                    <span>Account created at: </span>
                    <span>{user && (this.props.user.metadata.creationTime)}</span>
                  </span>
                </div>

                <div className='row justify-content-center'>
                  <span className='usercp_info usercp_createdacc'>
                    <span>Connected at: </span>
                    <span>{this.props.connectedTime}</span>
                  </span>
                </div>

                <div className='row justify-content-center'>
                  <span className='usercp_info usercp_lastsee'>
                    <span>Last sign in time: </span>
                    <span>{user && (this.props.user.metadata.lastSignInTime)}</span>
                  </span>
                </div>

                <div className='row justify-content-center'>
                  <span className='usercp_logout_wrap' onClick={this.signOut} tabIndex='0'>
                    <span></span>
                    <span>Leave chat</span>
                  </span>
                </div>

              </div>
            </div>
          </div>
          )}
        </div>
    )
  }
}

const UserCP = connect(mapStateToProps,mapDispatchToProps)(ConnectedUserCP);
export default UserCP;
