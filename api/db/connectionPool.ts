import mysql from "mysql2"

const connectionDB = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  // port: 3306,
  // waitForConnections: true,
  connectionLimit: 10,
  // maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  // idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  // queueLimit: 0,
  // enableKeepAlive: true,
  // keepAliveInitialDelay: 0
})

// const queryDB = (query: string): Promise<ResultsDB> => {
//   return new Promise((resolve, reject) => {
//     connectionDB.getConnection((err, connection) => {
//       if (err) reject(err)
//       connection.query(query, (err, results, fields) => {
//         connection.destroy()
//         if (err) reject(err)
//         resolve(results)
//       })
//     })
//   })
// }

// const queryDBPlaceHolder = (
//   query: string,
//   placeHolders: Array<string | number>
// ): Promise<ResultsDB> => {
//   return new Promise((resolve, reject) => {
//     connectionDB.getConnection((err, connection) => {
//       if (err) reject(err)
//       connection.query(query, placeHolders, (err, results, fields) => {
//         connection.destroy()
//         if (err) reject(err)
//         resolve(results)
//       })
//     })
//   })
// }

// connectionDB.on('release', function (connection) {
//   console.log('Connection %d released', connection.threadId);
// });

export { connectionDB }

//mysql -h dakshina.cyt6walgkcp2.us-east-2.rds.amazonaws.com -u admin -p
//mysql -h dakshina.cyt6walgkcp2.us-east-2.rds.amazonaws.com -P 3306 -u admin -p
