const ManyTwitch = {};

(function() {
  ManyTwitch['manager'] = {};
  ManyTwitch['streams'] = {};
  ManyTwitch['util'] = {};

  // resize the streams if the window is resized.
  window.onresize = function() {
    setTimeout(ManyTwitch.streams.handleResize(), 100);
  };
})();

// methods for the stream manager modal.
ManyTwitch.manager = {

  toggleAddButton() {
    const newStreamInput = document.getElementById('new_stream');
    const addButton = document.getElementById('add-stream-btn');

    if (newStreamInput.value.length > 0) {
      addButton.removeAttribute('disabled');
    } else {
      addButton.setAttribute('disabled', 'disabled');
    }
  },

  addToTable(streamParm) {
    ManyTwitch.util.log('ManyTwitch.manager.addToTable() - Begin');

    const streamsTable = document.getElementById('streams-list-tbody');
    const newStreamField = document.getElementById('new_stream');
    const saveBtn = document.getElementById('save-btn');

    ManyTwitch.util.log(`\t streamParm: ${streamParm}`);
    if (streamParm != '') {
      ManyTwitch.util.log(`\t Adding streamParm ${streamParm}`);
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

    ManyTwitch.util.log('ManyTwitch.manager.addToTable() - End');
  }

},

ManyTwitch.streams = {

  // returns streams as an array
  getStreams() {
    let sessionStorage = window.sessionStorage.getItem('streams');
    return (sessionStorage == '') ? [] : sessionStorage.split(',');
  },

  setStreams(streamsParm) {
    ManyTwitch.util.log('ManyTwitch.streams.setStreams() - Begin');

    ManyTwitch.util.log(`\t streamsParm: ${streamsParm}`);
    window.sessionStorage.setItem('streams', streamsParm);

    ManyTwitch.util.log('ManyTwitch.streams.setStreams() - End');
  },
  
  update() {
    ManyTwitch.util.log('ManyTwitch.streams.update() - Begin');

    const streamsContainer = document.getElementById('streams');
    const manage = document.getElementById('manage-btn');
    const defaultContainer = document.getElementById('default');
    let streamsArray = ManyTwitch.streams.getStreams();
    let iframes = [];
    let numStreams = 0;

    if (streamsArray.length > 0) {

      streamsArray.forEach(element => {
        if (document.getElementById(`stream-${element}-video`) != null) return;

        ManyTwitch.util.log(`\t Adding new stream: ${element}`);
        let newStreamSource = document.getElementById('new-stream-template').innerHTML.trim();
        let newStreamTemplate = Handlebars.compile(newStreamSource);
        let newStreamContext = { stream: element };
        let newStreamHTML = newStreamTemplate(newStreamContext);
        streamsContainer.innerHTML += newStreamHTML;
      });

      iframes = document.getElementsByClassName('stream');
      numStreams = iframes.length;
      ManyTwitch.util.log(`\t Stream count: ${numStreams}`);

      Array.from(iframes).forEach(element => {
        let streamName = element.dataset.streamName;
        if (!streamsArray.includes(streamName)) {
          element.remove();
          numStreams -= 1;
        }
      });

      if (numStreams < 0) {
        numStreams = 0;
      }
    }

    ManyTwitch.util.log(`ManyTwitch.streams.update() - numStreams: ${numStreams}`);

    if (numStreams > 0) {
      defaultContainer.style.display = 'none';
      manage.style.display = 'block';
    } else {
      defaultContainer.style.display = 'block';
      Array.from(document.getElementsByClassName('stream')).forEach(element => {
        element.remove();
      });
      manage.style.display = 'none';
    }

    ManyTwitch.streams.handleResize();
    ManyTwitch.streams.updateHistory();

    ManyTwitch.util.log('ManyTwitch.streams.update() - End');
  },

  handleResize() {
    const streamsContainer = document.getElementById('streams');
    iframes = document.getElementsByClassName('stream');
    let numStreams = iframes.length;
    let windowHeight = window.innerHeight - 48;
    let containerWidth = document.getElementById('container').width;
    streamsContainer.width = containerWidth;
    let calculatedHeight = 0;
    let calculatedWidth = 0;
    let containerPadding = 0;

    for (let perRow=1; perRow<=numStreams; perRow++) {
      let numRows = Math.ceil(numStreams / perRow);
      let maxWidth = Math.floor(containerWidth / perRow) - 4;
      let maxHeight = Math.floor(windowHeight / numRows) - 4;

      if (maxWidth * 9/16 < maxHeight) {
        maxHeight = maxWidth * 9/16;
      } else {
        maxWidth = maxHeight * 16/9;
      }

      if (maxWidth > calculatedWidth) {
        calculatedWidth = maxWidth;
        calculatedHeight = maxHeight;
        containerPadding = (windowHeight - numRows * maxHeight)/2;
      }
    }
  
    Array.from(document.getElementsByClassName('stream')).forEach(element => {
      element.height = calculatedHeight;
      element.width = calculatedWidth;
    });

    document.getElementById('streams').style.paddingTop = containerPadding;
  },

  updateHistory() {
    ManyTwitch.util.log("ManyTwitch.streams.updateHistory() - Start");

    let streams = ManyTwitch.streams.getStreams();
    let newURL = "";

    streams.forEach(element => {
      newURL = newURL+'/'+element;
    });

    if (newURL != "") {
      history.replaceState(null, "", newURL);
    } else {
      history.replaceState(null, "", "/");
    }

    ManyTwitch.util.log("ManyTwitch.streams.updateHistory() - End");
  }
},

ManyTwitch.util = {

  streamCount() {
    return ManyTwitch.streams.getStreams().length;
  },

  log(msg='') {
    return console.log(msg);
  }

}