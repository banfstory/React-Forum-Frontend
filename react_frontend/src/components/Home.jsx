import React, { useState, useEffect, useReducer } from 'react';
import PostSingle from './PostSingle';
import { getForumImage } from '../mixin/getImage';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import { loadingReducer } from '../mixin/reducerMixin';
import RedirectPageNotFound from './RedirectPageNotFound';
import Loader from './Loader';
import axios from 'axios';
import '../styles/home.css';

function Home(props) {
	const [IsLoading, loadDispatch] = useReducer(loadingReducer, true);
	const [posts, setPosts] = useState([]);
	const [exist, setExist] = useState(true);
	const [details, setDetails] = useState({});
	const query = new URLSearchParams(props.location.search);

  function posts_results() {
		loadDispatch('loading');
    let page = query.get('page') ? query.get('page') : 1;
    axios.get(`${REST_API_URL}posts?page=${page}`).then(response => {
		setPosts(response.data.posts);
		setDetails(response.data.details);
    }).catch(() => {
      setExist(false);
    }).finally(() => {
		loadDispatch('loaded');
	})
  }

  useEffect(() => {
	document.title = 'Flask Forum';
    posts_results();
  }, [query.get('page')]);

	if(!IsLoading) {
		if(!exist) {
			return <RedirectPageNotFound/>;
		}
		const post_single = posts.map(post => {
			return (
			<PostSingle key={post.id} post={post}>
				<span className="post-header-details">
					<Link to={`/forum/${post.forum.name}`}>{ post.forum.name }</Link>
					<span>  Posted by  <Link to={`/user-posts/${post.user.username}`}>{ post.user.username }</Link></span>
				</span> 
				<Link to={`/forum/${post.forum.name}`}><img src={getForumImage(post.forum.display_picture)} height="25" width="25"/></Link>
			</PostSingle>
			);
		});

		const pagination = details.paginate.map((page, index) => {
			const pageActive = page == details.page ? 'page-active' : '';
			return (		
				page ? <Link className={pageActive} to={`?page=${page}`} key={index}>{page}</Link> : <span key={index}> ... </span>
			);
		});

		return (
			<div id="home">
				<div className="post-layout-g">
					<div className="post-container-g">
						<div className="post-content-g">
							<h1> RECENT POSTS </h1>
							{ post_single }
						</div>
						<div className="pagination-bar">
							{ pagination }
						</div>
					</div>
				</div>
			</div>
		);
	} else {
		return <Loader/>;
	}
}

export default Home;