Hi Richard,

As per your feedback, I just fixed some issues and appended your required new features. Since I promised you I would provide a runnable demo for you, so this time I have not started upwork time tracker. I hope we can complete this task together as soon as possible and spend least amount of time, so does the money. 

Returning to our project - 

#1 About phantomjs. My framework is based on node.js, while using some third party modules like cheerio, phantomjs(selenium-node way). All of the modules were imported by me and sent to you except two things:
a)You need to install node.js. Node.js is a cross-platform language which means no matter what system are you using(Windows, linux, mac), it's easy to install and the script would be compatible. You should download node.js here - https://nodejs.org/en/download/ based on your OS(I suggest you download v6.x.x). 

b)Phantomjs. I have send a phantomjs.exe to you(See in the folder). Due to I was using windows to develop the project, I don't have linux version's executable file. Please go there - http://phantomjs.org/download.html directly and download the specific version, then put it into the root folder.(If you are using windows to test the demo, no need to download again).

#2 How to run demo?
If you have already done those two things above in point #1, you may start running the demo. Here is a file called links.txt - yes, you are able to modify the target link here. But right now you can only set one link to test. You don't need to care about demo.js because nothing in this file requires modification right now. Then you should click runDemo.bat to run the script if you are using Windows os. If you are using Linux, don't worry, only a simple terminal command should be input - directly input "node demo.js" after entering current folder via terminal. Your developer guys can be easy to work on this. If you are still confused about this, let me know. After running, there would be a output json file. See "opt_github.com.json", it's an example I just ran for http://www.github.com, you can also check this website output directly.

Feel free to ping me anytime. The performance may depends on your internet connection speed. I am here waiting for your feedback. 

Thanks!

Lyu