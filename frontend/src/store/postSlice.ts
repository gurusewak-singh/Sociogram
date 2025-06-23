// frontend/src/store/postSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type PostType } from '../components/Post';

interface PostsState {
  posts: PostType[];
  loading: boolean;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts(state, action: PayloadAction<PostType[]>) {
      state.posts = action.payload;
    },
    addPost(state, action: PayloadAction<PostType>) {
      state.posts.unshift(action.payload); // Add to the beginning
    },
    updatePost(state, action: PayloadAction<PostType>) {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
  },
});

export const { setPosts, addPost, updatePost } = postSlice.actions;
export default postSlice.reducer;