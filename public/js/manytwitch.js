/**
 * ManyTwitch
 * Copyright (C) Justin Thompson (Antillian) 
 */

// define our namespaces.
const ManyTwitch = {};
ManyTwitch['manager'] = {};
ManyTwitch['streams'] = {};
ManyTwitch['util'] = {};

// resize the streams if the window is resized.
window.onresize = () => {
  return setTimeout(ManyTwitch.streams.handleResize(), 500);
};

// shortcut for logging to the browser's console.
log = (msg) => {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

// methods for the stream manager modal.
ManyTwitch.manager = {

  // enable/disable the add button in the stream manager modal.
  toggleAddButton() {
    const newStreamInput = document.getElementById('new_stream');
    const addButton =      document.getElementById('add-stream-btn');
    if (newStreamInput.value.length > 0) {
      addButton.removeAttribute('disabled');
    } else {
      addButton.setAttribute('disabled', 'disabled');
    }
  },

  // add stream to the stream manager table.
  addToTable(streamParm) {
   log('ManyTwitch.manager.addToTable() - Begin');

    const streamsTable =   document.getElementById('streams-list-tbody');
    const newStreamField = document.getElementById('new_stream');
    const saveBtn =        document.getElementById('save-btn');

    if (streamParm != '') {
     log(`\t Adding streamParm ${streamParm}`);
      let newStream = streamParm != "" ? streamParm : newStreamField.value;
      let source = document.getElementById('streams-modal-new-stream-template').innerHTML.trim();
      let template = Handlebars.compile(source);
      let context = { stream: newStream };
      let html = template(context);

      streamsTable.innerHTML += html;
      newStreamField.value = '';
      saveBtn.removeAttribute('disabled');
      ManyTwitch.manager.toggleAddButton();  
    }

    if (document.getElementById('streams-modal').style.display == 'block') {
      newStreamField.click();
    }

   log('ManyTwitch.manager.addToTable() - End');
  }

},

// methods to manage the streams.
ManyTwitch.streams = {

  // returns streams as an array.
  getStreams() {
    let sessionStorage = window.sessionStorage.getItem('streams');
    return (sessionStorage == '') ? [] : sessionStorage.split(',');
  },

  // set the streams sessionStorage item.
  setStreams(streamsParm) {
    log('ManyTwitch.streams.setStreams() - Begin');

    log(`\t streamsParm: ${streamsParm}`);
    window.sessionStorage.setItem('streams', streamsParm);

    log('ManyTwitch.streams.setStreams() - End');
  },
  
  // add/remove streams.
  update(reordered=false) {
    log('ManyTwitch.streams.update() - Begin');

    const streamsContainer = document.getElementById('streams-container');
    const manage =           document.getElementById('manage-btn');
    const defaultContainer = document.getElementById('default-content-container');
    let streamsArray = ManyTwitch.streams.getStreams();
    let streamSpans = [];
    let numStreams = 0;

    if (streamsArray.length > 0) {

      streamsArray.forEach(element => {
        let existing = document.getElementById(`stream-${element}-video`);

        if (existing != null && reordered) {
          existing.remove();
        }

        if (existing == null || reordered) {
         log(`\t Adding new stream: ${element}`);
          let newStreamSource = document.getElementById('new-stream-template').innerHTML.trim();
          let newStreamTemplate = Handlebars.compile(newStreamSource);
          let newStreamContext = { stream: element };
          let newStreamHTML = newStreamTemplate(newStreamContext);
          streamsContainer.innerHTML += newStreamHTML;
        }

      });

      streamSpans = document.getElementsByClassName('stream');
      numStreams = streamSpans.length;

      Array.from(streamSpans).forEach(element => {
        let streamName = element.dataset.streamName;
        if (!streamsArray.includes(streamName)) {
          log(`\t Removing ${streamName}`);
          document.getElementById(`stream-${streamName}-video`).remove();
          numStreams -= 1;
        }
      });

      // sanity check.
      if (numStreams <= 0) {
        numStreams = 0;
        window.sessionStorage.setItem('streams', '');
      }
    }

    if (numStreams > 0) {
      defaultContainer.style.display = 'none';
      manage.style.display = 'block';
    } else {
      defaultContainer.style.display = 'block';
      manage.style.display = 'none';
      document.getElementById('streams-container').innerHTML = '';
    }

    ManyTwitch.streams.handleResize();
    ManyTwitch.streams.updateHistory();
    
    log('ManyTwitch.streams.update() - End');
  },

  // handles resizing the streams based on the browser window size.
  handleResize() {
    log('ManyTwitch.streams.handleResize() - Begin');

    const streamsContainer = document.getElementById('streams-container');
    let numStreams = ManyTwitch.util.streamCount();
    let innerWindowHeight = window.innerHeight - 48;
    let containerWidth = document.getElementById('container').clientWidth;
    let calculatedHeight = 0;
    let calculatedWidth = 0;
    let containerPadding = 0;

    streamsContainer.width = containerWidth;

    for (let perRow=1; perRow<=numStreams; perRow++) {
      let numRows = Math.ceil(numStreams / perRow);
      let maxWidth = Math.floor(containerWidth / perRow) - 8;
      let maxHeight = Math.floor(innerWindowHeight / numRows) - 8;

      if (maxWidth * 9/16 < maxHeight) {
        maxHeight = maxWidth * 9/16;
      } else {
        maxWidth = maxHeight * 16/9;
      }

      if (maxWidth > calculatedWidth) {
        calculatedWidth = maxWidth;
        calculatedHeight = maxHeight;
        containerPadding = ((innerWindowHeight - numRows * maxHeight)/2) + 16;
      }
    }
  
    Array.from(document.getElementsByClassName('stream-iframe')).forEach(element => {
      element.height = Math.floor(calculatedHeight);
      element.width = Math.floor(calculatedWidth);
    });

    streamsContainer.style.paddingTop = `${containerPadding}px`;
    
    log('ManyTwitch.streams.handleResize() - End');
  },

  // updates the url to include all the current streams.
  updateHistory() {
    log("ManyTwitch.streams.updateHistory() - Start");

    const streams = ManyTwitch.streams.getStreams();
    let newURL = '';

    streams.forEach(element => {
      newURL = `${newURL}/${element}`;
    });

    if (newURL != "") {
      history.replaceState(null, "", newURL);
    } else {
      history.replaceState(null, "", "/");
    }
    
    log("ManyTwitch.streams.updateHistory() - End");
  }

},

// utils used by the app.
ManyTwitch.util = {

  // return how many streams there are.
  streamCount() {
    return ManyTwitch.streams.getStreams().length;
  }

};