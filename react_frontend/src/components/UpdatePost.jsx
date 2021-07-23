import React, {useContext, useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { TokenContext, UserContext } from '../App';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import RedirectPageNotFound from './RedirectPageNotFound';
import RedirectForbidden from './RedirectForbidden';
import { error_class } from '../mixin/validationMixin';
import { FlashContext } from './Layout';

function ForumUpdate(props) {
  const errors_default = { title_empty: false, title_chars_exceed: false, content_chars_exceed: false };
  const { user } = useContext(UserContext);
  const { token } = useContext(TokenContext);
  const history = useHistory();
  const [input, setInput] = useState({ title: '', content: '' });
  const [name, setName] = useState('');
  const [exist, setExist] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [errors, setErrors] = useState({ ...errors_default });
  const { setFlash, setFlashContent } = useContext(FlashContext);

  function update_post() {
    setErrors({ ...errors_default });
    let id = props.match.params['id'];
    let title = input.title.trim();
    let content = input.content.trim();

    let validation_error = false;
    if(title.length === 0) {
      setErrors(prev => ({...prev, title_empty: true}));
      validation_error = true;
    } else if(title.length > 5000) {
      setErrors(prev => ({...prev, title_chars_exceed: true}));
      validation_error = true;
    }
    if(content.length > 30000) {
      setErrors(prev => ({...prev, content_chars_exceed: true}));
      validation_error = true;
    } 
    if(!validation_error) {
      axios.put(`${REST_API_URL}post/${id}`, {'title' : title, 'content' : content}, { headers: { 'x-access-token' : token }}).then(()=> {
        displayFlashMessage('Post Updated', setFlash, setFlashContent);
        history.push(`/post/${id}`);
      }); 
    }
  }

  function post_details() {
    let id = props.match.params['id'];
    axios.get(`${REST_API_URL}post/${id}`).then(response => {
      const post_result = response.data.post;
      setInput({'title' : post_result.title, 'content': post_result.content});
      setName(post_result.forum.name);
      if(response.data.post.user.id !== user.id) {
        setAuthorized(false);
      }
    }).catch(() => {
      setExist(false);
    }); 
  }

  useEffect(() => {
    if(!token) {
      setAuthorized(false);
		}
    post_details();
  }, []);

  useEffect(() => {
    document.title = `Update Post: ${name}`;
  }, [name]);

  if(!authorized) {
	  return <RedirectForbidden/>;
  }

  if(!exist) {
    return <RedirectPageNotFound/>;
  }

  const title_error = errors.title_empty ? <div className={error_class}>Title cannot be empty</div> : 
                      errors.title_chars_exceed ? <div className={error_class}>Title field must not exceed 5000 characters</div> : '';

  const content_error = errors.content_chars_exceed ? <div className={error_class}>Content field must not exceed 30000 characters</div> : '';

  return (
    <div id="form-layout-g">
      <div className="form-container-g">
        <h2> Update Post for { name } </h2>
        <label> Title </label>
        <input type="text" value={input.title} onChange={ e => setInput({...input, title: e.target.value}) }/>
        {title_error}
        <label> Content </label>
        <textarea type="text" value={input.content} onChange={  e => setInput({...input, content: e.target.value}) }></textarea>
        {content_error}
        <button onClick={update_post} className="form-submit-g"> Update </button>
      </div>
    </div>
  );
}

export default ForumUpdate;