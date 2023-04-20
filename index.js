require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns = require('dns'); 
global.urls = new Map();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// url-shortner api
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post("/api/shorturl", (req, res) => {
  //let inputUrl = req.body.url.replace(/\/*$/, '');
  let inputUrl = req.body.url;
  //let validUrl = inputUrl.replace(/^https:\/\/(www.)?/, '');
  let validUrl = new URL(inputUrl).hostname;  
  dns.lookup(validUrl, (err, address, family) => {
    if (err) {
      res.json({ error: 'Invalid Url' });
    } else {
      if(!global.urls.has(inputUrl)) {
        var x=0;
        for(i=0; i<10; i++){
          x = Math.floor((Math.random() * 10) + 1);
          if(global.urls.has(x))
            continue;
          else
            break;
        }
        global.urls.set(x, inputUrl);
      }
      res.json({
        original_url: inputUrl,
        short_url: x
      });
    }
    // console.log('req.body.url', req.body.url);
    // console.log('url.origin', url.origin);
  });
});

// get api for short-url
app.get('/api/shorturl/:id', (req, res) => {
  // for (let entry of global.urls) {
  //   console.log(entry);
  // }
  // console.log("id: "+req.params.id);
  const externalUrl = global.urls.get(Number(req.params.id));
  //console.log(externalUrl);
  res.redirect(externalUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
