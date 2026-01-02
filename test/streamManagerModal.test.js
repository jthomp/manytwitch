const { JSDOM } = require('jsdom');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Stream Manager Modal - Enter Key Submission', function() {
  let dom;
  let window;
  let document;
  let MT;

  beforeEach(function() {
    // Read the EJS template and convert it to HTML for testing
    const ejsContent = fs.readFileSync(
      path.join(__dirname, '../views/streamManagerModal.ejs'),
      'utf8'
    );
    
    // Simple EJS rendering - replace the mobile check with false for testing
    const htmlContent = ejsContent.replace('<%- isMobile ? \'modal-fullscreen\' : \'modal-dialog-centered\' %>', 'modal-dialog-centered');
    
    // Create a full HTML document with the modal content
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body>
          ${htmlContent}
          <script>
            // Mock Handlebars
            window.Handlebars = {
              compile: function(template) {
                return function(context) {
                  return template.replace(/\\{\\{stream\\}\\}/g, context.stream);
                };
              }
            };
            
            // Initialize MT namespace
            window.MT = {};
            window.MT.manager = {
              toggleAddButton: function() {
                const newStreamInput = document.getElementById("new_stream");
                const addButton = document.getElementById("add-stream-btn");
                if (newStreamInput.value.length > 0) {
                  addButton.removeAttribute("disabled");
                } else {
                  addButton.setAttribute("disabled", "disabled");
                }
              },
              addToTable: function(streamName) {
                // Mock implementation for testing
                window.lastAddedStream = streamName;
                const newStreamField = document.getElementById("new_stream");
                newStreamField.value = "";
                this.toggleAddButton();
              }
            };
            window.MT.streams = {
              getRecentStreams: function() {
                return [];
              }
            };
          </script>
        </body>
      </html>
    `;
    
    // Create JSDOM instance
    dom = new JSDOM(fullHtml, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost'
    });
    
    window = dom.window;
    document = window.document;
    MT = window.MT;
    
    // Wait for scripts to execute
    return new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(function() {
    if (dom) {
      dom.window.close();
    }
  });

  describe('Enter key functionality', function() {
    it('should submit when Enter is pressed with a valid stream name', function() {
      const input = document.getElementById('new_stream');
      const addBtn = document.getElementById('add-stream-btn');
      
      // Set a value in the input
      input.value = 'teststreamer';
      
      // Enable the button (simulating what happens when user types)
      MT.manager.toggleAddButton();
      
      // Verify button is enabled
      expect(addBtn.disabled).to.be.false;
      
      // Create and dispatch Enter key event
      const enterEvent = new window.KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      
      input.dispatchEvent(enterEvent);
      
      // Verify the stream was added
      expect(window.lastAddedStream).to.equal('teststreamer');
      
      // Verify input was cleared
      expect(input.value).to.equal('');
    });

    it('should not submit when Enter is pressed with empty input', function() {
      const input = document.getElementById('new_stream');
      const addBtn = document.getElementById('add-stream-btn');
      
      // Ensure input is empty
      input.value = '';
      MT.manager.toggleAddButton();
      
      // Verify button is disabled
      expect(addBtn.disabled).to.be.true;
      
      // Reset the last added stream tracker
      window.lastAddedStream = null;
      
      // Create and dispatch Enter key event
      const enterEvent = new window.KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      
      input.dispatchEvent(enterEvent);
      
      // Verify nothing was added
      expect(window.lastAddedStream).to.be.null;
    });

    it('should prevent default form submission when Enter is pressed', function() {
      const input = document.getElementById('new_stream');
      
      input.value = 'teststreamer';
      MT.manager.toggleAddButton();
      
      let defaultPrevented = false;
      
      // Create Enter key event
      const enterEvent = new window.KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      
      // Override preventDefault to track if it was called
      const originalPreventDefault = enterEvent.preventDefault;
      enterEvent.preventDefault = function() {
        defaultPrevented = true;
        originalPreventDefault.call(this);
      };
      
      input.dispatchEvent(enterEvent);
      
      // Verify preventDefault was called
      expect(defaultPrevented).to.be.true;
    });

    it('should not trigger on other keys', function() {
      const input = document.getElementById('new_stream');
      
      input.value = 'test';
      MT.manager.toggleAddButton();
      
      window.lastAddedStream = null;
      
      // Create a different key event (e.g., 'a' key)
      const aKeyEvent = new window.KeyboardEvent('keydown', {
        key: 'a',
        code: 'KeyA',
        keyCode: 65,
        which: 65,
        bubbles: true,
        cancelable: true
      });
      
      input.dispatchEvent(aKeyEvent);
      
      // Verify nothing was added
      expect(window.lastAddedStream).to.be.null;
      
      // Verify input value is unchanged
      expect(input.value).to.equal('test');
    });
  });

  describe('Input event for autocomplete', function() {
    it('should trigger autocomplete on input event', function() {
      const input = document.getElementById('new_stream');
      const autocompleteResults = document.getElementById('autocomplete-results');
      
      // Initially should be hidden or empty
      const initialDisplay = autocompleteResults.style.display;
      
      input.value = 'test';
      
      // Create and dispatch input event
      const inputEvent = new window.Event('input', {
        bubbles: true,
        cancelable: true
      });
      
      input.dispatchEvent(inputEvent);
      
      // The autocomplete results should be shown (even if empty)
      // This verifies the event listener is working
      expect(autocompleteResults.style.display).to.equal('block');
    });
  });

  describe('Button state management', function() {
    it('should enable button when input has value', function() {
      const input = document.getElementById('new_stream');
      const addBtn = document.getElementById('add-stream-btn');
      
      // Initially disabled
      expect(addBtn.disabled).to.be.true;
      
      // Add value and toggle
      input.value = 'streamer123';
      MT.manager.toggleAddButton();
      
      // Should be enabled
      expect(addBtn.disabled).to.be.false;
    });

    it('should disable button when input is empty', function() {
      const input = document.getElementById('new_stream');
      const addBtn = document.getElementById('add-stream-btn');
      
      // Set value and enable
      input.value = 'streamer123';
      MT.manager.toggleAddButton();
      expect(addBtn.disabled).to.be.false;
      
      // Clear value and toggle
      input.value = '';
      MT.manager.toggleAddButton();
      
      // Should be disabled
      expect(addBtn.disabled).to.be.true;
    });
  });
});
