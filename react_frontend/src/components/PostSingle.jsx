import React from 'react';
import { Link } from 'react-router-dom';
import { time_ago } from '../mixin/dateMixin';
import '../styles/postSingle.css';

function PostSingle(props) {
  const post = props.post;
  return (
  <div className="post-item">
    <Link to={`/post/${post.id}`}>
      <div className="item-header flex">
        { props.children[1] }
        <div className="item-header-data">
          { props.children[0] }
          <span className="post-time"> {time_ago(post.date_posted)} </span>
        </div>
      </div>
      <div className="item-body">
        <div> { post.title } </div> 
        <p> { post.content } </p>
        <div> { post.num_of_comments } Comments</div>     
      </div>
    </Link>
  </div>
  );
}

export default PostSingle;