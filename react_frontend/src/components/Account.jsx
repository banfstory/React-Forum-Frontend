import React, {useContext, useState, useRef, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import { displayFlashMessage } from '../mixin/flashMixin';
import { UserContext, TokenContext } from '../App';
import { FlashContext } from './Layout';
import { getUserImage, defaultImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import axios from 'axios';

function Account() {
	const history = useHistory();
  const { user, setUser } = useContext(UserContext);
	const { token, setToken } = useContext(TokenContext);
	const { setFlash, setFlashContent } = useContext(FlashContext);
	const [input, setInput] = useState({ username: user.username, email: user.email });
	const [popup, setPopup] = useState(false);
	const imageRef =  useRef(null);

  useEffect(() => {
		if(!token) {
      history.push('/');
		}
  }, []);

  function update() {
		let image = imageRef.current.files[0];
		if(image) {
			let form_data = new FormData();
			form_data.append("file", image);
			axios.post(`${REST_API_URL}update_user_image`, form_data, { headers: { 'Content-Type': 'multipart/form-data', 'x-access-token' : token } }).then(response => {
				setUser({...user, display_picture: response.data.filename});
			});
		}
		let username = input.username.trim();
		let email = input.email.trim();
		axios.put(`${REST_API_URL}account`, {'username' : username, 'email' : email}, { headers: { 'x-access-token' : token } }).then(() => {
			setUser({...user, username: username, email: email})
			displayFlashMessage('Account Updated', setFlash, setFlashContent)
		}).catch(err => {
			if(err) {
				console.log(err);
			}
		});
	}
	
	function remove_image() {
		axios.delete(`${REST_API_URL}remove_user_picture`, { headers: { 'x-access-token' : token } }).then(() => {
			setUser({...user, display_picture: 'default.png'});
			displayFlashMessage('User Image Removed', setFlash, setFlashContent);
			setPopup(false);
		});
	}

	const popup_form = (
		<div id="popup-form-g">
			<div className="popup-container-form-g">
				<div> Remove User Account Image </div>
				<div> Are you sure you want to remove this image? </div>
				<div className="pop-up-buttons-form-g">
					<button onClick={ remove_image }> REMOVE </button>
					<button onClick={ () => setPopup(false) }> CANCEL </button>
				</div>
			</div>
		</div>
	);

	const toggle_popup = popup ? popup_form : '';

	const RemoveImage = user.display_picture != defaultImage  ? (
		<button className="remove-picture" onClick={ () => setPopup(true)}> Remove Profile Picture </button>
	) : '';

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
				{ RemoveImage }
				<h2> Update Account </h2>
				<label> Username </label>
				<input type="text" value={ input.username } onChange={ e => setInput({...input, username: e.target.value}) }/>
				<label> Email </label>
				<input type="text" value={ input.email } onChange={ e => setInput({...input, email: e.target.value}) }/>
				<label> Image Upload </label>
				<input type="file" className="image_file" ref={ imageRef }/>
				<button onClick={ update } className="form-submit-g"> Update </button>
			</div>
			{toggle_popup}
		</div>
  );
}

export default Account;

