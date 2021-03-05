import React, { useContext, useRef, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { getUserImage } from '../mixin/getImage';
import { UserContext, TokenContext, FollowerContext } from '../App';
import { LayoutContext } from './Layout';
import { Link } from 'react-router-dom';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';
import '../styles/profileNav.css';

function UserLayout() {
  const { popup, popupDispatch, profileImageRef } = useContext(LayoutContext);
  const history = useHistory();
  const { user, setUser } = useContext(UserContext);
  const { setToken } = useContext(TokenContext);
  const { setFollower } = useContext(FollowerContext);
  const profileRef =  useRef(null);
  const { setFlash, setFlashContent } = useContext(FlashContext);

  // log the user out and remove current cookies
  function logout() {
    setToken('');
    setUser({});
    setFollower({});
    deleteAllCookies();
    popupDispatch('hide');
    displayFlashMessage('Logged Out', setFlash, setFlashContent);
    history.push('/');
  }

  // remove all existing cookies
  function deleteAllCookies() {
    let cookies = document.cookie.split(";");
    let currTime = new Date();
    currTime.setMonth(currTime.getMonth() - 1);
    for(let i = 0; i < cookies.length; i++) {
      let name = cookies[i].split("=")[0];
      document.cookie = `${name}=; expires=${currTime.toUTCString()}`;
    }
  }

  // close the profile navigation
  function closeProfileNav(e) {
    if(!(profileRef.current && profileRef.current)) {
      return;
    }
    // if user popup navigation is clicked then do nothing
    // if user picture is clicked in the header than do nothing and let the user picture onclick listener handle the toggle
    if(!(profileRef.current.contains(e.target) || profileImageRef.current.contains(e.target))) {
      popupDispatch('hide');
    }
  } 

  // click event listener to close profile navigation 
  useEffect(() => {
    document.addEventListener('click', closeProfileNav);
    return () => {
      document.removeEventListener('click', closeProfileNav);
    };
  }, []);

  // profile navigation popup
  const profile_popup = (
    <div id="navigation-popup" ref={profileRef}>
      <div className="profile-nav">
        <div className="profile-header flex">
          <div><img src={ getUserImage(user.display_picture) } height="50" width="50"/></div>
          <div className="profile-user flex"> 
            <div> { user.username } </div> 
            <div> { user.email } </div> 
          </div>
        </div>
        <div className="profile-links">
          <div onClick={() => popupDispatch('hide')}><Link to="/account" className="flex"> <i className="fas fa-id-badge"></i> <span>Account</span> </Link></div>
          <div onClick={() => popupDispatch('hide')}><Link to="/create-forum" className="flex"> <i className="fab fa-wpforms"></i> <span>Create Forum</span> </Link></div>
          <div onClick={() => popupDispatch('hide')}><Link to="/change-password" className="flex"> <i className="fas fa-lock"></i> <span>Change Password</span> </Link></div>
          <div onClick={ logout }><Link className="flex"> <i className="fas fa-sign-out-alt"></i> <span>Logout</span> </Link></div>
        </div>
    </div>
    </div>
  );

  const toggle_popup = popup ? profile_popup : '';

  return (  
    <React.Fragment>     
      {toggle_popup}
     </React.Fragment>  
  );
}


export default UserLayout;