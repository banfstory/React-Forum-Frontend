import React from 'react';
import { getForumImage } from '../mixin/getImage';
import { Link } from 'react-router-dom';
import { useHistory } from "react-router-dom";
import '../styles/autoComplete.css';

function AutoComplete(props) {
  const {forum, popupAutoDispatch} = props;
  const history = useHistory();

  function hideSearch(e) {
    history.push(`/forum/${forum.name}`);
    popupAutoDispatch('hide');
  }
  
  return (
    <Link onMouseDown={ e => hideSearch(e) } className="search-item flex">
      <img src={ getForumImage(forum.display_picture) } height="30" width="30"/>				
      <div className="search-content flex">
        <span>  {forum.name} </span>
        <div className="search-stats">
          <span> {forum.followers} followed </span>
          <span> {forum.num_of_post} posted </span>
        </div>
      </div>
    </Link>
  );
}

export default AutoComplete;