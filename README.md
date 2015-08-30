This project currently allows you to scrape meta data from a url via a basic CLI

<h3>Instalation</h3>

Go into your node_modules folder then run

```
git clone https://github.com/BenjaminConant/extract.js.git
cd extract
npm install
```

I use cloudinary and node webshot to make the first image in the image array a screenshot of the url.
You will need to provide your own cloudinary API credentials. Do this by adding a keys.js file to the root

```
keys.js

exports.cloudinaryConfig = { 
  cloud_name: 'your cloud name', 
  api_key: 'your api key', 
  api_secret: 'your secret' 
}
```


<h3>Usage</h3>

```
extractTest.js

var extract = require('extract');
var url = process.argv[2];


extract.url(url).then(function(res){
	console.log(res);
})

```




```
 node extract.js http://www.google.com

=>  { title: 'Google',
	  description: 'Search the world\'s information, including webpages, images, videos and more. Google has many special features to help you find exactly what you\'re looking for.',
	  favicon: 'http://www.google.com/images/google_favicon_128.png',
	  images:
	   [ 'http://res.cloudinary.com/fuzzies/image/upload/v1440894534/xsqe25x52gvzh3y8qwso.png',
	     'http://www.google.com/images/icons/product/chrome-48.png',
	     'http://www.google.com/images/srpr/logo9w.png' ],
	  url: 'http://www.google.com' }
```


