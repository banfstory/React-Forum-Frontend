import React, { useContext } from 'react';
import FollowSingle from './FollowerSingle';
import { UserContext, FollowerContext } from '../App';
import '../styles/follower.css';

function UserLayout() {
  const { follower } = useContext(FollowerContext);
  const { user } = useContext(UserContext);

  const follow_single = follower.map(follow => {
    return (
      <FollowSingle key={follow.id} follow={follow}/>
    );
  });

  return (
    <aside id="side-nav">
      <div> FOLLOWED FORUMS ( {user.forums_followed} ) </div>
      <div className="followers">
        { follow_single }
      </div>
    </aside>
  );

}


export default UserLayout;