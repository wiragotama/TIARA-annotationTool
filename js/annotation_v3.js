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


/**
 * Definition of jsPlumb inBound connection Endpoint Type
 */
var inBound = {
    anchor: ["BottomLeft", "Continuous"],
    isSource: false,
    isTarget: true,
    ConnectionsDetachable: false,
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
        ["Label", {label:"label", location: labelLocation, cssClass:"relation-label"} ]
    ],
    isSource: true,
    isTarget: false,
    ConnectionsDetachable: false,
    ReattachConnections: true,
    maxConnections: 1, //the number of outbound connection
    endpoint: ["Rectangle", {width: 15, height: 15}],
    paintStyle: {fill: defaultConnectionColor, stroke: defaultConnectionColor, strokeWidth:3},
    hoverPaintStyle: {fill: defaultHoverColor, stroke: defaultHoverColor, strokeWidth:3},
    endpointStyle: {fill: defaultConnectionColor, outlineStroke: defaultConnectionColor},
    endpointHoverStyle: {fill: defaultHoverColor, outlineStroke: defaultHoverColor},
    connectorStyle: {stroke: defaultConnectionColor, strokeWidth:3},
    connectorHoverStyle: {stroke: defaultHoverColor, strokeWidth:3}
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
    createEndpoints(4);

    // Events binding
    eventsBinding();
});
/** END GLOBAL PARAMETERS AND INITIALIZATION **/


/**
 * Creating Endpoints for each sentence
 * @param{number} 	number of sentences
 */
function createEndpoints(numberOfSentences) {
	// The number of endpoint is the same as number of sentences
	for (var i=0; i<numberOfSentences; i++) {
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
		alert("Source = "+conn.sourceId+"; Target = "+conn.targetId);
		relationDialog(conn);

		// Binding clicking event on connection on newly established connection
		info.connection.bind("click", function(conn) {
		    alert("connection between "+conn.sourceId+" and "+conn.targetId+" is clicked");
		    relationDialog(conn);
		});
	});

	// Binding detaching event 
	jsPlumb.bind('connectionDetached', function(info) {
		var conn = info.connection;
		alert("connection between "+conn.sourceId+" and "+conn.targetId+" is detached");
		// TO DO: do something about the DOM, hint: just reset the info in the DOM
	});
}


/** 
 * Selection of relation for sentences connection
 * @param(object) conn; jsPlum Connection Class
 */
function relationDialog(conn) {
	$( "#relation-dialog" ).dialog({
	    // autoOpen:false,
	    dialogClass: "no-close",
	    position: {my: "center top", at: "center top+80", of: window},
	    buttons: [
	        {
	            text: "=",
	            click: function() {
	                $( this ).dialog( "close" );
	                changeRelationLabelColor(conn.sourceId, conn.targetId, "=");
	                // TO DO: do something about the DOM
	            }
	        },
	        {
	            text: "sup",
	            click: function() {
	                $( this ).dialog( "close" );
	                changeRelationLabelColor(conn.sourceId, conn.targetId, "sup");
	                // TO DO: do something about the DOM
	            }
	        },
	        {
	            text: "det",
	            click: function() {
	                $( this ).dialog( "close" );
	                changeRelationLabelColor(conn.sourceId, conn.targetId, "det");
	                // TO DO: do something about the DOM
	            }
	        },
	        {
	            text: "att",
	            click: function() {
	                $( this ).dialog( "close" );
	                changeRelationLabelColor(conn.sourceId, conn.targetId, "att");
	                // TO DO: do something about the DOM
	            }
	        },
	        {
	            text: "delete",
	            click: function() {
	                $( this ).dialog( "close" );
	                connObj = jsPlumb.getConnections({source: conn.sourceId, target: conn.targetId})[0];
	                jsPlumb.deleteConnection(connObj);
	                // TO DO: do something about the DOM, hint: just reset the info in the DOM
	            }
	        }
	    ]
	});
	$("#relation-dialog").dialog("open");
}


/**
 * Changing the color and relation label on the vizualization
 * @param{string} 	sourceId
 * @param{string}	targetId
 * @param{string}	relationLabel {"=", "sup", "det", "att"}
 */
function changeRelationLabelColor(sourceId, targetId, relationLabel) {
	// must select at 0, only one object
	connObj = jsPlumb.getConnections({source: sourceId, target: targetId})[0];
    connObj.removeAllOverlays();
    connObj.addOverlay(
        ["Label", {label: relationLabel, location: labelLocation, cssClass:"relation-label"} ]
    );
    connObj.addOverlay(
        ["Arrow", {width: arrowWidth, length: arrowLength, location: arrowLocation}]
    );
    connObj.setPaintStyle({stroke: chooseColor(relationLabel), strokeWidth: 3});
}


/**
 * Determining the proper visualization relation color for each dependency relation type
 * @param{string} 	relationLabel {"=", "sup", "det", "att"}
 * @return{string} 	color
 */
function chooseColor(relationLabel) {
	if (relationLabel == "=") {
		return "black";
	}
	else if (relationLabel == "sup") {
		return "green";
	}
	else if (relationLabel == "det") {
		return "blue";
	}
	else if (relationLabel == "att") {
		return "red";
	}
}
