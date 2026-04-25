import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { setupApp } from '../../src/setup-app';

describe('Auth test', () => {
  const app = express();
  setupApp(app);

  const validAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;
  const invalidAuthHeader = `Basic ${Buffer.from('admin:wrong-password').toString('base64')}`;

  const validBlogInput = {
    name: 'Homework Blog',
    description: 'Blog created for homework e2e checks',
    websiteUrl: 'https://homework-blog.dev',
  };

  const createBlog = async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', validAuthHeader)
      .send(validBlogInput)
      .expect(HttpStatus.Created);

    return response.body;
  };

  const createPost = async () => {
    const blog = await createBlog();
    const response = await request(app)
      .post('/posts')
      .set('Authorization', validAuthHeader)
      .send({
        title: 'Homework post',
        shortDescription: 'Short description for homework post',
        content: 'Content for homework post validation and CRUD checks',
        blogId: blog.id,
      })
      .expect(HttpStatus.Created);

    return { blog, post: response.body };
  };

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  describe('Blogs api', () => {
    it('PUT, POST, DELETE -> "/blogs": should return error if auth credentials is incorrect; status 401;', async () => {
      const createdBlogResponse = await request(app)
        .post('/blogs')
        .set('Authorization', validAuthHeader)
        .send(validBlogInput)
        .expect(HttpStatus.Created);

      await request(app)
        .post('/blogs')
        .set('Authorization', invalidAuthHeader)
        .send({
          name: 'Unauth blog',
          description: 'Unauthorized create description',
          websiteUrl: 'https://unauthorized-create.dev',
        })
        .expect(HttpStatus.Unauthorized);

      await request(app)
        .put(`/blogs/${createdBlogResponse.body.id}`)
        .set('Authorization', invalidAuthHeader)
        .send({
          name: 'Unauth update',
          description: 'Unauthorized update description',
          websiteUrl: 'https://unauthorized-update.dev',
        })
        .expect(HttpStatus.Unauthorized);

      await request(app)
        .delete(`/blogs/${createdBlogResponse.body.id}`)
        .set('Authorization', invalidAuthHeader)
        .expect(HttpStatus.Unauthorized);
    });

    describe('Blog body validation', () => {
      it('POST -> "/blogs": should return error if passed body is incorrect; status 400;', async () => {
        const response = await request(app)
          .post('/blogs')
          .set('Authorization', validAuthHeader)
          .send({
            name: '',
            description: 123,
            websiteUrl: false,
          })
          .expect(HttpStatus.BadRequest);

        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            { field: 'name', message: expect.any(String) },
            { field: 'description', message: expect.any(String) },
            { field: 'websiteUrl', message: expect.any(String) },
          ]),
        );
      });

      it('PUT -> "/blogs/:id": should return error if passed body is incorrect; status 400;', async () => {
        const createdBlog = await createBlog();

        const response = await request(app)
          .put(`/blogs/${createdBlog.id}`)
          .set('Authorization', validAuthHeader)
          .send({
            name: '',
            description: 123,
            websiteUrl: false,
          })
          .expect(HttpStatus.BadRequest);

        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            { field: 'name', message: expect.any(String) },
            { field: 'description', message: expect.any(String) },
            { field: 'websiteUrl', message: expect.any(String) },
          ]),
        );
      });
    });
  });

  describe('Posts api', () => {
    it('POST -> "/posts": should create new post for an existing blog; status 201; content: created post;', async () => {
      const blog = await createBlog();

      const createResponse = await request(app)
        .post('/posts')
        .set('Authorization', validAuthHeader)
        .send({
          title: 'Created post',
          shortDescription: 'Post created for GET by id verification',
          content: 'Post content created to verify Homework 2 create case',
          blogId: blog.id,
        })
        .expect(HttpStatus.Created);

      expect(createResponse.body).toEqual({
        id: expect.any(String),
        title: 'Created post',
        shortDescription: 'Post created for GET by id verification',
        content: 'Post content created to verify Homework 2 create case',
        blogId: blog.id,
        blogName: blog.name,
      });

      const getResponse = await request(app)
        .get(`/posts/${createResponse.body.id}`)
        .expect(HttpStatus.Ok);

      expect(getResponse.body).toEqual(createResponse.body);
    });

    it('GET -> "/posts/:id": should return status 200; content: post by id;', async () => {
      const { post } = await createPost();

      const response = await request(app)
        .get(`/posts/${post.id}`)
        .expect(HttpStatus.Ok);

      expect(response.body).toEqual(post);
    });

    it('GET -> "/posts": should return status 200; content: posts array;', async () => {
      const first = await createPost();
      const secondBlog = await createBlog();
      const secondResponse = await request(app)
        .post('/posts')
        .set('Authorization', validAuthHeader)
        .send({
          title: 'Second homework post',
          shortDescription: 'Another post for list response check',
          content: 'Another content body to verify posts array response',
          blogId: secondBlog.id,
        })
        .expect(HttpStatus.Created);

      const response = await request(app).get('/posts').expect(HttpStatus.Ok);

      expect(response.body).toEqual([first.post, secondResponse.body]);
    });

    it('PUT -> "/posts/:id": should update post by id; status 204;', async () => {
      const { post } = await createPost();
      const updatedBlog = await request(app)
        .post('/blogs')
        .set('Authorization', validAuthHeader)
        .send({
          name: 'Updated blog',
          description: 'Another blog used for post update',
          websiteUrl: 'https://updated-homework-blog.dev',
        })
        .expect(HttpStatus.Created);

      await request(app)
        .put(`/posts/${post.id}`)
        .set('Authorization', validAuthHeader)
        .send({
          title: 'Updated post title',
          shortDescription: 'Updated short description',
          content: 'Updated content for homework post',
          blogId: updatedBlog.body.id,
        })
        .expect(HttpStatus.NoContent);

      const getResponse = await request(app)
        .get(`/posts/${post.id}`)
        .expect(HttpStatus.Ok);

      expect(getResponse.body).toEqual({
        id: post.id,
        title: 'Updated post title',
        shortDescription: 'Updated short description',
        content: 'Updated content for homework post',
        blogId: updatedBlog.body.id,
        blogName: updatedBlog.body.name,
      });
    });

    it('DELETE -> "/posts/:id": should delete post by id; status 204;', async () => {
      const { post } = await createPost();

      await request(app)
        .delete(`/posts/${post.id}`)
        .set('Authorization', validAuthHeader)
        .expect(HttpStatus.NoContent);

      await request(app).get(`/posts/${post.id}`).expect(HttpStatus.NotFound);
    });

    it('PUT, POST, DELETE -> "/posts": should return error if auth credentials is incorrect; status 401;', async () => {
      const blog = await createBlog();
      const { post } = await createPost();

      await request(app)
        .post('/posts')
        .set('Authorization', invalidAuthHeader)
        .send({
          title: 'Unauthorized create',
          shortDescription: 'Unauthorized create short description',
          content: 'Unauthorized create content',
          blogId: blog.id,
        })
        .expect(HttpStatus.Unauthorized);

      await request(app)
        .put(`/posts/${post.id}`)
        .set('Authorization', invalidAuthHeader)
        .send({
          title: 'Unauthorized update',
          shortDescription: 'Unauthorized update short description',
          content: 'Unauthorized update content',
          blogId: blog.id,
        })
        .expect(HttpStatus.Unauthorized);

      await request(app)
        .delete(`/posts/${post.id}`)
        .set('Authorization', invalidAuthHeader)
        .expect(HttpStatus.Unauthorized);
    });

    describe('Post body validation', () => {
      it('POST -> "/posts": should return error if passed body is incorrect; status 400;', async () => {
        const response = await request(app)
          .post('/posts')
          .set('Authorization', validAuthHeader)
          .send({
            title: '',
            shortDescription: 123,
            content: false,
            blogId: null,
          })
          .expect(HttpStatus.BadRequest);

        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            { field: 'title', message: expect.any(String) },
            { field: 'shortDescription', message: expect.any(String) },
            { field: 'content', message: expect.any(String) },
            { field: 'blogId', message: expect.any(String) },
          ]),
        );
      });

      it('PUT -> "/posts": should return error if passed body is incorrect; status 400;', async () => {
        const { post } = await createPost();

        const response = await request(app)
          .put(`/posts/${post.id}`)
          .set('Authorization', validAuthHeader)
          .send({
            title: '',
            shortDescription: 123,
            content: false,
            blogId: null,
          })
          .expect(HttpStatus.BadRequest);

        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            { field: 'title', message: expect.any(String) },
            { field: 'shortDescription', message: expect.any(String) },
            { field: 'content', message: expect.any(String) },
            { field: 'blogId', message: expect.any(String) },
          ]),
        );
      });
    });
  });
});
