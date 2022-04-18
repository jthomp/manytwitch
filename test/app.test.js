// const expect = require('chai').expect;
// const request = require('request');

// describe("Load the index", function() {
//   const url = "http://localhost:3000/";
  
//   it("returns status 200", function(done) {
//     request(url, function(error, response, body) {
//       expect(response.statusCode).to.equal(200);
//       expect(body).to.not.equal('');
//       done();
//     });
//   });
// });

// describe("Load the index with a stream", function() {
//   const url = "http://localhost:3000/arcus";
  
//   it("returns status 200", function(done) {
//     request(url, function(error, response, body) {
//       expect(response.statusCode).to.equal(200);
//       expect(body).to.not.equal('');
//       done();      
//     });
//   });
// });

// describe("Load the index with multiple streams", function() {
//   const url = "http://localhost:3000/arcus/lackattack";
  
//   it("returns status 200", function(done) {
//     request(url, function(error, response, body) {
//       expect(response.statusCode).to.equal(200);
//       expect(body).to.not.equal('');
//       done();
//     });
//   });
// });