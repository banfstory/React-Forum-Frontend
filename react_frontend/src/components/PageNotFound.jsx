import React, {useEffect} from 'react';
import { useHistory } from "react-router-dom";

function PageNotFound() {
	const history = useHistory();

	useEffect(() => {
		document.title = 'Page Not Found';
	}, []);

	function toHomePage() {
		history.push('/');
	}

	return (
		<div id="error_page">
			<div className="container">
				<h1> 404 </h1>
				<h2> Page Not Found </h2>
				<p> Sorry, the page you are looking for does not exist. </p>
				<button onClick={toHomePage}> Return to Homepage </button>
			</div>
		</div>
	);
}

export default PageNotFound;