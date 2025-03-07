document.addEventListener("DOMContentLoaded", init, false);
function init() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/js/sw.js")
	  	.then((reg) => {
			console.debug("Service worker registered -->", reg);
	  	}, (err) => {
			console.debug("Service worker not registered -->", err);
	  	});
  	}
}