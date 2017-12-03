const Datastore = require('nedb');
const path = require('path')
const DB_DIR = path.join(process.env['HOME'], ".clipboard-manager");
const MAX_ENTRIES = 1000;
require('mkdirp')(DB_DIR);

let db = new Datastore({
  filename: path.join(DB_DIR, '/.db'),
  autoload: true
});

function remove(data) {
  db.remove(data);
}

function clear() {
  db.remove({}, {
    multi: true
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
  return new Promise((resolve) => {
    db.remove({
      text: item.text
    }, {
      multi: true
    });
    db.insert(item, err => err && console.error(err));
    db.find({}).sort({
      id: -1
    }).limit(MAX_ENTRIES).exec((err, rows) => {
      resolve(rows);
      if (rows.length == MAX_ENTRIES) {
        db.remove({
          id: {
            $lt: rows[MAX_ENTRIES - 1].id
          }
        }, {
          multi: true
        });
      }
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