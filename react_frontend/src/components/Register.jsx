import React, { useState, useContext } from 'react';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';

function Register(props) {
  const {setAuthForm} = props;
  const [input, setInput] = useState({ username: '', email: '', password: '', confirm_password: '' });
  const { setFlash, setFlashContent } = useContext(FlashContext);

  function register() {
    let username = input.username.trim();
    let email = input.email.trim();
    let password = input.password;
    let confirm_password = input.confirm_password;
    if(password===confirm_password) {
      axios.post(`${REST_API_URL}register`, {'username' : username, 'email' : email, 'password' : password}).then(() => {
        setAuthForm('');
        displayFlashMessage('Register Successful', setFlash, setFlashContent);
      }).catch(err => {
        console.log(err);
      })
    }
  }

  function handleKeyDown(e) {
    if(e.key == 'Enter') {
      register();
    }
  }

  return (
    <div id="popup-form-g">
      <div className="popup-auth-container-g">
        <div onClick={() => setAuthForm('')} className="close"> &times; </div>
        <div className="auth-input-g">
          <div className="auth-inner-g">
            <h2> Join Flask Forum! </h2>
            <input type="text" placeholder="Username" value={ input.username } onChange={ e => setInput({ ...input, username: e.target.value }) } onKeyDown={ handleKeyDown }/>
            <input type="text" placeholder="Email" value={ input.email } onChange={ e => setInput({...input, email: e.target.value}) } onKeyDown={ handleKeyDown }/>
            <input type="password" placeholder="Password" value={ input.password } onChange={ e => setInput({ ...input, password: e.target.value }) } onKeyDown={ handleKeyDown }/>
            <input type="password" placeholder="Confirm Password" value={ input.confirm_password } onChange={ e => setInput({ ...input, confirm_password: e.target.value }) } onKeyDown={ handleKeyDown }/>
            <button onClick={ register }> Register </button>
            <span onClick={() => setAuthForm('login')}> Already have an account? </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;