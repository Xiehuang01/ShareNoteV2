import mysql from 'mysql2/promise';

// 默认写法--但是每次连接都要await调用成对象之后再await 对象
// export const connectionMysql = async () => {
//   return await mysql.createConnection({
//     host: '103.194.106.239',
//     port: 3306,
//     user: 'serveruser',
//     password: 'serveruser12138',
//     database: 'sharenotev2'
//   });
// }

// 连接池--每次使用直接await就行
export const pool = mysql.createPool({
    host: '103.194.106.239',
    port: 3306,
    user: 'serveruser',
    password: 'serveruser12138',
    database: 'sharenotev2',
    waitForConnections: true,  // 等待空闲连接
    connectionLimit: 10,       // 最大连接数
    queueLimit: 0              // 队列大小，0 表示无限
})