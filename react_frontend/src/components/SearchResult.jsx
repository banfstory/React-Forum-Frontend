import React, { useState, useEffect } from 'react';
import SearchSingle from './SearchSingle';
import REST_API_URL from '../mixin/default_API_URL';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/searchResult.css';

function Home(props) {
	const [isLoading, setLoading] = useState(true);
	const [forums, setForums] = useState([]);
  const [details, setDetails] = useState({});
  const query = new URLSearchParams(props.location.search);

  function search_results() {
    let q = query.get('q');
    let page = query.get('page') ? query.get('page') : 1;
    axios.get(`${REST_API_URL}forums?query=${q}&page=${page}`).then(response => {
      setForums(response.data.forums);
      setDetails(response.data.details);
      setLoading(false);
    });
  }

  useEffect(() => {
    search_results();
  }, [query.get('q'), query.get('page')]);

	if(!isLoading) {
		const search_single = forums.map(forum => {
			return (
			  <SearchSingle key={forum.id} forum={forum}/>
			);
		});

		const pagination = details.paginate.map((page, index) => {
      const pageActive = page == details.page ? 'page-active' : '';
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
		return <React.Fragment> Loading </React.Fragment>;
	}
}

export default Home;