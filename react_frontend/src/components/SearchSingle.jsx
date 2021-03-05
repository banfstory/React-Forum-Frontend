import React from 'react';
import { getForumImage } from '../mixin/getImage';
import { Link } from 'react-router-dom';
import '../styles/searchSingle.css';

function SearchSingle(props) {
  const forum = props.forum;
  return (
    <Link className="search-item flex" to={`/forum/${forum.name}`}>
      <div className="search-details flex">
        <img src={getForumImage(forum.display_picture)} height="35" width="35"/>
        <span> { forum.name } </span>
      </div>
      <div className="search-stats flex">
        <span> { forum.followers } followed </span>
        <span> { forum.num_of_post }  posted </span>
      </div>
    </Link> 
  );
}

export default SearchSingle;