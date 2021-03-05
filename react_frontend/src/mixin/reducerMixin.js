/* eslint-disable */
export const popupReducer = (state, action) => {
  switch(action) {
    case 'toggle':
      return !state;
    case 'show':
      return true;
    case 'hide':
      return false;
    default:
      return state;
  }
}

export const loadingReducer = (state, action) => {
  switch(action) {
    case 'loading':
      return true;
    case 'loaded':
      return false;
    default:
      return state;
  }  
}

export const forumReducer = (state, action) => {
  switch(action.type) {
    case 'increment-followers':
      return { ...state, followers: state.followers + 1 };
    case 'decrement-followers':
      return { ...state, followers: state.followers - 1 };
    case 'set':
      return action.state;
    default:
      state;
  }
}

export const postReducer = (state, action) => {
  switch(action.type) {
    case 'increment-comments':
      return { ...state, num_of_comments: state.num_of_comments + 1 };
    case 'decrement-comments':
      return { ...state, num_of_comments: state.num_of_comments - 1 };
    case 'set':
      return action.state;
    default:
      state;
  }
}

export const commentReducer = (state, action) => {
  switch(action.type) {
    case 'increment-replys':
      return { ...state, num_of_reply: state.num_of_reply + 1 };
    case 'decrement-replys':
      return { ...state, num_of_reply: state.num_of_reply - 1 };
    case 'set':
      return action.state;
    case 'update-content':
      return { ...state, content: action.content };
    default:
      state;
  }
}



