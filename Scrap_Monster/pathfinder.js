'use strict';

const cheerio = require("cheerio");
const req = require("tinyreq");

const bestiaryUrls = [
    "http://paizo.com/pathfinderRPG/prd/bestiary/monsterIndex.html",
    "http://paizo.com/pathfinderRPG/prd/bestiary2/additionalMonsterIndex.html",
    "http://paizo.com/pathfinderRPG/prd/bestiary3/monsterIndex.html",
    "http://paizo.com/pathfinderRPG/prd/bestiary4/monsterIndex.html",
    "http://paizo.com/pathfinderRPG/prd/bestiary5/index.html"
];

for(var bestiaryUrl of bestiaryUrls) {
    getUrlsMonster(bestiaryUrl)
    .then((tab) => console.log(tab.length));
}
// Define the scrape function
function getBodyPage(url) {
    return new Promise(function(resolve, reject) {
      console.log(url);
  
      // 1. Create the request
      req(url, (err, body) => {
          if (err) { return reject(err); }
          // Send the data in the callback
          resolve(cheerio.load(body));
      });
    })
    .catch((error) => {
        console.error("ERROR in getBodyPage :" + error);
    });
}


function getUrlsMonster(url) {
    return new Promise((resolve) => {
        const urlsMonster = [];
        getBodyPage(url)
        .then($ => {
            $('.index').find('a')
            .each(function() {
                let link = $(this).attr('href');
                link = refactorUrlMonster(link, url);
                if(urlsMonster.includes(link)) return;
                urlsMonster.push(link);
            });
            resolve(urlsMonster);
        })
        .catch((error) => {
            console.error("ERROR in getUrlsMonster :" + error);
        });
    })
    .catch((error) => {
        console.error("ERROR in getBodyPage :" + error);
    });
    
}

function refactorUrlMonster (link, url) {
    const beginUrl = url.substring(url.lastIndexOf('/') + 1, 0);
    const hashIndex = link.lastIndexOf('#');
    if (link[0] === '/') {
        link = link.substring(link.lastIndexOf('/') + 1, hashIndex);
    } else {
        link = link.substring(0, hashIndex);
    }
    link = beginUrl + link;
    return link;
}

function getSpellsMonster(urlMonster) {
    
}