import React, { useState, useContext } from 'react';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { validEmail, validUserSpace, validPassword, error_class } from '../mixin/validationMixin';
import { FlashContext } from './Layout';

function Register(props) {
  const {setAuthForm} = props;
  const errors_default = { user_exist: false, user_chars_range: false, user_spaces: false, email_invalid: false, password_invalid: false, 
                          password_match: false, password_chars_exceed: false };
  const [input, setInput] = useState({ ...errors_default });
  const [errors, setErrors] = useState({ user_exist: false, user_chars_range: false, user_spaces: false, email_invalid: false, password_invalid: false, 
        password_match: false, password_chars_exceed: false });
  const { setFlash, setFlashContent } = useContext(FlashContext);

  function register() {
    setErrors({ ...errors_default });
    let username = input.username.trim();
    let email = input.email.trim();
    let password = input.password;
    let confirm_password = input.confirm_password;
    let validation_error = false;

    if(username.length < 3 || username.length > 25) { // username must be 3 and 25 characters long
      setErrors(prev => ({...prev, user_chars_range: true}));
      validation_error = true;
    } else if(!validUserSpace(username)) {
      setErrors(prev => ({...prev, user_spaces: true}));
      validation_error = true;
    }
    if(!validEmail(email)) { // email format is invalid
      setErrors(prev => ({...prev, email_invalid: true}));
      validation_error = true;
    } 
    if(password != confirm_password) { // passwords do not match
      setErrors(prev => ({...prev, password_match: true}));
      validation_error = true;
    } else if(password.length > 128) {
      setErrors(prev => ({...prev, password_chars_exceed: true}));
      validation_error = true;
    } else if(!validPassword(password)) { // password format is invalid
      setErrors(prev => ({...prev, password_invalid: true}));
      validation_error = true;
    }

    if(!validation_error && password === confirm_password) {
      axios.post(`${REST_API_URL}register`, {'username' : username, 'email' : email, 'password' : password}).then(() => {
        setAuthForm('');
        displayFlashMessage('Register Successful', setFlash, setFlashContent);
      }).catch(err => {
        if(err.response.data.error) { // user already exist
          setErrors(prev => ({...prev, user_exist: true}));
        }
      })
    }
  }

  function handleKeyDown(e) {
    if(e.key == 'Enter') {
      register();
    }
  }

  const username_error =  errors.user_exist ? <div className={error_class}>Username already exist</div> :  
                          errors.user_chars_range ? <div className={error_class}>Username must be between 3 and 25 characters long</div> :
                          errors.user_spaces ? <div className={error_class}>Username must not contain spaces</div> : '';

  const email_error = errors.email_invalid ? <div className={error_class}>Invalid email address</div> : '';

  const password_error =  errors.password_invalid ? <div className={error_class}>Password must be 8 or more characters long and contain atleast one uppercase, lowercase, digit and special character</div> :
                          errors.password_match ? <div className={error_class}>Field must be equal to password</div> : 
                          errors.password_chars_exceed ? <div className={error_class}>Password cannot exceed 128 characters</div> : '';

  return (
    <div id="popup-form-g">
      <div className="popup-auth-container-g">
        <div onClick={() => setAuthForm('')} className="close"> &times; </div>
        <div className="auth-input-g">
          <div className="auth-inner-g">
            <h2> Join Flask Forum! </h2>
            <input type="text" placeholder="Username" value={ input.username } onChange={ e => setInput({ ...input, username: e.target.value }) } onKeyDown={ handleKeyDown }/>
            {username_error}
            <input type="text" placeholder="Email" value={ input.email } onChange={ e => setInput({...input, email: e.target.value}) } onKeyDown={ handleKeyDown }/>
            {email_error}
            <input type="password" placeholder="Password" value={ input.password } onChange={ e => setInput({ ...input, password: e.target.value }) } onKeyDown={ handleKeyDown }/>
            <input type="password" placeholder="Confirm Password" value={ input.confirm_password } onChange={ e => setInput({ ...input, confirm_password: e.target.value }) } onKeyDown={ handleKeyDown }/>
            {password_error}
            <button onClick={ register }> Register </button>
            <span onClick={() => setAuthForm('login')}> Already have an account? </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;