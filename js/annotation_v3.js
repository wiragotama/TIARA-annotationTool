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
var defaultHoverColor = "orange";
var defaultStrokeWidth = 3
var defaultStrokeHoverWidth = 7
var defaultTarget = "";
var defaultRelation = "";
var mode = "production"; // {"debug", "production"}
var Nsentences = -1; //global variable, number of sentences in the window, prompt included


/** 
 * Initiating sortable
 */ 
$(function() {
	$(".flex-container").sortable();
	$(".flex-item").disableSelection();
});


/** 
 * Initiating Dialog Box
 */
$(document).ready(function() {
    $( "#relation-dialog" ).dialog({
        autoOpen:false
    });
});


/**
 * Scroll page automatically when dragging
 */
var clicked = false, clickY;
$(document).on({
    'mousemove': function(e) {
        clicked && updateScrollPos(e);
    },
    'mousedown': function(e) {
        clicked = true;
        clickY = e.pageY;
    },
    'mouseup': function() {
        clicked = false;
        $('html').css('cursor', 'auto');
    }
});
var updateScrollPos = function(e) {
    $('html').css('cursor', 'row-resize');
    $(window).scrollTop($(window).scrollTop() + (e.pageY - clickY));
}


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
    paintStyle: {fill: defaultConnectionColor, stroke: defaultConnectionColor, strokeStyel: defaultConnectionColor, strokeWidth: defaultStrokeWidth},
    hoverPaintStyle: {fill: defaultHoverColor, stroke: defaultHoverColor, strokeStyle: defaultHoverColor, strokeWidth: defaultStrokeHoverWidth},
    endpointStyle: {fill: defaultConnectionColor, outlineStroke: defaultConnectionColor},
    endpointHoverStyle: {fill: defaultHoverColor, outlineStroke: defaultHoverColor},
    connectorStyle: {stroke: defaultConnectionColor, strokeStyel: defaultConnectionColor, strokeWidth: defaultStrokeWidth},
    connectorHoverStyle: {stroke: defaultHoverColor, strokeStyle: defaultHoverColor, strokeWidth: defaultStrokeHoverWidth}
};


/**
 * Initialization of the jsPlumb
 */
jsPlumb.ready(function() {
    jsPlumb.setContainer(document.getElementById("draggable-area"));

    // Drag the endpoint when the sentence (DIV) is dragged
    var is_dragging = false;
    $(".flex-container").sortable({
        start: function(event, ui) {
            is_dragging = true;
        },
        stop: function(event, ui) {
            is_dragging = false;
            jsPlumb.recalculateOffsets($(ui.item).parents(".draggable-area"));
            jsPlumb.repaintEverything();
        }
    })
    .on("mousemove", function(e) {
        if (is_dragging) {
            jsPlumb.repaintEverything();
        }
    });

    // Creating Endpoints for each sentence
    Nsentences = 6; // ideally, set this after loading
    createEndpoints(Nsentences);

    // Events binding
    eventsBinding();
});


/** 
 * Dropping listener
 */
 $("input[type=checkbox]").on('change', function() {
 	var checkbox = $(this);
 	var checkboxId = checkbox.attr("id");
 	var sentenceNumber = getSentenceIdNumber(checkbox.attr("id"));
 	if (checkbox.is(":checked")) {
 		if (mode=="debug") {alert(checkboxId+" is checked");}
 		$("#sentence"+sentenceNumber).addClass('hide-text').removeClass('show-text');
 		$("#textarea"+sentenceNumber).addClass('hide-text').removeClass('show-text');
 		$("#annotation"+sentenceNumber).addClass('hide-text-dropping').removeClass('show-text-dropping');
 		// drop relations when dropping sentence
 		inboundConn = jsPlumb.getConnections({target: "sentence"+sentenceNumber});
 		outboundConn = jsPlumb.getConnections({source: "sentence"+sentenceNumber});
 		if (mode=="debug") {alert("Number of inbound connections "+inboundConn.length);}
 		for (var i=0; i<inboundConn.length; i++) {
 			dropRelationLabelDOM(inboundConn[i].sourceId, inboundConn[i].targetId);
 			jsPlumb.deleteConnection(inboundConn[i]);
 		}
 		if (mode=="debug") {alert("Number of outbound connections "+outboundConn.length);}
 		for (var i=0; i<outboundConn.length; i++) {
 			dropRelationLabelDOM(outboundConn[i].sourceId, outboundConn[i].targetId);
 			jsPlumb.deleteConnection(outboundConn[i]);
 		}
 		$("#dropping"+sentenceNumber).val("drop");
 	}
 	else {
 		if (mode=="debug") {alert(checkboxId+" is unchecked");}
 		$("#sentence"+sentenceNumber).addClass('show-text').removeClass('hide-text');
 		$("#textarea"+sentenceNumber).addClass('show-text').removeClass('hide-text');
 		$("#annotation"+sentenceNumber).addClass('show-text-dropping').removeClass('hide-text-dropping');
 		$("#dropping"+sentenceNumber).val("non-drop");
 	}
 });


