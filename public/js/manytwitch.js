const ManyTwitch = {};

(function() {
  ManyTwitch["streams"] = {};
  ManyTwitch["manager"] = {};
  ManyTwitch["util"] = {};

  // resize the streams if the window is resized.
  window.onresize = function() {
    setTimeout(ManyTwitch.streams.update(), 100);
  };

})();

ManyTwitch.manager = {
  toggleAddButton() {
    const newStreamInput = $('#streams-modal #new_stream');
    const addButton = $('#streams-modal #add-stream-btn');

    if (newStreamInput.val().length > 0) {
      addButton.removeAttr('disabled');
    } else {
      addButton.attr('disabled', 'disabled');
    }
  },

  // returns streams as an array
  getStreams() {
    const streams = window.sessionStorage.getItem('streams');
    return (streams == '') ? [] : streams.split(',');
  },

  setStreams(streamsParm) {
    ManyTwitch.util.log('ManyTwitch.manager.setStreams() - Begin');

    ManyTwitch.util.log(`\t streamsParm: ${streamsParm}`);
    const streams = (typeof streamsParm == typeof undefined) ? '' : streamsParm;window.sessionStorage.setItem('streams', streams);

    ManyTwitch.util.log('ManyTwitch.manager.setStreams() - End');
  },

},

ManyTwitch.util = {

  streamCount() {
    return ManyTwitch.manager.getStreams().length;
  },

  log(msg='') {
    console.log(msg);
  }

},

ManyTwitch.streams = {

  addToModalTable(streamParm) {
    ManyTwitch.util.log('ManyTwitch.streams.addToModalTable() - Begin');

    ManyTwitch.util.log(`\t streamParm: ${streamParm}`);
    if (streamParm != "") {
      ManyTwitch.util.log(`\t Adding streamParm ${streamParm}`);
      let streamsTable = $('#streams-modal #streams-list tbody');
      let newStreamField = $('#streams-modal #new_stream');
      let newStream = streamParm != "" ? streamParm : newStreamField.val();
      let source = $('#streams-modal-new-stream-template').html();
      let template = Handlebars.compile(source);
      let context = { stream: newStream };
      let html = template(context);
      streamsTable.append(html);
  
      newStreamField.val('');
      $('#streams-modal #save-btn').removeAttr('disabled');
      ManyTwitch.manager.toggleAddButton();  
    }

    if ($('#streams-modal').css('display', 'block')) {
      $('#new_stream').trigger('click');
    }

    ManyTwitch.util.log('ManyTwitch.streams.addToModalTable() - End');
  },
  
  update() {
    ManyTwitch.util.log('ManyTwitch.streams.update() - Begin');
    const streamsContainer = $('#streams');
    const manage = $('#manage-btn');
    const defaultContainer = $('#default');
    let streams = ManyTwitch.manager.getStreams();
    let iframes = {};
    let numStreams = 0;

    if (streams.length > 0) {

      ManyTwitch.util.log('\t Current streams: '+streams);

      $.each(streams, function(idx, value) {
        if ($(`span#stream-${value}-video`).length == 0) {
          ManyTwitch.util.log(`\t Adding new stream: ${value}`);
          let newStreamSource = $('#new-stream-template').html();
          let newStreamTemplate = Handlebars.compile(newStreamSource);
          let newStreamContext = { stream: value };
          let newStreamHTML = newStreamTemplate(newStreamContext);
          streamsContainer.append(newStreamHTML);
        }
      });

      iframes = $('iframe.stream');
      ManyTwitch.util.log(`\t frames count: ${iframes.length}`);
      numStreams = iframes.length;

      $.each(iframes, function(idx, value) {
        let streamName = $(this).closest('span').prop('id').split('-')[1];
        if (!streams.includes(streamName)) {
          $(this).closest('span').remove();
          numStreams -= 1;
        }
      });

      if (numStreams < 0) {
        numStreams = 0;
      }

      let windowHeight = $(window).innerHeight() - 48;
      let containerWidth = $('#container').width();
      streamsContainer.width(containerWidth);
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
    
      $('.stream').height(Math.floor(calculatedHeight)).width(Math.floor(calculatedWidth));
      streamsContainer.css('padding-top', containerPadding);
    }

    if (numStreams > 0) {
      defaultContainer.hide();
      manage.show();
    } else {
      defaultContainer.show();
      $('iframe.stream').remove();
      manage.hide();
    }

    ManyTwitch.util.log(`\t Current streams: ${streams}`);

    ManyTwitch.streams.updateHistory();
    ManyTwitch.util.log('ManyTwitch.streams.update() - End');
  },

  updateHistory() {
    ManyTwitch.util.log("ManyTwitch.streams.updateHistory() - Start");

    let streams = ManyTwitch.manager.getStreams();
    let newUrl = "";

    $.each(streams, function(idx, value) {
      newUrl = newUrl+'/'+streams[idx];
    });

    if (newUrl != "") {
      history.replaceState(null, "", newUrl);
    } else {
      history.replaceState(null, "", "/");
    }

    ManyTwitch.util.log("ManyTwitch.streams.updateHistory() - End");
  }
}