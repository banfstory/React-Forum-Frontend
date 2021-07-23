import './App.css';
import React, { useState, useEffect, useReducer } from 'react';
import Layout from './components/Layout';
import axios from 'axios';
import jwtdecode from "jwt-decode";
import { loadingReducer } from './mixin/reducerMixin';
import { CSSTransition } from 'react-transition-group';

export const UserContext = React.createContext();
export const TokenContext = React.createContext();
export const FollowerContext = React.createContext();
export const REST_API_URL = React.createContext();

function App() {
  const [IsLoading, loadDispatch] = useReducer(loadingReducer, true);
  const rest_api_url = 'http://172.105.190.62:8080/api/';
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [follower, setFollower] = useState([]);
  const [_, setNotification] = useState(false);
  const [notify_message, setNotifyMessage] = useState('default');

  function deleteAllCookies() {
    let cookies = document.cookie.split(";");
    let currTime = new Date();
    currTime.setMonth(currTime.getMonth() - 1);
    for(let i = 0; i < cookies.length; i++) {
      let name = cookies[i].split("=")[0];
      document.cookie = `${name}=; expires=${currTime.toUTCString()}`;
    }
  }

  function initApp() {
    // if user has a cookie with the web token, then they have already authenticated before
    loadDispatch('loading');
    if(document.cookie.indexOf('token') != -1) {
      let arr_token = document.cookie.split(';').map(cookie => cookie.split('='));
      const token = arr_token[0][1];
      let user = jwtdecode(token);
      const getUser = axios.get(`${rest_api_url}user?id=${user.id}`);
      const getFollowers = axios.get(`${rest_api_url}user_followers`, { headers: { 'x-access-token' : token } });
      axios.all([getUser, getFollowers]).then(axios.spread((...response) => {
        const userResponse = response[0];
        setUser(userResponse.data.user); 
        const followersReponse = response[1];
        setFollower(followersReponse.data.user_followers);
        setToken(token);
      })).catch(() => {
        deleteAllCookies();
      }).finally(() => {
        loadDispatch('loaded');
      });
    } else {
      loadDispatch('loaded');
    }
  }

  useEffect(() => {
		initApp();
  }, []);

  function notifyPopupMessage(message) {
    setNotifyMessage(message);
    setNotification(true);
    setTimeout(() => { setNotification(false); setNotifyMessage('') }, 5000);
  }

  const toggleNotification = true ? (  
    <CSSTransition classNames="fade"><div id="pop-message"> {notify_message} </div> </CSSTransition>
  )  : '';


  if(!IsLoading) {
    return (
      <UserContext.Provider value={{ user, setUser: setUser }}>
        <TokenContext.Provider value={{ token, setToken: setToken }}>
          <FollowerContext.Provider value={{ follower, setFollower: setFollower }}>
            <Layout/>
          </FollowerContext.Provider>
        </TokenContext.Provider>
      </UserContext.Provider>
    );
  } else {
		return '';
	}
}

export default App;
