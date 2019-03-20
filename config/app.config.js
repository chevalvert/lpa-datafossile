const fs = require('fs')
const parseStringInObject = require('parse-strings-in-object')
const path = require('path')
const pckg = require('package')(module)
const rc = require('rc')
const resolvePath = require('@server/utils/resolve-configuration-paths')

const appname = pckg.name
process.title = appname

/**
 * APP CONFIGURATION
 * Construct from package.json and .apprc
 * Overridden in order by :
 * - cli args `--parent.child=value`
 * - environment variables `bassins-de-lumiere_parent__child=value`
 * SEE: https://github.com/dominictarr/rc#standards
 */
const defaultConfigPath = path.join(__dirname, '..', '.apprc')
const readrc = () => {
  const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'))
  return parseStringInObject(rc(appname, defaultConfig))
}

let configuration = readrc()
configuration.host.dist = resolvePath(configuration.host.dist)
configuration.appname = appname
configuration.package = pckg
configuration.help = configuration.help || configuration.h
configuration.version = configuration.version || configuration.v

/**
 * ACTIONS
 */
if (configuration.help) {
  console.log(fs.readFileSync(path.join(__dirname, '..', 'server', 'USAGE'), 'utf-8'))
  process.exit(0)
}

if (configuration.version) {
  console.log(configuration.package.version)
  process.exit(0)
}

/**
 * HOT RELOADING
 * only when --hot flag is present
 */
if (configuration.hot) {
  require('chokidar')
    .watch([defaultConfigPath, ...(configuration.configs || [])])
    .on('change', () => {
      try {
        configuration = Object.assign(configuration, readrc())
      } catch (err) {
        console.error(err)
      }
    })
}

module.exports = configuration
