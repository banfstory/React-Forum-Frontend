import React, {useContext, useState, useEffect} from 'react';
import { TokenContext } from '../App';
import REST_API_URL from '../mixin/default_API_URL';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';

function CreatePost(props) {
  const history = useHistory();
  const { token, setToken } = useContext(TokenContext);
  const [forum, setForum] = useState({});
  const [input, setInput] = useState({ title: '', content: '' });
  const { setFlash, setFlashContent } = useContext(FlashContext);

  function forum_details() {
    let name = props.match.params['name'];
    axios.get(`${REST_API_URL}forum?name=${name}`).then(response => {
      setForum(response.data.forum);
    }).catch((err) => {
      console.log(err);
    });
  }

  function create() {
    let title = input.title.trim();
    let content = input.content.trim();
    axios.post(`${REST_API_URL}post`, {'title' : title, 'content' : content, 'forum_id' : forum.id}, { headers: { 'x-access-token' : token} }).then(() => {
      history.push(`/forum/${forum.name}`);
      displayFlashMessage('Post Created', setFlash, setFlashContent);
    });
  }
  
  useEffect(() => {
		forum_details();
  }, []);
	
  return (
    <div id="form-layout-g">
      <div className="form-container-g">
        <h2> Create post for { forum.name } Forum </h2>
        <label> Title </label>
        <input type="text" value={ input.title } onChange={ e => setInput({...input, title: e.target.value}) }/>
        <label> Content </label>
        <textarea type="text" value={ input.content } onChange={ e => setInput({...input, content: e.target.value}) }></textarea>
        <button onClick={ create } className="form-submit-g"> Create Post </button>   
      </div>
    </div>
  );
}

export default CreatePost;