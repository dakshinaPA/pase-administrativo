const mysql = require('mysql2');

// const connectionDB = mysql.createConnection({
//     host: 'dakshina.cdnpwxaawgds.us-east-1.rds.amazonaws.com',
//     user: 'admin',
//     password: 'Dakshina23',
//     database: 'test',
//     port: '3306'
// })

const connectionDB = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tollotzin25',
    database: 'test',
})

async function connDB(){

  const mysql = require('mysql2/promise');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tollotzin25',
    database: 'test',
  })

  return connection
}

export { connectionDB, connDB }

//mysql -h dakshina.cdnpwxaawgds.us-east-1.rds.amazonaws.com -P 3306 -u admin -p
// mysql --user="root" --host="dakshina.cdnpwxaawgds.us-east-1.rds.amazonaws.com" --password="Dakshina23" --execute='SHOW VARIABLES LIKE "max_connections";'
// mysql --user="admin" --host="dakshina.cdnpwxaawgds.us-east-1.rds.amazonaws.com" --password="Dakshina23" --execute='SET GLOBAL max_connections = 500;'