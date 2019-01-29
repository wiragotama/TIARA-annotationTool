/** 
 * Global variables
 */
var labelLocation = 0.01;
var arrowLocation = 0.95;
var arrowWidth = 20;
var arrowLength = 12
var dotRadius = 8;
var rectangleWidth = 15;
var rectangleHeight = 15;
var defaultConnectionColor = "lightgray";
var defaultConnectedColor = "yellow";
var defaultHoverColor = "orange";
var defaultStrokeWidth = 3
var defaultStrokeHoverWidth = 7
var defaultTarget = "";
var defaultRelation = "";
var mode = "production"; // {"debug", "production"}
var Nsentences = -1; // global variable, number of sentences in the window, prompt included
var allowIntermediarySave = false; // set false if we only allows annotator to save only when the annotation is done; true if annotators can save midway

/** 
 * Initiating Dialog Box
 */
$(document).ready(function() {
    $( "#relation-dialog" ).dialog({
        autoOpen:false
    });
});


/**
 * Scroll page automatically when dragging --> seems buggy, disabled
 */
// var clicked = false, clickY;
// $(document).on({
//     'mousemove': function(e) {
//         clicked && updateScrollPos(e);
//     },
//     'mousedown': function(e) {
//         clicked = true;
//         clickY = e.pageY;
//     },
//     'mouseup': function() {
//         clicked = false;
//         $('html').css('cursor', 'auto');
//     }
// });
// var updateScrollPos = function(e) {
//     $('html').css('cursor', 'row-resize');
//     $(window).scrollTop($(window).scrollTop() + (e.pageY - clickY));
// }


/**
 * Definition of jsPlumb inBound connection Endpoint Type
 */
var inBound = {
    anchor: ["BottomLeft", "Continuous"],
    isSource: false,
    isTarget: true,
    ConnectionsDetachable: true,
    ReattachConnections: true,
    maxConnections: -1, //the number of inbound connection is not limited
    endpoint: ["Dot", {radius: dotRadius}],
    endpointStyle: {fill: defaultConnectionColor, outlineStroke: defaultConnectionColor},
    endpointHoverStyle: {fill: defaultHoverColor, outlineStroke: defaultHoverColor},
};


/** 
 * Definition of jsPlumb outBound connection Endpoint Type
 */
var outBound = {
    connector: ["StateMachine", { curviness: 80, promixityLimit: 0} ],
    anchor: ["TopLeft", "Continuous"],
    Overlays: [
        ["Arrow", {width: arrowWidth, length: arrowLength, location: arrowLocation}],
        ["Label", {label:"label", location: labelLocation, cssClass:"relation-label"}]
    ],
    isSource: true,
    isTarget: false,
    ConnectionsDetachable: true,
    ReattachConnections: true,
    maxConnections: 1, //the number of outbound connection
    endpoint: ["Rectangle", {width: 15, height: 15}],
    paintStyle: {fill: defaultConnectionColor, stroke: defaultConnectionColor, strokeStyle: defaultConnectionColor, strokeWidth: defaultStrokeWidth},
    hoverPaintStyle: {fill: defaultHoverColor, stroke: defaultHoverColor, strokeStyle: defaultHoverColor, strokeWidth: defaultStrokeHoverWidth},
    endpointStyle: {fill: defaultConnectionColor, outlineStroke: defaultConnectionColor},
    endpointHoverStyle: {fill: defaultHoverColor, outlineStroke: defaultHoverColor},
    connectorStyle: {stroke: defaultConnectionColor, strokeStyle: defaultConnectionColor, strokeWidth: defaultStrokeWidth},
    connectorHoverStyle: {stroke: defaultHoverColor, strokeStyle: defaultHoverColor, strokeWidth: defaultStrokeHoverWidth}
};


