import React, {useContext, useState, useEffect} from 'react';
import { TokenContext } from '../App';
import REST_API_URL from '../mixin/default_API_URL';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import RedirectPageNotFound from './RedirectPageNotFound';
import RedirectForbidden from './RedirectForbidden';
import { error_class } from '../mixin/validationMixin';
import { FlashContext } from './Layout';

function CreatePost(props) {
  const errors_default = { title_empty: false, title_chars_exceed: false, content_chars_exceed: false };
  const history = useHistory();
  const { token, setToken } = useContext(TokenContext);
  const [forum, setForum] = useState({});
  const [input, setInput] = useState({ title: '', content: '' });
  const [exist, setExist] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [errors, setErrors] = useState({ ...errors_default });
  const { setFlash, setFlashContent } = useContext(FlashContext);

  function forum_details() {
    let name = props.match.params['name'];
    axios.get(`${REST_API_URL}forum?name=${name}`).then(response => {
      setForum(response.data.forum);
    }).catch(() => {
      setExist(false);
    });
  }

  useEffect(() => {
    document.title = `Create Post: ${props.match.params['name']}`;
    if(!token) {
      setAuthorized(false);
    }
		forum_details();
  }, []);

  
  if(!authorized) {
	  return <RedirectForbidden/>;
  }

  function create() {
    setErrors({ ...errors_default });
    let title = input.title.trim();
    let content = input.content.trim();
    let validation_error = false;
    if(title.length == 0) {
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
      axios.post(`${REST_API_URL}post`, {'title' : title, 'content' : content, 'forum_id' : forum.id}, { headers: { 'x-access-token' : token} }).then(() => {
        history.push(`/forum/${forum.name}`);
        displayFlashMessage('Post Created', setFlash, setFlashContent);
      });
    }
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
        <h2> Create post for { forum.name } Forum </h2>
        <label> Title </label>
        <input type="text" value={ input.title } onChange={ e => setInput({...input, title: e.target.value}) }/>
        {title_error}
        <label> Content </label>
        <textarea type="text" value={ input.content } onChange={ e => setInput({...input, content: e.target.value}) }></textarea>
        {content_error}
        <button onClick={ create } className="form-submit-g"> Create Post </button>   
      </div>
    </div>
  );
}

export default CreatePost;