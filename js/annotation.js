/*
 * Annotation-js
 *
 * (c) 2021 Jan Wira Gotama Putra
 * https://github.com/wiragotama
 * This file (and the whole tool) may be freely distributed under the MIT license.
 *
 * TIARA is an open-source discourse-relation annotation tool
 * It is developed on top of JsPlumb (community edition) and Treant-js (for the visualization)
 */

/** 
 * Global variables (in this script)
 */
var labelLocation = 0.01;
var arrowLocation = 0.95;
var arrowWidth = 20;
var arrowLength = 12;
var dotRadius = 8;
var defaultConnectionColor = "lightgray";
var defaultConnectedColor = "yellow";
var defaultHoverColor = "orange";
var defaultStrokeWidth = 3;
var defaultStrokeHoverWidth = 7;
var defaultTarget = "";
var defaultRelation = "";
var noRelationSymbol = "n"; // no relation between a pair of sentences
var Nsentences = -1; // global variable, number of sentences in the window, the text body starts from unit 1
var compatibilityModeFlag = false; // this means the loaded file was annotated using the previous version of TIARA; What's different here? (1) The way to convert file to TSV, (2) automatically set disableSentenceCategorization=false (override user's config)
var defaultSentenceCategory = " "; // this is when a category has not been assigned to a sentence

/** 
 * Default config, can be changed based on your preference
 */
var mode = "production"; // {"debug", "production"}

/** 
 * Some parameters are defined in annotation-globalsetting.js (users can change it as they like, so we split the script in order to prevent users changing other things here) 
 * 
 * var disableDropping
 * var disableReordering
 * var disableEditing
 * var disableAddNewSentence
 * var disableLinking
 * var disableSentenceCategorization
 * var availableRels
 * var relColors
 * var relDirections
 * var sentenceCategories
 */

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
 * Params to control hierarchical visualization
 */
var defaultSiblingSeparation = 40;
var defaultLevelSeparation = 30;
var defaultSmallSiblingSeparationAddition = 10;
var defaultLargeSiblingSeparationAddition = 80;
var defaultSmallLevelSeparationAddition = 10;
var defaultLargeLevelSeparationAddition = 30

/**
 * configuration for hierarchical visualization
 */
var hierConfig = {
    container: "#collapsable-visualization",
    animateOnInit: false, // cannot set this true if hideRootNode=true
    hideRootNode: true,
    siblingSeparation: defaultSiblingSeparation,
    levelSeparation: defaultLevelSeparation,
    node: {
        collapsable: true,
        HTMLclass: 'visualization-text-3' // default size
    },
    animation: {
        nodeAnimation: "easeInOutSine",
        nodeSpeed: 500,
        connectorsAnimation: "linear",
        connectorsSpeed: 500
    },
    connectors: {
        style: { 
            "stroke-width": 2.2, 
            'stroke': 'black',
            'arrow-start': 'classic-wide-long',
            'arrow-end': 'none',
        }
    },
    nodeAlign: "top",
    scrollbar: "fancy",
    rootOrientation:  'NORTH', // NORTH || EAST || WEST || SOUTH
};



/************* GLOBAL INITIALIZATION ************/
/** 
 * Initiating Dialog Box
 */
$(document).ready(function() {
    // initialization (whenever applicable)
    if (availableRels.length!=relColors.length || availableRels.length!=relDirections.length || relColors.length!=relDirections.length || sentenceCategories.length!=sentCatColors.length) {
        alert("There is an error in the application setting! Cannot initiate the application!")
        var elem = document.querySelector('#draggable-area'); // to prevent end-user from using the application, since the initialization is wrong
        elem.style.display = 'none';
    }

    $( "#relation-dialog" ).dialog({
        autoOpen:false
    });
    $('#main-area').hide();
    $('#hierarchical-view').hide();
    $('#hierarchical-view-menu').hide();
});

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
            if (!disableSentenceCategorization) {
                $("#sentenceCategory"+sentenceNumber).addClass('hide-text').removeClass('show-text');
                sentenceCategoryToDefault(sentenceNumber); // remove sentence category when dropping happens
            }
            
            // drop relations when dropping sentence
            if (!disableLinking) {
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
            }
            $("#dropping"+sentenceNumber).val("drop");
        }
        else { 
            if (mode=="debug") {alert(checkboxId+" is unchecked");}
            addLogRecord("Un-drop", sentenceNumber);
            $("#sentence"+sentenceNumber).addClass('show-text').removeClass('hide-text');
            $("#textarea"+sentenceNumber).addClass('show-text').removeClass('hide-text');
            $("#annotation"+sentenceNumber).addClass('show-text-dropping').removeClass('hide-text-dropping');
            $("#dropping"+sentenceNumber).val("non-drop");
            if (!disableSentenceCategorization) {
                $("#sentenceCategory"+sentenceNumber).addClass('show-text').removeClass('hide-text');
            }
        }
    });
}

/**
 * Load pre-formatted essay (html) into the window, then establish connections based on the information present
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
            if (file.type=="text/xml" || file.type=="text/plain" || file.type=="text/html" || file.type=="text/tab-separated-values") {
                // if the file is txt, we need to convert the content to xml content
                if (file.type=="text/plain") {
                    plainTextFormatting(file.name, content);
                }
                else if (file.type=="text/tab-separated-values") {
                    tsvFileFormatting(file.name, content); // backward compatibility check is included here
                }
                else { // xml (backwards compatibility for the preliminary version of TIARA) or html
                    document.getElementsByClassName('draggable-area')[0].innerHTML = content;
                    updateColorLegend();
                    verdict = checkHTMLfileCompatibilityMode(); // backward compatibility check
                    if (!verdict) { //corrupt file
                        location.reload();
                    }
                }

                // initialization
                $('#main-area').show();
                Nsentences = document.getElementsByClassName("flex-item").length + 1; // unit index starts from 1

                // for text only
                if (file.type=="text/plain") {
                    initializeSentenceCategorySelection(Nsentences);
                }

                // disable or enable functions
                if (disableDropping) { // hide dropping buttons from end-user
                    droppingDisabler();
                }
                if (disableAddNewSentence) { // hide add new sentence button from end-user
                    addNewSentenceDisabler();
                }
                if (disableEditing) { // disable textarea editing
                    textAreaEditDisabler();
                }
                else {
                    textAreaEditEnabler(); // enable text editing
                }
                if (disableSentenceCategorization) { // disable sentence categorization
                    sentenceCategoryDisabler();
                }

                // adjust textarea size during loading
                autosize(document.querySelectorAll('textarea'));

                // JsPlumb, disable linking and reordering is handled inside this function
                initializeJsPlumb(Nsentences);

                 // events binding
                connectionEventBinding();
                droppingListener();
                textareaEventBinding(); // change the textarea content in the DOM, so we can reflect editing changes in tree view directly
                sentenceCategoryEventBinding();

                // etc
                addLogRecord("Load", file.name);
                document.getElementById("essay_code_hierarchical").innerHTML = document.getElementById("essay_code").innerHTML; // putting essay code in the hierarchical view
            }
            else {
                alert("Failed to load file, unsupported filetype");
            }
        }
        reader.readAsText(file);
    } 
    else { 
        alert("Failed to load file");
    }
});


/**
 * Event handling for textarea
 */
