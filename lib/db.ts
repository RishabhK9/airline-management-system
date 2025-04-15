"use server"

import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flight_tracking",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(query, params)
    return { success: true, data: rows }
  } catch (error) {
    console.error("Database error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

export async function executeStoredProcedure(procedure: string, params: any[] = []) {
  try {
    const query = `CALL ${procedure}(${params.map(() => "?").join(", ")})`
    const [result] = await pool.execute(query, params)
    return { success: true, data: result }
  } catch (error) {
    console.error("Stored procedure error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

export async function executeView(view: string) {
  try {
    const query = `SELECT * FROM ${view}`
    const [rows] = await pool.execute(query)
    return { success: true, data: rows }
  } catch (error) {
    console.error("View error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

// Helper function to fetch dropdown options
export async function fetchOptions(table: string, valueField: string, labelField: string = valueField) {
  try {
    const query = `SELECT DISTINCT ${valueField}, ${labelField} FROM ${table}`
    const [rows] = await pool.execute(query)
    return { success: true, data: rows }
  } catch (error) {
    console.error("Options fetch error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
      data: [],
    }
  }
}
