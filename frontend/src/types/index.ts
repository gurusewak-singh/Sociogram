// frontend/src/types/index.ts

export interface Author {
  _id: string;
  username: string;
  profilePic?: string;
}

export interface Comment {
  _id: string;
  text: string;
  userId: Author;
  createdAt: string;
}

export interface PostType {
  _id: string;
  textContent: string;
  image?: string;
  userId: Author;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  profilePic?: string;
  friends?: string[];
  friendRequests?: string[];
  // --- THIS IS THE CRITICAL LINE THAT NEEDS TO BE ADDED/UNCOMMENTED ---
  needsSetup?: boolean; 
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profilePic: string;
  friends: string[];
  friendRequests: string[];
  posts?: any[];
  createdAt: string;
}

export interface NotificationType {
  _id: string;
  sender: Author;
  type: 'like' | 'comment' | 'friend_request';
  // --- FIX: Use entityId consistently. Remove optional 'post' field. ---
  entityId: string; 
  read: boolean;
  createdAt: string;
}