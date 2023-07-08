import mysql from "mysql2"

// const connectionDB = mysql.createConnection({
//     host: 'dakshina.cdnpwxaawgds.us-east-1.rds.amazonaws.com',
//     user: 'admin',
//     password: 'Dakshina23',
//     database: 'test',
//     port: '3306'
// })

// const connectionDB = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "Tollotzin25",
//   database: "dakshina",
// })

const connectionDB = require('mysql2').createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // waitForConnections: true,
  connectionLimit: 10,
  // maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  // idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  // queueLimit: 0,
  // enableKeepAlive: true,
  // keepAliveInitialDelay: 0
});

// connectionDB.on('release', function (connection) {
//   console.log('Connection %d released', connection.threadId);
// });

export { connectionDB }

//mysql -h dakshina.cdnpwxaawgds.us-east-1.rds.amazonaws.com -P 3306 -u admin -p
// mysql --user="root" --host="dakshina.cdnpwxaawgds.us-east-1.rds.amazonaws.com" --password="Dakshina23" --execute='SHOW VARIABLES LIKE "max_connections";'
// mysql --user="admin" --host="dakshina.cdnpwxaawgds.us-east-1.rds.amazonaws.com" --password="Dakshina23" --execute='SET GLOBAL max_connections = 500;'
