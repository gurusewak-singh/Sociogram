//frontend/src/store/postSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  loading: false,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts(state, action) {
      state.posts = action.payload;
    },
    addPost(state, action) {
      state.posts.unshift(action.payload); // Add to the beginning
    },
    updatePost(state, action) {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
  },
});

export const { setPosts, addPost, updatePost } = postSlice.actions;
export default postSlice.reducer;