/** 
 * Dropping listener
 */
 function droppingListener() {
	$("input[type=checkbox]").on('change', function() {
		var checkbox = $(this);
		var checkboxId = checkbox.attr("id");
		var sentenceNumber = getSentenceIdNumber(checkbox.attr("id"));
		if (checkbox.is(":checked")) {
			if (mode=="debug") {alert(checkboxId+" is checked");}
			addLogRecord("Drop", sentenceNumber);

			$("#sentence"+sentenceNumber).addClass('hide-text').removeClass('show-text');
			$("#textarea"+sentenceNumber).addClass('hide-text').removeClass('show-text');
			$("#annotation"+sentenceNumber).addClass('hide-text-dropping').removeClass('show-text-dropping');
			
			// drop relations when dropping sentence
			inboundConn = jsPlumb.getConnections({target: "sentence"+sentenceNumber});
			outboundConn = jsPlumb.getConnections({source: "sentence"+sentenceNumber});
			if (mode=="debug") {alert("Number of inbound connections "+inboundConn.length);}
			for (var i=0; i < inboundConn.length; i++) {
				dropRelationLabelDOM(inboundConn[i].sourceId, inboundConn[i].targetId);
				jsPlumb.deleteConnection(inboundConn[i]);
				setSourceEndpointColor(inboundConn[i].sourceId, defaultConnectionColor);
			}
			if (mode=="debug") {alert("Number of outbound connections "+outboundConn.length);}
			for (var i=0; i < outboundConn.length; i++) {
				dropRelationLabelDOM(outboundConn[i].sourceId, outboundConn[i].targetId);
				jsPlumb.deleteConnection(outboundConn[i]);
			}
			setSourceEndpointColor("sentence"+sentenceNumber, defaultConnectionColor);
			$("#dropping"+sentenceNumber).val("drop");
		}
		else {
			if (mode=="debug") {alert(checkboxId+" is unchecked");}
			addLogRecord("Un-drop", sentenceNumber);
			$("#sentence"+sentenceNumber).addClass('show-text').removeClass('hide-text');
			$("#textarea"+sentenceNumber).addClass('show-text').removeClass('hide-text');
			$("#annotation"+sentenceNumber).addClass('show-text-dropping').removeClass('hide-text-dropping');
			$("#dropping"+sentenceNumber).val("non-drop");
		}
	});
}


/**
 * Load pre-formatted essay (xml) into the window, then establish connections based on the information present
 */
$("#load-file").on('change', function(event) {
	jsPlumb.reset(); // removes every endpoint, detaches every connection, and clears the event listeners list. Returns jsPlumb instance to its initial state.
	event.preventDefault(); // do not refresh the page

	if (mode=="debug") {alert("Load menu is clicked")};

	var file = event.target.files[0]; // get only the first one
	if (file) {
		var reader = new FileReader();
		reader.onload = function(e) { 
			var content = e.target.result;
			if (mode=="debug") {
				alert( "Got the file.n" 
					+"name: " + file.name + "n"
					+"type: " + file.type + "n"
					+"size: " + file.size + " bytesn"
					+ "starts with: " + content.substr(1, content.indexOf("n"))
				);  
			}
			document.getElementsByClassName('draggable-area')[0].innerHTML = content;
			Nsentences = document.getElementsByClassName("flex-item").length + 1; //prompt is included in the calculation
			
			initializeJsPlumb(Nsentences);
			addLogRecord("Load", file.name);
		}
		reader.readAsText(file);
	} 
	else { 
		alert("Failed to load file");
	}
});


/**
 * Initialization of the jsPlumb
 * @param{integer} Nsentences, number of sentences in the text including prompt
 */
 function initializeJsPlumb(Nsentences) {
 	jsPlumb.ready(function() {
	    jsPlumb.setContainer(document.getElementById("draggable-area"));

	    // initializing sortable
	    $(".flex-container").sortable();
		$(".flex-item").disableSelection();

	    // repaint connection when dragging sentence
	    var is_dragging = false;
	    $(".flex-container").sortable({
	        start: function(event, ui) {
	            is_dragging = true;
	            addLogRecord("Reordering-start", getCurrentOrdering());
	        },
	        stop: function(event, ui) {
	            is_dragging = false;
	            jsPlumb.recalculateOffsets($(ui.item).parents(".draggable-area"));
	            jsPlumb.repaintEverything();
	            addLogRecord("Reordering-end", getCurrentOrdering());
	        }
	    })
	    .on("mousemove", function(e) {
	        if (is_dragging) {
	            jsPlumb.repaintEverything();
	        }
	    });

	    // Creating Endpoints for each sentence, except the prompt
	    createEndpoints(Nsentences);

	    // Creating existing relation information
		for (var i=1; i < Nsentences; i++) {
			paintExistingConnection(i);
		}

	    // General event binding
	    eventsBinding();
	    droppingListener();
	});
}


