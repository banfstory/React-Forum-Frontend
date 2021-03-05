import React, { useState, useEffect, useContext, useRef, useReducer } from 'react';
import { UserContext, TokenContext } from '../App';
import ReplySingle from './ReplySingle';
import { getUserImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { loadingReducer, popupReducer, commentReducer } from '../mixin/reducerMixin';
import { time_ago } from '../mixin/dateMixin';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';
import '../styles/commentSingle.css';

function CommentSingle(props) {
  const tripleDotRef =  useRef(null);
  const popupRef =  useRef(null);
  const [IsLoading, loadDispatch] = useReducer(loadingReducer, true);
  const delete_comment = props.delete_comment;
  const { token } = useContext(TokenContext);
  const { user } = useContext(UserContext);
  const [comment, commentDispatch] = useReducer(commentReducer, props.comment);
  const [input, setInput] = useState({reply: '', comment: ''});
  const [popup, popupDispatch] = useReducer(popupReducer, false);
  const [display_reply, displayReplyDispatch] = useReducer(popupReducer, false);
  const [display_comment, displayCommentDispatch] = useReducer(popupReducer, false);
  const [display_reply_results, replyResultsDispatch] = useReducer(popupReducer, false);
  const [toggleDot, toggleDotDispatch] = useReducer(popupReducer, false);
  const [replys, setReplys] = useState([]);
  const { setFlash, setFlashContent } = useContext(FlashContext);
  const processPopup = props.processPopup;

  function replys_result() {
    loadDispatch('loading');
    axios.get(`${REST_API_URL}replys?comment_id=${comment.id}`).then(response => {
      setReplys(response.data.replys);
      loadDispatch('loaded');
    });  
  }

  function update_comment() {
    let content = input.comment.trim();
    axios.put(`${REST_API_URL}comment/${comment.id}`, { 'content' : content }, { headers: { 'x-access-token' : token } }).then(() => {
      // this will ensure the object reference remain the same so its possible to delete it indirectly
      commentDispatch({ type: 'update-content', content: content })
      setInput({...input, comment: ''});
      displayCommentDispatch('hide');
      displayFlashMessage('Comment Updated', setFlash, setFlashContent);
    });
  }

  function add_reply() {
    let content = input.reply.trim();
    console.log(content);
    axios.post(`${REST_API_URL}reply`, { 'content' : content, 'comment_id' : comment.id }, { headers: { 'x-access-token' : token } }).then((response) => {
      commentDispatch({ type: 'increment-replys' });
      setInput({...input, reply: ''});
      let newReplys = [response.data.reply, ...replys];
      setReplys(newReplys);
      displayReplyDispatch('hide');
      displayFlashMessage('Comment Replied', setFlash, setFlashContent);
    }).catch(err => {
      console.log(err);
    });
  }

  function delete_reply(user_reply) {
    axios.delete(`${REST_API_URL}reply/${user_reply.id}`, { headers: { 'x-access-token' : token } }).then(() => {
      setReplys(list => list.filter(item => item !== user_reply));
      commentDispatch({ type: 'decrement-replys' });
      displayFlashMessage('Reply Deleted', setFlash, setFlashContent);
    }).catch(err => {
      console.log(err);
    });
  }
  
  function show_update_comment() {
    displayCommentDispatch('show');
    setInput({...input, comment: comment.content});
    popupDispatch('hide');
  }

  useEffect(() => {
    replys_result();
  }, []);

  const auth_dot_popup = token && comment.user.id == user.id ? (
    <React.Fragment>
      <div onClick={show_update_comment} className="flex"> <i className="far fa-edit"> </i> <span> Update </span> </div>
      <div onClick={ () => { delete_comment(comment); popupDispatch('hide'); }} className="flex"> <i className="fas fa-trash-alt"> </i> <span> Delete </span> </div>
      <div onClick={ () => popupDispatch('hide') } className="flex"> <i className="fas fa-flag"> </i> <span> Report </span>  </div>
    </React.Fragment>
  ) : <div onClick={ () => popupDispatch('hide') } className="flex"> <i className="fas fa-flag"> </i> <span> Report </span>  </div>;

  const popup_comment = (
    <React.Fragment>
      {auth_dot_popup}
    </React.Fragment>
  );
  
  const toggle_popup = popup ? popup_comment : '';

  const reply_form = (
    <div className="comment-reply-popup-g">
      <textarea placeholder="Add a reply" value={input.reply} onChange={e => setInput({...input, reply: e.target.value})}></textarea>
      <div className="reply-comment-buttons-g">
        <button onClick={add_reply}> Reply </button>
        <button onClick={() => displayReplyDispatch('hide')}> Cancel </button>
      </div>
    </div>
  );

  const toggle_reply_form = display_reply ? reply_form : '';

  const toggleDisplayReply = (
    display_reply_results ? <div onClick={() => replyResultsDispatch('hide') } className="reply-display"> Hide {comment.num_of_reply} replies </div>
    :  <div onClick={() => replyResultsDispatch('show')} className="reply-display"> Show {comment.num_of_reply} replies </div>
  );

  const comment_form = (
    <div className="comment-reply-popup-g">
      <textarea placeholder="Update comment" value={input.comment} onChange={e => setInput({...input, comment: e.target.value})}> </textarea>
      <div className="reply-comment-buttons-g">
        <button onClick={update_comment}> Update </button>
        <button onClick={() => displayCommentDispatch('hide')}> Cancel </button>
      </div>
    </div>
  );

  const toggle_comment_form = display_comment ? comment_form : '';

  function toggle_vert_dot(e) {
    e.stopPropagation();
    const refsPopup = [tripleDotRef, popupRef]; // get access to these dom items to determine action
    const popupState = {comp_popup: popup, comp_setPopup: popupDispatch}; // toggle popup of this component popup
    processPopup(refsPopup, popupState);
  }

  const vertical_dot = toggleDot ? <div className="vertical-dots" onClick={toggle_vert_dot} ref={tripleDotRef}> </div> : '';

	if(!IsLoading) {
		const reply_single = display_reply_results ? replys.map(reply => {
			return (
        <ReplySingle key={reply.id} reply={reply} delete_reply={delete_reply} processPopup={props.processPopup}/>
			) 
    }) : '';

		return (
    <div className="comment-item">
      <div className="comment-details flex" onMouseOver={() => toggleDotDispatch('show')} onMouseLeave={() => toggleDotDispatch('hide')} >
          <div className="comment-header-container flex">
            <div className="comment-header flex">
              <Link to={`/user-posts/${comment.user.username}`}><img src={getUserImage(comment.user.display_picture)} height="40" width="40"/></Link>                
              <div className="comment-header-data">
                <span>  Commented by  <Link to={`/user-posts/${comment.user.username}`}>{comment.user.username} </Link> </span> 
                <span> {time_ago(comment.date_commented)}  </span>
              </div>
            </div>
            {vertical_dot}
          </div>
          <p> {comment.content} </p>
      </div>
      <div className="comment-footer">
        <div onClick={() => displayReplyDispatch('show')}> REPLY </div>
        {toggle_reply_form}
        {toggle_comment_form}
      </div>
      { toggleDisplayReply }
      <div className="replys-list">
        { reply_single }
      </div>
      <div className="dot-popup comment-tool" ref={popupRef}>
        {toggle_popup}
      </div>
    </div>
		);
	} else {
		return <React.Fragment> Loading </React.Fragment>;
	}
}

export default CommentSingle;