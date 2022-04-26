describe('Load the homepage', function() {

  it('loads the index with no streams', function(browser) {

    browser
          .url('http://localhost:3000/')
          .assert.textContains('#default', 'Welcome to ManyTwitch')
          .assert.textContains('#default', "Let's Watch!")
          .assert.textContains('#default', 'PSOD Notice')
          .assert.textContains('#default', 'Created by Antillian')
          .assert.textContains('#disclaimer', 'ManyTwitch is not affiliated with Twitch or Amazon.')
          .end();

  });

});