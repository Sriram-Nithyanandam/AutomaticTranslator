const fs = require('fs');
const path = require('path');
const fresdeskFreshchatMapping = require('./Constants/freshdeskFreshchatMapping');
const fetchValueFromTraversePath = require('./Utils/fetchValueFromTraversePath');
const findTraversePathOfValue = require('./Utils/findTraversePathOfValue');
const inputLanguage = require('./input');
const writeJsontoFile = require('./Utils/writeToFile');

const memoisedStorageObject = Object.keys(inputLanguage).reduce((initialObject, key) => { initialObject[key] = null; return initialObject; }, {})
const folderPath = path.join(__dirname, 'output/locales');

function searchChatTranslation(key, searchValue, referenceInputLanguage, referenceOutputLanguage) {
  let translatedKey = searchValue;
  let inputLanguage = fresdeskFreshchatMapping[referenceInputLanguage];
  let outputLanguage = fresdeskFreshchatMapping[referenceOutputLanguage];
  if(outputLanguage) {
    let referenceInputLanguagePath = `${__dirname}/Locales/Freshchat/${inputLanguage}.json`;
    let referenceOutputLanguagePath = `${__dirname}/Locales/Freshchat/${outputLanguage}.json`;

    let referenceInput = fs.readFileSync(referenceInputLanguagePath, 'utf8');
    let referenceOutout = fs.readFileSync(referenceOutputLanguagePath, 'utf8');
    let inputJson = JSON.parse(referenceInput);
    let outputJson = JSON.parse(referenceOutout);
    let traversePath = findTraversePathOfValue(searchValue, inputJson);
    let fetchedKey = fetchValueFromTraversePath([...traversePath], outputJson);
    if(fetchedKey) {
      translatedKey = fetchedKey;
      memoisedStorageObject[key] = { path: traversePath, location: 'Freshchat' };
    }
  }
  return translatedKey;
}

function languageTranslator(inputLanguage = {}, referenceInputLanguage = '', referenceOutputLanguage = '') {
  let translatedLanguage = {};
  let referenceInputLanguagePath = `${__dirname}/Locales/Freshdesk/${referenceInputLanguage}.json`;
  let referenceOutputLanguagePath = `${__dirname}/Locales/Freshdesk/${referenceOutputLanguage}.json`;

  for(key in inputLanguage) {
    let searchValue = String(inputLanguage[key]);

    if(!memoisedStorageObject[key]) {
      let referenceInput = fs.readFileSync(referenceInputLanguagePath, 'utf8');
      let inputJson = JSON.parse(referenceInput);
      let referenceOutout = fs.readFileSync(referenceOutputLanguagePath, 'utf8');
      let outputJson = JSON.parse(referenceOutout);
      let translationFound = false;
    
      let traversePath = findTraversePathOfValue(searchValue, inputJson);
      let fetchedKey = fetchValueFromTraversePath([...traversePath], outputJson);

      if(fetchedKey) {
        translationFound = true;
        translatedLanguage[key] = fetchedKey;
        memoisedStorageObject[key] = { path: traversePath, location: 'Freshdesk' };
      }

      if(!translationFound) {
        let chatTranslation = searchChatTranslation(key, searchValue, referenceInputLanguage, referenceOutputLanguage);
        translatedLanguage[key] = chatTranslation;
      }
    } else {
      let memoisedResult = memoisedStorageObject[key];
      let referenceOutoutPath;
      if(memoisedStorageObject[key].location === 'Freshdesk') {
        referenceOutoutPath = `${__dirname}/Locales/${memoisedResult.location}/${referenceOutputLanguage}.json`;
      } else {
        if(fresdeskFreshchatMapping[referenceOutputLanguage]) {
          referenceOutoutPath = `${__dirname}/Locales/${memoisedResult.location}/${fresdeskFreshchatMapping[referenceOutputLanguage]}.json`;
        }
      }
      
      if(referenceOutoutPath) {
        let referenceOutout = fs.readFileSync(referenceOutoutPath, 'utf8');
        let outputJson = JSON.parse(referenceOutout);

        translatedLanguage[key] = fetchValueFromTraversePath([...memoisedStorageObject[key].path], outputJson);
      } else {
        translatedLanguage[key] = searchValue;
      }
    }
  }

  return translatedLanguage;
};

function startTranslation() {
  let languageArray = ['ar','bg','bs','ca','cs','cy','da','de','el','en','es-LA','es','et','fi','fil','fr','he','hr','hu','id','is','it','ja-JP','ko','lt','lv-LV','ms','nb-NO','nl','pl','pt-BR','pt-PT','ro','ru-RU','sk','sl','sr','sv-SE','th','tr','uk','vi','zh-CN','zh-TW'];

  for(index in languageArray) {
    let language = languageArray[index];
    let translatedJson = languageTranslator(inputLanguage, 'en', language);
    // console.log(`[TRANSLATED LANGUAGE] : ${language}`, translatedJson);

    writeJsontoFile(translatedJson, `${__dirname}/output/locales/${language}.json`)
  }
};

function createDirectoryAndStartTranslation() {
  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
    console.log('created new folder');
    let start = new Date(Date.now());
    startTranslation();
    let end = new Date(Date.now());

    console.log('Time Taken => ', `${end.getTime() - start.getTime()} milliseconds`);
  });
}

if (!fs.existsSync(folderPath)) {
  createDirectoryAndStartTranslation();
} else {
  fs.rmdir(folderPath, { recursive: true }, () => { 
    console.log('removed existing folder'); 
    createDirectoryAndStartTranslation();
  });
}
