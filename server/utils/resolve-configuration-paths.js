const path = require('path')

module.exports = p => path.isAbsolute(p) ? p : path.resolve(__dirname, '..', '..', p)
