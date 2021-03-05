import React, {useContext, useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { UserContext, TokenContext } from '../App';
import { getUserImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';

function ChangePassword() {
  const history = useHistory();
  const { user } = useContext(UserContext);
  const { token } = useContext(TokenContext);
  const [input, setInput] = useState({ old_password: '', new_password: '', confirm_new_password: '' });
  const { setFlash, setFlashContent } = useContext(FlashContext);
  
  useEffect(() => {
		if(!token) {
      history.push('/');
		}
  }, []);

  function change_password() {
    let old_password = input.old_password;
    let new_password = input.new_password;
    let confirm_new_password = input.confirm_new_password;
    if(new_password == confirm_new_password) {
      axios.put(`${REST_API_URL}account_pass`, {'old_password' : old_password, 'new_password' : new_password}, { headers: { 'x-access-token' : token } }).then(() => {
        displayFlashMessage('Account Password Changed', setFlash, setFlashContent);
        history.push('/');
      }).catch(err => {
        if(err) {
          console.log(err);
        }
      });
    } else {
      console.log('password do not match!');
    }
  }
  
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
      <label> New Passowrd </label>
      <input type="password" value={ input.new_password } onChange={ e => setInput({...input, new_password: e.target.value}) }/>
      <label> Confirm New Passowrd </label>
      <input type="password" value={ input.confirm_new_password } onChange={ e => setInput({...input, confirm_new_password: e.target.value}) }/>
      <button onClick={ change_password } className="form-submit-g"> Change Password </button>
    </div>
  </div>
  );
}
export default ChangePassword;