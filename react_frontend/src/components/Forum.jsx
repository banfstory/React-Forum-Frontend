import React, { useState, useEffect, useContext, useReducer } from 'react';
import { UserContext, TokenContext, FollowerContext } from '../App';
import PostSingle from './PostSingle';
import { getUserImage, getForumImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import { normal_date_format } from '../mixin/dateMixin';
import { loadingReducer, forumReducer } from '../mixin/reducerMixin';
import axios from 'axios';
import { displayFlashMessage } from '../mixin/flashMixin';
import { FlashContext } from './Layout';
import '../styles/forum.css';

function Home(props) {
  const [IsLoading, loadDispatch] = useReducer(loadingReducer, true);
  const [forum, forumDispatch] = useReducer(forumReducer, {});
	const [posts, setPosts] = useState([]);
  const [details, setDetails] = useState({});
  const [IsFollowed, setIsFollowed] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const { token } = useContext(TokenContext);
  const { setFollower } = useContext(FollowerContext);
  const [leave, setLeave] = useState('JOINED');
  const { setFlash, setFlashContent } = useContext(FlashContext);
  const query = new URLSearchParams(props.location.search);

  function posts_results() {
    loadDispatch('loading');
    let page = query.get('page') ? query.get('page') : 1;
    let name = props.match.params['name'];
    axios.get(`${REST_API_URL}forum?name=${name}`).then(response => {
      forumDispatch({ type: 'set', state: response.data.forum });
      if(token) {
        axios.get(`${REST_API_URL}user_follower?forum_id=${response.data.forum.id}`, { headers: { 'x-access-token' : token } }).then(response => {
          setIsFollowed(response.data.follow ? true : false);
        });
      }
      return axios.get(`${REST_API_URL}posts?forum_id=${response.data.forum.id}&page=${page}`);
    }).then(response => {
      setPosts(response.data.posts);
      setDetails(response.data.details);
    }).catch(() => {
      console.log('invalid posts');
    }).finally(() => {
			loadDispatch('loaded')
		});
  }

  function follow_forum() {
    axios.post(`${REST_API_URL}user/follow/${forum.id}`, {}, { headers: { 'x-access-token' : token } }).then((response) => {
      forumDispatch({ type: 'increment-followers' });
      setFollower(prev => [...prev, response.data.forum]);
      setUser({...user, forums_followed: user.forums_followed + 1 });
      setIsFollowed(true);
      displayFlashMessage('Forum Followed', setFlash, setFlashContent);
    });
  }

  function unfollow_forum() {
    axios.delete(`${REST_API_URL}user/unfollow/${forum.id}`, { headers: { 'x-access-token' : token } }).then((response) => {
      forumDispatch({ type: 'decrement-followers' });
      setFollower(list => list.filter(item => item.id !== forum.id));
      setUser({...user, forums_followed: user.forums_followed - 1 });
      setIsFollowed(false);
      displayFlashMessage('Forum Unfollowed', setFlash, setFlashContent);
    });
  }

  useEffect(() => {
    posts_results();
  }, [props.match.params.name, query.get('page')]);

	if(!IsLoading) {
		const post_single = posts.map(post => {
			return (
			<PostSingle key={post.id} post={post}>
				<span className="post-header-details">
				  <span>  Posted by  <Link to={`/user-posts/${post.user.username}`}>{ post.user.username }</Link></span>
				</span> 
				<Link to={`/user-posts/${post.user.username}`}><img src={getUserImage(post.user.display_picture)} height="25" width="25"/></Link>
			</PostSingle>
			)
		});

    const pagination = details.paginate.map((page, index) => {
			const pageActive = page == details.page ? 'page-active' : '';
			return (		
				page ? <Link className={pageActive} to={`?page=${page}`} key={index}>{page}</Link> : <span key={index}> ... </span>
			)
		});
    
    const userCreatePost = token ? (
      <div className="forum-create-post flex">
        <img src={getUserImage(user.display_picture)}  height="45" width="45"/> 
        <Link to={`/create-post/${forum.name}`} className="flex"><input placeholder="Create Post"/></Link>
    </div>
    )  : '';

    const forumIsFollowed = !token ?  '' : IsFollowed ? <button onClick={unfollow_forum} onMouseOver={() => setLeave('LEAVE')} onMouseOut={() => setLeave('JOINED')}> {leave} </button> : <button onClick={follow_forum}> JOIN </button>;

    const update_forum = token && user.id == forum.user.id ? <Link to={`/update-forum/${forum.name}`}> UPDATE </Link> : '';

		return (
    <div id="forum">
      <div className="forum-header flex">
        <div className="forum-header-container flex">
          <div className="forum-header-details flex">
            <img src={getForumImage(forum.display_picture)} height="100" width="100"/>
            <div className="forum-data flex">
              <div> { forum.name } </div>
              <div> Forum </div>
            </div>  
          </div>
          <div className="forum-buttons flex">
            {forumIsFollowed}
            {update_forum}
          </div>
        </div>
      </div>
      <div className="forum-content flex">
        <div className="post-container-g">
          <div className="post-content-g">
            {userCreatePost}
            { post_single }
          </div>
          <div className="pagination-bar">
            { pagination }
          </div>
        </div>
        <div className="forum-side-g">
          <div className="forum-side-container-g">     
            <div> ABOUT FORUM </div>
            <div className="side-content-g">
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
            </div>
          </div> 
        </div>  
      </div>
    </div>
		);
	} else {
		return <React.Fragment> Loading </React.Fragment>;
	}
}

export default Home;