/**
 * Save essay (xml) into local file
 */
$("#save_menu").on('click', function(event) {
	if (mode=="debug") {
		alert("Save menu is clicked");
	}

	if (allowIntermediarySave || (!allowIntermediarySave && isFullAnnotation() && checkRepairFormat())) {
		event.preventDefault(); //do not refresh the page
		addLogRecord("Save");

		// Handling textarea
		for (var i=1; i < Nsentences; i++) {
			document.getElementById("textarea"+i).innerHTML = $("#textarea"+i).val();
		}

		var cut = document.getElementsByClassName('draggable-area')[0].innerHTML.indexOf("div class=\"jtk-endpoint");
		var text = document.getElementsByClassName('draggable-area')[0].innerHTML.substring(0, cut-1);
		var filename = $(".essay-code .col-md-10 #essay_code_ICNALE").text().trim() + "-annotated.xml";
		download(filename, text);

		alert("Refresh the page after the download is complete!")
	}
});
/** END GLOBAL PARAMETERS AND INITIALIZATION **/



/**
 * Check (shallowly) whether the annotators has finished the annotation
 * Definition: each sentence has outgoing connections (incoming otherwise) or dropped if no connection; OR all sentences are dropped. Only one node (non-dropped) has no outgoing connection at maximum
 */
function isFullAnnotation() {
	var verdict = []; 
	var droppingFlag = [];
	var incomingFlag = [];
	var outgoingFlag = [];
	var allNodesHaveConnection = true;
	var outgoingCount = 0;

	// initialization
	for (var i=0; i < Nsentences; i++) {
		droppingFlag.push(false);
		incomingFlag.push(false);
		outgoingFlag.push(false);
		verdict.push(false);
	}

	// fill the nodes information
	for (var i=1; i < Nsentences; i++) {
		var target = $("#target"+i).text();
		var relation = $("#relation"+i).text();
		var dropping = $("#dropping"+i).val();
		// console.log(getSentenceIdNumber(target)+","+relation+","+dropping);
		if (dropping == "non-drop") {
			if (target != defaultTarget && relation !=defaultRelation) {
				outgoingFlag[i] = true;
				incomingFlag[parseInt(getSentenceIdNumber(target))] = true;
				outgoingCount += 1;
			}
		}
		else {
			droppingFlag[i] = true;
			outgoingCount += 1;
		}
	}

	// annotation checking
	message = "You have not connected the following sentences: ";
	var first = true;
	for (var i=1; i < Nsentences; i++) {
		verdict[i] = droppingFlag[i] || (!droppingFlag[i] && (incomingFlag[i] || outgoingFlag[i]));
		allNodesHaveConnection = allNodesHaveConnection && verdict[i];

		if (!verdict[i]) {
			if (first) {
				message = message + i;
			}
			else {
				message = message + ", " + i;
			}
			first = false;
		}
	}

	if (!allNodesHaveConnection) { // Unconnected nodes
		message = "You cannot save because your annotation is incomplete!\n"+message;
		alert(message);
	}
	else {
		// How many nodes have outgoing connection
		if (outgoingCount == Nsentences-2) { // prompt is not counted so -2
			return allNodesHaveConnection;
		}
		else {
			message = "Only one non-dropped sentences is allowed not to have outgoing connection!\n"
			message = message + "The following sentences have no outgoing connection: "
			var first = true;
			for (var i=1; i < Nsentences; i++) {
				if (!droppingFlag[i] && !outgoingFlag[i]) {
					if (first) {
						first = false;
						message = message + i; 
					}
					else {
						message = message + ", " + i;
					}
				}
			}
			alert(message);
			return false;
		}
	}
}


/**
 * Check (shallowly) whether the annotator follows the repair formatting 
 * This works by checking the parenthesis
 */
function checkRepairFormat() {
	var flag = false;

	for (var i=1; i < Nsentences; i++) {
		sentence = document.getElementById("textarea"+i).innerHTML = $("#textarea"+i).val();

		var stack = [];
		var mode = "";
		for (var j=0; j < sentence.length; j++) {
			if (sentence.charAt(j) == '[') {
				mode = "push";
				stack.push(j);
			}
			else if (sentence.charAt(j) == '|') {
				mode = "pop";
			}
			else if (sentence.charAt(j) == ']') {
				if (mode == "pop") {
					if (stack.length != 0) {
						stack.pop();
					}
					else {
						flag = true;
					}
				}
			}
		}

		if (stack.length > 0) {
			flag = true;
		}

		if (flag) {
			alert("The text repair in sentence "+i+" does not follow the formatting standard!");
			break;
		}
	}

	return !flag;
}


