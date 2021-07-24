import React, { useContext, useState } from 'react';
import { UserContext, TokenContext, FollowerContext } from '../App';
import { LayoutContext } from './Layout';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import jwtdecode from "jwt-decode";
import { Link } from 'react-router-dom';
import { displayFlashMessage } from '../mixin/flashMixin';
import { error_class } from '../mixin/validationMixin';
import { FlashContext } from './Layout';

function Login(props) {
  const errors_default = { user_exist: false, password_match: false };
  const {setAuthForm} = props;
  const [input, setInput] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({...errors_default});
  const { setUser } = useContext(UserContext);
  const { setToken } = useContext(TokenContext);
  const { setFollower } = useContext(FollowerContext);
  const { loadLogDispatch } = useContext(LayoutContext);
  const { setFlash, setFlashContent } = useContext(FlashContext);


  function loginUser() {
    let username = input.username.trim();
    let password = input.password;
    setErrors({...errors_default});
    if(input.username.length === 0) {
      setErrors(prev => ({...prev, user_exist: true}));
    } else if(input.password.length === 0) {
      setErrors(prev => ({...prev, password_match: true}));
    } else {
      loadLogDispatch('loading');
      axios.get(`${REST_API_URL}login`, { auth: { username: username, password: password}}).then(response => {
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
        setAuthForm('');  
      })).catch(err => {
        const error = err.response.data.error;
        if(error.username) { // username already exist
          setErrors(prev => ({...prev, user_exist: true}));
        } else if (error.password) { // password does not match with username
          setErrors(prev => ({...prev, password_match: true}));
        }
      }).finally(() => {
        loadLogDispatch('loaded')
      });
    }
  }

  function handleKeyDown(e) {
    if(e.key === 'Enter') {
      loginUser();
    }
  }

  const username_error = errors.user_exist ? <div className={error_class}>Username does not exist</div> : '';
  const password_error = errors.password_match ? <div className={error_class}>Password does not match with this username</div> : '';

  return (
    <div id="popup-form-g">
      <div className="popup-auth-container-g">
        <div onClick={() => setAuthForm('')} className="close"> &times; </div>
        <div className="auth-input-g">
          <div className="auth-inner-g">
            <h2> Log in to Flask Forum </h2>      
            <input type="text" placeholder="Username" value={ input.username } onChange={ e => setInput({ ...input, username: e.target.value }) } onKeyDown={ handleKeyDown }/>
            {username_error}
            <input type="password" placeholder="Password" value={ input.password } onChange={ e => setInput({ ...input, password: e.target.value }) } onKeyDown={ handleKeyDown }/>
            {password_error}
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