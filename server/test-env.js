
const path = require('path');
console.log('当前工作目录:', process.cwd());
console.log('.env 文件路径:', path.resolve('.env'));

require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
