
"use strict";
const sqlite3 = require('sqlite3').verbose();

class Db {
  constructor(file) {
    this.db = new sqlite3.Database(file);
    this.createTables()
  }

  createTables() {
    let sql = `
      CREATE TABLE IF NOT EXISTS user (
      id integer PRIMARY KEY, 
      email text NOT NULL UNIQUE, 
      user_pass text NOT NULL)`
    this.db.run(sql);

    sql = `
      CREATE TABLE IF NOT EXISTS favourite (
      id integer PRIMARY KEY, 
      coin text NOT NULL, 
      user_id integer NOT NULL)`
    this.db.run(sql);
    return true
  }

  selectByEmail(email, callback) {
    return this.db.get(
      `SELECT * FROM user WHERE email = ?`,
      [email], (err,row) => {
          callback(err,row)
      }
    )
  }

  selectFavourite(user_id, callback) {
    return this.db.all(
      `SELECT * FROM favourite WHERE user_id = ?`,
      [user_id], (err,row) => {
          callback(err,row)
      }
    )
  }

  insertUser(user, callback) {
    return this.db.run(
      'INSERT INTO user (email,user_pass) VALUES (?,?)',
      user, function(err) {
          callback(err,this.lastID)
      }
    )
  }

  insertFavourite(favs, callback) {
    return this.db.run(
      'INSERT INTO favourite (coin,user_id) VALUES (?,?)',
      favs, err => {
          callback(err)
      }
    )
  }
}

module.exports = Db