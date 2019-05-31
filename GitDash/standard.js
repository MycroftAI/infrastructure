/*!
 *  standard.js
 
 *  (c) 2015-2016  Steve Penrod, other copyrights as indicated.
 *  penrod@gpll.org
 *
 *  MIT License
 */

///////////////////////////////////////
// logging support

var debuggingCategories = [
	];

function AddDebugCategory(cat)
{
	if (!IsDebugging(cat))
		debuggingCategories.push(cat);
}
function RemoveDebugCategory(cat)
{
	var index = debuggingCategories.indexOf(cat);    // <-- Not supported in <IE9
	if (index !== -1) {
		debuggingCategories.splice(index, 1);
	}
}

function setDebugging(aCats)
{
    debuggingCategories = aCats;
}

function IsDebugging(category)
{
	return !(debuggingCategories.indexOf(category) === -1);
}
	
function DebugLog(str, category)
{
	if (IsDefined(category))
	{
		// See if this is a category that we are looking for right now
		if (debuggingCategories.indexOf(category) === -1)
			return;		// ignore this message, we aren't debugging this category right now
	}
	
	if (!(typeof str === 'string' || str instanceof String))
		str = JSON.stringify(str);
	
	console.log(HHMMSSmmm()+" - "+str+"\n");
}

///////////////////////////////////////
// Javascript syntactic sugar

var MS = 1;										// in milliseconds, use like: 500*MS
var SEC = 1000;									// in milliseconds, use like: 5*SEC
var MIN = 60*SEC;								// in milliseconds, use like: 5*MIN
var HR =  60*HR;								// in milliseconds, use like: 5*HR

function unixNow()
{
	// unix time has a one second granularity
	return Math.floor(Date.now().valueOf() / SEC);
}

function HHMMSSmmm()
{
	var now = new Date();
	var MS = "000"+now.getMilliseconds();
	return now.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")+"."+MS.substr(MS.length-3);
}