/**
 * TO DO: LOAD AND SAVE
 */

 $("#load_menu").on('click', function(event) {
 	event.preventDefault(); //do not refresh the page
 	alert("load menu");
 });

  $("#save_menu").on('click', function(event) {
 	event.preventDefault(); //do not refresh the page
 	alert("save menu");
 });

/** END GLOBAL PARAMETERS AND INITIALIZATION **/




/**
 * Creating Endpoints for each sentence
 * @param{integer} 	numberOfSentences, prompt included
 */
function createEndpoints(numberOfSentences) {
	// The number of endpoint is the same as number of sentences
	for (var i=0; i < numberOfSentences; i++) {
		sentence_id = "sentence"+i;
		jsPlumb.addEndpoint(sentence_id, inBound);
		if (i > 0) 
			jsPlumb.addEndpoint(sentence_id, outBound);
	}
}


/**
 * Binding events that may occur in the sentences connection
 */
function eventsBinding() {
	jsPlumb.bind("connection", function(info) {
		// New connection is established
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
				relationDialog(conn);
				// Binding clicking event on connection on newly established connection
				info.connection.bind("click", function(conn) {
				    if (mode=="debug") {alert("connection between "+conn.sourceId+" and "+conn.targetId+" is clicked");}
				    relationDialog(conn);
				});
			}
		}
	});

	// Binding detaching event 
	jsPlumb.bind('connectionDetached', function(info) {
		var conn = info.connection;
		if (mode=="debug") {alert("connection between "+conn.sourceId+" and "+conn.targetId+" is detached");}
		dropRelationLabelDOM(conn.sourceId, conn.targetId);
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
		matrix[i][targetIdx] = 1;
	}

	if (mode=="debug") {
		console.log("ADJACENCY MATRIX");
		for (var i=1; i < numberOfSentences; i++) {
			for (var j=1; j < numberOfSentences; j++) {
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
	                $( this ).dialog( "close" );
	                setRelationLabelColor(conn.sourceId, conn.targetId, "=");
	                setRelationLabelDOM(conn.sourceId, conn.targetId, "=");
	            }
	        },
	        {
	            text: "sup",
	            class: "rel-sup-mark",
	            style: "margin-left:10px; width:37px; text-align:left",
	            click: function() {
	                $( this ).dialog( "close" );
	                setRelationLabelColor(conn.sourceId, conn.targetId, "sup");
	                setRelationLabelDOM(conn.sourceId, conn.targetId, "sup");
	            }
	        },
	        {
	            text: "det",
	            class: "rel-det-mark",
	            style: "margin-left:10px; width:37px; text-align:left",
	            click: function() {
	                $( this ).dialog( "close" );
	                setRelationLabelColor(conn.sourceId, conn.targetId, "det");
	                setRelationLabelDOM(conn.sourceId, conn.targetId, "det");
	            }
	        },
	        {
	            text: "att",
	            class: "rel-att-mark",
	            style: "margin-left:10px; width:37px; text-align:left",
	            click: function() {
	                $( this ).dialog( "close" );
	                setRelationLabelColor(conn.sourceId, conn.targetId, "att");
	                setRelationLabelDOM(conn.sourceId, conn.targetId, "att");
	            }
	        },
	        {
	            text: "delete",
	            class: "btn-default",
	            style: "margin-left:10px;",
	            click: function() {
	                $( this ).dialog( "close" );
	                dropRelationLabelDOM(conn.sourceId, conn.targetId);
	                connObj = jsPlumb.getConnections({source: conn.sourceId, target: conn.targetId})[0];
	                jsPlumb.deleteConnection(connObj);
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
        ["Label", {label: relationLabel, location: labelLocation, cssClass:"relation-label"} ]
    );
    connObj.addOverlay(
        ["Arrow", {width: arrowWidth, length: arrowLength, location: arrowLocation}]
    );
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
	return Id
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
