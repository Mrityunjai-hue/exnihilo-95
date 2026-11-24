import { executeSQL } from '../src/engine/index.ts';

const sql = process.argv[2] || 'SELECT 1 AS num, "Hello" AS greeting';

executeSQL(sql)
  .then((res) => {
    console.log(JSON.stringify(res));
    process.exit(0);
  })
  .catch((err) => {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  });
