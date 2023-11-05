const screenfull = require("screenfull");
console.log(screenfull);
function fullScreen(){
    if (screenfull.isEnabled) {
        console.log("Full Screen Enabled");
		screenfull.request();
	} else {
        console.log("No Full Screen");
	}
}