export type Comment = {
  content: string;
  postId: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
};
