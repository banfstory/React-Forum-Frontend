import React, {useContext, useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { TokenContext } from '../App';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';

function ForumUpdate(props) {
  const { token } = useContext(TokenContext);
  const history = useHistory();
  const [input, setInput] = useState({ title: '', content: '' });
  const [name, setName] = useState('');
  const { setFlash, setFlashContent } = useContext(FlashContext);

  function update_post() {
    let id = props.match.params['id'];
    let title = input.title.trim();
    let content = input.content.trim();
    axios.put(`${REST_API_URL}post/${id}`, {'title' : title, 'content' : content}, { headers: { 'x-access-token' : token }}).then(()=> {
      displayFlashMessage('Post Updated', setFlash, setFlashContent);
      history.push(`/post/${id}`);
    }); 
  }

  function post_details() {
    let id = props.match.params['id'];
    axios.get(`${REST_API_URL}post/${id}`).then(response => {
      const post_result = response.data.post;
      setInput({'title' : post_result.title, 'content': post_result.content});
      setName(post_result.forum.name);
    }).catch((err) => {
      console.log(err);
    }); 
  }

  useEffect(() => {
    if(!token) {
      history.push('/');
		}
    post_details();
  }, []);

  return (
    <div id="form-layout-g">
      <div className="form-container-g">
        <h2> Update Post for { name } </h2>
        <label> Title </label>
        <input type="text" value={input.title} onChange={ e => setInput({...input, title: e.target.value}) }/>
        <label> Content </label>
        <textarea type="text" value={input.content} onChange={  e => setInput({...input, content: e.target.value}) }></textarea>
        <button onClick={update_post} className="form-submit-g"> Update </button>
      </div>
    </div>
  );
}

export default ForumUpdate;