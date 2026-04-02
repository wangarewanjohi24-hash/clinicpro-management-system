import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const isMySQL = !!process.env.DB_HOST;

let sqliteDb: any;
let mysqlPool: mysql.Pool | null = null;

if (isMySQL) {
  console.log('Using MySQL database');
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  console.log('Using SQLite database');
  sqliteDb = new Database('clinic.db');
  sqliteDb.pragma('journal_mode = WAL');
}

export async function query(sql: string, params: any[] = []) {
  if (isMySQL && mysqlPool) {
    const [result]: any = await mysqlPool.execute(sql, params);
    return result;
  } else {
    const stmt = sqliteDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA')) {
      return stmt.all(...params);
    } else {
      return stmt.run(...params);
    }
  }
}

export async function get(sql: string, params: any[] = []) {
  if (isMySQL && mysqlPool) {
    const [rows]: any = await mysqlPool.execute(sql, params);
    return rows[0];
  } else {
    return sqliteDb.prepare(sql).get(...params);
  }
}

export async function exec(sql: string) {
  if (isMySQL && mysqlPool) {
    // MySQL exec is just query
    // We might need to split multiple statements if they are in one string
    const statements = sql.split(';').filter(s => s.trim() !== '');
    for (const s of statements) {
      await mysqlPool.execute(s);
    }
  } else {
    sqliteDb.exec(sql);
  }
}

export function getLastInsertId(result: any) {
  if (isMySQL) {
    return result.insertId;
  } else {
    return result.lastInsertRowid;
  }
}
