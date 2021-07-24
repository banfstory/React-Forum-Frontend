import React, { useState, useContext, useRef, useReducer } from 'react';
import { TokenContext } from '../App';
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';
import Header from './Header';
import UserLayout from './UserLayout';
import GuestLayout from './GuestLayout';
import { popupReducer, loadingReducer } from '../mixin/reducerMixin';
import '../styles/app.css';

export const LayoutContext = React.createContext();
export const FlashContext = React.createContext();

function Layout() {
  const { token } = useContext(TokenContext);
  const [popup, popupDispatch] = useReducer(popupReducer, false); // use to close user/guest popup navigation
  const [IsLoadingLog,  loadLogDispatch] = useReducer(loadingReducer, false); // ensure all user data has been retrieved before loading the header
  const profileRef =  useRef(null); 
  const [flash, setFlash] = useState(false);
  const [flash_content, setFlashContent] = useState('');
  const passContext = { popup: popup, popupDispatch: popupDispatch, profileImageRef: profileRef, loadLogDispatch: loadLogDispatch };
  const passFlashContext = { setFlash: setFlash, setFlashContent: setFlashContent }
  const passPropHeader = { popupDispatch: popupDispatch, profileRef: profileRef };
  const layout = token && !IsLoadingLog ? <UserLayout/> : <GuestLayout/>;

  const contentDetails = (
    <FlashContext.Provider value={ passFlashContext }>
      <LayoutContext.Provider value={ passContext }>
        { layout }
      </LayoutContext.Provider>
      <div className="main-content">
        <Routes/>
      </div>
    </FlashContext.Provider>
  );

  // user's interface will be different depending if the user has been logged in or not
  const contentContainer = token ? (
    <div className="content-container">
      { contentDetails }
    </div>
  ) : (
    (
      <div className="content-container" style={{ gridTemplateColumns: '1fr' }}>
        { contentDetails }
      </div>
    )
  );

  const flashMessage = ( flash ?
    <div className="flash-message">
      { flash_content }
    </div> : ''
  )

  return (
    <BrowserRouter>
      <div className="wrapper">
        <Header {...passPropHeader}/>
        { contentContainer }
      </div>
      { flashMessage }
    </BrowserRouter>
  )
}

export default Layout;
