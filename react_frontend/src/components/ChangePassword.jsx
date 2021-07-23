import React, {useContext, useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { UserContext, TokenContext } from '../App';
import { getUserImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import RedirectForbidden from './RedirectForbidden';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { error_class, validPassword } from '../mixin/validationMixin';
import { FlashContext } from './Layout';

function ChangePassword() {
  const errors_default = { password_match: false, password_chars_exceed: false, password_invalid: false, password_incorrect: false };
  const history = useHistory();
  const { user } = useContext(UserContext);
  const { token } = useContext(TokenContext);
  const [input, setInput] = useState({ old_password: '', new_password: '', confirm_new_password: '' });
  const [authorized, setAuthorized] = useState(true);
  const [errors, setErrors] = useState({ ...errors_default });
  const { setFlash, setFlashContent } = useContext(FlashContext);
  
  useEffect(() => {
    document.title = 'Change Password';
		if(!token) {
      setAuthorized(false);
		}
  }, []);

  if(!authorized) {
	  return <RedirectForbidden/>;
  }

  function change_password() {
    setErrors({ ...errors_default });
    let old_password = input.old_password;
    let new_password = input.new_password;
    let confirm_new_password = input.confirm_new_password;

    if(new_password != confirm_new_password) {
      setErrors(prev => ({...prev, password_match: true}));
    } else if(new_password.length > 128) {
      setErrors(prev => ({...prev, password_chars_exceed: true}));
    } else if(!validPassword(new_password)) {
      setErrors(prev => ({...prev, password_invalid: true}));
    } else {
      axios.put(`${REST_API_URL}account_pass`, {'old_password' : old_password, 'new_password' : new_password}, { headers: { 'x-access-token' : token } }).then(() => {
        displayFlashMessage('Account Password Changed', setFlash, setFlashContent);
        history.push('/');
      }).catch(err => {
        if(err.response.data.error) {
          setErrors(prev => ({...prev, password_incorrect: true}));
        }
      });
    }
  }

  const password_error_incorrect = errors.password_incorrect ? <div className={error_class}>Password is incorrect</div> : '';

  const password_error = errors.password_match ? <div className={error_class}>Field must be equal to new password</div> :
                          errors.password_invalid ? <div className={error_class}>Password must be 8 or more characters long and contain atleast one uppercase, lowercase, digit and special character</div> :
                          errors.password_chars_exceed ? <div className={error_class}>Password cannot exceed 128 characters</div> : '';
  
  return (
  <div id="form-layout-g">
    <div className="form-container-g">
      <div className="form-details flex">
        <img src={ getUserImage(user.display_picture) } height="125" width="125"/>
        <div>
          <div> { user.username } </div>
          <div> { user.email } </div>
        </div>
      </div>
      <h2> Change Password </h2>
      <label> Old Passowrd </label>
      <input type="password" value={ input.old_password } onChange={ e => setInput({...input, old_password: e.target.value}) }/>
      {password_error_incorrect}
      <label> New Passowrd </label>
      <input type="password" value={ input.new_password } onChange={ e => setInput({...input, new_password: e.target.value}) }/>
      <label> Confirm New Passowrd </label>
      <input type="password" value={ input.confirm_new_password } onChange={ e => setInput({...input, confirm_new_password: e.target.value}) }/>
      {password_error}
      <button onClick={ change_password } className="form-submit-g"> Change Password </button>
    </div>
  </div>
  );
}
export default ChangePassword;