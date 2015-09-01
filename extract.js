var fs = require('fs');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var urlParser = require('url');
var webshot = Promise.promisify(require('webshot'));
var keys = require('./keys.js')
var cloudinary = Promise.promisifyAll(require('cloudinary'));
cloudinary.config(keys.cloudinaryConfig);


// Todo ... refactor get favicon and get images in to single promise returning functions.


exports.url = function (url) {
  var output;
  return request(url)
          .spread(function(response, body) {
            output = { 'title': undefined, 'description': undefined, 'favicon': undefined, 'images': [], 'url': undefined };
            $ = cheerio.load(body);
            getUrl($, url, output);
            getTitle($, url, output);
            getDescription($, output);
            getFavicon($, url, output);
            getImages($, output, url);
          })
          .then(function(output){
            return webshot(url, 'frog.png');
          })
          .then(function(data) {
            return cloudinary.uploader.upload("frog.png");
          })
          .then(function(data){
            output.images.unshift(data.url);
            fs.unlinkSync("frog.png");
            console.log(output);
            return request('https://www.googfdsafdsafdsale.com/favicon.ico')
          })
          .then(function(res){
            console.log(res);
          })
          .catch(function(err) {
              console.error(err);
          });
}


function getTitle ($, url, output) {
  var possibleTitles = [ 
                         urlParser.parse(url).hostname,
                         $('title').text(),
                         $("meta[property='og:title']").attr('content')
                        ]
  output.title = triageOptions(possibleTitles);                 
}

function getUrl ($, url, output) {
  var possibleUrls = [ 
                       url,
                       $("meta[property='og:url']").attr('content')
                      ]
  output.url = triageOptions(possibleUrls);                 
}

function getDescription($, output) {
  var possibleDescriptions = [
                               $("meta[property='og:description']").attr('content'),
                               $("meta[name='description']").attr('content')
                              ]
  output.description = triageOptions(possibleDescriptions);   
}


function getFavicon($, url, output) {
  var first = $("link[rel='icon']").attr('href');
  var second = $("link[rel='shortcut icon']").attr('href');
  var third = $("meta[itemprop='image']").attr('content');
  var faviconGuesses = [first, second, third];
  faviconGuesses = faviconGuesses.filter(function(guess){ return guess; })
  faviconGuesses = faviconGuesses.map(function(guess) { return enforceAbsoluteLink(url, guess) })
  output.favicon = prefrencePngFavicons(faviconGuesses);
}

function getImages($, output, url) {
  var imageArray = [];
  var openGraphImage = $("meta[property='og:image']").attr('content');
  if (openGraphImage) {imageArray.push(enforceAbsoluteLink(url, openGraphImage))};
  var images = $("img");
  var imageLength = images.length;
  for ( var i = 0; i < images.length; i++) {
    if (images[i].attribs.src) {
      var image = enforceAbsoluteLink(url, images[i].attribs.src)
      if (image !== imageArray[0]) { imageArray.push(image) };
    }
  }
  output.images = imageArray;
}

function enforceAbsoluteLink (url, link) {
  if (link[0] !== '/') {
    return link;
  } else {
    return url + link
  }
}

function prefrencePngFavicons (links) {
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var lastForChars = link.substring(link.length - 4, link.length)
    if (lastForChars === '.png') {
      return link;
    }
  }
  return links[0];
}

function triageOptions (options) {
  var best;
  options.forEach(function(option) {
   if (option) { best = option; }
  });
  return best
}

