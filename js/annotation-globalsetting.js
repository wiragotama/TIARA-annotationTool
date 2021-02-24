/** 
 * Default configuration of program, can be changed based on your preference
 * It is recommended to change to configuration file before the start of your project, and keep it the same in the entire project
 */
var enableDropping = true; // {true, false}; set false to disable dropping function
var enableReordering = true; // {true, false}; set false to disable reordering function
var enableEditing = true; // {true, false}; set false to disable editing boxes' content
var enableAddNewSentence = true; // {true, false}; set false to disable "Add New Sentence" function
var enableLinking = true; // {true, false}; set false if you do not annotate relations between sentences
var enableSentenceCategorization = true; // {true, false}; set false to disable sentence categorization function
var enableIntermediarySave = false; // {true, false}; set false (suggested) if you allow the annotator to save only when the annotation is done; true if the annotator can save midway

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
