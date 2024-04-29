const request = require('supertest');
const express = require('express');
const data_source = require('./data_source.json');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());
app.use('/', require('D:/Upscalepics/backend/admin/customer_care.js'));

                 //STRIPE - List Customer         
describe('Stripe list customer', () => {
// Test for Listing all Stripe customers
test('GET /customer-care/stripe/list-customers - success', async () => {
    const { body } = await request(app).get('/stripe/list-customers').expect(200);
    expect(body).toEqual(expect.objectContaining({ data: expect.anything() }));
    body.data.forEach(item => {
    expect(item).toEqual(expect.objectContaining({ id: expect.anything(), email: expect.anything() }));
    });
  });
});
                 //STRIPE - Fetch Customer  
describe('Stripe fetch customer', () => { 
  // Test for fetching a Stripe customer by email
  test('Fetching customer using valid email id', async () => {
    const newCustomer = { type : "email", value : data_source.stripe_valid_cus_email };
    const { body } = await request(app).post('/stripe/fetch-customer').send(newCustomer).expect(200);
    expect(body).toEqual(expect.objectContaining({ id: expect.anything(), email: newCustomer.value }));
  });
  
    // Test for fetching a Stripe customer by invalid email
    test('Error for fetching using invalid email', async () => {
      const newCustomer = { type: 'email', value: data_source.stripe_invalid_cus_email };
      const { body } = await request(app).post('/stripe/fetch-customer').send(newCustomer).expect(404);
      expect(body).toEqual(expect.objectContaining({ error: 'Customer not found.' }));
    });

 // Test for customer EMAIL : NULL
test('Error for fetching using NULL email field', async () => {
  const newCustomer = { type : "email", value :""};
  const { body } = await request(app).post('/stripe/fetch-customer').send(newCustomer).expect(400);
  expect(body).toEqual(expect.objectContaining({ id: expect.anything(), email: newCustomer.value }));
});

  // Test for fetching a Stripe customer by customerID
  test('Fetching using valid customerID', async () => {
    const newCustomer = { type : "customerID", value : data_source.stripe_valid_cus_id };
    const { body } = await request(app).post('/stripe/fetch-customer').send(newCustomer).expect(200);
    expect(body).toEqual(expect.objectContaining({ id: newCustomer.value }));
  });
 
  // Test for fetching a Stripe customer by customerID  //fail giving 500
test('Error for fetching using invalid customerId', async () => {
  const newCustomer = { type : "customerID", value : data_source.stripe_invalid_cus_id };
  const { body } = await request(app).post('/stripe/fetch-customer').send(newCustomer).expect(404);
  expect(body).toEqual(expect.objectContaining({ id: newCustomer.value }));
});

// Test for fetching a Stripe customer by customerID = NULL
test('Error when customerId : NULL', async () => {
  const newCustomer = { type : "customerID", value : "" };
  const { body } = await request(app).post('/stripe/fetch-customer').send(newCustomer).expect(400);
  expect(body).toEqual(expect.objectContaining({ id: newCustomer.value }));
});

  
  // Test for fetching a Stripe customer by subscriptionID -  NO SUBID SHOULD GIVE 500
  test('500 Error on fetching using subscriptionID', async () => {
    const newCustomer = { type: 'subscriptionID', value: data_source.stripe_valid_cus_id };//USED CUSTOMER ID SHOULD CHANGE
    const { body } = await request(app).post('/stripe/fetch-customer').send(newCustomer).expect(500);
    //expect(body).toEqual(expect.objectContaining({ id: expect.anything() }));
  });
   

  // Test for invalid search type
  test('Error on fetching using an invalid typr', async () => {
    const newCustomer = { type: 'invalid', value: 'test' };
    const { body } = await request(app).post('/stripe/fetch-customer').send(newCustomer).expect(400);
    expect(body).toEqual(expect.objectContaining({ error: 'Invalid search type specified.' }));
  });
});
                 //STRIPE GET - PRODUCT              
