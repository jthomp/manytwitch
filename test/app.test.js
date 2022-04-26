describe('Load the homepage', function() {

  it('loads the index with no streams', function(browser) {

    browser
          .url('http://localhost:3000/')
          .assert.textContains('#default', 'Welcome to ManyTwitch')
          .assert.textContains('#default', "Let's Watch!")
          .end();

  });

});