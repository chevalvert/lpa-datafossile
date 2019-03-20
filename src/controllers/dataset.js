import csv from 'src/dataset'

const table = csv.split('\n')
export const headers = table.shift().split(';')

const isDatetime = value => ~value.indexOf('/') || ~value.indexOf(':')

const datas = {}
table.forEach(row => {
  const data = row.split(';')

  const o = {}
  headers.forEach((header, index) => {
    const value = data[index].replace(',', '.')
    o[header] = isDatetime(value) ? value : parseFloat(value)
  })

  const date = data[0]
  if (!datas[date]) datas[date] = []
  datas[date].push(o)
})

export default datas