describe('Stripe get-product', () => {                
// Test for fetching a product using valid productId  
  test('valid productId return a product', async () => {
    const response = await request(app).get(`/stripe/get-product?productId=${data_source.stripe_valid_prodid}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Product fetched successfully');
  });

// Test - no productId provided 
  test('error if no productId is provided', async () => {
    const response = await request(app).get('/stripe/get-product');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errorMessage).toBe('Product ID is required');
  });
  
// Test - invalid productId
  test('error if the productId format is invalid', async () => {
    const response = await request(app).get('/stripe/get-product?productId=invalid');
  expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errorMessage).toBe('Invalid product ID format');
  });

// Test - productId invalid format
  test('error if the productId not-found', async () => { //giving 400
    const response = await request(app).get('/stripe/get-product?productId=${data_source.stripe_invalid_prodid}');
   expect(response.status).toBe(404);
   expect(response.body.success).toBe(false);
    expect(response.body.errorMessage).toBe('Invalid product ID format');
  });
});  
                 //STRIPE LIST-ALL-INVOICES   
describe('Stripe list-all-invoices', () => {           
// Test - listing invoices using valid customerId 
test('list of invoices using valid customerId', async () => {
  const response = await request(app).get(`/stripe/list-all-invoices?customerId=${data_source.stripe_listinv_cusid}`);
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe('Invoices fetched successfully');
  expect(Array.isArray(response.body.data)).toBe(true);
});

// Test - listing invoice using unregistered customerId
test('Error when listing invoices using unregistered customer id', async () => {  //Getting 500
  const response = await request(app).get(`/stripe/list-all-invoices?customerId=${data_source.stripe_invalid_cus_id}`);
  // Check that the request was successful
  expect(response.status).toBe(404);
});

// Test -  listing invoices using invalid customeId format
test('Error when using invalid customer id format', async () => {  //Getting 500
  const response = await request(app).get(`/stripe/list-all-invoices?customerId=${data_source.stripe_invalid_cus_email}`);
  // Check that the request was successful
  expect(response.status).toBe(400);
});
});
                 //STRIPE send-invoice-to-customer
describe('Stripe get latest payments endpoint', () => {

// Test sending invoice to customer using email(subscribed customer)
test('200 for sending an invoice', async () => {
const invoiceData = {
invoiceHostedUrl: data_source.invoice_hosted_url,
invoicePdfUrl: data_source.invoice_pdf_url,
email: data_source.stripe_invoice_valid_email,
};
const response = await request(app).post('/stripe/send-invoice-to-customer').send(invoiceData);
expect(response.status).toBe(200);
expect(response.body.success).toBe(true);
expect(response.body.message).toBe('Mail sent successfully.');
});

// Test - no data provided
test('error if no data is provided', async () => {
const response = await request(app).post('/stripe/send-invoice-to-customer');
expect(response.status).toBe(400);
expect(response.body.success).toBe(false);
expect(response.body.errorMessage).toBe('Invalid or missing invoiceHostedUrl.');
});

// Test - NO Email(subscribed user email)
test('error if NO EMAIL is passes', async () => {
const invoiceData = {
invoiceHostedUrl: data_source.invoice_hosted_url,
invoicePdfUrl: data_source.invoice_pdf_url,
email: "",};
const response = await request(app).post('/stripe/send-invoice-to-customer').send(invoiceData);
expect(response.status).toBe(400);
expect(response.body.success).toBe(false);
expect(response.body.errorMessage).toBe('Invalid or missing email.');
});

// Test - Invalid Email Format
test('400 for INVALID EMAIL FORMAT', async () => {
const invoiceData = {
invoiceHostedUrl: data_source.invoice_hosted_url,
invoicePdfUrl: data_source.invoice_pdf_url,
email: "jksdvbhsbvlk",
};
const response = await request(app).post('/stripe/send-invoice-to-customer').send(invoiceData);
expect(response.status).toBe(400);
expect(response.body.success).toBe(false);
expect(response.body.errorMessage).toBe('Invalid or missing email.');
});         

//Test - User having no subscription(no invoice)
test('404 for customer EMAIL HAVING NO INVOICE', async () => {
const invoiceData = {
invoiceHostedUrl: data_source.invoice_hosted_url,
invoicePdfUrl: data_source.invoice_pdf_url,
email: data_source.stripe_NO_invoice_valid_email,
};
const response = await request(app).post('/stripe/send-invoice-to-customer').send(invoiceData);
expect(response.status).toBe(404);
}); 
});
                 // GET-LATEST-PAYMENT-DETAILS
describe('Stripe get latest payments endpoint', () => {

  //Test valid customerID
test('valid customerID', async () => {
const response = await request(app).get(`/stripe/get-latest-payment-details?customerId=${data_source.stripe_listinv_cusid}`)
expect(response.status).toBe(200);
expect(response.body.success).toBe(true);
expect(response.body.message).toBe('Latest payment intent fetched successfully');
expect(typeof response.body.data).toBe('object');
});

//Test no customerID
test('error if no customerId is provided', async () => {
const response = await request(app).get('/stripe/get-latest-payment-details?customerId=');
expect(response.status).toBe(400);expect(response.body.success).toBe(false);
expect(response.body.errorMessage).toBe('Customer ID is required');
});

// Test - No latest Payment Found
test('error if no payment intents are found', async () => {
const response = await request(app).get(`/stripe/get-latest-payment-details?customerId=${data_source.stripe_valid_cus_id}`)
expect(response.status).toBe(404);
expect(response.body.success).toBe(false);
expect(response.body.errorMessage).toBe('No payment intents found for this customer');
});

//Test - invalid customer id format
test('error for invalid customerId Format ', async () => {
  const response = await request(app).get(`/stripe/get-latest-payment-details?customerId=cus1bh33b`)
  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  });
});
                 // FETCH-SUBSCRIPTION                   
 describe('Stripe Fetch-subscription endpoint', () => {
 // Test - Fetch subscription using customerId  
test('Subscriptions for valid customer ID', async () => {
const requestData = {
type: 'customerID',
value: data_source.stripe_listinv_cusid,
};
const response = await request(app).post('/stripe/fetch-subscriptions').send(requestData);
expect(response.status).toBe(200);
expect(response.body.success).toBe(true);
expect(response.body.message).toBe('subscription fetched successfully');
});

// Test - Fetching without specifying type                    
test('error if no type(customerId) is provided', async () => {
const requestData = {
value: data_source.stripe_listinv_cusid,
};
const response = await request(app).post('/stripe/fetch-subscriptions').send(requestData);
expect(response.status).toBe(400);
expect(response.body.success).toBe(false);
expect(response.body.errorMessage).toBe('Invalid search type specified. Use "customerID" or "email".');
});

//Test - No customerId
test('error if no value is provided', async () => {
const requestData = {
type: 'customerID',
value: ''
};
 const response = await request(app).post('/stripe/fetch-subscriptions').send(requestData);
 expect(response.status).toBe(400);
 expect(response.body.success).toBe(false);
 });

//Test - invalid customerId
test('error if invalid customerId is provided', async () => {
  const requestData = {
  type: 'customerID',
  value: 'abcdeg'
  };
   const response = await request(app).post('/stripe/fetch-subscriptions').send(requestData);
   expect(response.status).toBe(400);
   expect(response.body.success).toBe(false);
   });
 });
                 //STRIPE CANCELLATION
/*
// Test for canceling a Stripe subscription
test('POST /customer-care/stripe/cancel-subscription - success', async () => {
  const newSubscription = { subscriptionId: 'sub_test' };
  const { body } = await request(app).post('/stripe/cancel-subscription').send(newSubscription).expect(200);
  expect(body).toEqual(expect.objectContaining({ message: 'Subscription canceled successfully', subscription: expect.anything() }));
});


// Test for canceling a Stripe subscription that does not exist
test('POST /customer-care/stripe/cancel-subscription - failure', async () => {
  const newSubscription = { subscriptionId: 'abcguhsdffbhsb' };
  const { body } = await request(app).post('/stripe/cancel-subscription').send(newSubscription).expect(500);
  expect(body).toEqual(expect.objectContaining({ error: expect.anything() }));
});
*/
/*
// Test for refunding and canceling a Stripe subscription
test('POST /customer-care/stripe/refund-and-cancel-subscription - success', async () => {
  const newSubscription = { subscriptionId: 'sub_test' };
  const { body } = await request(app).post('/customer-care/stripe/refund-and-cancel-subscription').send(newSubscription).expect(200);
  expect(body).toEqual(expect.objectContaining({ message: 'Subscription canceled and last payment refunded successfully', refundedInvoice: expect.anything(), canceledSubscription: expect.anything() }));
});

// Test for refunding and canceling a Stripe subscription that does not exist
test('POST /customer-care/stripe/refund-and-cancel-subscription - failure', async () => {
  const newSubscription = { subscriptionId: 'sub_notfound' };
  const { body } = await request(app).post('/customer-care/stripe/refund-and-cancel-subscription').send(newSubscription).expect(500);
  expect(body).toEqual(expect.objectContaining({ error: expect.anything() }));
});
*/

/*
// Test for canceling a Stripe subscription without providing a subscriptionId
test('POST /customer-care/stripe/cancel-subscription - failure (no subscriptionId)', async () => {
  const { body } = await request(app).post('/customer-care/stripe/cancel-subscription').send({}).expect(400);
  expect(body).toEqual(expect.objectContaining({ error: 'subscriptionId is required.' }));
});

// Test for refunding and canceling a Stripe subscription without providing a subscriptionId
test('POST /customer-care/stripe/refund-and-cancel-subscription - failure (no subscriptionId)', async () => {
  const { body } = await request(app).post('/customer-care/stripe/refund-and-cancel-subscription').send({}).expect(400);
  expect(body).toEqual(expect.objectContaining({ error: 'subscriptionId is required.' }));
});

// Test for refunding and canceling a Stripe subscription with an unpaid invoice
test('POST /customer-care/stripe/refund-and-cancel-subscription - failure (unpaid invoice)', async () => {
  const newSubscription = { subscriptionId: 'sub_unpaid' };
  const { body } = await request(app).post('/customer-care/stripe/refund-and-cancel-subscription').send(newSubscription).expect(400);
  expect(body).toEqual(expect.objectContaining({ error: 'Latest invoice has not been paid or does not have a valid payment intent.' }));
});
*/
      
           
                      //PAYPAL

/*
// Fetching all PayPal customers
test('GET /customer-care/paypal/list-customers - success', async () => {
    const { body } = await request(app).get('/paypal/list-customers').expect(200);
    expect(body).toEqual(expect.objectContaining({ userNames: expect.anything() }));
    body.userNames.forEach(item => {
      expect(typeof item).toBe('string');
    });
  });
  
  // Testing error handling
  test('GET /customer-care/paypal/list-customers - failure', async () => {
    // Here you should mock an error from the axios call
    // For example, you can use jest.mock() to mock the axios module
    const { body } = await request(app).get('/customer-care/paypal/list-customers').expect(500);
    expect(body).toEqual(expect.objectContaining({ error: expect.anything() }));
  });
  
  // Test for unauthorized access
test('GET /customer-care/paypal/list-customers - unauthorized', async () => {
    // Here you should mock an unauthorized response from the axios call
    const { body } = await request(app).get('/customer-care/paypal/list-customers').expect(401);
    expect(body).toEqual(expect.objectContaining({ error: 'Unauthorized' }));
  });
  
  // Test for service unavailable
  test('GET /customer-care/paypal/list-customers - service unavailable', async () => {
    // Here you should mock a service unavailable response from the axios call
    const { body } = await request(app).get('/customer-care/paypal/list-customers').expect(503);
    expect(body).toEqual(expect.objectContaining({ error: 'Service Unavailable' }));
  });
  
  // Test for bad request
  test('GET /customer-care/paypal/list-customers - bad request', async () => {
    // Here you should mock a bad request response from the axios call
    const { body } = await request(app).get('/customer-care/paypal/list-customers').expect(400);
    expect(body).toEqual(expect.objectContaining({ error: 'Bad Request' }));
  });
  */
 /*
 // Test for fetching a PayPal customer
test('GET /customer-care/paypal/fetch-customer - success', async () => {
  const { body } = await request(app).get('/customer-care/paypal/fetch-customer?userName=test@example.com').expect(200);
  expect(body).toEqual(expect.objectContaining({ userName: 'test@example.com' }));
});

// Test for fetching a PayPal customer that does not exist
test('GET /customer-care/paypal/fetch-customer - failure', async () => {
  const { body } = await request(app).get('/customer-care/paypal/fetch-customer?userName=notfound@example.com').expect(404);
  expect(body).toEqual(expect.objectContaining({ error: 'Customer not found.' }));
});
*/






