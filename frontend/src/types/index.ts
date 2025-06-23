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

// --- Add friends and friendRequests to User and UserProfile types ---
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePic?: string;
  friends: string[]; // Array of user IDs
  friendRequests: string[]; // Array of user IDs
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
  sender: Author; // Use our existing Author type
  type: 'like' | 'comment' | 'friend_request';
  // --- CORRECTED FIELD ---
  entityId: string; // The ID of the Post or User. It is NOT optional.
  read: boolean;
  createdAt: string;
}