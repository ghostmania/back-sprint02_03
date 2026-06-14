import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { client, runDB } from '../../src/db/mongo.db';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/common/config/config';

describe('Blog Posts API', () => {
  const app = express();
  setupApp(app);

  const adminAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;
  const nonExistingId = '507f1f77bcf86cd799439011';
  const invalidId = 'not-a-valid-mongo-id';

  const validBlogInput = {
    name: 'Test Blog',
    description: 'Blog used for blog-posts endpoint tests',
    websiteUrl: 'https://test-blog.dev',
  };

  const validPostBody = {
    title: 'Blog Post Title',
    shortDescription: 'Short description for the blog post',
    content: 'Full content for the blog post used in tests',
  };

  const createBlog = async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send(validBlogInput)
      .expect(HttpStatus.Created);
    return response.body as { id: string; name: string };
  };

  const createPostForBlog = async (blogId: string) => {
    const response = await request(app)
      .post(`/blogs/${blogId}/posts`)
      .set('Authorization', adminAuthHeader)
      .send(validPostBody)
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

  describe('GET /blogs/:id/posts', () => {
    it('should return 200 with empty list when blog has no posts', async () => {
      const blog = await createBlog();

      const response = await request(app)
        .get(`/blogs/${blog.id}/posts`)
        .expect(HttpStatus.Ok);

      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return 200 with paginated posts when blog has posts', async () => {
      const blog = await createBlog();
      await createPostForBlog(blog.id);
      await createPostForBlog(blog.id);

      const response = await request(app)
        .get(`/blogs/${blog.id}/posts`)
        .expect(HttpStatus.Ok);

      expect(response.body.pagesCount).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalCount).toBe(2);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0]).toEqual({
        id: expect.any(String),
        title: validPostBody.title,
        shortDescription: validPostBody.shortDescription,
        content: validPostBody.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
      });
    });

    it('should only return posts belonging to the specified blog', async () => {
      const blogA = await createBlog();
      const blogB = await request(app)
        .post('/blogs')
        .set('Authorization', adminAuthHeader)
        .send({
          name: 'Blog B',
          description: 'Another blog',
          websiteUrl: 'https://blog-b.dev',
        })
        .expect(HttpStatus.Created)
        .then((r) => r.body as { id: string });

      await createPostForBlog(blogA.id);
      await createPostForBlog(blogB.id);

      const response = await request(app)
        .get(`/blogs/${blogA.id}/posts`)
        .expect(HttpStatus.Ok);

      expect(response.body.totalCount).toBe(1);
      expect(response.body.items[0].blogId).toBe(blogA.id);
    });

    it('should respect pageSize pagination param', async () => {
      const blog = await createBlog();
      await createPostForBlog(blog.id);
      await createPostForBlog(blog.id);
      await createPostForBlog(blog.id);

      const response = await request(app)
        .get(`/blogs/${blog.id}/posts?pageSize=2&pageNumber=1`)
        .expect(HttpStatus.Ok);

      expect(response.body.pagesCount).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(2);
      expect(response.body.totalCount).toBe(3);
      expect(response.body.items).toHaveLength(2);
    });

    it('should return 404 when blog does not exist', async () => {
      const response = await request(app)
        .get(`/blogs/${nonExistingId}/posts`)
        .expect(HttpStatus.NotFound);

      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Blog not found' }),
        ]),
      );
    });

    it('should return 400 when blog id is not a valid MongoId', async () => {
      const response = await request(app)
        .get(`/blogs/${invalidId}/posts`)
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'id' })]),
      );
    });
  });

  describe('POST /blogs/:id/posts', () => {
    it('should return 201 with the created post', async () => {
      const blog = await createBlog();

      const response = await request(app)
        .post(`/blogs/${blog.id}/posts`)
        .set('Authorization', adminAuthHeader)
        .send(validPostBody)
        .expect(HttpStatus.Created);

      expect(response.body).toEqual({
        id: expect.any(String),
        title: validPostBody.title,
        shortDescription: validPostBody.shortDescription,
        content: validPostBody.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
      });
    });

    it('should make the post visible via GET /blogs/:id/posts', async () => {
      const blog = await createBlog();
      const createdPost = await createPostForBlog(blog.id);

      const response = await request(app)
        .get(`/blogs/${blog.id}/posts`)
        .expect(HttpStatus.Ok);

      expect(response.body.totalCount).toBe(1);
      expect(response.body.items[0]).toMatchObject({
        id: createdPost.id,
        title: createdPost.title,
      });
    });

    it('should return 400 when post body is invalid; POST /blogs/:id/posts', async () => {
      const blog = await createBlog();

      const response = await request(app)
        .post(`/blogs/${blog.id}/posts`)
        .set('Authorization', adminAuthHeader)
        .send({ title: 'a'.repeat(31), content: 'valid content' })
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'title' }),
          expect.objectContaining({ field: 'shortDescription' }),
        ]),
      );
    });

    it('should return 401 without admin authorization', async () => {
      const blog = await createBlog();

      await request(app)
        .post(`/blogs/${blog.id}/posts`)
        .send(validPostBody)
        .expect(HttpStatus.Unauthorized);
    });

    it('should return 401 with wrong credentials', async () => {
      const blog = await createBlog();
      const wrongAuth = `Basic ${Buffer.from('admin:wrong-password').toString('base64')}`;

      await request(app)
        .post(`/blogs/${blog.id}/posts`)
        .set('Authorization', wrongAuth)
        .send(validPostBody)
        .expect(HttpStatus.Unauthorized);
    });

    it('should return 404 when blog does not exist', async () => {
      const response = await request(app)
        .post(`/blogs/${nonExistingId}/posts`)
        .set('Authorization', adminAuthHeader)
        .send(validPostBody)
        .expect(HttpStatus.NotFound);

      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Blog not found' }),
        ]),
      );
    });

    it('should return 400 when blog id is not a valid MongoId', async () => {
      const response = await request(app)
        .post(`/blogs/${invalidId}/posts`)
        .set('Authorization', adminAuthHeader)
        .send(validPostBody)
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'id' })]),
      );
    });
  });
});
