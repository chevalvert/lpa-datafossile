const hostname = window.configuration.debug['overrideHostname'] || window.location.hostname
export default `${window.location.protocol}//${hostname}:${window.configuration['host'].port}`
