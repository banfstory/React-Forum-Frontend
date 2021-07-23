import React, {useEffect} from 'react';
import  { Redirect } from 'react-router-dom'

function Forbidden() {
    useEffect(() => {
		document.title = 'Forbidden';
	}, []);

	function toHomePage() {
		<Redirect to='/'/>
	}

    return (
        <div id="error_page">
            <div className="container">
                <h1> 403 </h1>
                <h2> Forbidden </h2>
                <p> You don't have permission to access this page. </p>
                <button onClick={toHomePage}> Return to Homepage </button>
            </div>
        </div>
    );
}
  
export default Forbidden;