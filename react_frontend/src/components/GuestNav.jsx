import React, { useContext, useState, useRef, useEffect } from 'react';
import { getUserImage } from '../mixin/getImage';
import Login from './Login';
import Register from './Register';
import { LayoutContext } from './Layout';
import '../styles/guestNav.css';

function GuestLayout() {
  const { popup, popupDispatch, profileImageRef } = useContext(LayoutContext);
  const [authForm, setAuthForm ] = useState('');
  const profileRef =  useRef(null);

  // close guest navigation
  function closeProfileNav(e) {
    if(!(profileRef.current && profileRef.current)) {
      return;
    }
    // if guest popup navigation is clicked then do nothing
    // if guest picture is clicked in the header than do nothing and let the guest picture onclick listener handle the toggle
    if(!(profileRef.current.contains(e.target) || profileImageRef.current.contains(e.target))) {
      popupDispatch('hide');
    }
  } 

  // click event listen to close guest navigation
  useEffect(() => {
    document.addEventListener('click', closeProfileNav);
    return () => {
      document.removeEventListener('click', closeProfileNav);
    };
  }, []);

  // switch between login and register forms
  const LoginOrRegister = authForm == 'login' ? <Login setAuthForm={setAuthForm}/> : authForm == 'register' ? <Register setAuthForm={setAuthForm}/> : ''; 

  // guest navigation popup
  const guest_popup = (
    <div id="navigation-popup" ref={profileRef}>
      <div className="guest-nav">
        <div className="guest-header flex">
          <div><img src={getUserImage('default.png')} height="50" width="50"/></div>
          <div> Guest </div>
        </div>
        <div className="guest-links">
          <div onClick={() => {setAuthForm('login'); popupDispatch('hide');}} className="flex"> <i className="fas fa-sign-in-alt"></i> <span>Login</span> </div>
          <div onClick={() => {setAuthForm('register'); popupDispatch('hide');}} className="flex"> <i className="fas fa-address-book"></i>  <span>Register</span> </div>
        </div>
      </div>
    </div>
  );

  const toggle_popup = popup ? guest_popup : '';

  return (
    <React.Fragment>  
      { toggle_popup }
      { LoginOrRegister }
    </React.Fragment>
  );
}

export default GuestLayout;