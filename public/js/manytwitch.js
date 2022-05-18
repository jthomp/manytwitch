/**
 * ManyTwitch
 * Copyright (C) Justin Thompson (Antillian)
 * https://www.twitter.com/antillian_
 */

/**
 * Establish and define our namespaces.
*/
const MT = {};
MT['manager'] = {};
MT['streams'] = {};
MT['util'] = {};

/**
 * Recalculate the size of the streams if the window is resized.
 */
window.onresize = () => {
  return setTimeout(MT.streams.handleResize(), 500);
};

/**
 * Passthrough for logging a message to the browser's console.
 * @param {String} msg The message to log to the console.
 */
log = (msg) => {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

// methods for the stream manager modal.
MT.manager = {

  /**
   * Toggles the add stream button on the stream manager modal.
   */
  toggleAddButton() {
    const newStreamInput = document.getElementById('new_stream');
    const addButton =      document.getElementById('add-stream-btn');
    if (newStreamInput.value.length > 0) {
      addButton.removeAttribute('disabled');
    } else {
      addButton.setAttribute('disabled', 'disabled');
    }
  },

  /**
   * Add new stream to the stream manager table.
   * @param {String} streamParm The stream to add.
  */
  addToTable(streamParm) {
   log('MT.manager.addToTable() - Begin');

    const streamsTable =   document.getElementById('streams-list-tbody');
    const newStreamField = document.getElementById('new_stream');
    const saveBtn =        document.getElementById('save-btn');
    const streamManagerDefaultContent = document.getElementById('streams-manager-default-content');

    if (streamParm != '') {
     log(`\t Adding ${streamParm}`);
      let newStream = streamParm != "" ? streamParm : newStreamField.value;
      let source = document.getElementById('streams-modal-new-stream-template').innerHTML.trim();
      let template = Handlebars.compile(source);
      let context = { stream: newStream };
      let html = template(context);

      streamsTable.innerHTML += html;
      newStreamField.value = '';
      saveBtn.removeAttribute('disabled');
      MT.manager.toggleAddButton();
      streamManagerDefaultContent.style.display = 'none';
    }

    if (document.getElementById('streams-modal').style.display == 'block') {
      newStreamField.click();
    }

   log('MT.manager.addToTable() - End');
  },

  /**
   * Remove a given stream from the stream manager table.
   * @param {String} streamParm The stream to remove.
  */
  removeFromTable(streamParm) {
    log('MT.manager.removeFromTable() - Begin');
    if (streamParm != '') {
      log(`\t Removing stream ${streamParm}`);
      document.getElementById(`tr-${streamParm}`).remove();  
    }
    log('MT.manager.removeFromTable() - End');
  }

},

// methods to manage the streams.
MT.streams = {

  /**
   * Returns an array of the streams stored in sessionStorage.
   * @return {Array} The streams stored in sessionStorage.
  */
  getStreams() {
    let sessionStorage = window.sessionStorage.getItem('streams');
    return (sessionStorage == '') ? [] : sessionStorage.split(',');
  },

  /**
   * Set the streams in sessionStorage with a collection of streams.
   * @param {String} streamsParm The streams to store in sessionStorage.
  */
  setStreams(streamsParm) {
    log('MT.streams.setStreams() - Begin');

    log(`\t streamsParm: ${streamsParm}`);
    window.sessionStorage.setItem('streams', streamsParm);

    log('MT.streams.setStreams() - End');
  },
  
  /**
   * Update the current streams stored in sessionStorage.
   * @param {Boolean} reordered If the user reordered the streams, we need to reload them based on the given order.
  */
  update(reordered=false) {
    log('MT.streams.update() - Begin');

    const streamsContainer = document.getElementById('streams-container');
    const manage =           document.getElementById('manage-btn');
    const defaultContainer = document.getElementById('default-content-container');
    let streamsArray = MT.streams.getStreams();
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
      defaultContainer.style = "display: none !important;";
      manage.style.display = 'block';
    } else {
      defaultContainer.style.display = 'block';
      manage.style.display = 'none';
      document.getElementById('streams-container').innerHTML = '';
    }

    MT.streams.handleResize();
    MT.streams.updateHistory();
    
    log('MT.streams.update() - End');
  },

  /**
   * Handles resizing streams.
  */
  handleResize() {
    log('MT.streams.handleResize() - Begin');

    const streamsContainer = document.getElementById('streams-container');
    let numStreams = MT.util.streamCount();
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
    
    log('MT.streams.handleResize() - End');
  },

  /**
   * Update the current URL to include all current streams.
  */
  updateHistory() {
    log("MT.streams.updateHistory() - Start");

    const streams = MT.streams.getStreams();
    let newURL = '';

    streams.forEach(element => {
      newURL = `${newURL}/${element}`;
    });

    if (newURL != "") {
      history.replaceState(null, "", newURL);
    } else {
      history.replaceState(null, "", "/");
    }
    
    log("MT.streams.updateHistory() - End");
  }

},

// utils used by the app.
MT.util = {

  /**
   * Returns a count of how many streams are stored in sessionStorage.
   * Warning: This does not reflect the state of the stream manager modal table.
   * @return {Number} The number of streams.
  */
  streamCount() {
    return MT.streams.getStreams().length;
  }

};