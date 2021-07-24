import React, { useState, useEffect, useContext, useReducer} from 'react';
import { useHistory } from "react-router-dom";
import CommentSingle from './CommentSingle';
import { UserContext, TokenContext } from '../App';
import { getForumImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { loadingReducer, forumReducer, postReducer } from '../mixin/reducerMixin';
import { normal_date_format, time_ago } from '../mixin/dateMixin';
import { displayFlashMessage } from '../mixin/flashMixin';
import RedirectPageNotFound from './RedirectPageNotFound';
import { error_class } from '../mixin/validationMixin';
import { FlashContext } from './Layout';
import Loader from './Loader';
import '../styles/post.css';

function Post(props) {
  const errors_default = { content_empty: false, content_chars_exceed: false };
  const [IsLoading, loadDispatch] = useReducer(loadingReducer, true);
  const history = useHistory();
  const [content, setContent] = useState('');
  const [forum, forumDispatch] = useReducer(forumReducer, {});
  const [post, postDispatch] = useReducer(postReducer, {});
  const [comments, setComments] = useState([]);
  const [details, setDetails] = useState({});
  const [exist, setExist] = useState(true);
  const [IsFollowed, setIsFollowed] = useState(false);
  const { user } = useContext(UserContext);
  const { token } = useContext(TokenContext);
  const [popup, setPopup] = useState(false);
  const [componentRefs, setComponentRefs] = useState([]);
  const [componentState, setComponentState] = useState({});
  const [leave, setLeave] = useState('JOINED');
  const { setFlash, setFlashContent } = useContext(FlashContext);
  const [errors, setErrors] = useState({ ...errors_default });
  const query = new URLSearchParams(props.location.search);

  function post_details() {
    let page = query.get('page') ? query.get('page') : 1;
    let id = props.match.params['id'];
    let getPost = axios.get(`${REST_API_URL}post/${id}`);
    let getComment = axios.get(`${REST_API_URL}comments?post_id=${id}&page=${page}`);

    axios.all([getPost, getComment]).then(axios.spread((...response) => {
      const postResponse = response[0];
      postDispatch({ type: 'set', state: postResponse.data.post });
      forumDispatch({ type: 'set', state: postResponse.data.post.forum });
      const commentResponse = response[1];
      setComments(commentResponse.data.comments);
      setDetails(commentResponse.data.details);
      if(token) {
        axios.get(`${REST_API_URL}user_follower?forum_id=${postResponse.data.post.forum.id}`, { headers: { 'x-access-token' : token } }).then(response => {
          setIsFollowed(response.data.follow ? true : false);
        });
      }
    })).catch(() => {
      setExist(false);
    }).finally(() => {
      loadDispatch('loaded');
    });
  }

  function delete_post() {
    axios.delete(`${REST_API_URL}post/${post.id}`, { headers: { 'x-access-token' : token } }).then(() => {
      history.push(`/forum/${forum.name}`);
      displayFlashMessage('Post Deleted', setFlash, setFlashContent);
    });
  }

  function add_comment() {
    let _content = content.trim();
    if(_content.length === 0) {
      setErrors(prev => ({...prev, content_empty: true}));
    } else if(_content.length > 20000) {
      setErrors(prev => ({...prev, content_chars_exceed: true}));
    } else {
      axios.post(`${REST_API_URL}comment`, {'content' : _content, 'post_id' : post.id}, { headers: { 'x-access-token' : token} }).then((response) => {
        postDispatch({ type: 'increment-comments' });
        setContent('');
        let newComments = [response.data.comment, ...comments];
        if(newComments.length > 10) {
          newComments.pop();
        }
        setComments(newComments);
        displayFlashMessage('Commented on Post', setFlash, setFlashContent);
      }).catch(err => {
        console.log(err);
      });
    }
  }

  function delete_comment(user_comment) {
    axios.delete(`${REST_API_URL}comment/${user_comment.id}`, { headers: { 'x-access-token' : token } }).then(() => {
      setComments(list => list.filter(item => item !== user_comment))
      postDispatch({ type: 'decrement-comments' });
      displayFlashMessage('Comment Deleted', setFlash, setFlashContent);
    }).catch(err => {
      console.log(err);
    });
  }

  function follow_forum() {
    axios.post(`${REST_API_URL}user/follow/${forum.id}`, {}, { headers: { 'x-access-token' : token } }).then(() => {
      forumDispatch({ type: 'increment-followers' });
      displayFlashMessage('Forum Followed', setFlash, setFlashContent);
    });
  }

  function unfollow_forum() {
    axios.delete(`${REST_API_URL}user/unfollow/${forum.id}`, { headers: { 'x-access-token' : token } }).then(() => {
      forumDispatch({ type: 'decrement-followers' });
      displayFlashMessage('Unfollowed', setFlash, setFlashContent);
    });
  }

  // determine which item should popup when the vertical dots is clicked
  function processPopup(refsPopup, popupState) {
    const [comp_dotRef] = refsPopup;
    const {comp_setPopup} = popupState;
    if(componentRefs.length === 0) {
      comp_setPopup('show');
      setComponentRefs(refsPopup);
      setComponentState(popupState);
    } else {
      const [curr_dotRef] = componentRefs;
      if(curr_dotRef.current && curr_dotRef.current.contains(comp_dotRef.current)) {
        comp_setPopup('toggle');
      } else {
        comp_setPopup('show'); // open the current popup
        componentState.comp_setPopup('hide'); // close the previous popup
        setComponentRefs(refsPopup);
        setComponentState(popupState);
      }
    }
  }

  // determine if the popup should be hidden
  const toggleDotPopup = (e) => {
    if(componentRefs.length !== 0){
      const [comp_dotRef, comp_popupRef] = componentRefs;
      const {comp_setPopup} = componentState;
      // if you click on the active component's vertical dot functionality or the popup box then skip this
      if(!((comp_dotRef.current && comp_dotRef.current.contains(e.target)) || (comp_popupRef.current && comp_popupRef.current.contains(e.target)))) {
        comp_setPopup('hide');
        setComponentRefs([]);
        setComponentState({});
      }
    }
  }

  useEffect(() => {
    document.title = `Posts: ${forum.name}`;
    post_details();
    document.addEventListener('click', toggleDotPopup);
    return () => {
      document.removeEventListener('click', toggleDotPopup);
    };
  }, [props.match.params.id, query.get('page'), componentState, componentRefs]); // if component state or refs is changed, rerender event

  useEffect(() => {
    document.title = `Posts: ${forum.name}`;
  }, [forum]);

	if(!IsLoading) {
    if(!exist) {
			return <RedirectPageNotFound/>;
		}
		const comment_single = comments.map(comment => {
			return (
        <CommentSingle key={comment.id} comment={comment} delete_comment={delete_comment} processPopup={processPopup}/>
			)
    });
    
    const forumIsFollowed = !token ?  '' : IsFollowed ? <button onClick={unfollow_forum} onMouseOver={() => setLeave('LEAVE')} onMouseOut={() => setLeave('JOINED')}> {leave} </button> : <button onClick={follow_forum}> JOIN </button>;

		const pagination = details.paginate.map((page, index) => {
      const pageActive = page === details.page ? 'page-active' : '';
			return (		
				page ? <Link className={pageActive} to={`?page=${page}`} key={index}>{page}</Link> : <span key={index}> ... </span>
			)
    });

    // popup to delete comment
    const popup_post = (
    <div id="popup-form-g">
      <div className="popup-container-form-g">
        <div> Delete Post </div>
        <div> Are you sure you want to delete this post? </div>
        <div className="pop-up-buttons-form-g">
          <button onClick={ delete_post }> DELETE </button>
          <button onClick={ () => setPopup(false) }> CANCEL </button>
        </div>
      </div>
    </div>
    );
  
    const toggle_popup = popup ? popup_post : '';

    // determine if the user is allowed to update or delete the comment
    const auth_modify_post = token && post.user.id == user.id ? (
      <div className="modify-post flex">                  
        <Link to={`/update-post/${post.id}`}> Update </Link>
        <button onClick={ () => setPopup(true) }> Delete </button>
     </div>
    ) : '';

    const content_error = errors.content_empty ? <div className={error_class}>Content cannot be empty</div> :
                          errors.content_chars_exceed ? <div className={error_class}>Content field must not exceed 20000 characters</div> : '';

    const CommentPostForm = token ? (
      <div className="post-input flex">
        {auth_modify_post}
        {content_error}
        <textarea placeholder="Add a comment" value={content} onChange={ e => setContent(e.target.value) }> </textarea>
        <button onClick={ add_comment }> Comment </button>
      </div>
    ) : '';

		return (
      <div id="forum-post">
        <div className="post-layout">
          <div className="post-main">
            <div className="post-container">
              <div className="post-details">
                <div className="post-header flex">
                  <Link to={`/forum/${forum.name}`}><img src={getForumImage(forum.display_picture)} height="40" width="40"/></Link>                 
                  <div className="post-header-data">
                    <Link to={`/forum/${forum.name}`}>{ forum.name }</Link>     
                    <span>Posted by <Link to={`/user-posts/${ post.user.username }`}>{ post.user.username }</Link> </span> 
                    <span>  {time_ago(post.date_posted)}  </span>
                  </div>
                </div>
                <div className="post-content">
                  <div>  { post.title } </div> 
                  <p>  { post.content}  </p>
                  <div>  { post.num_of_comments } Comments </div>
                </div>
                { CommentPostForm }
              </div>
              <div className="comments-list">
                { comment_single } 
              </div>
            </div>
          </div>
          <div className="pagination-bar">
            { pagination }
          </div>
        </div>
        <div className="forum-side-g">
          <div className="forum-side-container-g"> 
            <div> ABOUT FORUM </div>
            <div className="side-content-g">
              <div className="side-forum-name flex">
                <img src={getForumImage(forum.display_picture)} height="50" width="50"/>
                <span> { forum.name } </span>
              </div>
              <div className="side-about-g"> { forum.about } </div>
              <div className="side-stats-g flex">
                <div>
                  <div> { forum.followers } </div>
                  <div> Followers </div>
                </div>
                <div>
                  <div> { forum.num_of_post }</div>
                  <div> Posts </div>
                </div>
              </div>
              <div className="side-date-g"> Created in {normal_date_format(forum.date_created)} </div>
              { forumIsFollowed }
            </div>
          </div>
        </div>  
       
        {toggle_popup}
      </div>
		);
	} else {
		return <Loader/>;
	}
}

export default Post;