module.exports = (arr = [], {
  alreadySorted = false,
  alreadyCloned = false
} = {}) => {
  const values = alreadyCloned ? arr : arr.slice(0)
  const numbers = alreadySorted ? values : values.sort((a, b) => a - b)

  const middle = Math.floor(numbers.length / 2)
  const isEven = numbers.length % 2 === 0
  return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle]
}
