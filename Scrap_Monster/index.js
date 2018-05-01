"use strict";
const cheerio = require("cheerio");
const req = require("tinyreq");
const co = require("co");
const Monster = require("./monster.js");
const fs = require('fs');

const bestiaryUrls = [
    "http://paizo.com/pathfinderRPG/prd/bestiary/monsterIndex.html",
    "http://paizo.com/pathfinderRPG/prd/bestiary2/additionalMonsterIndex.html",
    "http://paizo.com/pathfinderRPG/prd/bestiary3/monsterIndex.html",
    "http://paizo.com/pathfinderRPG/prd/bestiary4/monsterIndex.html",
    "http://paizo.com/pathfinderRPG/prd/bestiary5/index.html"
];

const concat = (x,y) =>
  x.concat(y)

const flatMap = (f,xs) =>
  xs.map(f).reduce(concat, [])

co(function*() {
    "use strict";
    let monsters = [];
    for(var bestiaryUrl of bestiaryUrls) {
        let urlsMonster = yield getUrlsMonster(bestiaryUrl)
        console.log(urlsMonster.length);
        for(var urlMonster of urlsMonster) {
            yield createMonsters(urlMonster)
            .then(res => monsters.push(res));
        }
    }
    console.log("1: "+monsters.length);
    monsters = flatMap(x => x, monsters);
    return monsters;
})
.then((monsters) => {
    createJsonFile(monsters);
    console.log("2: "+monsters.length);
});

// Define the scrape function
function getBodyPage(url) {
    return new Promise(function(resolve, reject) {
  
      // 1. Create the request
      req(url, (err, body) => {
          if (err) { return reject(err); }
          // Send the data in the callback
          resolve(cheerio.load(body));
      });
    })
    .catch((error) => {
        console.log(url);
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

function createMonsters(urlMonster) {
    return new Promise((resolve, reject) =>{
        const monsters = [];
        getBodyPage(urlMonster)
        .then($ => {
            if (!$) return resolve([]);
            $('.stat-block-title')
            .each(function() {
                let name = $(this).text();
                const indexCR = name.indexOf(' CR');
                if (indexCR === -1) return;
                name = name.substring(0, indexCR);
                let monster = new Monster(name);
                $(this).nextUntil('.stat-block-title')
                .each(function() {
                    $(this).find('a')
                    .each(function() {
                        if (!$(this).attr('href')) return;
                        if ($(this).attr('href').includes('/spells/')) {
                            monster.spells.push($(this).text());
                        }
                    });
                });
                //console.log(monster);
                monsters.push(monster);
            })
            resolve(monsters);
        })
        .catch((error) => {
            console.error("ERROR in createMonsters :" + error);
        });
    });
}

function createJsonFile(jsonObject) {
    let jsonString = JSON.stringify(jsonObject);
    fs.writeFile("mosnters.json", jsonString, function(err) {
        if (err) throw err;
        console.log('complete');
        }
    );
}
