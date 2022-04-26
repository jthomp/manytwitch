describe('Load the homepage', function() {

  it('loads the index with no streams', function(browser) {

    browser
          .url('http://localhost:3000/')
          .assert.visible('#default')
          .assert.not.visible('#streams-container')
          .assert.textContains('#default', 'Welcome to ManyTwitch')
          .assert.textContains('#default', "Let's Watch!")
          .assert.textContains('#default', 'PSOD Notice')
          .assert.textContains('#default', 'Created by Antillian')
          .assert.textContains('#disclaimer', 'ManyTwitch is not affiliated with Twitch or Amazon.')
          .end();

  });

  it('loads the index with one stream', function(browser) {
    browser
          .url('http://localhost:3000/arcus')
          .assert.not.visible('#default')
          .assert.not.visible('#disclaimer')
          .assert.visible('#manage-btn')
          .assert.visible('span#stream-arcus-video')
          .end();
  });

  it('loads the index with multiple streams', function(browser) {

    browser
          .url('http://localhost:3000/arcus/lackattack')
          .assert.not.visible('#default')
          .assert.not.visible('#disclaimer')
          .assert.visible('#manage-btn')
          .assert.visible('span#stream-arcus-video')
          .assert.visible('span#stream-lackattack-video')
          .end();

  });

});