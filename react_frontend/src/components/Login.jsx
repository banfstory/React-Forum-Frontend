import React, { useContext, useState } from 'react';
import { UserContext, TokenContext, FollowerContext } from '../App';
import { LayoutContext } from './Layout';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import jwtdecode from "jwt-decode";
import { Link } from 'react-router-dom';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';

function Login(props) {
  const {setAuthForm} = props;
  const [input, setInput] = useState({ username: '', password: '' })
  const { setUser } = useContext(UserContext);
  const { setToken } = useContext(TokenContext);
  const { setFollower } = useContext(FollowerContext);
  const { loadLogDispatch } = useContext(LayoutContext);
  const { setFlash, setFlashContent } = useContext(FlashContext);
  
  
  function loginUser() {
    loadLogDispatch('loading');
    axios.get(`${REST_API_URL}login`, { auth: { username: input.username, password: input.password}}).then(response => {
      let currTime = new Date();
      currTime.setTime(currTime.getTime() + 86400 * 1000);
      document.cookie = `token=${response.data.token}; path=/; expires=${currTime.toUTCString()}`;
      const token = response.data.token;
      setToken(token);
      const user = jwtdecode(token);
      const getUser = axios.get(`${REST_API_URL}user?id=${user.id}`);
      const getFollowers = axios.get(`${REST_API_URL}user_followers`, { headers: { 'x-access-token' : token } });
      return axios.all([getUser, getFollowers]);
    }).then(axios.spread((...response) => {
      const userResponse = response[0];
      setUser(userResponse.data.user);
      const followersResponse = response[1];
      setFollower(followersResponse.data.user_followers);
      displayFlashMessage('Login Successful', setFlash, setFlashContent);
    })).catch(err => {
      console.log(err);
    }).finally(() => {
      setAuthForm('');
      loadLogDispatch('loaded')
    });
  }

  function handleKeyDown(e) {
    if(e.key == 'Enter') {
      loginUser();
    }
  }

  return (
    <div id="popup-form-g">
      <div className="popup-auth-container-g">
        <div onClick={() => setAuthForm('')} className="close"> &times; </div>
        <div className="auth-input-g">
          <div className="auth-inner-g">
            <h2> Log in to Flask Forum </h2>      
            <input type="text" placeholder="Username" value={ input.username } onChange={ e => setInput({ ...input, username: e.target.value }) } onKeyDown={ handleKeyDown }/>
            <input type="password" placeholder="Password" value={ input.password } onChange={ e => setInput({ ...input, password: e.target.value }) } onKeyDown={ handleKeyDown }/>
            <Link to="#"> Forgot Password? </Link>
            <button onClick={ loginUser }> Login </button>
            <span onClick={() => setAuthForm('register')}>Create an account </span>
          </div>
        </div>
      </div>
    </div> 
  );
}

export default Login;