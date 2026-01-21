const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "database_lab_inventory",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting:", err.message);
    process.exit(1);
  }
  console.log("MySQL connected");

  // Fix bookings with empty status
  db.query(
    "UPDATE booking SET status = 'return_pending' WHERE status = '' OR status IS NULL",
    (err, res) => {
      if (err) {
        console.log("Error:", err.message);
      } else {
        console.log(
          "Fixed",
          res.affectedRows,
          "bookings with empty status to 'return_pending'",
        );
      }
      db.end();
      process.exit(0);
    },
  );
});
