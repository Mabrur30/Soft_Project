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
  console.log("MySQL connected\n");

  // Check table structure
  db.query("DESCRIBE booking", (err, results) => {
    if (err) {
      console.log("Error:", err.message);
      db.end();
      process.exit(1);
    }

    console.log("Booking table columns:");
    const columns = results.map((r) => r.Field);
    console.log(columns.join(", "));

    // Check if actual_return_date column exists
    if (!columns.includes("actual_return_date")) {
      console.log("\n⚠️  'actual_return_date' column does NOT exist!");
      console.log("Adding column...\n");

      db.query(
        "ALTER TABLE booking ADD COLUMN actual_return_date DATETIME NULL",
        (alterErr) => {
          if (alterErr) {
            console.log("Error adding column:", alterErr.message);
          } else {
            console.log("✅ Added 'actual_return_date' column successfully!");
          }
          db.end();
          process.exit(0);
        },
      );
    } else {
      console.log("\n✅ 'actual_return_date' column exists.");
      db.end();
      process.exit(0);
    }
  });
});