function textareaEventBinding() {
    for (var i=1; i<=Nsentences; i++) {
        $('#textarea'+i).bind('input propertychange', function(event) {
            document.getElementById(event.target.id).innerHTML = $(this).val();
            if (mode=="debug") {
                console.log("Editing", event.target.id);
            }
            // would be nice if we put the textediting to log but I don't think it's important
        });
    }
}

/**
 * update the color legend (the main target is for the saved annotated file) to match the current available relations
 */
function updateColorLegend() {
    if (mode=="debug") {
        alert("Updating color-legend");
    }
    // remove the current version
    document.getElementById("color-legend").innerHTML = ""; 
    
    // update
    for (var i=availableRels.length-1; i >= 0; i--) {
        var newColorLegend = document.createElement("span");
        newColorLegend.className = "relation-color-mark";
        newColorLegend.innerHTML = availableRels[i];
        newColorLegend.style = "background-color: " + relColors[i];
        document.getElementById("color-legend").appendChild(newColorLegend);
    }
}

/**
 * Replace all occurence of query in inputString using replacement
 * @param{string} inputString
 * @param{string} query
 * @param{string} replacement
 */
function replaceAll(inputString, query, replacement) {
    var re = new RegExp(query, 'g');
    return inputString.replace(re, replacement);
}


/**
 * prepare the skeleton when loading plaintext
 */
function prepXMLskeleton(filename) {
    // skeleton
    xmlText = "";
    header = replaceAll(essayCodeHTMLTemplate, "\\[ESSAY_CODE_HERE\\]", filename.split(".")[0]);
    xmlText = xmlText + header + "\n";
    xmlText = xmlText + '\<div class="flex-container" id="flex-container"\>';
    xmlText = xmlText + '\<\/div\>\n';
    document.getElementsByClassName('draggable-area')[0].innerHTML = xmlText;

    // add relation legend
    for (var i=availableRels.length-1; i >= 0; i--) {
        var newColorLegend = document.createElement("span");
        newColorLegend.className = "relation-color-mark";
        newColorLegend.innerHTML = availableRels[i];
        newColorLegend.style = "background-color: " + relColors[i];
        document.getElementById("color-legend").appendChild(newColorLegend);
    }
}

/**
 * Format plaintext input to XML, then project the result to screen directly
 * @param{string} filename
 * @param{string} content
 */
function plainTextFormatting(filename, content) {
    // skeleton
    prepXMLskeleton(filename)

    // add sentences
    sentences = content.split("\n")
    for (var i=0; i < sentences.length; i++) {
        if (sentences[i]!="") {
            var newNodeSentence = document.createElement("div");
            newNodeSentence.className = "flex-item";
            newNodeSentence.id = "sentence"+(i+1);
            sentenceFormat = replaceAll(sentenceContainerHTMLTemplate, "\\[PUT_SENTENCE_NUMBER_HERE\\]", String(i+1));
            sentenceFormat = replaceAll(sentenceFormat, "\\[PUT_SENTENCE_TEXT_HERE\\]", sentences[i]);
            newNodeSentence.innerHTML = sentenceFormat
        }
        document.getElementById("flex-container").appendChild(newNodeSentence);
    }
}

/**
 * Format tsv input to XML, then project the result to screen directly
 * @param{string} filename
 * @param{string} content
 */
function tsvFileFormatting(filename, content) {
    // preparation
    infos = content.split("\n")
    header = infos[0];
    checkTSVfileCompatibilityMode(header);

    infos.shift() // remove the header
    infos.pop() // remove trailing underline

    // skeleton
    filename = infos[0].split("\t")[0]
    prepXMLskeleton(filename)

    // project sentences into skeleton
    for (var i=0; i < infos.length; i++) {
        row = infos[i].split("\t");
        sentence_id = row[1];
        sentence_text = row[2];
        if (!compatibilityModeFlag) {
            sentence_category = row[3];
        }
        target_id = compatibilityModeFlag ? row[3]: row[4];
        relLabel = compatibilityModeFlag ? row[4]: row[5];
        acFlag = compatibilityModeFlag ? row[5].toLowerCase(): row[6].toLowerCase();

        if (sentence_text!="") {
            if (sentence_text[0]=="\"" && sentence_text[sentence_text.length-1]=="\"") {
                sentence_text = sentence_text.slice(1, -1);
            }
            var newNodeSentence = document.createElement("div");
            newNodeSentence.className = "flex-item";
            newNodeSentence.id = "sentence"+(sentence_id);
            sentenceFormat = replaceAll(sentenceContainerHTMLTemplate, "\\[PUT_SENTENCE_NUMBER_HERE\\]", sentence_id);
            sentenceFormat = replaceAll(sentenceFormat, "\\[PUT_SENTENCE_TEXT_HERE\\]", sentence_text);

            // relation information
            if (target_id != "") {
                sentenceFormat = replaceAll(sentenceFormat, "id=\"target"+sentence_id+"\"></span>", "id=\"target"+sentence_id+"\">sentence"+target_id+"</span>")
                sentenceFormat = replaceAll(sentenceFormat, "id=\"relation"+sentence_id+"\"></span>", "id=\"relation"+sentence_id+"\">"+relLabel+"</span>")
            }

            newNodeSentence.innerHTML = sentenceFormat

        }
        document.getElementById("flex-container").appendChild(newNodeSentence);

        // category selection
        if (!disableSentenceCategorization) {
            addSentenceCategorySelection(sentence_id);
            $("#sentenceCategory"+sentence_id+" option[value="+sentence_category+"]").attr('selected', 'selected');
            changeSentenceCategoryColors(sentence_id);
        }

        // dropping
        if (acFlag.trim() == "true") {
            document.getElementById("dropping"+sentence_id).value = "drop"; // trigger dropping event
            document.getElementById("annotation"+sentence_id).classList.add("hide-text-dropping");
            document.getElementById("sentence"+sentence_id).classList.add("hide-text");
            document.getElementById("textarea"+sentence_id).classList.add("hide-text");
            document.getElementById("sentenceCategory"+sentence_id).classList.add('hide-text');
        }
    }
}

/**
 * Hide dropping button (thus disabling the dropping function) from end-user
 */
function droppingDisabler() {
    for (var i=1; i < Nsentences; i++) {
        document.getElementById("dropping"+i).parentElement.style.display = 'none';
    }
}

/**
 * Disable editing textarea
 */ 