/**
 * Download a text file
 * @param{string} filename, save filename
 * @param{string} text
 */
function download(filename, text) {
	var pom = document.createElement('a');
	pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	pom.setAttribute('download', filename);

	if (document.createEvent) {
	    var event = document.createEvent('MouseEvents');
	    event.initEvent('click', true, true);
	    pom.dispatchEvent(event);
	}
	else {
	    pom.click();
	}
}


/**
 * Creating Endpoints for each sentence
 * @param{integer} 	numberOfSentences, prompt included
 */
function createEndpoints(numberOfSentences) {
	// The number of endpoint is the same as number of sentences; except we do not create endpoint for prompt
	for (var i=1; i < numberOfSentences; i++) {
		sentence_id = "sentence"+i;
		jsPlumb.addEndpoint(sentence_id, inBound, {uuid:"ib"+i}); 
		jsPlumb.addEndpoint(sentence_id, outBound, {uuid:"ob"+i});
	}
}


/**
 * Binding events that may occur in the sentences connection
 */
function eventsBinding() {
	// New connection is established
	jsPlumb.bind("connection", function(info) {	
		var conn = info.connection;
		if (mode=="debug") {alert("Source = "+conn.sourceId+"; Target = "+conn.targetId);}
		setRelationLabelDOM(conn.sourceId, conn.targetId, "temporary"); // for cycle detection
		
		// Establish connection if cycle is not detected
		var cycle = cycleDetection(Nsentences, conn.sourceId);
		if (cycle) { 
			// cycle detected
			alert("You cannot establish this new link because it causes circular connection");
			dropRelationLabelDOM(conn.sourceId, conn.targetId);
			connObj = jsPlumb.getConnections({source: conn.sourceId, target: conn.targetId})[0];
			jsPlumb.deleteConnection(connObj);
		}
		else { 
			// no cycle, safe
			// check whether connect to dropped sentence
			if ($('#dropping'+getSentenceIdNumber(conn.sourceId)+':checked').length > 0 || $('#dropping'+getSentenceIdNumber(conn.targetId)+':checked').length > 0) {
				alert("You cannot establish link from or to a dropped sentence");
				dropRelationLabelDOM(conn.sourceId, conn.targetId);
				connObj = jsPlumb.getConnections({source: conn.sourceId, target: conn.targetId})[0];
				jsPlumb.deleteConnection(connObj);
			}
			else { // select type of relation
				addLogRecord("Relation-add", "connection between "+getSentenceIdNumber(conn.sourceId)+" to "+getSentenceIdNumber(conn.targetId)+" is established");
				relationDialog(conn);
			}
		}
	});

	// Binding clicking event on connection
	jsPlumb.bind("click", function(conn) {
	    if (mode=="debug") {alert("connection between "+conn.sourceId+" and "+conn.targetId+" is clicked");}
	    relationDialog(conn);
	});

	// Binding detaching event 
	jsPlumb.bind('connectionDetached', function(info) {
		var conn = info.connection;
		if (mode=="debug") {alert("connection between "+conn.sourceId+" -> "+conn.targetId+" is detached");}
		dropRelationLabelDOM(conn.sourceId, conn.targetId);
		setSourceEndpointColor(conn.sourceId, defaultConnectionColor);
		addLogRecord("Relation-delete", "connection between "+getSentenceIdNumber(conn.sourceId)+" to "+getSentenceIdNumber(conn.targetId)+" is detached");
	});
}


/**
 * Get the adjacency matrix representation of the relations
 * @param{integer} numberOfSentences, prompt included
 * @return{array} adjacency matrix
 */
