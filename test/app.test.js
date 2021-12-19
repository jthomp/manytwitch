var expect = require('chai').expect;
var request = require('request');

describe("Load the index", function() {
  var url = "http://localhost:3000/";
  
  it("returns status 200", function(done) {
    request(url, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

describe("Load the index with a stream", function() {
  var url = "http://localhost:3000/arcus";
  
  it("returns status 200", function(done) {
    request(url, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();      
    });
  });
});

describe("Load the index with multiple streams", function() {
  var url = "http://localhost:3000/arcus/lackattack";
  
  it("returns status 200", function(done) {
    request(url, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

describe("Load the index with multiple streams and remove a stream.", function() {
  var url = "http://localhost:3000/arcus/lackattack";

  it("returns status 200", function(done) {
    request(url, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      // const button = document.querySelector(".js-super-special");
      const iframes = document.querySelector('iframe.stream');
      expect(iframes.length).to.equal(2);
      done();
    });
  });
});