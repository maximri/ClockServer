type CoinsInventory = { '1': number; '2': number; '5': number; '10': number }

const ChangeComponent = (coinsInventory: CoinsInventory) => {
  return {
    calcChange: ({ priceOfItem, userInputValue }: { priceOfItem: number, userInputValue: number }):CoinsInventory => {
      let emptyCoins = {
        1: 0, 2: 0, 5: 0, 10: 0
      }
      let change = userInputValue - priceOfItem

      function extractedCoin(coin: 1 | 2 | 5 | 10) {
        emptyCoins = {
          ...emptyCoins,
          [coin]: emptyCoins[coin] + 1
        }
        change -= coin
        coinsInventory = {
          ...coinsInventory,
          [coin]: coinsInventory[`${coin}`] - 1
        }
      }

      while (change > 0) {
        if (change >= 10 && coinsInventory['10'] > 0) {
          extractedCoin(10)
          continue
        }
        if (change >= 5 && coinsInventory['5'] > 0) {
          extractedCoin(5)
          continue
        }
        if (change >= 2 && coinsInventory['2'] > 0) {
          extractedCoin(2)
          continue
        }
        if (change >= 1 && coinsInventory['1'] > 0) {
          extractedCoin(1)
        }
      }
      return emptyCoins
    }
  }
}

describe('vending machine change comp should ', () => {
  test('return maximum amount of high value coins', () => {
    const changeComponent = ChangeComponent({ 1: 10, 2: 10, 5: 10, 10: 10 })
    const change = changeComponent.calcChange({ priceOfItem: 7, userInputValue: 10 })
    expect(change).toEqual({ 2: 1, 1: 1, 5: 0, 10: 0 })
  })

  test('return maximum amount of high value coins if some coins are missing', () => {
    const changeComponent = ChangeComponent({ 1: 10, 2: 0, 5: 10, 10: 10 })
    const change = changeComponent.calcChange({ priceOfItem: 7, userInputValue: 10 })
    expect(change).toEqual({ 2: 0, 1: 3, 5: 0, 10: 0 })
  })

  test('return maximum amount of high value coins if some coins are partly missing', () => {
    const changeComponent = ChangeComponent({ 1: 10, 2: 1, 5: 10, 10: 10 })
    const change = changeComponent.calcChange({ priceOfItem: 7, userInputValue: 11 })
    expect(change).toEqual({ 2: 1, 1: 2, 5: 0, 10: 0 })
  })

  test('return maximum amount of high value coins and make sure it evan return the same coins twice', () => {
    const changeComponent = ChangeComponent({ 1: 10, 2: 10, 5: 10, 10: 10 })
    const change = changeComponent.calcChange({ priceOfItem: 10, userInputValue: 30 })
    expect(change).toEqual({ 2: 0, 1: 0, 5: 0, 10: 2 })
  })

})