function adjMatrix(numberOfSentences) {
	// get an empty matrix ready
	var matrix = [];
	for (var i=0; i < numberOfSentences; i++) {
		matrix[i] = [];
		for (var j=0; j< numberOfSentences; j++) {
			matrix[i][j] = 0; //no connection from sentence i to sentence j
		}
	}
	// build adjacency matrix
	for (var i=1; i < numberOfSentences; i++) {
		var targetIdx = parseInt(getSentenceIdNumber($("#target"+i).text()));
		matrix[i][targetIdx] = 1; // connection from sentence i to targetIdx
	}

	if (mode=="debug") {
		console.log("ADJACENCY MATRIX");
		for (var i=1; i < numberOfSentences; i++) {
			for (var j=0; j < numberOfSentences; j++) {
				console.log("["+i+","+j+"] "+matrix[i][j]);
			}
		}
		console.log("------\n");
	}
	return matrix;
}


/**
 * Checking whether cycle exist
 * @param{integer} numberOfSentences, prompt included
 * @param{string} sourceId, source sentence where we want to check the cycle
 * @return{boolean}
 */
function cycleDetection(numberOfSentences, sourceId) {
	var matrix = adjMatrix(numberOfSentences);
	var visited = [numberOfSentences];
	for (var i=0; i < numberOfSentences; i++) {
		visited[i] = 0;
	}
	return cycleDetectionRec(numberOfSentences, matrix, visited, parseInt(getSentenceIdNumber(sourceId)));
}


/**
 * Traversing graph recursively to check whether cycle exist
 * @param{integer} numberOfSentences, prompt included
 * @param{array} adjacency matrix
 * @param{array} visited flag, saving the information of which nodes have been visited
 * @param{integer} currentSentencesIdx, current sentence in the traversal
 * @return{boolean}
 */
function cycleDetectionRec(numberOfSentences, matrix, visited, currentSentenceIdx) {
	if (mode=="debug") {alert("traversing node "+currentSentenceIdx);}
	if (visited[currentSentenceIdx]==0) {
		visited[currentSentenceIdx] = 1;
		var flag = false; // no cycle
		for (var i=0; i < numberOfSentences; i++) {
			if (matrix[currentSentenceIdx][i]==1) {
				flag = cycleDetectionRec(numberOfSentences, matrix, visited, i);
				if (flag) { // cycle detected
					break;
				}
			}
		}
		return flag;
	}
	else {
		if (mode=="debug") {alert("Cycle detected! "+currentSentenceIdx);}
		return true; // cycle detected
	}
}


/** 
 * Selection of relation for sentences connection
 * @param(object) conn, jsPlum Connection Class
 */
function relationDialog(conn) {
	$( "#relation-dialog" ).dialog({
	    // autoOpen:false,
	    closeOnEscape: false,
	    dialogClass: "no-close",
	    position: {my: "center top", at: "center top+80", of: window},
	    height: 100,
	    title: "Relation option "+getSentenceIdNumber(conn.sourceId)+" -> "+getSentenceIdNumber(conn.targetId),
	    buttons: [
	        {
	            text: "=",
	            class: "rel-equal-mark",
	            style: "width:37px; text-align:center",
	            click: function() {
	                $(this).dialog("close");
	                setRelationLabelColor(conn.sourceId, conn.targetId, "=");
	                setRelationLabelDOM(conn.sourceId, conn.targetId, "=");
	                setSourceEndpointColor(conn.sourceId, defaultConnectedColor);
	                addLogRecord("Relation-add", "connection between "+getSentenceIdNumber(conn.sourceId)+" to "+getSentenceIdNumber(conn.targetId)+" is labeled =");
	            }
	        },
	        {
	            text: "sup",
	            class: "rel-sup-mark",
	            style: "margin-left:10px; width:37px; text-align:left",
	            click: function() {
	                $(this).dialog("close");
	                setRelationLabelColor(conn.sourceId, conn.targetId, "sup");
	                setRelationLabelDOM(conn.sourceId, conn.targetId, "sup");
	                setSourceEndpointColor(conn.sourceId, defaultConnectedColor);
                 	addLogRecord("Relation-add", "connection between "+getSentenceIdNumber(conn.sourceId)+" to "+getSentenceIdNumber(conn.targetId)+" is labeled sup");
	            }
	        },
	        {
	            text: "det",
	            class: "rel-det-mark",
	            style: "margin-left:10px; width:37px; text-align:left",
	            click: function() {
	                $(this).dialog("close");
	                setRelationLabelColor(conn.sourceId, conn.targetId, "det");
	                setRelationLabelDOM(conn.sourceId, conn.targetId, "det");
	                setSourceEndpointColor(conn.sourceId, defaultConnectedColor);
	                addLogRecord("Relation-add", "connection between "+getSentenceIdNumber(conn.sourceId)+" to "+getSentenceIdNumber(conn.targetId)+" is labeled det");
	            }
	        },
	        {
	            text: "att",
	            class: "rel-att-mark",
	            style: "margin-left:10px; width:37px; text-align:left",
	            click: function() {
	                $(this).dialog("close");
	                setRelationLabelColor(conn.sourceId, conn.targetId, "att");
	                setRelationLabelDOM(conn.sourceId, conn.targetId, "att");
	                setSourceEndpointColor(conn.sourceId, defaultConnectedColor);
	                addLogRecord("Relation-add", "connection between "+getSentenceIdNumber(conn.sourceId)+" to "+getSentenceIdNumber(conn.targetId)+" is labeled att");
	            }
	        },
	        {
	            text: "delete",
	            class: "btn-default",
	            style: "margin-left:10px;",
	            click: function() {
	                $(this).dialog("close");
	                dropRelationLabelDOM(conn.sourceId, conn.targetId);
	                connObj = jsPlumb.getConnections({source: conn.sourceId, target: conn.targetId})[0];
	                jsPlumb.deleteConnection(connObj);
	                setSourceEndpointColor(conn.sourceId, defaultConnectionColor);
	                // logging at detaching event
	            }
	        }
	    ]
	});
	$("#relation-dialog").dialog("open");
}


