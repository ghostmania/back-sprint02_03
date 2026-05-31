import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { client, runDB } from '../../src/db/mongo.db';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/common/config/config';

describe('Comments API', () => {
  const app = express();
  setupApp(app);

  const adminAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;
  const nonExistingId = '507f1f77bcf86cd799439011';

  const createUserAndLogin = async (
    login: string,
  ): Promise<{ id: string; login: string; accessToken: string }> => {
    const userInput = {
      login,
      password: 'secret123',
      email: `${login}@example.com`,
    };

    const userResponse = await request(app)
      .post('/users')
      .set('Authorization', adminAuthHeader)
      .send(userInput)
      .expect(HttpStatus.Created);

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: userInput.login,
        password: userInput.password,
      })
      .expect(HttpStatus.Ok);

    return {
      id: userResponse.body.id,
      login: userResponse.body.login,
      accessToken: loginResponse.body.accessToken,
    };
  };

  const createPost = async (): Promise<{ id: string }> => {
    const blogResponse = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send({
        name: 'Backend',
        description: 'Backend engineering notes',
        websiteUrl: 'https://backend.example.com',
      })
      .expect(HttpStatus.Created);

    const postResponse = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 'API post',
        shortDescription: 'Post about APIs',
        content: 'Useful notes about backend API design',
        blogId: blogResponse.body.id,
      })
      .expect(HttpStatus.Created);

    return postResponse.body;
  };

  const createComment = async (
    postId: string,
    accessToken: string,
    content = 'This is a valid comment body for the post',
  ) => {
    const response = await request(app)
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content })
      .expect(HttpStatus.Created);

    return response.body;
  };

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  it('should create and return comment for post; POST /posts/:postId/comments and GET /comments/:id', async () => {
    const user = await createUserAndLogin('alice');
    const post = await createPost();

    const createdComment = await createComment(
      post.id,
      user.accessToken,
      'This is a valid comment body for creation',
    );

    expect(createdComment).toEqual({
      id: expect.any(String),
      content: 'This is a valid comment body for creation',
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: expect.any(String),
    });

    const getResponse = await request(app)
      .get(`/comments/${createdComment.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual(createdComment);
  });

  it('should return paginated comments for specified post; GET /posts/:postId/comments', async () => {
    const user = await createUserAndLogin('bob');
    const post = await createPost();
    const otherPost = await createPost();

    const firstComment = await createComment(
      post.id,
      user.accessToken,
      'This is the first valid comment body',
    );
    const secondComment = await createComment(
      post.id,
      user.accessToken,
      'This is the second valid comment body',
    );
    await createComment(
      otherPost.id,
      user.accessToken,
      'This comment belongs to a different post',
    );

    const response = await request(app)
      .get(`/posts/${post.id}/comments?pageNumber=1&pageSize=10`)
      .expect(HttpStatus.Ok);

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [secondComment, firstComment],
    });
  });

  it('should update own comment and reject update by another user; PUT /comments/:commentId', async () => {
    const owner = await createUserAndLogin('owner');
    const otherUser = await createUserAndLogin('guest');
    const post = await createPost();
    const comment = await createComment(post.id, owner.accessToken);

    await request(app)
      .put(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${otherUser.accessToken}`)
      .send({ content: 'This update has enough length but wrong owner' })
      .expect(HttpStatus.Forbidden);

    await request(app)
      .put(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ content: 'This update has enough length and right owner' })
      .expect(HttpStatus.NoContent);

    const getResponse = await request(app)
      .get(`/comments/${comment.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body.content).toBe(
      'This update has enough length and right owner',
    );
  });

  it('should delete own comment and reject delete by another user; DELETE /comments/:commentId', async () => {
    const owner = await createUserAndLogin('mary');
    const otherUser = await createUserAndLogin('john');
    const post = await createPost();
    const comment = await createComment(post.id, owner.accessToken);

    await request(app)
      .delete(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${otherUser.accessToken}`)
      .expect(HttpStatus.Forbidden);

    await request(app)
      .delete(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(`/comments/${comment.id}`)
      .expect(HttpStatus.NotFound);
  });

  it('should return 401 for write endpoints without bearer token', async () => {
    const user = await createUserAndLogin('token');
    const post = await createPost();
    const comment = await createComment(post.id, user.accessToken);

    await request(app)
      .post(`/posts/${post.id}/comments`)
      .send({ content: 'This valid content should need auth' })
      .expect(HttpStatus.Unauthorized);

    await request(app)
      .put(`/comments/${comment.id}`)
      .send({ content: 'This valid content should need auth' })
      .expect(HttpStatus.Unauthorized);

    await request(app)
      .delete(`/comments/${comment.id}`)
      .expect(HttpStatus.Unauthorized);
  });

  it('should return 400 for invalid comment content', async () => {
    const user = await createUserAndLogin('valid');
    const post = await createPost();
    const comment = await createComment(post.id, user.accessToken);

    const createResponse = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ content: 'short' })
      .expect(HttpStatus.BadRequest);

    expect(createResponse.body.errorsMessages).toEqual([
      {
        field: 'content',
        message: expect.any(String),
      },
    ]);

    await request(app)
      .put(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ content: 'short' })
      .expect(HttpStatus.BadRequest);
  });

  it('should return 404 for missing post or comment', async () => {
    const user = await createUserAndLogin('notfound');

    await request(app)
      .post(`/posts/${nonExistingId}/comments`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ content: 'This valid content targets a missing post' })
      .expect(HttpStatus.NotFound);

    await request(app)
      .get(`/comments/${nonExistingId}`)
      .expect(HttpStatus.NotFound);

    await request(app)
      .put(`/comments/${nonExistingId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ content: 'This valid content targets a missing comment' })
      .expect(HttpStatus.NotFound);

    await request(app)
      .delete(`/comments/${nonExistingId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(HttpStatus.NotFound);
  });

  it('should return 404 for malformed post or comment ids', async () => {
    const user = await createUserAndLogin('badids');

    await request(app)
      .post('/posts/not-valid-id/comments')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ content: 'This valid content targets a malformed post id' })
      .expect(HttpStatus.NotFound);

    await request(app)
      .get('/comments/not-valid-id')
      .expect(HttpStatus.NotFound);

    await request(app)
      .put('/comments/not-valid-id')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ content: 'This valid content targets a malformed comment id' })
      .expect(HttpStatus.NotFound);

    await request(app)
      .delete('/comments/not-valid-id')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(HttpStatus.NotFound);
  });
});
