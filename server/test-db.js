const pool = require("./config/db");

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log(result.rows);
    }
    pool.end();
});