/**
 * Set the color and relation label on the vizualization
 * @param{string} 	sourceId, corresponds to DOM id
 * @param{string}	targetId, corresponds to DOM id
 * @param{string}	relationLabel, {"=", "sup", "det", "att"}
 */
function setRelationLabelColor(sourceId, targetId, relationLabel) {
	// must select at index 0, only one object
	connObj = jsPlumb.getConnections({source: sourceId, target: targetId})[0];
    connObj.removeAllOverlays();
    connObj.addOverlay(
        ["Label", {label: relationLabel, location: labelLocation, cssClass:"relation-label", id:"label"+getSentenceIdNumber(sourceId)} ]
    );
    if (relationLabel != "=") {
	    connObj.addOverlay(
	        ["Arrow", {width: arrowWidth, length: arrowLength, location: arrowLocation, id:"arrow"+getSentenceIdNumber(sourceId)}]
	    );
	}
    connObj.setPaintStyle({stroke: chooseColor(relationLabel), strokeWidth: defaultStrokeWidth});
}


/** 
 * Extracting the sentence number from the sentenceId (DOM)
 * @param{string} sentenceId, corresponds to DOM id
 * @return{integer} sentence number
 */
function getSentenceIdNumber(sentenceId) {
	var Id = sentenceId;
	while (isNaN(Id.charAt(0))) {
		Id = Id.substr(1);
	}
	return Id;
}


/**
 * Set the following relation from source to target sentence in the DOM
 * @param{string} sourceId, corresponds to DOM id
 * @param{string} targetId, corresponds to DOM id
 * @param{string} relationLabel, {"=", "sup", "det", "att"}
 */
function setRelationLabelDOM(sourceId, targetId, relationLabel) {
	document.getElementById("target"+getSentenceIdNumber(sourceId)).innerHTML = targetId;
	document.getElementById("relation"+getSentenceIdNumber(sourceId)).innerHTML = relationLabel;
}


/**
 * Drop the the relation from source to target sentence in the DOM
 * @param{string} sourceId, corresponds to DOM id
 * @param{string} targetId, corresponds to DOM id
 */
function dropRelationLabelDOM(sourceId, targetId) {
	document.getElementById("target"+getSentenceIdNumber(sourceId)).innerHTML = defaultTarget;
	document.getElementById("relation"+getSentenceIdNumber(sourceId)).innerHTML = defaultRelation;
}


/**
 * Get the relation information (from the DOM) from a particular source sentence
 * @param{integer} sourceIdx, corresponds to original index (order) of sentence
 * @return{array} target, relation, dropping status
 */
function getRelationInfoByDOM(sourceIdx) {
	var retval = [3];
	retval[0] = document.getElementById("target"+sourceIdx).innerHTML;
	retval[1] = document.getElementById("relation"+sourceIdx).innerHTML;
	retval[2] = $("#dropping"+sourceIdx).val();
	return retval
}


