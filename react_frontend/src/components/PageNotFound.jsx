import React, {useEffect} from 'react';

function PageNotFound() {
	useEffect(() => {
		document.title = 'Page Not Found';
	}, []);

	return (
		<div id="error_page">
			<div className="container">
				<h1> 404 </h1>
				<h2> Page Not Found </h2>
				<p> Sorry, the page you are looking for does not exist. </p>
				<button> Return to Homepage </button>
			</div>
		</div>
	);
}

export default PageNotFound;