HOW TO USE:
	- Open ver3.html
	- Click "load" menu, and then select an essay you want to annotate in the "original/" folder. The essays have been pre-formatted in xml
	- After you have done the annotation click "Save", the javascript will automatically download a file
		- You cannot save midway. For example, when you have 5 sentences but you only annotate 3 sentences, the script will give you an error message
		- When you annotate the essay, DO NOT REFRESH the page (the annotation will be gone)
		- When you have finished annotating an essay, please move the downloaded ".xml" file into the "annotation/" folder. You can load them too!
	- After you have done the annotation and saved the annotation, please refresh the page before begin working on another file
		- I.e., load -> annotate -> save -> refresh

ADVICE:
	For easy reordering, grab (click) the box of the sentence id for grabbing the whole div

DEVELOPER NOTE:
	- We have two modes: "debug" and "production". If you want the script to output some messages every time it detects an event in the page, please change the line 17 of the "js/annotation_v3.js" file as "var mode = "debug""
	- I have tried annotating three files without problems (Chrome 67 and Safari 11.1.2). Hopefully there is no bug but if you found one, please kindly tell me how to reproduce the bug