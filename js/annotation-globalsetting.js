/** 
 * Default configuration of program, can be changed based on your preference
 * It is recommended to change to configuration file before the start of your project, and keep it the same in the entire project
 */
var disableDropping = false; // {true, false}; set true to disable dropping function
var disableReordering = false; // {true, false}; set true to disable reordering function
var disableEditing = false; // {true, false}; set true to enable editing boxes' content
var disableAddNewSentence = false; // {true, false}; set true to disable "Add New Sentence" function
var disableLinking = false; // {true, false}; set false if you do not annotate relations between sentences
var disableSentenceCategorization = false; // {true, false}; set true to disable sentence categorization function
var allowIntermediarySave = false; // {true, false}; set false (suggested) if you allow the annotator to save only when the annotation is done; true if the annotator can save midway

/** 
 * Relations and their color
 * The relations that can be used in the tool, you can add or delete the relation in this list
 */
var availableRels = ["att", "det", "sup", "="];

/** 
 * The corresponding color for the relation, i.e., the first element of relColor for the first relation in availableRels list. 
 * For example, change "lightgreen" to "khaki"
 *
 * The list of recommended color pallete is included in the manual
 */
var relColors = ["lightpink", "lightblue", "lightgreen", "lightgray"];

/**
 * Corresponding relation type, true if directed (asymmetrical) and false if undirected (symmetrical)
 */
var relDirections = [true, true, true, false];


/**
 * Available sentence categories
 */
var sentenceCategories = ["proponent", "opponent"];

/**
 * The corresponding color for sentence categories
 */
var sentCatColors = ["lightseagreen", "lightgrey"];