function textAreaEditDisabler() {
    for (var i=1; i< Nsentences; i++) {
        document.getElementById("textarea"+i).readOnly = true;
    }
}

/**
 * Enable editing textarea
 */ 
function textAreaEditEnabler() {
    for (var i=1; i< Nsentences; i++) {
        document.getElementById("textarea"+i).readOnly = false;
    }
}

/**
 * Hide "Add new sentence" button from end-user
 */ 
function addNewSentenceDisabler() {
    document.getElementById("add_sentence_box").style.display = 'none';
}

/**
 * Initialization of the jsPlumb
 * @param{integer} Nsentences, number of sentences in the text (index starts from 1)
 */
function initializeJsPlumb(Nsentences) {
    jsPlumb.ready(function() {
        if (!disableReordering) {
            jsPlumb.setContainer(document.getElementById("draggable-area"));

            // initializing sortable
            $(".flex-container").sortable();
            $(".flex-item").disableSelection();

            // repaint connection when dragging sentence
            var isDragging = false;
            $(".flex-container").sortable({
                start: function(event, ui) {
                    isDragging = true;
                    addLogRecord("Reordering-start", getCurrentOrdering());
                },
                stop: function(event, ui) {
                    isDragging = false;
                    jsPlumb.recalculateOffsets($(ui.item).parents(".draggable-area"));
                    jsPlumb.repaintEverything();
                    addLogRecord("Reordering-end", getCurrentOrdering());
                }
            })
            .on("mousemove", function(e) {
                if (isDragging) {
                    jsPlumb.repaintEverything();
                }
            });
        }

        if (!disableLinking) { // linking function permitted
            // create Endpoints for each sentence
            createEndpoints(Nsentences);

            // create existing relation information
            for (var i=1; i < Nsentences; i++) {
                paintExistingConnection(i);
            }
        }
        else {
            // if dropping is previously
            for (var i=1; i < Nsentences; i++) {
                paintExistingConnection(i);
            }
        }
    });
}

/**
 * Save essay into local file (html extension)
 */
$("#save_menu").on('click', function(event) {
    if (mode=="debug") {
        alert("Save menu is clicked");
    }

    if (allowIntermediarySave || (!allowIntermediarySave && isFullAnnotation() && checkRepairFormat() && !checkTemporaryPresence())) {
        event.preventDefault(); //do not refresh the page
        addLogRecord("Save");

        if (!disableLinking) {
            cut = document.getElementsByClassName('draggable-area')[0].innerHTML.indexOf("div class=\"jtk-endpoint"); // JsPlumb trailing info
            text = document.getElementsByClassName('draggable-area')[0].innerHTML.substring(0, cut-1);
        }
        else { // no connection endpoints, so don't cut JsPlumb trailing info
            text = document.getElementsByClassName('draggable-area')[0].innerHTML;
        }
        var filename = $(".essay-code .col-md-10 #essay_code").text().trim() + "-annotated.html";
        download(filename, text);

        alert("Refresh the page after the download is complete!")
    }
});

/**
 * Save relations existing in essay into a local excel (tsv) file, this is using inter-annotator agreement format
 */
$("#rel_to_excel").on('click', function(event) {
    if (mode=="debug") {
        alert("Format relation to excel (menu) is clicked");
    }

    if (allowIntermediarySave || (!allowIntermediarySave && isFullAnnotation() && checkRepairFormat() && !checkTemporaryPresence())) {
        event.preventDefault(); // do not refresh the page
        addLogRecord("Expert-relation-to-TSV");

        // convert to csv format
        var filename = $(".essay-code .col-md-10 #essay_code").text().trim();
        text = relationToTSV(Nsentences, filename, "\t")
        download(filename+"_rels.tsv", text);

        alert("Refresh the page after the download is complete!")
    }
});

/**
 * Save relations existing in essay into a local excel (csv) file, this is using inter-annotator agreement format
 */
$("#annotation_to_excel").on('click', function(event) {
    if (mode=="debug") {
        alert("Format file to excel (menu) is clicked");
    }

    if (allowIntermediarySave || (!allowIntermediarySave && isFullAnnotation() && checkRepairFormat() && !checkTemporaryPresence())) {
        event.preventDefault(); //do not refresh the page
        addLogRecord("Export-file-to-TSV");

        // convert to TSV format
        var filename = $(".essay-code .col-md-10 #essay_code").text().trim();
        if (compatibilityModeFlag) {
            text = annotationToTSVBackwardCompatible(filename);
            download(filename+"_backward_compatible.tsv", text);
        }
        else {
            text = annotationToTSV(filename);
            download(filename+".tsv", text);
        }

        alert("Refresh the page after the download is complete!")
    }
});

/**
 * Change to text view (hide the hierarchical visualization)
 */
$("#text_view").on('click', function(event) {
    if (mode=="debug") {
        alert("Change to text view")
    }
    $('#main-area').show();
    $('#hierarchical-view').hide();
    $('#hierarchical-view-menu').hide();
});

/**
 * Change to hierarchical view (hide the text view)
 */
$("#tree_view").on('click', function(event) {
    if (mode=="debug") {
        alert("Change to tree view");
    }
    $('#main-area').hide();
    $('#hierarchical-view').show();
    $('#hierarchical-view-menu').show();

    // meta node as a root (for ongoing-process visualization)
    var meta = {text: {name: 'meta'}};

    // convert each sentence information to visual nodes
    var nodes = []
    for (var i=1; i < Nsentences; i++) {
        var node = new Object()
        relName = document.getElementById("relation"+i).textContent;
        if (disableSentenceCategorization) { // to prevent DOM search error
            categoryName = "";
        }
        else {
            categoryName = document.getElementById("sentenceCategory"+i).value;
        }
        node.text = { 
            desc: ((disableSentenceCategorization) ? "": "[" + categoryName + "] ") + ((relName!="") ? "("+ relName + ")" : ""),
            name: i +". " + document.getElementById("textarea"+i).textContent.trim(), 
        };
        node.HTMLclass = "hierSent"+i;
        nodes.push(node);
    }

    // establish connection to parent
    for (var i=1; i < Nsentences; i++) {
        if ($("#target"+i).text()!="") {
            nodes[i-1].parent = nodes[getSentenceIdNumber(document.getElementById("target"+i).textContent)-1]; 
        }
        else {
            if ($("#dropping"+i).val()=="non-drop") { // connect the root(s) to meta-parent
                nodes[i-1].parent = meta
            }
        }
    }

    // combine everything
    var visualization = [hierConfig];
    visualization.push(meta);
    for (var i=0; i < nodes.length; i++) {
        visualization.push(nodes[i])
    }
    if (mode=="debug") {
        console.log("visualization definition");
        console.log(visualization);
    }
    tree = new Treant( visualization ); // pray the garbage collector works well
    
    // change the description color according to the relation it is involved in
    for (var i=1; i <Nsentences; i++) {
        relName = document.getElementById("relation"+i).textContent;
        // $(".hierSent"+i).css("border-color", chooseRelColor(relName));
        // $(".hierSent"+i+" > .node-desc").css("color", chooseRelColor(relName));
        $(".hierSent"+i).css("border-color", getSentenceCategoryNodeColor(i));
    }
});

