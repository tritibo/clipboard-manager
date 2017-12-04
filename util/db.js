const Datastore = require('nedb');
const path = require('path')
const fs = require('fs');
const DB_DIR = path.join(process.env['HOME'], ".clipboard-manager");
const MAX_ENTRIES = 1000;
const PREVIEW_SIZE = 256;
require('mkdirp')(DB_DIR);
const CLIP_DIR = path.join(DB_DIR, 'clips');
require('mkdirp')(CLIP_DIR);
var rimraf = require('rimraf');

let db = new Datastore({
  filename: path.join(DB_DIR, '/.db'),
  autoload: true
});

function remove(data) {
  db.remove(data);
  if (data.file) {
    fs.unlink(data.file, () => {});
  }
}

function clear() {
  db.remove({}, {
    multi: true
  });
  rimraf(CLIP_DIR, () => {
    require('mkdirp')(CLIP_DIR);
  });
}

function findAll() {
  return new Promise(resolve => {
    db.find({}).sort({
      id: -1
    }).limit(MAX_ENTRIES).exec((err, rows) => resolve(rows));
  })
}

function filter(input) {
  return new Promise((resolve) => {
    db.find({
      text: new RegExp(escapeRegExp(input), 'i')
    }).sort({
      id: -1
    }).limit(100).exec((err, rows) => resolve(rows));
  });
}

function insertEntry(item) {
  const preview = item.text.substring(0, PREVIEW_SIZE);
  return new Promise(async(resolve) => {
    await checkRemove(item);
    if (item.text !== preview) {
      item.file = path.join(CLIP_DIR, '' + item.id);
      fs.writeFileSync(item.file, item.text);
      item.text = preview;
    }
    db.insert(item, err => err && console.error(err));
    db.find({}).sort({
      id: -1
    }).exec((err, rows) => {
      resolve(rows);
      let length = rows.length;
      while (length >= MAX_ENTRIES) {
        remove(rows[length - 1]);
        length--;
      }
    });
  });
}

function checkRemove(newItem) {
  return new Promise(resolve => {
    const preview = newItem.text.substring(0, 256);
    db.find({text: preview}).exec((err, rows) => {
      rows.forEach(item => {
        if (item.file) {
          const data = fs.readFileSync(item.file, 'utf8');
          if (data === newItem.text) {
            remove(item);
          }
        } else if (preview === newItem.text) {
          db.remove({_id: item._id});
        }
      });
      resolve();
    });
  });
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = {
  insertEntry: insertEntry,
  findAll: findAll,
  filter: filter,
  clear: clear,
  remove: remove
}