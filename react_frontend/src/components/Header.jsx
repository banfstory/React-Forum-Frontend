import React, { useContext, useState, useReducer } from 'react';
import { useHistory } from "react-router-dom";
import AutoSearch from './AutoSearch';
import { getUserImage } from '../mixin/getImage';
import { popupReducer } from '../mixin/reducerMixin';
import { UserContext, TokenContext } from '../App';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/header.css';

export const LayoutContext = React.createContext();

function Layout(props) {
  const { popupDispatch, profileRef } = props;
  const { user } = useContext(UserContext);
  const { token } = useContext(TokenContext);
  const history = useHistory();
  const [search, setSearch] = useState(''); // search bar input
  const [forums, setForums] = useState([]); // search results stored as an array for search bar input
  const [popupAuto, popupAutoDispatch] = useReducer(popupReducer, true); // use to display or hide popup search results
  const passPropAuto = { forums: forums, popupAutoDispatch: popupAutoDispatch, popupAuto: popupAuto };
  // when image is clicked toggle popup user/guest popup navigation
  const displayImage = token ? <img onClick={ () => popupDispatch('toggle') } src={ getUserImage(user.display_picture) } id="profile-pic" ref={ profileRef } height="35" width="35"/> : <img onClick={ () => popupDispatch('toggle')  } src={ getUserImage('default.png') } id="profile-pic" ref={ profileRef } height="35" width="35"/>;

  // call this function when search bar input is selected to show popup search results
  function onFocus(val) {
    if(val.length > 0) {
      popupAutoDispatch('show');
    } 
  }

  // show potential search results for each keystroke
  function auto_complete(val) {
    popupAutoDispatch('hide');
    setSearch(val);
    if(val.trim().length === 0) {
      return;
    }
    axios.get(`${REST_API_URL}autocomplete?query=${val}`).then(response => {
      setForums(response.data.forums);
    }).finally(() => {
      if(val.length > 0) {
        popupAutoDispatch('show');
      }
    });
  }

  // redirect to different link with the search query parameter
  function search_forum() {
    history.push(`/search?q=${search}`);
  }

  // top navigation 
  const header = (
    <header id="header" className="flex">
      <div className="logo">
        <Link to="/">
          <i className="fab fa-forumbee"></i>
          <span>Flask Forum</span>
        </Link>
      </div>
      <div className="search">
        <div className="flex">        
          <input type="text" placeholder="Search" value={search} onChange={ e => auto_complete(e.target.value) } onFocus={(e) => onFocus(e.target.value)} onBlur={ () => popupAutoDispatch('hide') }/>
          <button onClick={ search_forum }> <i className="fas fa-search"></i> </button>
        </div>
        <AutoSearch {...passPropAuto}/>
      </div>
      <div className="profile-nav">{ displayImage }</div>
    </header>
  );

  return header;
}

export default Layout;