/**
 * Change the source (outgoing) endpoint color
 * @param{string} sourceId, corresponds to DOM id (div) where the endpoint is attached 
 */
function setSourceEndpointColor(sourceId, color) {
	jsPlumb.selectEndpoints({source: "sentence"+getSentenceIdNumber(sourceId)}).setPaintStyle({fill: color});
}


/**
 * Paint existing connections from the source sentnece when loading text
 * @param{integer} sourceIdx, corresponds to original index (order) of sentence
 */
function paintExistingConnection(sourceIdx) {
	var retval = getRelationInfoByDOM(sourceIdx);
	if (retval[2] == "non-drop") {
		if (retval[0] != defaultTarget && retval[1] != defaultRelation) {
			if (mode=="debug") {alert("paint "+sourceIdx+" -> "+getSentenceIdNumber(retval[0])+" on "+retval[1])};
			jsPlumb.connect({
				uuids: ["ob"+sourceIdx, "ib"+getSentenceIdNumber(retval[0])],
			    ConnectionsDetachable: true,
			    ReattachConnections: true,
			});
			setRelationLabelColor("sentence"+sourceIdx, retval[0], retval[1]);
			setSourceEndpointColor("sentence"+sourceIdx, defaultConnectedColor);
		}
		document.getElementById("dropping"+sourceIdx).checked = false;
	}
	else {
		document.getElementById("dropping"+sourceIdx).checked = true;
	}
}


/**
 * Determining the proper visualization relation color for each dependency relation type
 * @param{string} 	relationLabel {"=", "sup", "det", "att"}
 * @return{string} 	color
 */
function chooseColor(relationLabel) {
	if (relationLabel == "=") {
		return "lightgray";
	}
	else if (relationLabel == "sup") {
		return "lightgreen";
	}
	else if (relationLabel == "det") {
		return "lightblue";
	}
	else if (relationLabel == "att") {
		return "lightpink";
	}
}


/**
 * Moving box (flex-item), sentence container to the left for indentation
 * @param{int} 	sentenceId, corresponds to the sentence Id of the text
 */
function moveBoxLeft(sentenceId) {
	var box = document.getElementById("sentence"+sentenceId);
	var left_pos;
	if (box.style.left == "") {
		left_pos = 0;
	}
	else left_pos = parseInt(box.style.left);
	box.style.left = (left_pos - 20) + 'px';
	addLogRecord("Indent-left", sentenceId);
	jsPlumb.repaintEverything();
}


/**
 * Moving box (flex-item), sentence container to the right for indentation
 * @param{int} 	sentenceId, corresponds to the sentence Id of the text
 */
function moveBoxRight(sentenceId) {
	var box = document.getElementById("sentence"+sentenceId);
	var left_pos;
	if (box.style.left == "") {
		left_pos = 0;
	}
	else left_pos = parseInt(box.style.left);
	box.style.left = (left_pos + 20) + 'px';
	addLogRecord("Indent-right", sentenceId);
	jsPlumb.repaintEverything();
}


/**
 * @return currentDateTime
 */
function getCurrentDateTime() {
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	return date+' '+time;
}


/** 
 * Add log record to the annotation file for tracing the actions performed by the annotator
 * @param{string} actionType {Load, Save, Drop, Un-drop, Relation-add, Relation-delete}
 * @param{string} description
 */
function addLogRecord(actionType, description) {
	if (document.getElementsByClassName('logging').length == 0) {
		$(".draggable-area").prepend("<ul class='logging hide'>\n</ul>\n\n");
	}
	var logRecord = {};
	logRecord.timestamp = getCurrentDateTime();
	logRecord.actionType = actionType;
	logRecord.description = description;
	$(".logging").append("<li>"+JSON.stringify(logRecord)+"</li>\n");
}


/** 
 * Get the current sentence ordering
 * @return{string} current sentence ordering
 */
function getCurrentOrdering() {
	var items = $(".flex-item");
	var ordering = "";
	for (var i=0; i < items.length; i++) {
		if (i==0) {
			ordering += ("[" + getSentenceIdNumber(items[i].id));
		}
		else {
			ordering += ("," + getSentenceIdNumber(items[i].id));
		}
	}
	ordering += "]";
	return ordering;
}