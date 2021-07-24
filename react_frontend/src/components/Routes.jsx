import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import Account from './Account';
import ChangePassword from './ChangePassword';
import UserPosts from './UserPosts';
import Forum from './Forum';
import CreateForum from './CreateForum';
import CreatePost from './CreatePost';
import ForumUpdate from './UpdateForum';
import Post from './Post';
import UpdatePost from './UpdatePost';
import SearchResult from './SearchResult';
import PageNotFound from './PageNotFound';
import Forbidden from './Forbidden';

function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={Home}/>
      <Route path="/account" exact component={Account}/>
      <Route path="/change-password" exact component={ChangePassword}/>
      <Route path="/user-posts/:username" exact component={UserPosts}/>
      <Route path="/forum/:name" exact component={Forum}/>
      <Route path="/create-forum" exact component={CreateForum}/>
      <Route path="/create-post/:name" exact component={CreatePost}/>
      <Route path="/update-forum/:name" exact component={ForumUpdate}/>
      <Route path="/post/:id" exact component={Post}/>
      <Route path="/update-post/:id" exact component={UpdatePost}/>
      <Route path="/search" exact component={SearchResult}/>
      <Route path="/forbidden">
        <Forbidden/>
      </Route>
      <Route path="/notfound">
        <PageNotFound/>
      </Route>
      <Route path="*">
        <PageNotFound/>
      </Route>
    </Switch>
  );
}

export default Routes;