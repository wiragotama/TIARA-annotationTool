# TIARA v2.0: An Interactive Tool for Annotating Discourse Structure and Text Improvement

### [Homepage](https://sites.google.com/view/tokyotechcl-tiara/)・[Live Demo](https://wiragotama.github.io/TIARA-annotationTool/)・[Paper](http://www.lrec-conf.org/proceedings/lrec2020/pdf/2020.lrec-1.854.pdf)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![version](https://img.shields.io/badge/version-2.0-red.svg)](https://semver.org)



## About
TIARA is a tool for annotating argumentative structure and sentence reordering. This is a client-side tool, so you do not need to install anything. You just need to download the TIARA package (click ```code``` then ```download zip``` on top of this page), and the tool is ready to use; as easy as that. Beyond as an annotation tool, we also designed the tool to be useful for educational purposes as well. It can be used both in learning-to-read and learning-to-write scenarios. 


## Concept
There are many great annotation tools available out there. However, some (if not many) require complicated steps (and dependencies) to install. Hence, people without a programming background may find it difficult to use them. TIARA considers the ease of use in mind (of course, with compromises), even for people without a programming background. That is why we provide this **client-side** annotation tool. The tool is customisable; you can configure it to suit your annotation project by changing the conguration file: ```js/annotation-globalsetting.js```. Please read the manual (in the ```manual/``` folder) on how to do this.  

We try to design the tool to be as generic as possible, that is, supporting a wide range of tasks. It can be used to annotate (1) tree-shaped discourse structure (2) tree-shaped argumentative structure, (3) reordering sentences, and (4) content editing. Aspect (3) and (4) make this tool unique compared to existing tools. If you are a teacher, you can use this tool to analyse students' writing. You may then provide feedback, telling them where to improve their texts. Students can directly revise their texts in TIARA. One of our team members came from an educational background and has used **TIARA to analyse argumentative texts and encourage revisions**. Please read our paper below and the manual for a more detailed explanation. 

Please do not hestitate to contact us if you have any questions


## How to Use
- Fork, clone or download (```code``` then ```download zip``` on the top of this page) this repository.
- Read the manual in ```manual/``` folder
- Open ```index.html``` located in the root folder using a web browser.
- We have confirmed that the tool works on Google Chrome (ver 88). You can use other web browsers at your own risk.
- Live demo: <https://wiragotama.github.io/TIARA-annotationTool/> (since this is a **client-side** tool, your data (essay) will not be uploaded, i.e., stays locally in your computer)

## Formatting Text for Annotation
Format the text you want to annotate in ```.txt```, in which each discourse unit (sentence/clause) is separated by a newline. See the following example (```sample_original/ESSAY_TRIAL_00.txt```).

```
I agree with the previous statement.
I have a two reasons.
If somebody smokes in the restaurant, other people may not be able to enjoy the experience.
However, if we ban smoking in restaurants, then those restaurants might lose some customers.
But, I firmly support banning smoking in restaurants because we need to prioritise health.
Some restaurants are indeed popular, especially among old men, because they allow people to smoke.
In conclusion, I encourage banning smoking in all restaurants.

``` 


## Important Notes
We assume you have read the manual at this point.

- Refresh the web browser before working on another file (see the manual). <span style="color:gray"> While it should be generally safe without refreshing, we found super rare cases (when used by our annotator, and that we cannot reproduce) in which error happens when loading files into pre-existing workarea. </span>
- However, do not refresh the web browser midway (the annotation will be gone otherwise)
- If you are looking for the older version of TIARA, visit <https://github.com/wiragotama/TIARAv1> (without sentence categorization support)


## Paper

The [paper](http://www.lrec-conf.org/proceedings/lrec2020/pdf/2020.lrec-1.854.pdf) describing the tool has been published at LREC2020. Please kindly cite the following paper when you use TIARA. **You can use this tool for free**, but it would be appreciated if you could send us a courtesy email so we could survey what kind of tasks the tool is used for. Please visit [this link](https://wiragotama.github.io) to contact us. 


```
@inproceedings{putra-etal-2020-tiara,
    title = "{TIARA}: A Tool for Annotating Discourse Relations and Sentence Reordering",
    author = "Putra, Jan Wira Gotama  and
      Teufel, Simone  and
      Matsumura, Kana  and
      Tokunaga, Takenobu",
    booktitle = "Proceedings of The 12th Language Resources and Evaluation Conference",
    month = may,
    year = "2020",
    address = "Marseille, France",
    publisher = "European Language Resources Association",
    url = "https://www.aclweb.org/anthology/2020.lrec-1.854",
    pages = "6912--6920",
    language = "English",
    ISBN = "979-10-95546-34-4",
}
```

>Jan Wira Gotama Putra, Simone Teufel, Kana Matsumura, and Takenobu Tokunaga. TIARA: A Tool for Annotating Discourse Relations and Sentence Reordering. Proceedings of the 12th International Conference on Language Resources and Evaluation (LREC), pp. 6914--6922, Marseille, France, May 2020.

#### What can you get from the paper
- How to design an annotation tool, especially for discourse structures. What are the requirements? Why the consideration of the visual elegance of the tool is important in discourse annotation? How TIARA compares to other tools?
- Some possible best practices when designing an annotation tool
- How TIARA can be used in the teaching environment, particularly for analysing argumentative essays? 
- How the visualisation and functionalities in TIARA may encourage revisions. 


## Update!!
Since we published the LREC paper above, we have made the following updates to the tool.

- ```2020/02/22```: The tool now support the annotation of sentence categories. The textarea of ```text view``` will adjust its size (useful for annotating long texts). You can also customize the colors for the sentence categories. 
- ```2021/01/21```: There is a new ```Add New Sentence``` button at the bottom of the ```text view```. This button is dedicated for educational uses. For example, a teacher asks a student to add more sentences to support their argument. Another example is when the teacher asks the student to merge two or more sentences as a single opinion. In this case, the student may "drop" those two or more sentences, and then create a new merged sentence. 
- ```2021/01/21```: You can now shrink and enlarge the hierarchical view
- ```2020/10/03```: TIARA can now open (visualise) ```.tsv``` file that results from ```Export annotation to TSV``` menu. Please note that the indentation and history do not present in the ```.tsv``` format. Update: issues found and fixed  in```2021/02/24```.


## License 
[MIT](https://opensource.org/licenses/MIT)


## Dependencies (included)
- [Treant-js](https://github.com/fperucic/treant-js) + [Raphael-js](https://dmitrybaranovskiy.github.io/raphael/)
- [JsPlumb](https://github.com/jsplumb/jsplumb)
- [html2canvas](https://github.com/niklasvh/html2canvas)
- [Autosize](https://github.com/jackmoore/autosize)


## Screenshots
![](img/SS1.png)
![](img/SS2.png)