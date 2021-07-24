import React, { useState, useEffect, useReducer } from 'react';
import SearchSingle from './SearchSingle';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import { loadingReducer } from '../mixin/reducerMixin';
import RedirectPageNotFound from './RedirectPageNotFound';
import Loader from './Loader';
import axios from 'axios';
import '../styles/searchResult.css';

function Home(props) {
	const [IsLoading, loadDispatch] = useReducer(loadingReducer, true);
	const [forums, setForums] = useState([]);
  const [details, setDetails] = useState({});
  const [exist, setExist] = useState(true);
  const query = new URLSearchParams(props.location.search);

  function search_results() {
    let q = query.get('q');
    let page = query.get('page') ? query.get('page') : 1;
    axios.get(`${REST_API_URL}forums?query=${q}&page=${page}`).then(response => {
      setForums(response.data.forums);
      setDetails(response.data.details);
    }).catch(() => {
      setExist(false);
    }).finally(() => {
      loadDispatch('loaded');
    });
  }

  useEffect(() => {
    document.title = `Search Results: ${query.get('q')}`;
    search_results();
  }, [query.get('q'), query.get('page')]);

	if(!IsLoading) {
    if(!exist) {
			return <RedirectPageNotFound/>;
		}
		const search_single = forums.map(forum => {
			return (
			  <SearchSingle key={forum.id} forum={forum}/>
			);
		});

		const pagination = details.paginate.map((page, index) => {
      const pageActive = page === details.page ? 'page-active' : '';
			return (		
				page ? <Link className={pageActive} to={`?q=${query.get('q')}&page=${page}`} key={index}>{page}</Link> : <span key={index}> ... </span>
			);
    });

		return (
      <div id="search-result">
        <div className="search-container">
          <div className="search-content">
            <h2> Search results for '{query.get('q')}': </h2>
            {search_single}
          </div>
          <div className="pagination-bar">
            {pagination}
          </div>
        </div>
      </div>
		);
	} else {
		return <Loader/>;
	}
}

export default Home;