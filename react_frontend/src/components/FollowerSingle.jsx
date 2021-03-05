import React from 'react';
import { getForumImage } from '../mixin/getImage';
import { Link } from 'react-router-dom';
import '../styles/followerSingle.css'; 

function FollowerSingle(props) {
  const follow = props.follow;
  return (
    <Link to={ `/forum/${follow.name}` } className="follow-single flex">
      <img src={ getForumImage(follow.display_picture) } height="35" width="35"/>
      <span> { follow.name } </span>
    </Link>
  );
}

export default FollowerSingle;