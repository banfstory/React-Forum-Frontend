import React, { useContext } from 'react';
import Follower from './Follower';
import ProfileNav from './ProfileNav';

function UserLayout() {

  return (
    <React.Fragment>
      <ProfileNav/>
      <Follower/>
    </React.Fragment>
  );

}


export default UserLayout;