/**
 * Download the visualized annotation as an image (full-sized)
 * ref: https://stackoverflow.com/questions/13591339/html2canvas-offscreen
 */
$('#visualization-download-btn').on("click", function() {          
    function hiddenClone(element){
        // Create clone of element
        var clone = element.cloneNode(true);

        // Position element relatively within the body but still out of the viewport
        var style = clone.style;
        style.position = 'relative';
        style.top = window.innerHeight + 'px';
        style.left = 0;

        // Append clone to body and return the clone
        document.body.appendChild(clone);
        return clone;
    }

    var offScreen = document.querySelector('#hierarchical-view');
    var clone = hiddenClone(offScreen); // clone off-screen element

    html2canvas(clone).then(function(canvas) { // open image in new tab
        var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // convert image to 'octet-stream' (Just a download, really)

        $(this).attr("href", image)
        $(this).attr("download","imgName.png");
        
        var aTag = document.createElement('a');
        aTag.download = $(".essay-code .col-md-10 #essay_code").text().trim() + '-ann-visualized.png';
        aTag.href = image;
        aTag.click();
    });

    document.body.removeChild(clone); // remove clone element
});


/**
 * Zoom-in hierarchical visualization (enlarge)
 */
$('#hierarchical-view-ensmall').on("click", function() { 
    if (mode=="debug") {
        alert("shrink tree view");
    }
    zoom_size = parseInt(hierConfig.node.HTMLclass.match(/\d+/g));
    if (zoom_size > 1) {
        if (zoom_size>6) {
            hierConfig.siblingSeparation -= defaultLargeSiblingSeparationAddition;
            hierConfig.levelSeparation -= defaultLargeLevelSeparationAddition;
        }
        else {
            hierConfig.siblingSeparation -= defaultSmallSiblingSeparationAddition;
            hierConfig.levelSeparation -= defaultSmallSiblingSeparationAddition;
        }
        hierConfig.connectors.style["stroke-width"] -= 0.2;
        hierConfig.node.HTMLclass = "visualization-text-" + (zoom_size-1);
        $("#tree_view").click(); // refresh visualization
    }
});


/**
 * Zoom-out hierarchical visualization (shrink)
 */
$('#hierarchical-view-enlarge').on("click", function() {         
    if (mode=="debug") {
        alert("enlarge tree view");
    }
    zoom_size = parseInt(hierConfig.node.HTMLclass.match(/\d+/g));
    if (zoom_size < 11) {
        if (zoom_size<6) {
            hierConfig.siblingSeparation += defaultSmallSiblingSeparationAddition;
            hierConfig.levelSeparation += defaultSmallSiblingSeparationAddition;
        }
        else {
            hierConfig.siblingSeparation += defaultLargeSiblingSeparationAddition;
            hierConfig.levelSeparation += defaultLargeLevelSeparationAddition;
        }
        hierConfig.connectors.style["stroke-width"] += 0.2;
        hierConfig.node.HTMLclass = "visualization-text-" + (zoom_size+1);
        $("#tree_view").click(); // refresh visualization
    }
});


/**
 * Add a new sentence box. This feature is particularly useful for educational purpose. 
 * For example, the teacher asks the student to add more sentences to support their argument. 
 * Another example is when the teacher asks the student to collapse two or more sentences. In this case, the student may drop those two or more sentences, and then create a new merged sentence.
 */
$("#add_sentence_box").on("click", function() {
    if (mode=="debug") {
        alert("add new sentence box");
    }
    newSentenceIdx = Nsentences;

    // new sentence object
    var newNodeSentence = document.createElement("div");
    newNodeSentence.className = "flex-item";
    newNodeSentence.id = "sentence"+newSentenceIdx;
    sentenceFormat = replaceAll(sentenceContainerHTMLTemplate, "\\[PUT_SENTENCE_NUMBER_HERE\\]", String(newSentenceIdx));
    sentenceFormat = replaceAll(sentenceFormat, "\\[PUT_SENTENCE_TEXT_HERE\\]", "");
    newNodeSentence.innerHTML = sentenceFormat;
    document.getElementById("flex-container").appendChild(newNodeSentence);

    // sucessful addition
    Nsentences += 1

    // event binding
    droppingListener();
    textareaEventBinding();

    // disable dropping
    if (disableDropping) { // hide dropping button from end-user
        droppingDisabler();
    }
    // disable editing
    if (disableEditing) {
        textAreaEditDisabler();
    }
    // disable or enable sentence categorization, has to be here before the endpoint is drawn
    if (!disableSentenceCategorization) {
        addSentenceCategorySelection(newSentenceIdx);
        sentenceCategoryChangeListener(newSentenceIdx);
    }
    else {
        sentenceCategoryDisabler();
    }
    // endpoint for connections
    if (!disableLinking) {
        jsPlumb.addEndpoint("sentence"+newSentenceIdx, inBound, {uuid:"ib"+newSentenceIdx}); 
        jsPlumb.addEndpoint("sentence"+newSentenceIdx, outBound, {uuid:"ob"+newSentenceIdx});
    }

    // log
    addLogRecord("Add-new-sentence", newSentenceIdx);
});

/********* END GLOBAL PARAMETERS AND INITIALIZATION *********/


/**
 * Check (probably rather shallow) whether the annotators has finished the annotation
 * Definition: each sentence has outgoing connections (incoming otherwise) or dropped if no connection; OR all sentences are dropped. Only one node (non-dropped) has no outgoing connection at maximum. Non-dropped sentences should have sentence categories
 */
