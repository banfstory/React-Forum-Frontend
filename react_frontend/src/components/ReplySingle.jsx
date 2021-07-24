import React, { useState, useContext, useRef, useReducer } from 'react';
import { UserContext, TokenContext } from '../App';
import { getUserImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { popupReducer } from '../mixin/reducerMixin';
import { time_ago } from '../mixin/dateMixin';
import { displayFlashMessage } from '../mixin/flashMixin';
import { error_class } from '../mixin/validationMixin';
import { FlashContext } from './Layout';
import '../styles/replySingle.css';

function ReplySingle(props) {
  const errors_default = { content_empty: false, content_chars_exceed: false };
  const tripleDotRef =  useRef(null);
  const popupRef =  useRef(null);
  const delete_reply = props.delete_reply;
  const [reply, setReply] = useState(props.reply);
  const { token } = useContext(TokenContext);
  const { user } = useContext(UserContext);
  const [popup, popupDispatch] = useReducer(popupReducer, false);
  const [display_reply, displayReplyDispatch] = useReducer(popupReducer, false);
  const [toggleDot, toggleDotDispatch] = useReducer(popupReducer, false);
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({ ...errors_default });
  const { setFlash, setFlashContent } = useContext(FlashContext);
  const processPopup = props.processPopup;

  function update_reply() {
    let _content = content.trim();
    if(_content.length === 0) {
      setErrors(prev => ({...prev, content_empty: true}));
    } else if(_content.length > 20000) {
      setErrors(prev => ({...prev, content_chars_exceed: true}));
    } else {
      axios.put(`${REST_API_URL}reply/${reply.id}`, { 'content' : _content }, { headers: { 'x-access-token' : token } }).then(() => {
        reply.content = _content; // this will ensure the object reference remain the same so its possible to delete it indirectly
        setReply(reply);
        setContent('');
        displayReplyDispatch('hide');
        displayFlashMessage('Reply Updated', setFlash, setFlashContent);
      });
    }
  }

  function show_update_reply() {
    displayReplyDispatch('show');
    setContent(reply.content);
    popupDispatch('hide');
  }

  function toggle_vert_dot(e) {
    e.stopPropagation();
    const refsPopup = [tripleDotRef, popupRef]; // get access to these dom items to determine action
    const popupState = {comp_popup: popup, comp_setPopup: popupDispatch}; // toggle popup of this component popup
    processPopup(refsPopup, popupState);
  }

  const vertical_dot = toggleDot ? <div onClick={toggle_vert_dot} className="vertical-dots" ref={tripleDotRef}></div> : '';

  
  const auth_dot_popup = token && reply.user.id === user.id ? (
    <React.Fragment>
      <div onClick={show_update_reply} className="flex"> <i className="far fa-edit"> </i> <span> Update </span> </div>
      <div onClick={() => {delete_reply(reply); popupDispatch('hide')}} className="flex"> <i className="fas fa-trash-alt"> </i> <span> Delete </span> </div>
      <div onClick={() => popupDispatch('hide')} className="flex"> <i className="fas fa-flag"> </i> <span> Report </span>  </div>
    </React.Fragment>
  ) : <div onClick={() => popupDispatch('hide')} className="flex"> <i className="fas fa-flag"> </i> <span> Report </span>  </div>;

  const popup_reply = (
    <React.Fragment>
      {auth_dot_popup}
    </React.Fragment>
  );
  
  const toggle_popup = popup ? popup_reply : '';
  
  const content_error = errors.content_empty ? <div className={error_class}>Content cannot be empty</div> :
                        errors.content_chars_exceed ? <div className={error_class}>Content field must not exceed 20000 characters</div> : '';

  const reply_form = (
    <div className="comment-reply-popup-g">
      {content_error}
      <textarea placeholder="Update reply" value={content} onChange={ e => setContent(e.target.value) }/>
      <div className="reply-comment-buttons-g">
        <button onClick={update_reply}> Update </button>
        <button onClick={() => displayReplyDispatch('hide')}> Cancel </button>
      </div>
    </div>
  );

  const toggle_reply_form = display_reply ? reply_form : '';

  return (
    <div className="reply-item" onMouseOver={() => toggleDotDispatch('show')} onMouseLeave={() => toggleDotDispatch('hide')}>
      <div className="reply-details">
        <div className="reply-header-container flex">
          <div className="reply-header flex">
            <Link to={`/user-posts/${reply.user.username}`}> <img src={getUserImage(reply.user.display_picture)} height="30" width="30"/></Link>       
            <div className="reply-header-data">
              <span>  Replied by  <Link to={`/user-posts/${reply.user.username}`}>{ reply.user.username }</Link></span> 
              <span>  {time_ago(reply.date_reply)}   </span>  
            </div>
          </div>
          {vertical_dot}
        </div>
        <p> { reply.content } </p> 
      </div>
      {toggle_reply_form}
      <div className="dot-popup reply-tool" ref={popupRef}>
        { toggle_popup }
      </div>
    </div>
  );
}

export default ReplySingle;