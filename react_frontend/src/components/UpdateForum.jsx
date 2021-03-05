import React, {useContext, useState, useRef, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { TokenContext } from '../App';
import { getForumImage, defaultImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';

function ForumUpdate(props) {
  const history = useHistory();
  const { token, setToken } = useContext(TokenContext);
  const [input, setInput] = useState({ about: '' });
  const [forum, setForum] = useState({});
  const [popup, setPopup] = useState(false);
  const imageRef =  useRef(null);
  const { setFlash, setFlashContent } = useContext(FlashContext);

  function update() {
		let image = imageRef.current.files[0];
		if(image) {
			let form_data = new FormData();
			form_data.append("file", image);
			axios.post(`${REST_API_URL}update_forum_image/${forum.id}`, form_data, { headers: { 'Content-Type': 'multipart/form-data', 'x-access-token' : token } }).then(response => {
				setForum({...forum, display_picture: response.data.filename});
			});
		}
    let about = input.about.trim();
    axios.put(`${REST_API_URL}forum/${forum.id}`, {'about' : about}, { headers: { 'x-access-token' : token } }).then(() => {
      setForum({...forum, about: about});
      displayFlashMessage('Forum Updated', setFlash, setFlashContent);
    }).catch(err => {
			if(err) {
				console.log(err);
			}
		});
	}
	
	function remove_image() {
		axios.delete(`${REST_API_URL}remove_forum_picture/${forum.id}`, { headers: { 'x-access-token' : token } }).then(() => {
      setForum({...forum, display_picture: 'default.png'});
      displayFlashMessage('Forum Image Removed', setFlash, setFlashContent);
      setPopup(false);
		});
  }

  function forum_details() {
    let name = props.match.params['name'];
    axios.get(`${REST_API_URL}forum?name=${name}`).then(response => {
      input.about = response.data.forum.about;
      setForum(response.data.forum);
    }).catch((err) => {
       console.log(err);
    });   
  }

  useEffect(() => {
    if(!token) {
      history.push('/');
		}
    forum_details();
  }, []);

  
	const popup_form = (
    <div id="popup-form-g">
      <div className="popup-container-form-g">
      <div> Remove Forum Image </div>
            <div> Are you sure you want to remove this image? </div>
        <div className="pop-up-buttons-form-g">
          <button onClick={ remove_image }> REMOVE </button>
          <button onClick={ () => setPopup(false) }> CANCEL </button>
        </div>
      </div>
    </div>
  );

  const toggle_popup = popup ? popup_form : '';
  
  const RemoveImage = forum.display_picture != defaultImage  ? (
		<button className="remove-picture" onClick={ () => setPopup(true)}> Remove Forum Picture </button>
	) : '';

  return (
    <div id="form-layout-g">
      <div className="form-container-g">
        <div className="form-details flex">
          <img src={getForumImage(forum.display_picture)} height="125" width="125"/>
          <div>
            <div>  {forum.name } </div>
            <div> Forum </div>
          </div>
        </div>
        { RemoveImage }
        <h2> Update Forum </h2>
        <label> About </label>
        <textarea type="text" value={input.about} onChange={ e => setInput({...input, about: e.target.value}) }> </textarea>
        <label> Image Upload </label>
        <input type="file" name="image_file" ref={ imageRef }/>
        <button onClick={ update } className="form-submit-g"> Update </button>
      </div>
      {toggle_popup}
    </div>
  );
}

export default ForumUpdate;