function isFullAnnotation() {
    var verdict = []; 
    var droppingFlag = [];
    var incomingFlag = [];
    var outgoingFlag = [];
    var allNodesHaveConnection = true;
    var outgoingCount = 0;
    var dropCount = false;
    var sentenceWithoutLabel = [];

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
        var sentCategory = $("#sentenceCategory"+i).val();
        // console.log(getSentenceIdNumber(target)+","+relation+","+dropping);
        if (dropping == "non-drop") {
            if (target!=defaultTarget && relation!=defaultRelation) {
                outgoingFlag[i] = true;
                incomingFlag[parseInt(getSentenceIdNumber(target))] = true;
                outgoingCount += 1;
            }
            if (!disableSentenceCategorization && (sentCategory==null || sentCategory==defaultSentenceCategory)) { //not dropped but no label
                sentenceWithoutLabel.push(i);
            }
        }
        else { 
            droppingFlag[i] = true;
            dropCount += 1;
            outgoingCount += 1;

        }
    }

    if (dropCount == Nsentences-1) { // all dropped
        if (mode=="debug") {
            alert("save case 1: all dropped");
        }
        return true;
    }
    else {
        // check sentence without label
        if (!disableSentenceCategorization && sentenceWithoutLabel.length > 0) { 
            message = "You have not assigned the categories of the following sentences: ";
            for (var i=0; i < sentenceWithoutLabel.length; i++) {
                if (i==0) {
                    message = message + sentenceWithoutLabel[i];
                }
                else {
                    message = message + ", " + sentenceWithoutLabel[i];
                }
            }
            alert(message);
            return false;
        }

        // check links
        if (disableLinking) {
            if (mode=="debug") {
                alert("save case 3: non-dropped are categorized");
            }
            return true
        }
        else {
            if (dropCount == Nsentences-2) { // only one sentence left, and that sentence has been labelled
                if (mode=="debug") {
                    alert("save case 4: only one sentence left");
                }
                return true;
            }
            else { // check links
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
                    return false;
                }
                else {
                    // how many nodes have outgoing connection
                    if (outgoingCount == Nsentences-2) { // index starts from 1 and one unit acts as a root, so -2
                        if (mode=="debug") {
                            alert("save case 5: all sentences categorized or dropped, check if all nodes have outgoing connections");
                        }
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
            } // end check links
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
                if (stack.length == 0) stack.push(j);
                else flag = true; // error in annotation
            }
            else if (sentence.charAt(j) == '|') {
                if (mode == "pop") flag = true; // no double separator
                else mode = "pop";
            }
            else if (sentence.charAt(j) == ']') {
                if (stack.length == 1 && mode == "pop") {
                    stack.pop();
                }
                else flag = true;
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
 * Check whether there is relation labelled "temporary"
 */
function checkTemporaryPresence() {
    var flag = false; // no "temporary" relation
    var message = "The following relations are labelled \"temporary\", please label them correctly:";

    for (var i=1; i < Nsentences; i++) {
        relation = document.getElementById("relation"+i).innerHTML;

        if (relation == "temporary") {
            flag = true;
            message += "\n" + i.toString() + " -> " + document.getElementById("target"+i).innerHTML.replace( /^\D+/g, ''); 
        }
    }

    if (flag) {
        alert(message);
    }
    return flag;
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
 * @param{integer}  numberOfSentences, index starts from 1
 */
function createEndpoints(numberOfSentences) {
    // the number of endpoint is the same as number of sentences
    for (var i=1; i < numberOfSentences; i++) {
        sentenceID = "sentence"+i;
        jsPlumb.addEndpoint(sentenceID, inBound, {uuid:"ib"+i}); 
        jsPlumb.addEndpoint(sentenceID, outBound, {uuid:"ob"+i});
    }
}

/**
 * Binding events that may occur in the sentences connection
 */
function connectionEventBinding() {
    // new connection is established
    jsPlumb.bind("connection", function(info) { 
        var conn = info.connection;
        if (mode=="debug") {alert("Source = "+conn.sourceId+"; Target = "+conn.targetId);}
        setRelationLabelDOM(conn.sourceId, conn.targetId, "temporary"); // for cycle detection
        
        // establish connection if cycle is not detected
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

    // binds clicking event on connection
    jsPlumb.bind("click", function(conn) {
        if (mode=="debug") {alert("connection between "+conn.sourceId+" and "+conn.targetId+" is clicked");}
        relationDialog(conn);
    });

    // binds detaching event 
    jsPlumb.bind('connectionDetached', function(info) {
        var conn = info.connection;
        if (mode=="debug") {alert("connection between "+conn.sourceId+" -> "+conn.targetId+" is detached");}
        dropRelationLabelDOM(conn.sourceId, conn.targetId);
        setSourceEndpointColor(conn.sourceId, defaultConnectionColor);
        addLogRecord("Relation-delete", "connection between "+getSentenceIdNumber(conn.sourceId)+" to "+getSentenceIdNumber(conn.targetId)+" is detached");
    });
}

/**
 * Generate empty matrix of size N * N
 * @param(integer} N
 * @param{anything} element
 * @return{array} matrix of zero
 */
function emptyMatrix(N, element) {
    var matrix = [];
    for (var i=0; i < N; i++) {
        matrix[i] = [];
        for (var j=0; j< N; j++) {
            matrix[i][j] = element;
        }
    }
    return matrix
}

/**
 * Get the adjacency matrix representation of the relations (binary)
 * @param{integer} numberOfSentences, index starts from 1
 * @return{array} adjacency matrix
 */
function adjMatrix(numberOfSentences) {
    // get an empty matrix ready
    var matrix = emptyMatrix(numberOfSentences, 0)

    // build adjacency matrix
    for (var i=1; i < numberOfSentences; i++) {
        if ($("#target"+i).text()!="") {
            var targetIdx = parseInt(getSentenceIdNumber($("#target"+i).text()));
            matrix[i][targetIdx] = 1; // connection from sentence i to targetIdx
        }
    }

    if (mode=="debug") {
        console.log("ADJACENCY MATRIX");
        console.log(matrix)
        console.log("------\n");
    }
    return matrix;
}

/**
 * Get the adjacency matrix representation of the relations (with relation label)
 * @param{integer} numberOfSentences, index starts from 1
 * @return{array} adjacency matrix
 */
function adjMatrixRelLabel(numberOfSentences) {
    // get an empty matrix ready
    var matrix = emptyMatrix(numberOfSentences, 'n')

    // get the relation name
    for (var i=1; i < numberOfSentences; i++) {
        if ($("#target"+i).text()!="") { // the current sentence points somewhere in some label
            var targetIdx = parseInt(getSentenceIdNumber($("#target"+i).text()));
            matrix[i][targetIdx] = $("#relation"+i).text(); // connection from sentence i to targetIdx
        }
    }

    return matrix
}

/**
 * Format annotated relations into excel (tsv) output
 * @param{int} numberOfSentences
 * @param{string} essayCode
 */
function relationToTSV(numberOfSentences, essayCode, separator) {
    adjMatrix = adjMatrixRelLabel(numberOfSentences);
    if (mode=="debug") {
        console.log("RELATION MATRIX");
        console.log(adjMatrix);
        console.log("------\n");
    }
    var outputText = "essay code" + separator + "source" + separator + "target" + separator + "relation\n";
    for (var i=1; i < numberOfSentences; i++) {
        for (var j=1; j < numberOfSentences; j++) {
            if (i!=j) { 
                outputText += essayCode + separator + i + separator + j + separator + adjMatrix[i][j] + "\n";
            }
        }
    }
    return outputText;
}

/**
 * Extract annotated file in TSV format
 * @param{string} essayCode
 */
function annotationToTSV(essayCode) {
    var outputText = ""
    if (disableDropping)
        outputText = "essay code\t unit ID\t text\t unit category\t target\t relation\n"; // header;
    else
        outputText = "essay code\t unit ID\t text\t unit category\t target\t relation\t drop flag\n"; // header;
    
    var items = document.getElementsByClassName("flex-item");
    for (i = 0; i < items.length; i++) {
        sentenceID  = parseInt(items[i].getElementsByClassName("sentence-id-number")[0].textContent);
        text        = document.getElementById("textarea"+sentenceID).textContent.trim();
        sentCategory= document.getElementById("sentenceCategory"+sentenceID).value;
        target      = getSentenceIdNumber(document.getElementById("target"+sentenceID).textContent);
        relation    = document.getElementById("relation"+sentenceID).textContent;
        
        if (!disableDropping) {
            dropStr     = document.getElementById("dropping"+sentenceID).value;
            if (dropStr == "non-drop")
                dropFlag = false;
            else dropFlag = true;
        }

        if (disableDropping)
            outputText += essayCode + "\t" + sentenceID + "\t\"" + text + "\"\t\"" + sentCategory + "\"\t" + target + "\t" + relation + "\n";
        else 
            outputText += essayCode + "\t" + sentenceID + "\t\"" + text + "\"\t\"" + sentCategory + "\"\t" + target + "\t" + relation + "\t" + dropFlag + "\n";
    }
    return outputText;
}

/**
 * Extract annotated file in TSV format (old format)
 * @param{string} essayCode
 */
function annotationToTSVBackwardCompatible(essayCode) {
    var outputText = ""
    if (disableDropping)
        outputText = "essay code\t unit ID\t text\t target\t relation\n"; // header;
    else
        outputText = "essay code\t unit ID\t text\t target\t relation\t drop flag\n"; // header;
    
    var items = document.getElementsByClassName("flex-item");
    for (i = 0; i < items.length; i++) {
        sentenceID  = parseInt(items[i].getElementsByClassName("sentence-id-number")[0].textContent);
        text        = document.getElementById("textarea"+sentenceID).textContent.trim();
        target      = getSentenceIdNumber(document.getElementById("target"+sentenceID).textContent);
        relation    = document.getElementById("relation"+sentenceID).textContent;
        
        if (!disableDropping) {
            dropStr     = document.getElementById("dropping"+sentenceID).value;
            if (dropStr == "non-drop")
                dropFlag = false;
            else dropFlag = true;
        }

        if (disableDropping)
            outputText += essayCode + "\t" + sentenceID + "\t\"" + text + "\"\t" + target + "\t" + relation + "\n";
        else 
            outputText += essayCode + "\t" + sentenceID + "\t\"" + text + "\"\t" + target + "\t" + relation + "\t" + dropFlag + "\n";
    }
    return outputText;
}

/**
 * Checking whether cycle exist
 * @param{integer} numberOfSentences, index starts from 1
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
 * @param{integer} numberOfSentences, index starts from 1
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
        if (mode=="debug") {
            alert("Cycle detected! "+currentSentenceIdx);
        }
        return true; // cycle detected
    }
}

/** 
 * Selection of relation for sentences connection
 * @param(object) conn, jsPlum Connection Class
 */
function relationDialog(conn) {
    // prepare buttons for selecting available relations
    var dialogButtons = []; 
    for (var i=0; i < availableRels.length; i++) {
        newElement = {
            text: availableRels[i],
            class: "relation-menu-button",
            style: "background-color:"+chooseRelColor(availableRels[i]),
            click: function(event) {
                relationLabel = $(event.target).text();
                setRelationLabelColor(conn.sourceId, conn.targetId, relationLabel);
                setRelationLabelDOM(conn.sourceId, conn.targetId, relationLabel);
                setSourceEndpointColor(conn.sourceId, defaultConnectedColor);
                addLogRecord("Relation-add", "connection between "+getSentenceIdNumber(conn.sourceId)+" to "+getSentenceIdNumber(conn.targetId)+" is labeled "+relationLabel);
                $(this).dialog("close");
            }
        }
        dialogButtons.push(newElement);
    }

    // delete button
    dialogButtons.push({
        text: "delete",
        class: "relation-menu-button btn-default",
        style: "",
        click: function() {
            $(this).dialog("close");
            dropRelationLabelDOM(conn.sourceId, conn.targetId);
            connObj = jsPlumb.getConnections({source: conn.sourceId, target: conn.targetId})[0];
            jsPlumb.deleteConnection(connObj);
            setSourceEndpointColor(conn.sourceId, defaultConnectionColor);
            // logging already handled by detaching event
        }
    })

    // put a dialog box
    $( "#relation-dialog" ).dialog({
        // autoOpen:false,
        closeOnEscape: false,
        dialogClass: "no-close",
        position: {my: "center top", at: "center top+80", of: window},
        height: 200,
        width: 600,
        title: "Relation option "+getSentenceIdNumber(conn.sourceId)+" -> "+getSentenceIdNumber(conn.targetId), 
        buttons: dialogButtons
    });
    $("#relation-dialog").dialog("open");
}

/**
 * Set the color and relation label on the visualization
 * @param{string}   sourceId, corresponds to DOM id
 * @param{string}   targetId, corresponds to DOM id
 * @param{string}   relationLabel, defined as elements of availableRels (variable)
 */
function setRelationLabelColor(sourceId, targetId, relationLabel) {
    // must select at index 0, only one object
    connObj = jsPlumb.getConnections({source: sourceId, target: targetId})[0];
    connObj.removeAllOverlays();
    connObj.addOverlay(
        ["Label", {label: relationLabel, location: labelLocation, cssClass:"relation-label", id:"label"+getSentenceIdNumber(sourceId)} ]
    );
    if (isDirected(relationLabel)) { // add arrow to the endpoint, only for directed relations
        connObj.addOverlay(
            ["Arrow", {width: arrowWidth, length: arrowLength, location: arrowLocation, id:"arrow"+getSentenceIdNumber(sourceId)}]
        );
    }
    connObj.setPaintStyle({stroke: chooseRelColor(relationLabel), strokeWidth: defaultStrokeWidth});
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
 * @param{string} relationLabel, defined as elements of availableRels (variable)
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
 * Paint dropping checkbox
 * @param{integer} sourceIdx, corresponds to original index (order) of sentence
 */
function paintExistingDroppingCheckbox(sourceIdx) {
    var retval = getRelationInfoByDOM(sourceIdx);
    if (retval[2] == "non-drop") {
        document.getElementById("dropping"+sourceIdx).checked = false;
    }
    else {
        document.getElementById("dropping"+sourceIdx).checked = true;
    }
}

/**
 * Determining the proper visualization relation color for each dependency relation type (this function is just a mapping)
 * @param{string}   relationLabel, defined as elements of availableRels (variable)
 * @return{string}  color, defined by relColors
 */
function chooseRelColor(relationLabel) {
    return relColors[availableRels.indexOf(relationLabel)]
}

/**
 * Check whether the given relationLabel is a directed relation
 * @param{string}   relationLabel, defined as elements of availableRels (variable)
 * @return{boolean} true or false, based on relDirections (variable)    
 */
function isDirected(relationLabel) {
    return relDirections[availableRels.indexOf(relationLabel)]
}

/**
 * Moving box (flex-item), sentence container to the left for indentation
 * @param{int}  sentenceId, corresponds to the sentence Id of the text
 */
function moveBoxLeft(sentenceId) {
    if (mode=="debug") {
        alert("Move box "+sentenceId+" to the left");
    }
    var box = document.getElementById("sentence"+sentenceId);
    var leftPosition;
    if (box.style.left == "") {
        leftPosition = 0;
    }
    else leftPosition = parseInt(box.style.left);
    box.style.left = (leftPosition - 20) + 'px';
    addLogRecord("Indent-left", sentenceId);
    jsPlumb.repaintEverything();
}

/**
 * Moving box (flex-item), sentence container to the right for indentation
 * @param{int}  sentenceId, corresponds to the sentence Id of the text
 */
function moveBoxRight(sentenceId) {
    if (mode=="debug") {
        alert("Move box "+sentenceId+" to the right");
    }
    var box = document.getElementById("sentence"+sentenceId);
    var leftPosition;
    if (box.style.left == "") {
        leftPosition = 0;
    }
    else leftPosition = parseInt(box.style.left);
    box.style.left = (leftPosition + 20) + 'px';
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

/**
 * Tempalate variables for text formatting (better not modify this unless you are the developer)
 */
essayCodeHTMLTemplate = '\<!-- Essay Code --\> \n \<div class="row essay-code"\> \n \t \<div class="row"\> \n \t \t \<div class="col-md-10"\> \n \t \t \t \<h4 id="essay_code"\> [ESSAY_CODE_HERE] \</h4\> \n \t \t \</div\> \n \t \t \<div class="col-md-2 legend"\> \n \t \t \t \<p\> [Relation Legend] \</p\> \n \t \t \</div\> \n \t \</div\> \n \t \<div class="row color-legend col-lg-12" id="color-legend"\> \n \t \</div\> \n \</div\> \<br\> \n';
// old template (TIARA without sentence categorization)
// sentenceContainerHTMLTemplate = '\<span class="col-md-1 sentence-id-number"\> \n \t [PUT_SENTENCE_NUMBER_HERE] \n \</span\> \n \<span class="col-md-10"\> \n \t \<textarea id="textarea[PUT_SENTENCE_NUMBER_HERE]"\>[PUT_SENTENCE_TEXT_HERE]\</textarea\> \n \</span\> \n \n \<span class="col-md-1 sentence-side-menu" id="annotation[PUT_SENTENCE_NUMBER_HERE]"\> \n \t \<table\> \n \t \t \<tr\> \n \t \t \t \<td\> \n \t \t \t \t \<span class="input-number hide" id="target[PUT_SENTENCE_NUMBER_HERE]"\>\</span\> \n \t \t \t \t \<span class="input-relation hide" id="relation[PUT_SENTENCE_NUMBER_HERE]"\>\</span\> \n \t \t \t \t \<span\> \n \t \t \t \t \t \<Label class="drop-label"\> Drop? \</Label\> \n \t \t \t \t \t \<input type="checkbox" id="dropping[PUT_SENTENCE_NUMBER_HERE]" name="drop" value="non-drop"/\> \n \t \t \t \t \</span\> \n \t \t \t \</td\> \n \t \t \</tr\> \n \t \t \<tr\> \n \t \t \t \<td\> \n \t \t \t \t \<button class="movebutton" onclick="moveBoxLeft([PUT_SENTENCE_NUMBER_HERE])"\> \n \t \t \t \t \t \&laquo; \n \t \t \t \t \</button\> \n \n \t \t \t \t \<button class="movebutton" onclick="moveBoxRight([PUT_SENTENCE_NUMBER_HERE])"\> \n \t \t \t \t \t \&raquo; \n \t \t \t \t \</button\> \n \t \t \t \</td\> \n \t \t \</tr\> \n \t \</table\> \n \</span\> \n'

// new template
sentenceContainerHTMLTemplate = '\t \<div class="row"\> \n \t \t \<span class="col-md-1 sentence-box-col-padding"\> \n \t \t \</span\> \n \t \t \<span class="col-md-1 sentence-id-number"\> \n \t \t \t [PUT_SENTENCE_NUMBER_HERE] \n \t \t \</span\> \n \t \t \<span class="col-md-9"\> \n \t \t \t \<textarea id="textarea[PUT_SENTENCE_NUMBER_HERE]"\>[PUT_SENTENCE_TEXT_HERE]\</textarea\> \n \t \t \</span\> \n    \t \t \<span class="col-md-1 sentence-side-menu" id="annotation[PUT_SENTENCE_NUMBER_HERE]"\> \n \t \t \t \<table\> \<tbody\> \n \t \t \t \t \<tr\> \n \t \t \t \t \t \<td\> \n \t \t \t \t \t \t \<span class="input-number hide" id="target[PUT_SENTENCE_NUMBER_HERE]"\>\</span\> \n \t \t \t \t \t \t \<span class="input-relation hide" id="relation[PUT_SENTENCE_NUMBER_HERE]"\>\</span\> \n  \t \t \t \t \t \t \<span\> \n \t \t \t \t \t \t \t \<label class="drop-label"\> Drop? \</label\> \n \t \t \t \t \t \t \t \<input type="checkbox" id="dropping[PUT_SENTENCE_NUMBER_HERE]" name="drop" value="non-drop"\> \n \t \t \t \t \t \t \</span\> \n \t \t \t \t \t \</td\> \n \t \t \t \t \</tr\> \n \t \t \t \t \<tr\> \n \t \t \t \t \t \<td\> \n  \t \t \t \t \t \t \<button class="movebutton" onclick="moveBoxLeft([PUT_SENTENCE_NUMBER_HERE])"\> \n \t \t \t \t \t \t \t « \n \t \t \t \t \t \t \</button\> \n     \t \t \t \t \t \t \<button class="movebutton" onclick="moveBoxRight([PUT_SENTENCE_NUMBER_HERE])"\> \n \t \t \t \t \t \t \t » \n \t \t \t \t \t \t \</button\> \n  \t \t \t \t \t \</td\> \n \t \t \t \t \</tr\> \n \t \t \t \</tbody\>\</table\> \n  \t \t \</span\> \n \t \t \</div\> \n \t \t \<div class="row sentence-lower-menu"\> \n \t \t \t \<span class="col-md-1 sentence-box-col-padding"\> \n \t \t \t \</span\> \n \t \t \t \<select class="col-md-2 sentence-category" id="sentenceCategory[PUT_SENTENCE_NUMBER_HERE]" name="sentenceCategory[PUT_SENTENCE_NUMBER_HERE]"\> \n \t \t \t \t \<option value=" "\>\</option\> \n \t \t \t \</select\> \n \t \t \</div\> \n';



/**** Sentence categorization related (the biggest update in TIARA 2.0) ****/

/**
 * Initialize sentence category selection dropdown
 * @param{integer} Nsentences, number of sentences in the text (index starts from 1)
 */
function initializeSentenceCategorySelection(Nsentences) {
    for (var i=1; i<=Nsentences; i++) {
        addSentenceCategorySelection(i)
    }
}

/**
 * Initialize sentence category selection dropdown for a specific sentence
 * @param{integer} sentenceNumber
 */
function addSentenceCategorySelection(sentenceNumber) {
    for (var i=0; i < sentenceCategories.length; i++) {
        option_string = "<option value=\""+sentenceCategories[i]+"\">"+sentenceCategories[i]+"</option>";
        $('#sentenceCategory'+sentenceNumber).append(option_string);
    }
    sentenceCategoryChangeListener(sentenceNumber);
}

/**
 * Change the color of a particular sentence category selection box
 */
function changeSentenceCategoryColors(sentenceNumber) {
    document.getElementById('sentenceCategory'+sentenceNumber).style.backgroundColor = getSentenceCategoryColor(sentenceNumber);
}


/**
 * Get the corresponding color for selected sentence category selection (text view)
 */
function getSentenceCategoryColor(sentenceNumber) {
    idx = document.getElementById("sentenceCategory"+sentenceNumber).selectedIndex;
    catColors = ["transparent"].concat(sentCatColors);
    return catColors[idx];
}

/**
 * Get the corresponding color for selected sentence category selection (tree view)
 */
function getSentenceCategoryNodeColor(sentenceNumber) {
    idx = document.getElementById("sentenceCategory"+sentenceNumber).selectedIndex;
    catColors = ["black"].concat(sentCatColors); // no transparent border
    return catColors[idx];
}


/**
 * Change sentence category event
 */
function sentenceCategoryEventBinding() {
    for (var i=1; i<=Nsentences; i++) {
        sentenceCategoryChangeListener(i);
    }
}

/**
 * Event when sentence category is changed
 * @param{integer} sentenceNumber
 */
function sentenceCategoryChangeListener(sentenceNumber) {
    // normal change
    $('#sentenceCategory'+sentenceNumber).change(function(e) {
        e.preventDefault();
        e.stopPropagation();

        option_selected = $(this).find("option:selected").attr('value');
        idx = document.getElementById("sentenceCategory"+sentenceNumber).selectedIndex;
        n = document.getElementById("sentenceCategory"+sentenceNumber).options.length;
    
        // remove old selection, and change the HTML
        for (var i=0; i<n; i++) {
            val = document.getElementById("sentenceCategory"+sentenceNumber).options[i].value;
            if (i!=idx) {
                $("#sentenceCategory"+sentenceNumber+" option[value=\""+val+"\"]").attr('selected', false);
            }
            else {
                $("#sentenceCategory"+sentenceNumber+" option[value=\""+option_selected+"\"]").attr('selected', true);
            }
        }

        // change color
        catColors = ["transparent"].concat(sentCatColors);
        document.getElementById('sentenceCategory'+sentenceNumber).style.backgroundColor = catColors[idx];

        // message for debugging
        if (mode=="debug") {
            alert("sentence "+sentenceNumber + " category: " + option_selected);
        }   

        // record
        addLogRecord("Sentence Category", "Sentence "+sentenceNumber+" is labelled `" + option_selected + "'");
    });

    // prevent changes when the sentence is dropped
    $('#sentenceCategory'+sentenceNumber).mousedown(function(e) {
        if ($("#dropping"+sentenceNumber).is(":checked")) {
            e.preventDefault(); // cannot change sentence category for dropped sentences
            if (mode=="debug") {
                alert("Cannot change the category for sentence "+sentenceNumber + " because it is dropped");
            }
        }
    });
}

/**
 * Changing sentence category to some default label
 * @param{integer} sentenceNumber
 */
function sentenceCategoryToDefault(sentenceNumber) {
    // drop all selection
    n = document.getElementById("sentenceCategory"+sentenceNumber).options.length;
    for (var i=0; i<n; i++) {
        val = document.getElementById("sentenceCategory"+sentenceNumber).options[i].value;
        $("#sentenceCategory"+sentenceNumber+" option[value=\""+val+"\"]").attr('selected', false);
    }

    document.getElementById("sentenceCategory"+sentenceNumber).selectedIndex = 0; // change to default category
    document.getElementById('sentenceCategory'+sentenceNumber).style.backgroundColor = "transparent"; // remove color
    addLogRecord("Sentence Category", "Sentence category for "+sentenceNumber+" is deleted due to dropping");
}

/**
 * Hide sentence category selections from end-user
 */
function sentenceCategoryDisabler() {
    $(".sentence-lower-menu").hide();
}

/**
 * This is to support loading the annotations in the previous version of TIARA (without sentence categorization)
 * Basically, we override the annotation global setting, and set disableSentenceCategorization=false
 */
function checkHTMLfileCompatibilityMode() {
    Nsentences = document.getElementsByClassName("flex-item").length + 1; // unit index starts from 1
    cnt = 0
    for (var i=1; i < Nsentences; i++) {
        if (document.getElementById("sentenceCategory"+i)==null) {
            cnt += 1
        }
    }
    if (cnt == Nsentences-1) { // no sentenceCategory DOM found
        setBackwardCompatibilityMode();
        return true;
    }
    else {
        if (cnt!=0) { //  more than one sentenceCategory DOM found
            alert("Corrupt file");
            return false;
        }
        return true;
    } 
}

/**
 * This is to support loading the annotations in the previous version of TIARA (without sentence categorization)
 * Basically, we override the annotation global setting, and set disableSentenceCategorization=false
 */
function checkTSVfileCompatibilityMode(header) {
    header = header.split("\t");
    if (header.length == 6) {
        setBackwardCompatibilityMode();
        return true
    }
    else {
        return false
    }
}

/**
 * Helper function for backward compatibility routine
 */
function setBackwardCompatibilityMode() {
    alert("The loaded file is apperent to be annotated using the previous version of TIARA (without sentence categorization), we now switch to compatibility mode!");
    $("#compatibility-mode").css('visibility', 'visible');
    compatibilityModeFlag = true;
    if (mode=="debug") {
        alert("set disableSentenceCategorization=false");
    }
    disableSentenceCategorization = true;
}

/**
 * Get only the number portion of string
 */
function retnum(str) { 
    var num = str.replace(/[^0-9]/g, ''); 
    return parseInt(num,10); 
}
