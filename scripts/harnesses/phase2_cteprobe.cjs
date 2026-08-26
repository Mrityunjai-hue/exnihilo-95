const {Parser}=require('node-sql-parser');
const p=new Parser();

// Full CTE dump for PostgreSQL
const sql14 = "WITH recent AS (SELECT * FROM sales WHERE sale_date > '2026-01-01') SELECT * FROM recent";
const ast14 = p.astify(sql14, {database:'PostgreSQL'});
const node14 = Array.isArray(ast14)?ast14[0]:ast14;
console.log('=== Full PostgreSQL CTE AST ===');
console.log(JSON.stringify(node14, null, 2));
