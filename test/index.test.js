describe('Load the homepage', function() {

  it('loads the index with no streams', function(browser) {

	browser
		  .url('http://localhost:8080/')
		  .assert.visible('#default')
		  .assert.not.visible('#streams-container')
		  .assert.textContains('#default', 'Welcome to ManyTwitch')
		  .assert.textContains('#default', "Let's Watch!")
		  .assert.textContains('#default', 'By Antillian')
		  .end();

  });

  it('loads the index with one stream', function(browser) {
	browser
		  .url('http://localhost:8080/arcus')
		  .assert.not.visible('#default')
		  .assert.not.visible('#disclaimer')
		  .assert.visible('#manage-btn')
		  .assert.visible('span#stream-arcus-video')
		  .end();
  });

  it('loads the index with multiple streams', function(browser) {

	browser
		  .url('http://localhost:8080/arcus/lackattack')
		  .assert.not.visible('#default')
		  .assert.not.visible('#disclaimer')
		  .assert.visible('#manage-btn')
		  .assert.visible('span#stream-arcus-video')
		  .assert.visible('span#stream-lackattack-video')
		  .end();

  });

});