import React, {useContext, useState, useRef, useEffect} from 'react';
import { TokenContext, UserContext } from '../App';
import { getForumImage, defaultImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import RedirectPageNotFound from './RedirectPageNotFound';
import RedirectForbidden from './RedirectForbidden';
import { error_class } from '../mixin/validationMixin';
import { FlashContext } from './Layout';

function ForumUpdate(props) {
  const errors_default = { about_chars_exceed: false, file_invalid: false };
  const { user } = useContext(UserContext);
  const { token } = useContext(TokenContext);
  const [input, setInput] = useState({ about: '' });
  const [forum, setForum] = useState({});
  const [popup, setPopup] = useState(false);
  const imageRef =  useRef(null);
  const [exist, setExist] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [errors, setErrors] = useState({ ...errors_default });
  const { setFlash, setFlashContent } = useContext(FlashContext);

  function forum_details() {
    let name = props.match.params['name'];
    axios.get(`${REST_API_URL}forum?name=${name}`).then(response => {
      input.about = response.data.forum.about;
      setForum(response.data.forum);
      if(response.data.forum.user.id !== user.id) {
        setAuthorized(false);
      }
    }).catch(() => {
      setExist(false);
    });   
  }

  useEffect(() => {
    document.title = `Update Forum: ${props.match.params['name']}`;
    if(!token) {
      setAuthorized(false);
		}
    forum_details();
  }, []);

  if(!authorized) {
	  return <RedirectForbidden/>;
  }

  function update() {
    setErrors({ ...errors_default });
		let image = imageRef.current.files[0];
    let about = input.about.trim();

    if(about.length > 30000) {
      setErrors(prev => ({...prev, about_chars_exceed: true}));
    } else {
      let validation_error = false;
      if(image) {
        let ext = image.name.split('.').pop(); // the extnesion will be the last period of the filename therefore pop is used
        if(ext !== 'jpg' && ext !== 'png') {
          setErrors(prev => ({...prev, file_invalid: true}));
          validation_error = true;
        } else {
          let form_data = new FormData();
          form_data.append("file", image);
          axios.post(`${REST_API_URL}update_forum_image/${forum.id}`, form_data, { headers: { 'Content-Type': 'multipart/form-data', 'x-access-token' : token } }).then(response => {
            setForum({...forum, display_picture: response.data.filename});
          });
        }
      }
      if(!validation_error) {
        axios.put(`${REST_API_URL}forum/${forum.id}`, {'about' : about}, { headers: { 'x-access-token' : token } }).then(() => {
          setForum({...forum, about: about});
          displayFlashMessage('Forum Updated', setFlash, setFlashContent);
        });
      }
    }
	}
	
	function remove_image() {
		axios.delete(`${REST_API_URL}remove_forum_picture/${forum.id}`, { headers: { 'x-access-token' : token } }).then(() => {
      setForum({...forum, display_picture: 'default.png'});
      displayFlashMessage('Forum Image Removed', setFlash, setFlashContent);
      setPopup(false);
		});
  }
  
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

  if(!exist) {
    return <RedirectPageNotFound/>;
  }

  const about_error = errors.about_chars_exceed ? <div className={error_class}>About field must not exceed 30000 characters</div> : '';

	const file_error = errors.file_invalid ? <div className={error_class}>File must have the extension .jpg or .png</div> : '';

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
        {about_error}
        <label> Image Upload </label>
        {file_error}
        <input type="file" name="image_file" ref={ imageRef }/>
        <button onClick={ update } className="form-submit-g"> Update </button>
      </div>
      {toggle_popup}
    </div>
  );
}

export default ForumUpdate;