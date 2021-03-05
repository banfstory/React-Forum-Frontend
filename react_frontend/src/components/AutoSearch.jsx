import React from 'react';
import AutoComplete from './AutoComplete'
import '../styles/autoSearch.css';

function Layout(props) {
  const { forums, popupAutoDispatch, popupAuto } = props;

  // loop through forums array and show each potential search result
  const search_results = forums.map(forum => {
    return <AutoComplete forum={forum} popupAutoDispatch={ popupAutoDispatch }/>
  });

  // show all potential search results
  const autocomplete = forums.length > 0 && popupAuto ? (
    <div id="autocomplete">
      { search_results }
    </div> 
  ) : '';

  return autocomplete;
}

export default Layout;
