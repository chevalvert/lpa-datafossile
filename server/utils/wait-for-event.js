module.exports = (emitter, eventName) => new Promise((resolve, reject) => emitter.once(eventName, resolve))
