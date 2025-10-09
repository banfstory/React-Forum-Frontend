# 🧭 React-Forum-Frontend
A Single Page Application (SPA) that allows users to create and participate in forums.
Each forum hosts user-generated posts and discussions.
Built using React for the frontend and a Flask REST API backend, ensuring fast load times by updating only necessary components.

## ⚙️ Requirements
- Node.js v16.20.2
> **Note:** Using newer Node versions may cause dependency or build issues.  
> You can manage Node versions using [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows).
- Running instance of the Flask REST API backend: [REST-API-FLASK](https://github.com/banfstory/REST-API-FLASK)

## 🛠️ Getting Started
### 1. Run the Flask Backend
Start your Flask REST API server in a separate terminal. <br>
Backend repository: https://github.com/banfstory/REST-API-FLASK

### 2. Run the React Frontend
For Windows:
```bash
cd react_frontend
npm install
npm start
```
This launches the app in development mode on http://localhost:3000.
If the `node_modules` folder doesn’t exist, `npm install` will create it automatically.

## ⚙️ API URL
The frontend connects to the REST API using the following default URL:
```javascript
// File: react_frontend/src/mixin/default_API_URL.js
const REST_API_URL = 'http://127.0.0.1:5000/api/';
```
You can leave it as is if your backend runs locally on port 5000, or update it to match your own backend URL.

## 📝 About the Backend
This frontend connects to a RESTful Flask backend, which handles data storage, authentication, and API logic.
Backend repository: [REST-API-FLASK](https://github.com/banfstory/REST-API-FLASK)

## 📜 License
This project is licensed under the [MIT License](./LICENSE).
