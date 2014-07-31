
// xPather.js
// ---------------------------------------------------------------------------------------------
// xPather.js offers an extension to the Firefox browser that allows the user utilize the xPath. 
// The functions below are implemented in this script. 
//
// Functions: 
//	Evaluate xPath (Paragraphs) - count how many xPaths of tag <p> exist in the DOM
//		-pathEvaluate();
// 	List xPath - user inputs a tag/element, dialog box returns those elements  
//		-listPaths();
// 	Find xPath - user inputs xPath to be found
//		-specifyPaths();
//	Highlight - implementation of jQuery in Firefox Browser
//		-highlight(); 
//	Get xPath - get xPath of highlighted element on webpage
//		-uiWebview_storeSelection();
//
// Author: Kevin T. Lee
// The Aerospace Corporation - CSRD - LinkWorks
// 
// Credits: //http://home.arcor.de/martin.honnen/javascript/storingSelection1.html
// ---------------------------------------------------------------------------------------------


// loads jQuery in Firefox Extension
(function() {var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
			 .getService(Components.interfaces.mozIJSSubScriptLoader);
loader.loadSubScript("chrome://content/js/jquery-2.0.1.js");})


// onload has to be put at the front of the JS document
var myExtension = {
    init: function() {
        // The event can be DOMContentLoaded, pageshow, pagehide, load or unload.
        if(gBrowser) gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);
    },
    onPageLoad: function(aEvent) {
        var doc = aEvent.originalTarget; // doc is document that triggered the event
        var win = doc.defaultView; // win is the window for the doc
        // test desired conditions and do something
        // if (doc.nodeName == "#document") return; // only documents
        // if (win != win.top) return; //only top window.
        // if (win.frameElement) return; // skip iframes/frames
        //alert("page is loaded \n" +doc.location.href);

       	//ajaxCall();
        
	}
}

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    myExtension.init(); 
},false);


function initOverlay() {
  var menu = document.getElementById("contentAreaContextMenu");
  menu.addEventListener("popupshowing", contextPopupShowing, false);
}

//The menu item will only appear when some page text is selected
function contextPopupShowing() {
  var menuitem = document.getElementById("hello-world");
  if(menuitem)
	menuitem.hidden = !gContextMenu.isTextSelected;
}

//Gives paragraph count in terms of HTML Window Document opened
function pathEvaluate() {
	//Gives DOM 
	var htmlDocument = top.document.getElementById('content').selectedBrowser.contentDocument;
	//alert(htmlDocument);

	var paragraphCount = htmlDocument.evaluate( 'count(//p)', htmlDocument, null, XPathResult.ANY_TYPE, null );   
	alert( 'This document contains ' + paragraphCount.numberValue + ' paragraph elements' ); 
	//alert(document.evaluate( 'count(//p)', document, null, XPathResult.ANY_TYPE, null).numberValue);
}


//Given an element tag, listPaths will alert the user with a dialog box of the element tag content
function listPaths() {
	var pathRequest = prompt("What element paths to list?");
	var pathRequested = "/html/body//" + pathRequest;
	var htmlDocument = top.document.getElementById('content').selectedBrowser.contentDocument;
	
	var headings = htmlDocument.evaluate(pathRequested, htmlDocument, null, XPathResult.ANY_TYPE, null); 
	var thisHeading = headings.iterateNext();
	var alertText = pathRequest + " in this document are: \n"; 
	
	while (thisHeading) {   
		alertText += thisHeading.textContent + "\n";   
		thisHeading = headings.iterateNext(); 
	} 
	
	alert(alertText); 
}

//given an xpath, example: /html/body/div/div/div[3]/div/div[4]/div[2]
function specifyPaths() {
	var pathRequest = prompt("What path do you want to search for?");
	var htmlDocument = top.document.getElementById('content').selectedBrowser.contentDocument;
	
	var headings = htmlDocument.evaluate(pathRequest, htmlDocument, null, XPathResult.ANY_TYPE, null); 
	var thisHeading = headings.iterateNext();
	var alertText = pathRequest + " in this document are: \n"; 
	
	var count = 1;
	while (thisHeading) {   
		alertText += "path requested #" + count + "\n" + thisHeading.textContent + "\n";   
		thisHeading = headings.iterateNext(); 
		count++;
	} 
	
	alert(alertText); 
}


