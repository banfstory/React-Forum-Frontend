import React, {useContext, useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { TokenContext } from '../App';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';

function CreateForum() {
  const history = useHistory();
  const { token, setToken } = useContext(TokenContext);
  const [input, setInput] = useState({ name: '', about: '' });
  const { setFlash, setFlashContent } = useContext(FlashContext);

  useEffect(() => {
		if(!token) {
      history.push('/');
		}
  }, []);

  function create() {
    let name = input.name.trim();
    let about = input.about.trim();
    axios.post(`${REST_API_URL}forum`, {'name' : name, 'about' : about}, { headers: { 'x-access-token' : token } }).then(() => {
      history.push(`/forum/${name}`);
      displayFlashMessage('Forum Created', setFlash, setFlashContent);
    }).catch(err => {
      if(err) {
        console.log(err);
      }
    })
	}
	
  return (
    <div id="form-layout-g">
      <div className="form-container-g">
        <h2> Create Forum </h2>
        <label> Name </label>
        <input type="text" value={ input.name } onChange={ e => setInput({...input, name: e.target.value}) }/>
        <label> About </label>
        <textarea type="text" value={input.about} onChange={ e => setInput({...input, about: e.target.value}) }></textarea>
        <button onClick={ create } className="form-submit-g"> Create Forum </button>
      </div>
    </div>
  );
}

export default CreateForum;