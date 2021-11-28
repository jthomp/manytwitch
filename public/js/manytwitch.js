if (typeof ManyTwitch == typeof undefined) {
  var ManyTwitch = {};
}

(function() {
  ManyTwitch["streams"] = {};
  ManyTwitch["manager"] = {};

  // resize the streams if the window is resized.
  window.onresize = function() {
    setTimeout(ManyTwitch.streams.update(), 100);
  };

})();

ManyTwitch.manager = {
  toggleAddButton() {
    var newStreamInput = $('#streams-modal #new_stream');
    var addButton = $('#streams-modal #add-stream-btn');

    if (newStreamInput.val().length > 0) {
      addButton.removeAttr('disabled');
    } else {
      addButton.attr('disabled', 'disabled');
    }
  },

  // returns streams as an array
  getStreams() {
    var streams = sessionStorage.getItem('streams');
    return (streams == '') ? [] : streams.split(',');
  },

  setStreams(streamsParm) {
    console.log('ManyTwitch.manager.setStreams() - Begin');

    console.log('\t streamsParm: '+streamsParm);
    var streams = (typeof streamsParm == typeof undefined) ? '' : streamsParm;

    sessionStorage.setItem('streams', streams);

    console.log('ManyTwitch.manager.setStreams() - End');
  },

  getStreamsFromURL() {
    var path = window.location.pathname;
    var streamsFromURL = [];
    var splits = path.split('/');

    if (splits.length > 0) {
      $.each(splits, function(idx, value) {
        if (value != "") {
          streamsFromURL.push(value);
        }
      });
    }
    return streamsFromURL;
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
    console.log('ManyTwitch.streams.addToModalTable() - Begin');

    console.log('\t streamParm: '+streamParm);
    if (streamParm != "") {
      console.log('\t Adding streamParm '+streamParm);
      var streamsTable = $('#streams-modal #streams-list tbody');
      var newStreamField = $('#streams-modal #new_stream');
      var newStream = streamParm != "" ? streamParm : newStreamField.val();
      var source = $('#streams-modal-new-stream-template').html();
      var template = Handlebars.compile(source);
      var context = { stream: newStream };
      var html = template(context);
      streamsTable.append(html);
  
      newStreamField.val('');
      $('#streams-modal #save-btn').removeAttr('disabled');
      ManyTwitch.manager.toggleAddButton();  
    }

    if ($('#streams-modal').css('display', 'block')) {
      $('#new_stream').focus();
    }

    console.log('ManyTwitch.streams.addToModalTable() - End');    
  },
  
  update() {
    console.log('ManyTwitch.streams.update() - Begin');
    var streamsContainer = $('#streams');
    var manage = $('#manage-btn');
    var streams = ManyTwitch.manager.getStreams();

    if (streams.length > 0) {

      console.log('\t Current streams: '+streams);

      $.each(streams, function(idx, value) {
        var existing = $('span#stream-'+value+'-video');
        if (existing.length == 0) {
          console.log('\t Adding new stream: '+value);
          var newStreamSource = $('#new-stream-template').html();
          var newStreamTemplate = Handlebars.compile(newStreamSource);
          var newStreamContext = { stream: value };
          var newStreamHTML = newStreamTemplate(newStreamContext);
          streamsContainer.append(newStreamHTML);  
        }
      });

      $.each($('iframe.stream'), function(idx, value) {
        var streamName = $(this).closest('span').prop('id').split('-')[1];
        if (!streams.includes(streamName)) {
          $(this).closest('span').remove();
        }
      });

      var numStreams = $('iframe.stream').length;
      var windowHeight = $(window).innerHeight() - 48;
      var containerWidth = $('#container').width();
      streamsContainer.width(containerWidth);
      var calculatedHeight = 0;
      var calculatedWidth = 0;
      var containerPadding = 0;

      for (var perRow=1; perRow<=numStreams; perRow++) {
        var numRows = Math.ceil(numStreams / perRow);
        var maxWidth = Math.floor(containerWidth / perRow) - 4;
        var maxHeight = Math.floor(windowHeight / numRows) - 4;

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

    if (numStreams > 0) {
      $('#default').hide();
      manage.show();
    } else {
      $('#default').show();
      $('iframe.stream').remove();
      manage.hide();
    }

    console.log('\t Current streams: '+streams);

    ManyTwitch.streams.updateHistory();
    console.log('ManyTwitch.streams.update() - End');
  },

  updateHistory() {
    console.log("ManyTwitch.streams.updateHistory() - Start");

    var streams = ManyTwitch.manager.getStreams();
    var newUrl = "";

    $.each(streams, function(idx, value) {
      newUrl = newUrl+'/'+streams[idx];
    });

    if (newUrl != "") {
      history.replaceState(null, "", newUrl);
    } else {
      history.replaceState(null, "", "/");
    }

    console.log("ManyTwitch.streams.updateHistory() - End");
  }
}