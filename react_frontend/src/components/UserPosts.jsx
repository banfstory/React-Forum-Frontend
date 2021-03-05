import React, { useState, useEffect, useReducer } from 'react';
import PostSingle from './PostSingle';
import { getUserImage, getForumImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import { loadingReducer } from '../mixin/reducerMixin';
import axios from 'axios';
import '../styles/userPost.css';

function UserPost(props) {
	const [IsLoading, loadDispatch] = useReducer(loadingReducer, true);
	const [owner, setOwner] = useState({});
	const [posts, setPosts] = useState([]);
	const [details, setDetails] = useState({});
	const query = new URLSearchParams(props.location.search);

  function posts_results() {
		loadDispatch('loading');
		let page = query.get('page') ? query.get('page') : 1;
		let username = props.match.params['username'];

		axios.get(`${REST_API_URL}user?username=${username}`).then(response => {
			setOwner(response.data.user);
			return axios.get(`${REST_API_URL}posts?user_id=${response.data.user.id}&page=${page}`);
		}).then(response => {
			setPosts(response.data.posts);
			setDetails(response.data.details);
		}).catch(() => {
			console.log('invalid posts');
		}).finally(() => {
			loadDispatch('loaded');
		});
  }

  useEffect(() => {
		posts_results();
  }, [props.match.params.username, query.get('page')]);

	if(!IsLoading) {
		const post_single = posts.map(post => {
			return (
			<PostSingle key={post.id} post={post}>
				<span className="post-header-details">
					<Link to={`/forum/${post.forum.name}`}>{ post.forum.name }</Link>
				</span> 
				<Link to={`/forum/${post.forum.name}`}><img src={getForumImage(post.forum.display_picture)} height="25" width="25"/></Link>
			</PostSingle>
			)
		});

		const pagination = details.paginate.map((page, index) => {
			const pageActive = page == details.page ? 'page-active' : '';
			return (		
				page ? <Link className={pageActive} to={`?page=${page}`} key={index}>{page}</Link> : <span key={index}> ... </span>
			)
		});

		return (
			<div id="user-posts">
				<div className="user-header flex">
					<div className="user-header-container flex">
						<img src={ getUserImage(owner.display_picture) } height="100" width="100"/>
						<div className="user-data flex">
							<span>{owner.username}</span>
							<span> User </span>
						</div>  
					</div>
				</div>
				<div className="post-layout-g">
					<div className="post-container-g">
						<div className="post-content-g">
							<h2> USER POSTS (total of { details.total_posts } posts) </h2>
							{ post_single }
						</div>
						<div className="pagination-bar">
							{pagination}
						</div>
					</div>
				</div>
			</div>		
		);
	} else {
		return <React.Fragment> Loading... </React.Fragment>;
	}
}

export default UserPost;