function HHMMSS()
{
	return new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

function IsDefined(parameter)
{
	return !(typeof(parameter) === "undefined");
}

function IsValid(parameter)
{
	return IsDefined(parameter) && (parameter != null);
}

function Default(parameter, defaultValue)
{
	if (typeof(parameter) === "undefined")
		return defaultValue;
	else
		return parameter;
}

function EncodeForPHP(str)
{
	var enc = encodeURIComponent(str);
	return enc;
}

// Taken from:  http://www.html5rocks.com/en/tutorials/es6/promises/#toc-javascript-promises
// Added the optional respType parameter

function get(url, respType, auth) {
	return doXHR("GET", url, respType, auth);
}

// Ex: post("createAcct.php", "fname=Henry&lname=Ford");
//     post("compactDbase.php");
function post(url, data) {
	return doXHR("POST", url, data);
}

function doXHR(method, url, param, auth) {
	DebugLog("XHR "+method+": "+url, "XHR");
	
	// Return a new promise.
	return new Promise(function(resolve, reject) {
		// Do the usual XHR stuff
		var req = new XMLHttpRequest();
		
		if (method === "GET" && IsDefined(param))
		{
			var respType = param;
			if (respType === "blob" || respType === "arrayBuffer" || respType === "document" || respType === "json" || respType === "text")
				req.responseType = respType;
		}
		req.open(method, url);

		req.onload = function() {
			// This is called even on 404 etc
			// so check the status
			if (req.status === 200) {
				// Resolve the promise with the response text
				resolve(req.response);
			}
			else {
				// Otherwise reject with the status text
				// which will hopefully be a meaningful error
				reject(Error(req.statusText+": "+url));
			}
		};

		// Handle network errors
		req.onerror = function() {
			reject(Error("Network Error"));
		};

		// Make the request
		if (method === "POST" && IsDefined(param))
		{
			var data = param;
			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.send(data);
		}
		else
		{
			req.setRequestHeader("Authorization", "Basic "+auth)
			req.send();
		}
	});
}

///////////////////////////////////////
// use:
// var timeout = null;
// ...
// timeout = singleTimeout(someFunc, 1000, timeout);
// ...
// timeout = singleTimeout(someFunc, 2000, timeout);		// replaces the first timeout call with a restarted timer

function singleTimeout(callback, milliseconds, timerSingleton)
{
	if (timerSingleton !== null)
		clearTimeout(timerSingleton);
	return setTimeout(callback, milliseconds);
}


///////////////////////////////////////
// String utilties

// string str.trim()
if (typeof(String.prototype.trim) === "undefined")
{
	String.prototype.trim = function()
	{
		return String(this).replace(/^\s+|\s+$/g, '');
	};
}

// bool str.contains(text)
if (typeof(String.prototype.contains) === "undefined")
{
	String.prototype.contains = function(str, startIndex)
	{
		return ''.indexOf.call(this, str, startIndex) !== -1;
	};
}

// bool str.endsWith(suffix)
if (typeof(String.prototype.endsWith) === "undefined")
{
	String.prototype.endsWith = function(suffix)
	{
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

// bool str.startsWith(suffix)
if (typeof(String.prototype.startsWith) === "undefined")
{
	String.prototype.startsWith = function(prefix)
	{
		return this.indexOf(prefix) === 0;
	};
}



///////////////////////////////////////
// HTML/CSS helpers

function addClass(element, classToAdd) {
    var currentClassValue = element.className;
      
    if (currentClassValue.indexOf(classToAdd) == -1) {
        if ((currentClassValue == null) || (currentClassValue === "")) {
            element.className = classToAdd;
        } else {
            element.className += " " + classToAdd;
        }
    }
}
 
function removeClass(element, classToRemove) {
    var currentClassValue = element.className;
 
    if (currentClassValue == classToRemove) {
        element.className = "";
        return;
    }
 
    var classValues = currentClassValue.split(" ");
    var filteredList = [];
 
    for (var i = 0 ; i < classValues.length; i++) {
        if (classToRemove != classValues[i]) {
            filteredList.push(classValues[i]);
        }
    }
 
    element.className = filteredList.join(" ");
}

function slideTo(url)
{
//	$('body').toggle('slide');
	$('body').animate(
                        {
                            'margin-left':'-1000px',
                            'margin-right':'1000px'
                            // to move it towards the right and, probably, off-screen.
                        },200,
                        function(){
                            $(this).slideUp('fast');
                            // once it's finished moving to the right, just 
                            // removes the the element from the display, you could use
                            // `remove()` instead, or whatever.
                        }
                    );
			
	setTimeout(function() {window.location = url;}, 250 );
}

function slideFrom(url)
{
//	$('body').toggle('slide');
	$('body').animate(
                        {
                            'margin-left':'1000px',
							'margin-right':'-1000px'
                            // to move it towards the right and, probably, off-screen.
                        },200,
                        function(){
                            $(this).slideUp('fast');
                            // once it's finished moving to the right, just 
                            // removes the the element from the display, you could use
                            // `remove()` instead, or whatever.
                        }
                    );
	setTimeout(function() {window.location = url;}, 250 );
}

function getPosition(element)
{
    var xPosition = 0;
    var yPosition = 0;
  
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

///////////////////////////////////////
// HTML5 <audio> support
// Example:  PlaySound("working", 0.3);
//      for  <audio id="working" src="snd/working.mp3" loop="true"></audio>
// 

function PlaySound(audioID, vol) {
	vol = Default(vol, 1.0);
	DebugLog("PlaySound: "+audioID);
	var sound = document.getElementById(audioID);
	sound.volume = vol;
	sound.play();
}

function StopSound(audioID) {
	DebugLog("StopSound: '"+audioID+"'");
	var sound = document.getElementById(audioID);
	sound.pause();
}

function PlaySoundDelayed(audioID, delay, vol) {
	vol = Default(vol, 1.0);
	
	var sound = document.getElementById(audioID);
	var timeout = Default(sound.timeout, null);

	if (timeout !== null)
		clearTimeout(timeout);
	sound.timeout = setTimeout( function() { PlaySound(audioID, vol); }, delay);
}

function StopDelayedSound(audioID) {
	var sound = document.getElementById(audioID);
	var timeout = Default(sound.timeout, null);
	
	if (timeout !== null)
		clearTimeout(timeout);
	StopSound(audioID);
}
