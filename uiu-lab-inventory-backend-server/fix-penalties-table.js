const db = require("./models/db");

const queries = [
  "ALTER TABLE penalties MODIFY penalty_type ENUM('overdue','damage','lost','other') NOT NULL",
  "ALTER TABLE penalties ADD COLUMN penalty_date DATETIME DEFAULT CURRENT_TIMESTAMP",
];

let completed = 0;

queries.forEach((query, index) => {
  db.query(query, (err) => {
    if (err) {
      console.log(`Query ${index + 1} Error:`, err.message);
    } else {
      console.log(`Query ${index + 1} Success`);
    }
    completed++;
    if (completed === queries.length) {
      console.log("Done!");
      process.exit();
    }
  });
});
