/**
 * ManyTwitch
 * Copyright (C) Justin Thompson (Antillian)
 * https://www.twitter.com/antillian_
*/

/**
 * Establish and define our namespaces.
*/
const MT = {};
MT["manager"] = {};     // the stream manager modal.
MT["streams"] = {};    // managing streams.
MT["util"] = {};      // utils.
MT["settings"] = {}; // user settings.

/**
 * Recalculate the size of the streams if the window is resized.
*/
window.onresize = () => {
  return setTimeout(MT.streams.handleResize(), 500);
};

/**
 * Setup a listener for the new stream field on the manager modal.
 */
window.document.getElementById("new_stream").addEventListener("paste", (event) => {
  const addStreamBtn = document.getElementById("add-stream-btn");

  if ($(this).length < 1) {
    addStreamBtn.setAttribute("disabled", "disabled");
  } else {
    addStreamBtn.removeAttribute("disabled");
  }
});

/**
 * Passthrough for logging a message to the browser's console.
 * @param {String} msg The message to log to the console.
*/
log = (msg) => {
  const env = window.document.getElementsByTagName("body")[0].dataset.env;
  if (window.console && window.console.log && env != "production") {
    window.console.log(msg);
  }
};

// methods for the stream manager modal.
MT.manager = {

  /**
   * Add a stream to the recent streams table in the stream manager.
   * @param {String} recentStreamParm The stream to add to the recents table.
  */
  addToRecentsTable(recentStreamParm="") {
    log("MT.manager.addToRecentsTable() - Begin");

    const recentStreamsTable = document.getElementById("recent-streams-list-tbody");
    if (recentStreamParm != "") {
      let existing = document.getElementById(`tr-recent-${recentStreamParm}`);

      if (existing != null) {
        log(`\t Skipping adding stream: ${recentStreamParm}`);
      } else {
        // add to table via template.
        let source = document.getElementById("streams-modal-new-recent-stream-template").innerHTML.trim();
        let template = Handlebars.compile(source);
        let context = { stream: recentStreamParm };
        let html = template(context);
        recentStreamsTable.innerHTML += html;
        log(`\t Adding stream: ${recentStreamParm}`);
      }

    }

    log("MT.manager.addToRecentsTable() - End");
  },

  /**
   * Add new stream to the stream manager table.
   * @param {String} streamParm The stream to add.
  */
  addToTable(streamParm="") {
    log("MT.manager.addToTable() - Begin");
 
     const streamsTable =   document.getElementById("streams-list-tbody");
     const newStreamField = document.getElementById("new_stream");
     const saveBtn =        document.getElementById("save-btn");
     const streamManagerDefaultContent = document.getElementById("streams-manager-default-content");
 
     if (streamParm != "") {
      log(`\t Adding ${streamParm}`);
       let newStream = streamParm != "" ? streamParm : newStreamField.value;
       let source = document.getElementById("streams-modal-new-stream-template").innerHTML.trim();
       let template = Handlebars.compile(source);
       let context = { stream: newStream };
       let html = template(context);
 
       streamsTable.innerHTML += html;
       newStreamField.value = "";
       saveBtn.removeAttribute("disabled");
       MT.manager.toggleAddButton();
       streamManagerDefaultContent.style.display = "none";

       let currentRecentStreams = MT.streams.getRecentStreams();
       currentRecentStreams.push(streamParm);
       MT.streams.setRecentStreams(currentRecentStreams);
       MT.manager.addToRecentsTable(streamParm); 
     }
 
     if (document.getElementById("streams-modal").style.display == "block") {
       newStreamField.click();
     }
 
    log("MT.manager.addToTable() - End");
  },

  /**
   * Various logic that needs to be done when the manager modal is hidden.
  */
  hidden() {
    log("MT.manager.hidden() - Begin");

    const newStreamField = document.getElementById("new_stream");
    const addStreamBtn = document.getElementById("add-stream-btn");

    newStreamField.value = "";
    addStreamBtn.setAttribute("disabled", "disabled");

    log("MT.manager.hidden() - End");
  },

  /**
   * Setup various elements on the manager modal before it's shown.
  */
  show() {
    log("MT.manager.show() - Begin");

    const saveBtn = document.getElementById("save-btn");
    const addStreamBtn = document.getElementById("add-stream-btn");
    const streamManagerDefaultContent = document.getElementById("streams-manager-default-content");
    const clearAllRecentStreamsBtn = document.getElementById("clear-all-recent-streams-btn");

    clearAllRecentStreamsBtn.style.display = (MT.streams.getRecentStreams().length > 0) ? "block" : "none";

    Array.from(document.getElementsByClassName("streams-modal-table-tr")).forEach(element => {
      element.remove();
    });

    Array.from(document.getElementsByClassName("recent-streams-modal-table-tr")).forEach(element => {
      element.remove();
    });

    // add our current streams to the streams table.
    Array.from(MT.streams.getStreams()).forEach(element => {
      MT.manager.addToTable(element);
    });

    // add our recent streams to the recent streams table.
    Array.from(MT.streams.getRecentStreams()).forEach(element => {
      MT.manager.addToRecentsTable(element);
    });

    if (MT.util.streamCount() == 0) {
      addStreamBtn.setAttribute("disabled", "disabled");
      saveBtn.setAttribute("disabled", "disabled");
      streamManagerDefaultContent.style.display = "block";
    } else {
      saveBtn.removeAttribute("disabled");
      streamManagerDefaultContent.style.display = "none";
    }

    const mutedSettingCheckbox = document.getElementById("mutedSetting");
    let mutedSetting = JSON.parse(MT.settings.getSettings()).muted;
    mutedSettingCheckbox.checked = mutedSetting;

    log("MT.manager.show() - End");
  },

  /**
   * Setup various elements on the manager modal after it's shown.
  */
  shown() {
    log("MT.manager.shown() - Begin");

    const addStreamBtn = document.getElementById("add-stream-btn");
    const newStreamField = document.getElementById("new_stream");
    const saveBtn = document.getElementById("save-btn");
    const streamManagerDefaultContent = document.getElementById("streams-manager-default-content");

    newStreamField.focus();
    if (MT.util.streamCount() == 0) {
      addStreamBtn.setAttribute("disabled", "disabled");
      saveBtn.setAttribute("disabled", "disabled");
      streamManagerDefaultContent.style.display = "block";
    } else {
      saveBtn.removeAttribute("disabled");
      streamManagerDefaultContent.style.display = "none";
    }

    log("MT.manager.shown() - End");
  },

  /**
   * Removes a stream from the recents stream manager table, as well as localStorage.
   * @param {String} recentStreamParm 
  */
  removeFromRecentsTable(recentStreamParm="", clearAll=false) {
    log("MT.manager.removeFromRecentsTable() - Begin");

    let currentRecentStreams = MT.streams.getRecentStreams();

    if (recentStreamParm != "") {
      log(`\t Removing stream ${recentStreamParm}`);
      document.getElementById(`tr-recent-${recentStreamParm}`).remove();
      let recentStreamParmIdx = currentRecentStreams.indexOf(recentStreamParm);
      currentRecentStreams.splice(recentStreamParmIdx, 1);
      MT.streams.setRecentStreams(currentRecentStreams);
    }

    currentRecentStreams = MT.streams.getRecentStreams();

    if (clearAll || currentRecentStreams.length == 0) {
      MT.streams.setRecentStreams("");
      document.getElementById("recent-streams-list-tbody").innerHTML = "";
      document.getElementById("clear-all-recent-streams-btn").style.display = "none";
    }

    log("MT.manager.removeFromRecentsTable() - End");
  },

  /**
   * Remove a given stream from the stream manager table.
   * @param {String} streamParm The stream to remove.
  */
  removeFromTable(streamParm="") {
    log("MT.manager.removeFromTable() - Begin");

    if (streamParm != "") {
      log(`\t Removing stream ${streamParm}`);
      document.getElementById(`tr-${streamParm}`).remove();
    }

    log("MT.manager.removeFromTable() - End");
  },

  /**
   * Toggles the add stream button on the stream manager modal.
  */
  toggleAddButton() {
    const newStreamInput = document.getElementById("new_stream");
    const addButton =      document.getElementById("add-stream-btn");
    if (newStreamInput.value.length > 0) {
      addButton.removeAttribute("disabled");
    } else {
      addButton.setAttribute("disabled", "disabled");
    }
  }

},

