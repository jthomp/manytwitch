const ManyTwitch = {};

if (typeof ManyTwitch === typeof undefined) {
  const ManyTwitch = {};
}

(function() {
  ManyTwitch["streams"] = {};
  ManyTwitch["manager"] = {};

  // resize the streams if the window is resized.
  window.onresize = function() {
    setTimeout(ManyTwitch.streams.update(), 100);
  };

})();

log = function(msg='') {
  console.log(msg);
}

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
    let streams = sessionStorage.getItem('streams');
    return (streams == '') ? [] : streams.split(',');
  },

  setStreams(streamsParm) {
    log('ManyTwitch.manager.setStreams() - Begin');

    log(`\t streamsParm: ${streamsParm}`);
    const streams = (typeof streamsParm == typeof undefined) ? '' : streamsParm;

    sessionStorage.setItem('streams', streams);

    log('ManyTwitch.manager.setStreams() - End');
  },

  // Util methods.

  toString() {
    return ManyTwitch.manager.getStreams().join(',');
  },

  streamCount() {
    return ManyTwitch.manager.getStreams().length;
  }
},

ManyTwitch.streams = {

  addToModalTable(streamParm) {
    log('ManyTwitch.streams.addToModalTable() - Begin');

    log(`t streamParm: ${streamParm}`);
    if (streamParm != "") {
      log(`\t Adding streamParm ${streamParm}`);
      const streamsTable = $('#streams-modal #streams-list tbody');
      const newStreamField = $('#streams-modal #new_stream');
      let newStream = streamParm != "" ? streamParm : newStreamField.val();
      const source = $('#streams-modal-new-stream-template').html();
      let template = Handlebars.compile(source);
      let context = { stream: newStream };
      let html = template(context);
      streamsTable.append(html);
  
      newStreamField.val('');
      $('#streams-modal #save-btn').removeAttr('disabled');
      ManyTwitch.manager.toggleAddButton();  
    }

    if ($('#streams-modal').css('display', 'block')) {
      $('#new_stream').focus();
    }

    log('ManyTwitch.streams.addToModalTable() - End');
  },
  
  update() {
    log('ManyTwitch.streams.update() - Begin');
    let streamsContainer = $('#streams');
    let manage = $('#manage-btn');
    let streams = ManyTwitch.manager.getStreams();
    let iframeStreams;
    let numStreams = 0;

    if (streams.length > 0) {

      log('\t Current streams: '+streams);

      $.each(streams, function(idx, value) {
        if ($(`span#stream-${value}-video`).length == 0) {
          log(`\t Adding new stream: ${value}`);
          const newStreamSource = $('#new-stream-template').html();
          const newStreamTemplate = Handlebars.compile(newStreamSource);
          const newStreamContext = { stream: value };
          const newStreamHTML = newStreamTemplate(newStreamContext);
          streamsContainer.append(newStreamHTML);  
        }
      });

      iframeStreams = $('iframe.stream');
      numStreams = iframeStreams.length;

      $.each(iframeStreams, function(idx, value) {
        let streamName = $(this).closest('span').prop('id').split('-')[1];
        if (!streams.includes(streamName)) {
          $(this).closest('span').remove();
        }
      });

      const windowHeight = $(window).innerHeight() - 48;
      const containerWidth = $('#container').width();
      streamsContainer.width(containerWidth);
      let calculatedHeight = 0;
      let calculatedWidth = 0;
      let containerPadding = 0;

      for (var perRow=1; perRow<=numStreams; perRow++) {
        const numRows = Math.ceil(numStreams / perRow);
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
    
      $('.stream').height(Math.floor(calculatedHeight));
      $('.stream').width(Math.floor(calculatedWidth));
      streamsContainer.css('padding-top', containerPadding);
    }

    const defaultContainer = $('#default');

    if (numStreams > 0) {
      defaultContainer.hide();
      manage.show();
    } else {
      defaultContainer.show();
      $('iframe.stream').remove();
      manage.hide();
    }

    log(`\t Current streams: ${streams}`);

    ManyTwitch.streams.updateHistory();
    log('ManyTwitch.streams.update() - End');
  },

  updateHistory() {
    log("ManyTwitch.streams.updateHistory() - Start");

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

    log("ManyTwitch.streams.updateHistory() - End");
  }
}