const request = require("supertest");
const express = require("express");
const data_source = require('./data_source.json');
const app = express();
app.use(express.json());
app.use("/",require("D:/Upscalepics/backend/admin/human_resources.js"));

                   //fetching all employee details
describe('HR - fetch employee', () => {
test("Fetching employee details", async () => {
  const { body } = await request(app)
    .get("/fetch-employee-details")
    .expect(200);
  expect(body).toEqual(expect.objectContaining({ data: expect.anything() }));
  body.data.forEach((item) => {
    expect(item).toEqual(
      expect.objectContaining({
        id: expect.anything(),
        email: expect.anything(),
      })
    );
  });
});
});
                  //adding employee
describe('HR - ADD employee', () => {
//adding new employee
test("add-employee - valid", async () => {
  const newEmployee = { email: data_source.add_employee_email };
  const { body } = await request(app)
    .post("/add-employee")
    .send(newEmployee)
    .expect(200);
});

//adding already existing employee
test("Error on adding already existing employee", async () => {
  const newEmployee = { email: data_source.add_existing_employee };
  const { body } = await request(app)
    .post("/add-employee")
    .send(newEmployee)
    .expect(400);
});


//invalid employee email format -- failing adding any
test("Error on invalid email format", async () => {
  const newEmployee = { email: data_source.add_invalid_email };
  const { body } = await request(app)
    .post("/add-employee")
    .send(newEmployee)
    .expect(400);
});

//empty email field
test("Error on empty email/no email", async () => {
  const { body } = await request(app)
    .post("/add-employee")
    .send({})
    .expect(400);
  expect(body.error).toEqual("Email is required for adding an employee.");
});
});

describe('HR - DELETE employee', () => {
//delete employee using id
test("Deleting employee - valid", async () => {
  const { body } = await request(app)
    .delete(`/delete-employee/${data_source.delete_id}`)
    .expect(200);
  expect(body.message).toEqual("Employee deleted successfully.");
});

//delete using invalid employee id
test("Error on deleting using invalid id", async () => {
  const { body } = await request(app)
    .delete(`/delete-employee/${data_source.delete_invalid_id}`)
    .expect(404);
});

//deleting using email : should get a 500
test("Error on deleting using email ", async () => {
  const employeeEmail = data_source.add_invalid_email; // using add_invalid_email from data_source.js
  const { body } = await request(app)
    .delete(`/delete-employee/${employeeEmail}`) // use the email from the data source
    .expect(400);
});
});
               //Get employee details
describe('HR - GET employee details', () => {
//employee details using id
test("Employee details - valid/success", async () => {
  const { body } = await request(app).get(`/employee-details/${data_source.get_emp_id}`).expect(200);
  expect(body.message).toEqual("Employee details fetched successfully");
  expect(body.data.id).toEqual(data_source.get_emp_id);
});
//invalid id
test("Error on giving invalid ID", async () => {
  const { body } = await request(app).get(`/employee-details/${data_source.get_inv_id}`).expect(404);
  expect(body.message).toEqual("Employee not found");
});
});
               //Update employee
describe('HR - updating employee details', () => {
//update employee Id missing
test("Error on updating when id is missing", async () => {
  const newEmployee = { id: "", email: data_source.update_email }; 
  const { body } = await request(app)
    .put(`/update-employee/${newEmployee.id}`) 
    .send(newEmployee)
    .expect(400);
});
// Test case: New email is missing
test("Error on updating if the email is missing", async () => {
  const newEmployee = { id: data_source.update_emp_id };
  const { body } = await request(app)
    .put('/update-employee')
    .send(newEmployee)
    .expect(400);
});
// Test case: Employee does not exist
test("Error if the employee does not exists", async () => {
  const { body } = await request(app)
   .put('/update-employee/' + data_source.update_inv_id)
    .send({ email: data_source.update_inv_email })
    .expect(404);
  expect(body.error).toEqual("Employee not found.");
});
// Test case: Successful update
test("Update employee - valid/Success", async () => {
  const { body } = await request(app)
    .put('/update-employee/' + data_source.update_emp_id)
    .send({ email: data_source.update_email })
    .expect(200);
  expect(body.message).toEqual("Employee email updated successfully.");
  expect(body.updatedEmployee).toHaveProperty('email', data_source.update_email);
});
});