// methods to handle user settings.
MT.settings = {

  /**
   * Returns an array of settings in localStorage.
   * @returns {Array} The settings stored in localStorage.
  */
  getSettings() {
    let settings = window.localStorage.getItem("settings");

    if (settings == null) {
      let muteSetting = {
        "mute": "false"
      }
      window.localStorage.setItem("settings", muteSetting);
      settings = window.localStorage.getItem("settings");
    }

    return (settings == "") ? [] : settings;
  },

  /**
   * Set the key and value of a setting.
   * @param {String} key The name of the setting.
   * @param {String} value The value of the setting.
  */
  setSetting(key="", value="") {
    if (key != "" && value != "") {
      let settingKeyValuePair = {
        [key]: value
      }
      log(settingKeyValuePair);
      window.localStorage.setItem("settings", JSON.stringify(settingKeyValuePair));
    }
  },

  toString() {
    // ...
  }

},

// methods to manage the streams.
MT.streams = {

  /**
   * Returns an array of the recent streams stored in localStorage.
   * @returns {Array} The recent streams stored in localStorage.
  */
  getRecentStreams() {
    let recents = window.localStorage.getItem("recents");
    
    if (recents == null) {
      window.localStorage.setItem("recents", "");
      recents = window.localStorage.getItem("recents");
    }

    return (recents == "") ? [] : recents.split(",").sort();
  },

  /**
   * Returns an array of the streams stored in localStorage.
   * @return {Array} The streams stored in localStorage.
  */
  getStreams() {
    let localStorage = window.localStorage.getItem("streams");
    return (localStorage == "") ? [] : localStorage.split(",");
  },

  /**
   * Handles resizing streams on the document.
  */
  handleResize() {
    log("MT.streams.handleResize() - Begin");

    const streamsContainer = document.getElementById("streams-container");
    let numStreams = MT.util.streamCount();
    let innerWindowHeight = window.innerHeight - 48;
    let containerWidth = document.getElementById("container").clientWidth;
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
  
    Array.from(document.getElementsByClassName("stream-iframe")).forEach(element => {
      element.height = Math.floor(calculatedHeight);
      element.width = Math.floor(calculatedWidth);
    });

    streamsContainer.style.paddingTop = `${containerPadding}px`;
    
    log("MT.streams.handleResize() - End");
  },

  /**
   * Set the value for the recents object in localStorage.
   * @param {String} streamsParm The list of streams to store in recents object in localStorage.
  */
  setRecentStreams(recentStreamsParm="") {
    log("MT.streams.setRecentStreams() - Begin");
    let newRecentStreamsParm = Array.from(new Set(recentStreamsParm)).sort().join(",");
    window.localStorage.setItem("recents", newRecentStreamsParm);
    log("MT.streams.setRecentStreams() - End");
  },

  /**
   * Set the streams in localStorage with a collection of streams.
   * @param {String} streamsParm The streams to store in localStorage.
  */
  setStreams(streamsParm) {
    log("MT.streams.setStreams() - Begin");

    log(`\t streamsParm: ${streamsParm}`);
    window.localStorage.setItem("streams", streamsParm);

    log("MT.streams.setStreams() - End");
  },
  
  /**
   * Update the current streams stored in localStorage.
   * @param {Boolean} reordered If the user reordered the streams, we need to reload them based on the given order.
  */
  update(reordered=false) {
    log("MT.streams.update() - Begin");

    const streamsContainer = document.getElementById("streams-container");
    const manage =           document.getElementById("manage-btn");
    const defaultContainer = document.getElementById("default-content-container");
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
          let newStreamSource = document.getElementById("new-stream-template").innerHTML.trim();
          let newStreamTemplate = Handlebars.compile(newStreamSource);
          let muteSetting = JSON.parse(MT.settings.getSettings()).muted;
          let newStreamContext = { stream: element, muteSetting: muteSetting };
          let newStreamHTML = newStreamTemplate(newStreamContext);
          streamsContainer.innerHTML += newStreamHTML;
        }

      });

      streamSpans = document.getElementsByClassName("stream");
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
        window.localStorage.setItem("streams", "");
      }
    }

    if (numStreams > 0) {
      defaultContainer.style = "display: none !important;";
      manage.style.display = "block";
    } else {
      defaultContainer.style.display = "block";
      manage.style.display = "none";
      document.getElementById("streams-container").innerHTML = "";
    }

    // save settings.
    let mutedSettingValue = document.getElementById("mutedSetting").checked == true ? "true" : "false";
    MT.settings.setSetting("muted", mutedSettingValue);

    MT.streams.handleResize();
    MT.streams.updateHistory();
    
    log("MT.streams.update() - End");
  },

  /**
   * Update the current URL to include all current streams.
  */
  updateHistory() {
    log("MT.streams.updateHistory() - Start");

    let streams = MT.streams.getStreams();
    let newURL = "";

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
   * Checks to see if localStorage API is available on this device.
   * @return {Boolean} The result of the check for localStorage API availability.
  */
  checkForLocalStorageAPI(type) {
    var storage;
    try {
      storage = window[type];
      var x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch(e) {
      log(e);
      return false;
    }
  },

  /**
   * Returns a count of how many streams are stored in localStorage.
   * Warning: This does not reflect the state of the stream manager modal table.
   * @return {Number} The number of streams.
  */
  streamCount() {
    return MT.streams.getStreams().length;
  }

};