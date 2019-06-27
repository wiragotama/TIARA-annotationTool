# TIARA - a Lightweight Annotation Tool for Hierarchical-structured Discourse-relation
Annotation tool described in [our paper at NLP2019](http://www.anlp.jp/proceedings/annual_meeting/2019/pdf_dir/P3-9.pdf). Please kindly cite the following paper when you use this tool.

```
@inproceedings{Putra_etal-NLP2019,
	author	= {Jan Wira Gotama Putra and Simone Teufel and Takenobu Tokunaga},
	title	= {An Argument Annotation Scheme for the Repair of Student Essays by Sentence Reordering},
	month	= March,
	year	= {2019},
	booktitle = {Proceedings of Annual Meeting of the Association for Natural Language Processing Japan},
	pages	= {546-549},
	url		= {http://www.anlp.jp/proceedings/annual_meeting/2019/pdf_dir/P3-9.pdf},
}
```

>Jan Wira Gotama Putra, Simone Teufel, and Takenobu Tokunaga. An Argument Annotation Scheme for the Repair of Student Essays by Sentence Reordering. In Proceedings of Annual Meeting of the Association for Natural Language Processing Japan (言語処理学会第25回年次表論文集), pp. 546--549, Nagoya, Japan, March 2019.

## How to Use
- Fork, clone or download (+unpack) this repository
- Read the manual located at ```manual/``` folder
- Open ```index.html``` located at the root folder
- We have tested the tool using Google Chrome (ver 7.4++) and Safari (ver 12++). You can use other web browsers at your own risks
- Live demo: <https://wiragotama.github.io/TIARA-annotationTool/>

## Concept
There are many great annotation tools available out there. However, some (if not many) require complicated steps (and dependencies) to install. People with programming background may not find it difficult to install but people from other backgrounds may. This annotation tool considers the ease of use in mind (of course, with compromises), even for people without a programming background. That is why we provide this client-side annotation tool. The tool is customizable, by changing the conguration suit your annotation scheme (explained in the manual, ```js/annotation-globalsetting.js```). 

## Formatting Text for Annotation
Format the text you want to annotate in ```.txt```, in which each discourse unit (sentence/clause) is separated by a newline. See at the following example (```sample_original/ESSAY_TRIAL_00.txt```).

```
I agree with the previous statement.
If somebody smokes in the restaurant, other people may not be able to enjoy the experience.
At restaurants, customers enjoy eating and talking.
However, if we ban smoking in restaurants, then those restaurants might lose some customers.
Some restaurants are indeed popular, especially among old men, because they allow people to smoke.
But, I firmly support banning smoking in restaurants because we need to prioritise health.
In conclusion, I encourage banning smoking in all restaurants.

``` 

## Important
- Refresh the web browser after saving an annotated file (see the manual)
- However, do not refresh the web browser midway (the annotation will be gone otherwise)

## License 
[MIT](https://opensource.org/licenses/MIT)

## Dependencies (included)
- [Treant-js](https://github.com/fperucic/treant-js)
- [JsPlumb](https://github.com/jsplumb/jsplumb)

## Screenshots
![](img/SS1.png)
![](img/SS2.png)