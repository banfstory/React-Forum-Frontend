import React, {useContext, useState, useRef, useEffect} from 'react';
import { displayFlashMessage } from '../mixin/flashMixin';
import { UserContext, TokenContext } from '../App';
import { FlashContext } from './Layout';
import { getUserImage, defaultImage } from '../mixin/getImage';
import RedirectForbidden from './RedirectForbidden';
import REST_API_URL from '../mixin/default_API_URL';
import { validEmail, validUserSpace, error_class } from '../mixin/validationMixin';
import axios from 'axios';

function Account() {
	const errors_default = { user_exist: false, user_chars_range: false, user_spaces: false, email_invalid: false, file_invalid: false };
  	const { user, setUser } = useContext(UserContext);
	const { token } = useContext(TokenContext);
	const { setFlash, setFlashContent } = useContext(FlashContext);
	const [input, setInput] = useState({ username: user.username, email: user.email });
	const [popup, setPopup] = useState(false);
	const [authorized, setAuthorized] = useState(true);
	const [errors, setErrors] = useState({ ...errors_default });
	const imageRef =  useRef(null);

  useEffect(() => {
	document.title = 'Account';
	if(!token) {
		setAuthorized(false);
	}
  }, []);
  

  if(!authorized) {
	  return <RedirectForbidden/>;
  }

  function update() {
	  	setErrors({ ...errors_default });
		let image = imageRef.current.files[0];
		let username = input.username.trim();
		let email = input.email.trim();
		let validation_error = false;
		if(username.length < 3 || username.length > 25) {
			setErrors(prev => ({...prev, user_chars_range: true}));
			validation_error = true;
		} else if(!validUserSpace(username)) {
			setErrors(prev => ({...prev, user_spaces: true}));
			validation_error = true;
		}
		
		if(!validEmail(email)) {
			setErrors(prev => ({...prev, email_invalid: true}));
			validation_error = true;
		}
		if(!validation_error) {
			if(image) {
				let ext = image.name.split('.').pop(); // the extnesion will be the last period of the filename therefore pop is used
				if(ext != 'jpg' && ext != 'png') {
					setErrors(prev => ({...prev, file_invalid: true}));
					validation_error = true;
				} else {
					let form_data = new FormData();
					form_data.append("file", image);
					axios.post(`${REST_API_URL}update_user_image`, form_data, { headers: { 'Content-Type': 'multipart/form-data', 'x-access-token' : token } }).then(response => {
						setUser({...user, display_picture: response.data.filename});
					});
				}
			}
			if(!validation_error) {
				axios.put(`${REST_API_URL}account`, {'username' : username, 'email' : email}, { headers: { 'x-access-token' : token } }).then(() => {
					setUser({...user, username: username, email: email})
					displayFlashMessage('Account Updated', setFlash, setFlashContent)
				}).catch(err => {
					if(err.response.data.error) {
						setErrors(prev => ({...prev, user_exist: true}));
					}
				});
			}
		}
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

	const username_error =  errors.user_exist ? <div className={error_class}>Username already exist</div> :  
							errors.user_chars_range ? <div className={error_class}>Username must be between 3 and 25 characters long</div> :
							errors.user_spaces ? <div className={error_class}>Username must not contain spaces</div> : '';

	const email_error = errors.email_invalid ? <div className={error_class}>Invalid email address</div> : '';

	const file_error = errors.file_invalid ? <div className={error_class}>File must have the extension .jpg or .png</div> : '';

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
				{ username_error }
				<label> Email </label>
				<input type="text" value={ input.email } onChange={ e => setInput({...input, email: e.target.value}) }/>
				{ email_error }
				<label> Image Upload </label>
				<input type="file" className="image_file" ref={ imageRef }/>
				{ file_error }
				<button onClick={ update } className="form-submit-g"> Update </button>
			</div>
			{toggle_popup}
		</div>
  );
}

export default Account;

