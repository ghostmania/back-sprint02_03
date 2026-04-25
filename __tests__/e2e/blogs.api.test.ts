import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { setupApp } from '../../src/setup-app';

describe('Blogs API', () => {
  const app = express();
  setupApp(app);
  const adminAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;

  const validBlogInput = {
    name: 'Code Notes',
    description: 'Articles about backend engineering',
    websiteUrl: 'https://code-notes.dev',
  };

  const createBlog = async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send(validBlogInput)
      .expect(HttpStatus.Created);

    return response.body;
  };

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  it('should create blog with valid data; POST /blogs', async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send(validBlogInput)
      .expect(HttpStatus.Created);

    expect(response.body).toEqual({
      id: '1',
      name: validBlogInput.name,
      description: validBlogInput.description,
      websiteUrl: validBlogInput.websiteUrl,
    });
  });

  it('should return 400 when create payload is invalid; POST /blogs', async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send({
        name: 123,
        description: null,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'name',
          message: expect.any(String),
        },
        {
          field: 'description',
          message: expect.any(String),
        },
        {
          field: 'websiteUrl',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when websiteUrl does not match the required https pattern; POST /blogs', async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send({
        ...validBlogInput,
        websiteUrl: 'http://code-notes.dev/invalid-path/test?x=1',
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'websiteUrl',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when blog fields exceed validation limits; POST /blogs', async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send({
        name: 'a'.repeat(16),
        description: 'b'.repeat(501),
        websiteUrl: `https://${'c'.repeat(95)}`,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'name',
          message: expect.any(String),
        },
        {
          field: 'description',
          message: expect.any(String),
        },
        {
          field: 'websiteUrl',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return all blogs; GET /blogs', async () => {
    const firstBlog = await createBlog();
    const secondResponse = await request(app)
      .post('/blogs')
      .set('Authorization', adminAuthHeader)
      .send({
        name: 'Ops Weekly',
        description: 'DevOps updates and notes',
        websiteUrl: 'https://ops-weekly.dev',
      })
      .expect(HttpStatus.Created);

    const response = await request(app).get('/blogs').expect(HttpStatus.Ok);

    expect(response.body).toEqual([firstBlog, secondResponse.body]);
  });

  it('should return blog by id; GET /blogs/:id', async () => {
    const createdBlog = await createBlog();

    const response = await request(app)
      .get(`/blogs/${createdBlog.id}`)
      .expect(HttpStatus.Ok);

    expect(response.body).toEqual(createdBlog);
  });

  it('should return 404 when blog does not exist; GET /blogs/:id', async () => {
    const response = await request(app)
      .get('/blogs/999')
      .expect(HttpStatus.NotFound);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'Blog not found',
        },
      ],
    });
  });

  it('should update blog with valid data; PUT /blogs/:id', async () => {
    const createdBlog = await createBlog();
    const updatedBlog = {
      name: 'Refined Code',
      description: 'Updated backend engineering articles',
      websiteUrl: 'https://refined-code.dev',
    };

    await request(app)
      .put(`/blogs/${createdBlog.id}`)
      .set('Authorization', adminAuthHeader)
      .send(updatedBlog)
      .expect(HttpStatus.NoContent);

    const getResponse = await request(app)
      .get(`/blogs/${createdBlog.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      id: createdBlog.id,
      ...updatedBlog,
    });
  });

  it('should return 400 when update payload is invalid; PUT /blogs/:id', async () => {
    const createdBlog = await createBlog();

    const response = await request(app)
      .put(`/blogs/${createdBlog.id}`)
      .set('Authorization', adminAuthHeader)
      .send({
        name: '',
        description: 123,
        websiteUrl: false,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'name',
          message: expect.any(String),
        },
        {
          field: 'description',
          message: expect.any(String),
        },
        {
          field: 'websiteUrl',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when websiteUrl does not match the required https pattern; PUT /blogs/:id', async () => {
    const createdBlog = await createBlog();

    const response = await request(app)
      .put(`/blogs/${createdBlog.id}`)
      .set('Authorization', adminAuthHeader)
      .send({
        name: 'Refined Code',
        description: 'Updated backend engineering articles',
        websiteUrl: 'https://refined-code.dev/path/with.dot',
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'websiteUrl',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 404 when trying to update non-existing blog; PUT /blogs/:id', async () => {
    const response = await request(app)
      .put('/blogs/999')
      .set('Authorization', adminAuthHeader)
      .send(validBlogInput)
      .expect(HttpStatus.NotFound);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'Blog not found',
        },
      ],
    });
  });

  it('should delete blog; DELETE /blogs/:id', async () => {
    const createdBlog = await createBlog();

    await request(app)
      .delete(`/blogs/${createdBlog.id}`)
      .set('Authorization', adminAuthHeader)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(`/blogs/${createdBlog.id}`)
      .expect(HttpStatus.NotFound);

    const listResponse = await request(app).get('/blogs').expect(HttpStatus.Ok);

    expect(listResponse.body).toEqual([]);
  });

  it('should return 404 when trying to delete non-existing blog; DELETE /blogs/:id', async () => {
    const response = await request(app)
      .delete('/blogs/999')
      .set('Authorization', adminAuthHeader)
      .expect(HttpStatus.NotFound);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'Blog not found',
        },
      ],
    });
  });
});
