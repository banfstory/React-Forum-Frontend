# React-Forum-Frontend

The Single Page Application (SPA) website allows users to create their own forums which gives a place for other users to create post which is built using React for the frontend and Flask for the REST API backend which ensures quicker load times as only certain components of the page is updated.

For this website, it is required that two local servers are running at the same time, one will be used for the Restful Flask API and the other will be used for React frontend.

FLASK RESTFUL API INSTRUCTIONS: To run the Flask API, it needs to run on a local server and it will be running the application from a virtual environment so that all packages will be already pre-installed within the whole folder itself.

To run the virtual environment do the following (instructions for windows OS only), start with going into command prompt:

1. Go to the 'flask_api_env' folder
2. Enter 'venv\Scripts\activate' to activate the virtual environment
3. Go to the following path: flask_api_env (folder) > flask_api (folder)
4. Enter 'python run.py' to run the local server

If you want to change the port number for the localhost, go to the following path: flask_api_env (folder) > flask_api (folder) > run.py . Look for the code 'app.run(debug=True, port=5000)' on line 14 and change the 'port' parameter (localhost uses port number 5000 by default) WARNING: If you change the port number for the FLASK API port number, you will also need to change the api http request url with a different port number in order for the react frontend to call the correct API server. To change this, go to the path: react_frontend (folder) > src (folder) > mixin (folder) > default_API_URL.js. Look for the code 'const REST_API_URL = 'http://127.0.0.1:5000/api/' on line 1 and change the url's port to reflect the changes made in the port for the API server.

REACT FRONTEND INSTRUCTIONS: To run the local server of the React website do the following (instructions for windows OS only), start with going into command prompt:

1. Go to the 'react_frontend' folder
2. Enter 'npm install' to install all the modules within this folder (check if the folder 'node_modules' exist within the 'react_frontend' folder)
3. Enter 'npm start' which will run on port 3000 by default
