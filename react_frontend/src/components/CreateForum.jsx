import React, {useContext, useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { TokenContext } from '../App';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';
import { error_class } from '../mixin/validationMixin';
import RedirectForbidden from './RedirectForbidden';

function CreateForum() {
  const errors_default = { forum_exist: false, forum_chars_range: false, about_chars_limit: false };
  const history = useHistory();
  const { token, setToken } = useContext(TokenContext);
  const [input, setInput] = useState({ name: '', about: '' });
  const [authorized, setAuthorized] = useState(true);
  const { setFlash, setFlashContent } = useContext(FlashContext);
  const [errors, setErrors] = useState({ ...errors_default });

  useEffect(() => {
    document.title = 'Create Forum';
		if(!token) {
      setAuthorized(false);
		}
  }, []);

  if(!authorized) {
	  return <RedirectForbidden/>;
  }

  function create() {
    setErrors({ ...errors_default });
    let name = input.name.trim();
    let about = input.about.trim();
    let validation_error = false;
    if(about.length > 30000) {
      setErrors(prev => ({...prev, about_chars_limit: true}));
      validation_error = true;
    }
    if(name.length < 3 || name.length > 25) {
      setErrors(prev => ({...prev, forum_chars_range: true}));
      validation_error = true;
    } 

    if(!validation_error) {
      axios.post(`${REST_API_URL}forum`, {'name' : name, 'about' : about}, { headers: { 'x-access-token' : token } }).then(() => {
        history.push(`/forum/${name}`);
        displayFlashMessage('Forum Created', setFlash, setFlashContent);
      }).catch(err => {
        if(err.response.data.error) {
          setErrors(prev => ({...prev, forum_exist: true}));
        }
      })
    }
	}
	
  const forum_error = errors.forum_exist ? <div className={error_class}>Forum already exist</div> : 
                errors.forum_chars_range ? <div className={error_class}>Forum name must be 3 and 25 characters long</div> : '';

  const about_error = errors.about_chars_limit ? <div className={error_class}>About field must not exceed 30000 characters</div> : '';

  return (
    <div id="form-layout-g">
      <div className="form-container-g">
        <h2> Create Forum </h2>
        <label> Name </label>
        <input type="text" value={ input.name } onChange={ e => setInput({...input, name: e.target.value}) }/>
        {forum_error}
        <label> About </label>
        <textarea type="text" value={input.about} onChange={ e => setInput({...input, about: e.target.value}) }></textarea>
        {about_error}
        <button onClick={ create } className="form-submit-g"> Create Forum </button>
      </div>
    </div>
  );
}

export default CreateForum;