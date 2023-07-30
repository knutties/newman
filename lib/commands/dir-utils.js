const fs = require('fs');
const pathLib = require('path');
const dirTree = require('directory-tree');
const os = require('os');

const assertDirectoryExistence = (dir) => {
  try {
    fs.readdirSync(dir);
  } catch(e) {
    console.log(`Unable to open directory ${dir} for implode:\n${e}\n`)
    process.exit(-1);
  }
};

const assertFileExistence = (file) => {
  try {
    fs.accessSync(file, fs.constants.R_OK);
  } catch(e) {
    console.log(`Unable to open file ${file}\n`)
    process.exit(-1);
  }
}

// create directory
const createDir = (dir) => {
  if (fs.existsSync(dir)) {
    throw new Error(`directory ${dir} already exists, please name your request files with unique names within a directory`);
  } else {
    fs.mkdirSync(dir, {recursive: true});
  }
}

// create file
const createFile = (fileName, content, opts) => {
  //fs.writeFileSync(fileName, content + '\n');
  fs.writeFileSync(fileName, content + ((typeof(opts) === 'object' && opts.skipTrailingNewLine) ? '' : '\n'));
}

// remove forward slashes in name
const sanitizePathName = (name) => {
  return name.replace(/\//g, '_slash_');
}

const topLevelFileKeys = {
  variable: 1,
  event: 1,
  info: 1,
  auth: 1
};

const traverse = (thing, ancestors) => {
  let parent = './' + ancestors.join('/');
  let name = '';

  if (ancestors.length === 0) {
    // this is top level set directory name from info
    name = thing['info']['name'];
  } else {
    // set directory name to thing['name']
    name = thing['name'];
  }
  name = sanitizePathName(name);

  let itemDir = `${parent}/${name}`;

  if (thing.hasOwnProperty('item')) {
    // TODO - handle directory creation error
    createDir(itemDir);

    // top-level files to be created after top-level directory is created
    if (ancestors.length === 0) {
      Object.keys(topLevelFileKeys).forEach(element => {
        if (thing.hasOwnProperty(element)) {
          let obj = {};
          obj[element] = thing[element];
          // TODO - handle file creation error
          createFile(`${parent}/${name}/.${element}.json`, JSON.stringify(obj, null, 2));
        }
      });
    }

    // walk-through items
    let newParent = ancestors.map((x) => x);
    newParent.push(name);
    let elementOrder = [];
    thing['item'].forEach(element => {
      traverse(element, newParent);
      elementOrder.push(element['name']);
    });

    let meta = {
      childrenOrder: elementOrder
    };

    if (thing.hasOwnProperty('description')) {
      meta.description = thing['description'];
    }

    // TODO save order of folders as meta
    createFile(`${parent}/${name}/.meta.json`, JSON.stringify(meta, null, 2));
  }

  if (thing.hasOwnProperty('request')) {
    /*
      - save request under ancestors dir
      - save tests that is part of event
    */
    createDir(itemDir);
    let requestFileName = `${itemDir}/request.json`;
    createFile(requestFileName, JSON.stringify(thing['request'], null, 2));

    if (thing.hasOwnProperty('event')) {
      thing['event'].forEach(element => {
        let eventFileName = `${itemDir}/event.${element['listen']}.js`;
        //createFile(eventFileName, element['script']['exec'].join('\n'), {});
        createFile(eventFileName, element['script']['exec'].join('\n'), {skipTrailingNewLine: true});
      });
    }

    if (thing.hasOwnProperty('response')) {
      let responseFileName = `${itemDir}/response.json`;
      createFile(responseFileName, JSON.stringify(thing['response'], null, 2));
    }
  }
}

const walkDirTree = (dirTreeJson, level) => {
  // console.log(JSON.stringify(dirTreeJson, null, 2));
  const { path, name, children, type } = dirTreeJson;
  let result = {};

  if (level === 0) {
    result['collection'] = {};
    result = result['collection'];
  }

  if (level === 1) {
    // collect following top level keys
    // info
    // auth
    // event
    // variable
    let matches = name.match(/\.([^\.\/]*)\.json$/);
    if (matches && topLevelFileKeys.hasOwnProperty(matches[1])) {
      let item = matches[1];
      // console.log(`@@@ reading item ${path}`);
      result[item] = JSON.parse(fs.readFileSync(path))[item];
      return result;
    }
  }
  // console.log(`processing name:${name} with type:${type} in path:${path}`);

  switch (type) {
    case 'file':
      switch (name) {
        case '.meta.json':
          break;
        case 'request.json':
          result = {
            request: JSON.parse(fs.readFileSync(path))
          };
          break;
        case 'response.json':
          result = {
            response: JSON.parse(fs.readFileSync(path))
          };
          break;
        default:
          let eventMatches = name.match(/^event\.([^\.]+)\.js$/);
          if (eventMatches) {
            // console.log(`@@@@ eventMatches ${eventMatches[1]}`);
            let fileContent = fs.readFileSync(path).toString();
            // console.log(`@@@@ typeof fileContent is ${typeof fileContent}`);
            // console.log(`@@@@ fileContent is ${fileContent}`);
            result = {
              listen: eventMatches[1],
              script: {
                exec: fileContent.split('\n'),
                type: "text/javascript"
              }
            };
          }
          break;
      }
      break;
    case 'directory':
      let items = [];
      let others = {};
      // top level name is part of info key
      if (level !== 0) {
        result['name'] = name;
      }
      if (children instanceof Array && children.length > 0) {
        let metaFilePath = pathLib.join(path, '.meta.json');
        try {
          fs.accessSync(metaFilePath, fs.constants.R_OK);
          let meta = JSON.parse(fs.readFileSync(metaFilePath));
          let childrenOrder = meta['childrenOrder'];
          // console.log(`childrenOrder: ${childrenOrder}`);
          // console.log(`children filtered: ${JSON.stringify(children)}`);
          children.sort((a, b) => {
            // console.log(`a.name: :${a.name}: b.name: :${b.name}:`);
            let aIndex = childrenOrder.findIndex(e => (e === a.name));
            let bIndex = childrenOrder.findIndex(e => (e === b.name));
            // console.log(`aIndex: ${aIndex} bIndex: ${bIndex}`);
            return (aIndex < bIndex) ? -1 : 1;
          });
          // add description from meta
          result['description'] = meta['description'];
        } catch (e) {
          // ignore if .meta.json does not exist
        }
        children.forEach(child => {
          let output = walkDirTree(child, level + 1);
          if (child.type === 'file') {
            // handle event files outside of top-level directory separately
            if (child.name.match(/event/) && level > 1) {
              if (!result.hasOwnProperty('event')) {
                result['event'] = [];
              }
              result.event.push(output);
            } else {
              Object.assign(others, output);
            }
          } else {
            items.push(output);
          }
        });
        if (items.length > 0) {
          result['item'] = items;
        }
      }
      Object.assign(result, others);
      break;
    default:
      break;
  }

  return result;
};

const dirTreeToCollectionJson = function(collectionDir) {
    let collectionJson = {}; const tree = dirTree(collectionDir, { attributes: ['type'] });
    collectionJson.collection = walkDirTree(tree, 0);
    return collectionJson;
};

const createTempDir = function() {
    return fs.mkdtempSync(pathLib.join(os.tmpdir(), 'newman-'));
};

module.exports = {
    assertDirectoryExistence,
    assertFileExistence,
    createFile,
    createDir,
    createTempDir,
    dirTreeToCollectionJson,
    sanitizePathName,
    traverse,
    walkDirTree
}
