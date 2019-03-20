import 'whatwg-fetch'
import host from 'utils/host'

/* global fetch Headers */

const restURL = endpoint => host + '/api/' + endpoint

const restFetch = async (endpoint, options) => {
  const url = restURL(endpoint)

  const response = await fetch(url, options)
  if (!response || !response.ok) throw Error(`${url} (${response.statusText})`)

  const json = await validateJSONResponse(response)

  // SEE @server/utils/decorate-rest-action
  if (json.error) throw Error(`${url} (${json.error})`)
  return json.data
}

const validateJSONResponse = response => {
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  throw TypeError('Badly formatted JSON')
}

export default {
  get: async endpoint => restFetch(endpoint),
  post: async (endpoint, data) => restFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({ 'Content-Type': 'application/json' })
  })
}