//Working jQuery Function
function highlight(){

	// var browserDoc = gBrowser.selectedBrowser.contentDocument;
	// alert(browserDoc);
	
    /* jquery begin - */
    var htmlDocument = top.document.getElementById('content').selectedBrowser.contentDocument;

    var $j = jQuery.noConflict();

    //Highlights div with id="header"
    $j('#header', htmlDocument).css("background-color", "yellow");
    alert('highlighted header');

      
    //Hides div with id="description"
    // $j("#description", htmlDocument).hide();
    // alert('description hidden');

    // var selObj = htmlDocument.getSelection(); 
    // var selectedText = selObj.toString();
}


//Get XPath from highlighted HTML text
//http://home.arcor.de/martin.honnen/javascript/storingSelection1.html
function nsResolver(prefix){
    var ns = {
        'mathml' : 'http://www.w3.org/1998/Math/MathML', // for example's sake only
        'h' : 'http://www.w3.org/1999/xhtml'
    };
    return ns[prefix];
}

function makeXPath (node, currentPath) {
	/* this should suffice in HTML documents for selectable nodes, XML with namespaces needs more code */
	var htmlDocument = top.document.getElementById('content').selectedBrowser.contentDocument;
    currentPath = currentPath || '';
    switch (node.nodeType) {
        case 3:
        case 4:
            return makeXPath(node.parentNode, 'text()[' + (htmlDocument.evaluate('preceding-sibling::text()', node, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']');
        case 1:
        	return makeXPath(node.parentNode, node.tagName + (currentPath ? '/' + currentPath : ''));
            //return makeXPath(node.parentNode, node.tagName + '[' + (htmlDocument.evaluate('preceding-sibling::' + 'h:' + node.tagName, node, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']' + (currentPath ? '/' + currentPath : ''));
        case 9:
            return '/' + currentPath;
        default:
            return '';
    }
}

var uiWebview_xpath = "";

function uiWebview_storeSelection() 
{
	var htmlDocument = top.document.getElementById('content').selectedBrowser.contentDocument;
	
    if (typeof htmlDocument.getSelection != 'undefined')
     {
		var selection = htmlDocument.getSelection();
		var range = selection.getRangeAt(0);//two range, absolute and relative
		if (range != null) 
        {
		    uiWebview_xpath = makeXPath(range.startContainer); // + '|' + range.startOffset + '|' + makeXPath(range.endContainer) + '|' + range.endOffset;
		    // var x = document.getElementsByName("Hidden1");
		    // x.value = uiWebview_xpath;
		    alert(uiWebview_xpath);

		}

    }
    else if (typeof htmlDocument.selection != "undefined") {
        if (htmlDocument.selection.type == "Text") {
            html = htmlDocument.selection.createRange().htmlText;
            
        }
        alert(html);}
}

function uiWebview_restoreSelection () {
	var htmlDocument = top.document.getElementById('content').selectedBrowser.contentDocument;
    var selectionDetails = xpath;
    if (selectionDetails != null) {
        selectionDetails = selectionDetails.split(/\|/g);
        if (typeof htmlDocument.getSelection != 'undefined') {
            var selection = htmlDocument.getSelection();
            selection.removeAllRanges();
            var range = htmlDocument.createRange();
			var selectionDetails0 = selectionDetails[0];
			selectionDetails0 = selectionDetails0.replace(/\//g,"/h:");
			selectionDetails0 = selectionDetails0.replace("h:t","t");
			var selectionDetails2 = selectionDetails[2];
			selectionDetails2 = selectionDetails2.replace(/\//g,"/h:");
			selectionDetails2 = selectionDetails2.replace("h:t","t");
			range.setStart(htmlDocument.evaluate(selectionDetails0, htmlDocument, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue, Number(selectionDetails[1]));
			range.setEnd(htmlDocument.evaluate(selectionDetails2, htmlDocument, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue, Number(selectionDetails[3]));
																										
			var newSpanMark = htmlDocument.createElement("span");
			var newSpanMarkText = htmlDocument.createTextNode("|||| my span |||||");
			newSpanMark.appendChild(newSpanMarkText);
																										
			range.insertNode(newSpanMark) ;
		}
	}
}


/**
 * sample namespace.
 */
if ("undefined" == typeof(sample)) {
  var sample = {};
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
sample.BrowserOverlay = {
  /**
   * Says 'Hello' to the user.
   */
  sayHello : function(aEvent) {
    window.alert("Hello, Javascript Oncommand success!");
  }
};
