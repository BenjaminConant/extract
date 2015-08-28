This project currently allows you to scrape meta data from a url via a basic CLI

<h3>Instalation</h3>
```
git clone https://github.com/BenjaminConant/extract.js.git
npm install
```

Usage
```
 node extract.js http://www.google.com

=>  { title: 'Google',
  	  description: 'Search the world\'s information, including webpages, images, videos and more. Google has many special features to help you find exactly what you\'re looking for.',
      favicon: 'http://www.google.com/images/google_favicon_128.png',
      images: [],
      url: 'http://www.google.com' }
```