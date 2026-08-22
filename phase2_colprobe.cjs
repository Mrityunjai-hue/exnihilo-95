const {Parser}=require('node-sql-parser');
const p=new Parser();

// Test 2: PostgreSQL LIKE query — what is the 'column' shape for column_refs?
const sql2 = "SELECT name, email FROM users WHERE email LIKE '%@gmail.com'";
const ast2 = p.astify(sql2, {database:'PostgreSQL'});
const node2 = Array.isArray(ast2)?ast2[0]:ast2;
console.log('=== Test 2: PostgreSQL LIKE ===');
console.log('columns:', JSON.stringify(node2.columns, null, 2));
console.log('where:', JSON.stringify(node2.where, null, 2));

// Test 14: CTE with PostgreSQL
const sql14 = "WITH recent AS (SELECT * FROM sales WHERE sale_date > '2026-01-01') SELECT * FROM recent";
const ast14 = p.astify(sql14, {database:'PostgreSQL'});
const node14 = Array.isArray(ast14)?ast14[0]:ast14;
console.log('\n=== Test 14: PostgreSQL CTE ===');
console.log('with[0].stmt.ast.where:', JSON.stringify(node14.with?.[0]?.stmt?.ast?.where, null, 2));
console.log('with[0].stmt.ast.columns:', JSON.stringify(node14.with?.[0]?.stmt?.ast?.columns, null, 2));
