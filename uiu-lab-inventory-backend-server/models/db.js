const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // MySQL username
  password: "", //  MySQL password
  database: "database_lab_inventory", //  database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting: " + err.stack);
    return;
  }
  console.log("MySQL connected");
});

module.exports = db;
