# TIARAv2.0: An Interactive Tool for Annotating Discourse Structure and Text Improvement

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![version](https://img.shields.io/badge/version-2.0-red.svg)](https://semver.org) 

Annotation tool described in [our paper at LRE2021](.pdf). Please kindly cite the following paper when you use this tool. **You can use this tool freely**, but it would be appreciated if you could send me a courtesy [email](https://wiragotama.github.io) so I could survey what kind of tasks the tool is used for. 

```
@article{putra-etal-2021-tiarav2,
}
```

>Jan Wira Gotama Putra, Simone Teufel, Kana Matsumura, and Takenobu Tokunaga....

## How to Use
- Fork, clone or download (+unpack) this repository
- Read the manual located at ```manual/``` folder
- Open ```index.html``` located at the root folder using a web browser.
- We have confirmed that the tool works on Google Chrome (ver 88). You can use other web browsers at your own risk.
- Live demo: <https://wiragotama.github.io/TIARA-annotationTool/> (since this is a **client-side** tool, your data (essay) will not be uploaded, i.e., stays in your computer locally)

## Concept
There are many great annotation tools available out there. However, some (if not many) require complicated steps (and dependencies) to install. People with programming background may not find it difficult to install but people from other backgrounds may. This annotation tool considers the ease of use in mind (of course, with compromises), even for people without a programming background. That is why we provide this **client-side** annotation tool. The tool is customizable, by changing the conguration to suit your annotation scheme, as explained in the manual (configuration file: ```js/annotation-globalsetting.js```). 

We designed the tool to be general enough for discourse structure and argumentative structure annotation (but the structure must be tree-shaped). Specifically, it can be used to annotate sentence (discourse unit) categories and relations between sentences. This tool can also be useful for educational purpose as well. Please read our paper for a more complete explanation. 

## Formatting Text for Annotation
Format the text you want to annotate in ```.txt```, in which each discourse unit (sentence/clause) is separated by a newline. See at the following example (```sample_original/ESSAY_TRIAL_00.txt```).

```
I agree with the previous statement.
I have a two reasons.
If somebody smokes in the restaurant, other people may not be able to enjoy the experience.
However, if we ban smoking in restaurants, then those restaurants might lose some customers.
But, I firmly support banning smoking in restaurants because we need to prioritise health.
Some restaurants are indeed popular, especially among old men, because they allow people to smoke.
In conclusion, I encourage banning smoking in all restaurants.


``` 

## Important
- Refresh the web browser before working on another file (see the manual). <span style="color:gray"> While it should be generally safe without refreshing, we found super rare cases (when used by our annotator, and that we cannot reproduce) in which error happens when loading files into pre-existing workarea. </span>
- However, do not refresh the web browser midway (the annotation will be gone otherwise)
- If you are looking for the older version of TIARA, visit <https://github.com/wiragotama/TIARAv1>

## Update!!
NA

## License 
[MIT](https://opensource.org/licenses/MIT)

## Dependencies (included)
- [Treant-js](https://github.com/fperucic/treant-js)
- [JsPlumb](https://github.com/jsplumb/jsplumb)
- [html2canvas](https://github.com/niklasvh/html2canvas)

## Screenshots
![](img/SS1.png)
![](img/SS2.png)