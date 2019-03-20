/**
 * Take an async function and decorate it into a RESTful function
 */

const error = err => ({ error: err.message })
const success = data => ({ data, error: false })

module.exports = action => async (req, res) => {
  try {
    const resp = await action(req, success)
    if (!resp || !resp.data) throw new Error('REST return value must be formatted as { error, data } object. Use:\n```\n  (req, success) => return success("foo")\n  (req, success) => throw new Error("bar")\n```')
    res.json(resp)
  } catch (err) {
    console.error(err)
    res.json(error(err))
  }
}
