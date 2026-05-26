import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { client, runDB } from '../../src/db/mongo.db';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/common/config/config';

describe('Posts API', () => {
  const app = express();
  setupApp(app);
  const adminAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;
  const nonExistingId = '507f1f77bcf86cd799439011';

  const validBlogInput = {
    name: 'Platform Notes',
    description: 'Notes about platform engineering',
    websiteUrl: 'https://platform-notes.dev',
  };

  const expectPostShape = (post: {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
  }) => ({
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: expect.any(String),
  });

  const createBlog = async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send(validBlogInput)
      .expect(HttpStatus.Created);

    return response.body;
  };

  const createPost = async () => {
    const blog = await createBlog();
    const response = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 'First post',
        shortDescription: 'Introductory backend post',
        content: 'A longer text about backend APIs',
        blogId: blog.id,
      })
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

  it('should create post with valid data; POST /posts', async () => {
    const blog = await createBlog();

    const response = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 'First post',
        shortDescription: 'Introductory backend post',
        content: 'A longer text about backend APIs',
        blogId: blog.id,
      })
      .expect(HttpStatus.Created);

    expect(response.body).toEqual({
      id: expect.any(String),
      title: 'First post',
      shortDescription: 'Introductory backend post',
      content: 'A longer text about backend APIs',
      blogId: blog.id,
      blogName: blog.name,
      createdAt: expect.any(String),
    });
  });

  it('should return 400 when create payload is invalid; POST /posts', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 123,
        shortDescription: null,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'title',
          message: expect.any(String),
        },
        {
          field: 'shortDescription',
          message: expect.any(String),
        },
        {
          field: 'content',
          message: expect.any(String),
        },
        {
          field: 'blogId',
          message: expect.any(String),
        },
      ]),
    );
  });

  // it('should return 400 for invalid create payload even without admin authorization; POST /posts', async () => {
  //   const response = await request(app)
  //     .post('/posts')
  //     .send({
  //       title: '',
  //       shortDescription: null,
  //       content: false,
  //       blogId: null,
  //     })
  //     .expect(HttpStatus.BadRequest);

  //   expect(response.body.errorsMessages).toEqual(
  //     expect.arrayContaining([
  //       {
  //         field: 'title',
  //         message: expect.any(String),
  //       },
  //       {
  //         field: 'shortDescription',
  //         message: expect.any(String),
  //       },
  //       {
  //         field: 'content',
  //         message: expect.any(String),
  //       },
  //       {
  //         field: 'blogId',
  //         message: expect.any(String),
  //       },
  //     ]),
  //   );
  // });

  it('should return 400 when blog does not exist; POST /posts', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 'First post',
        shortDescription: 'Introductory backend post',
        content: 'A longer text about backend APIs',
        blogId: nonExistingId,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'blogId',
          message: 'Blog for post does not exist',
        },
      ],
    });
  });

  it('should return 400 when blogId is empty string; POST /posts', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 'First post',
        shortDescription: 'Introductory backend post',
        content: 'A longer text about backend APIs',
        blogId: '',
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'blogId',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when blogId is null; POST /posts', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 'First post',
        shortDescription: 'Introductory backend post',
        content: 'A longer text about backend APIs',
        blogId: null,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'blogId',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when blogId is not a string; POST /posts', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 'First post',
        shortDescription: 'Introductory backend post',
        content: 'A longer text about backend APIs',
        blogId: 123,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'blogId',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return all posts; GET /posts', async () => {
    const firstPost = await createPost();
    const blog = await createBlog();
    const secondPost = await request(app)
      .post('/posts')
      .set('Authorization', adminAuthHeader)
      .send({
        title: 'Second post',
        shortDescription: 'Follow-up backend post',
        content: 'Another longer text about backend APIs',
        blogId: blog.id,
      })
      .expect(HttpStatus.Created)
      .then((r) => r.body);

    const response = await request(app).get('/posts').expect(HttpStatus.Ok);

    expect(response.body.totalCount).toBe(2);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(10);
    expect(response.body.pagesCount).toBe(1);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([firstPost, secondPost]),
    );
  });

  it('should return post by id; GET /posts/:id', async () => {
    const createdPost = await createPost();

    const response = await request(app)
      .get(`/posts/${createdPost.id}`)
      .expect(HttpStatus.Ok);

    expect(response.body).toEqual(createdPost);
  });

  it('should return 404 when post does not exist; GET /posts/:id', async () => {
    const response = await request(app)
      .get(`/posts/${nonExistingId}`)
      .expect(HttpStatus.NotFound);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'Post not found',
        },
      ],
    });
  });

  it('should update post with valid data; PUT /posts/:id', async () => {
    const createdPost = await createPost();
    const updatedBlog = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send({
        name: 'Refined Notes',
        description: 'Refined notes about platform engineering',
        websiteUrl: 'https://refined-platform-notes.dev',
      })
      .expect(HttpStatus.Created);

    const updatedPost = {
      title: 'Refined post',
      shortDescription: 'Updated backend post',
      content: 'Updated backend API content',
      blogId: updatedBlog.body.id,
    };

    await request(app)
      .put(`/posts/${createdPost.id}`)
      .set('Authorization', adminAuthHeader)
      .send(updatedPost)
      .expect(HttpStatus.NoContent);

    const getResponse = await request(app)
      .get(`/posts/${createdPost.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual(
      expectPostShape({
        id: createdPost.id,
        ...updatedPost,
        blogName: updatedBlog.body.name,
      }),
    );
  });

  it('should return 400 when update payload is invalid; PUT /posts/:id', async () => {
    const createdPost = await createPost();

    const response = await request(app)
      .put(`/posts/${createdPost.id}`)
      .set('Authorization', adminAuthHeader)
      .send({
        title: '',
        shortDescription: 123,
        content: false,
        blogId: null,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'title',
          message: expect.any(String),
        },
        {
          field: 'shortDescription',
          message: expect.any(String),
        },
        {
          field: 'content',
          message: expect.any(String),
        },
        {
          field: 'blogId',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 401 for update without admin authorization before validation and existence checks; PUT /posts/:id', async () => {
    await request(app)
      .put('/posts/999')
      .send({
        title: '',
        shortDescription: 123,
        content: false,
        blogId: null,
      })
      .expect(HttpStatus.Unauthorized);
  });

  // it('should return 404 when trying to update non-existing post; PUT /posts/:id', async () => {
  //   const blog = await createBlog();

  //   const response = await request(app)
  //     .put(`/posts/${nonExistingId}`)
  //     .set('Authorization', adminAuthHeader)
  //     .send({
  //       title: 'First post',
  //       shortDescription: 'Introductory backend post',
  //       content: 'A longer text about backend APIs',
  //       blogId: blog.id,
  //     })
  //     .expect(HttpStatus.NotFound);

  //   expect(response.body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: 'id',
  //         message: 'Post not found',
  //       },
  //     ],
  //   });
  // });

  it('should delete post; DELETE /posts/:id', async () => {
    const createdPost = await createPost();

    await request(app)
      .delete(`/posts/${createdPost.id}`)
      .set('Authorization', adminAuthHeader)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(`/posts/${createdPost.id}`)
      .expect(HttpStatus.NotFound);

    const listResponse = await request(app).get('/posts').expect(HttpStatus.Ok);

    expect(listResponse.body.items).toEqual([]);
    expect(listResponse.body.totalCount).toBe(0);
  });

  it('should return 404 when trying to delete non-existing post; DELETE /posts/:id', async () => {
    const response = await request(app)
      .delete(`/posts/${nonExistingId}`)
      .set('Authorization', adminAuthHeader)
      .expect(HttpStatus.NotFound);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'Post not found',
        },
      ],
    });
  });

  it('should return 401 when creating post without admin authorization; POST /posts', async () => {
    const blog = await createBlog();

    await request(app)
      .post('/posts')
      .send({
        title: 'First post',
        shortDescription: 'Introductory backend post',
        content: 'A longer text about backend APIs',
        blogId: blog.id,
      })
      .expect(HttpStatus.Unauthorized);
  });

  it('should return 401 when updating post without admin authorization; PUT /posts/:id', async () => {
    const createdPost = await createPost();
    const blog = await createBlog();

    await request(app)
      .put(`/posts/${createdPost.id}`)
      .send({
        title: 'Refined post',
        shortDescription: 'Updated backend post',
        content: 'Updated backend API content',
        blogId: blog.id,
      })
      .expect(HttpStatus.Unauthorized);
  });

  it('should return 401 when deleting post without admin authorization; DELETE /posts/:id', async () => {
    const createdPost = await createPost();

    await request(app)
      .delete(`/posts/${createdPost.id}`)
      .expect(HttpStatus.Unauthorized);
  });
});
