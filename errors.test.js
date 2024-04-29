const request = require('supertest');
const express = require('express');
const app = express();
app.use('/errors', require('D:/Upscalepics/backend/admin/errors.js')); // Replace with the actual path to your errors router
/*
// Test for reporting an error
test('POST /errors/report-error - success', async () => {
  const errorDetails = {
    error_description: 'Test error',
    type: 'backend_error',
    error_code: 500,
    created_at_line: 42,
    created_at_script: 'test_script.js',
    severity: 'low'
  };
  const { body } = await request(app).post('/errors/report-error').send(errorDetails).expect(201);
  expect(body).toEqual(expect.objectContaining({ message: 'Error details inserted successfully.' }));
});
*/
// Test for fetching backend errors
test('GET /errors/backend-errors - success', async () => {
  const { body } = await request(app).get('/errors/backend-errors').expect(200);
  expect(Array.isArray(body)).toBeTruthy();
  body.forEach(item => {
    expect(item).toEqual(expect.objectContaining({ type: 'backend_error' }));
  });
});
/*
// Test for fetching frontend errors
test('GET /errors/frontend-errors - success', async () => {
  const { body } = await request(app).get('/errors/frontend-errors').expect(200);
  expect(Array.isArray(body)).toBeTruthy();
  body.forEach(item => {
    expect(item).toEqual(expect.objectContaining({ type: 'frontend_error' }));
  });
});
*/