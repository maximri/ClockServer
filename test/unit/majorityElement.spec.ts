const majorityElementSpec = (A: number[]) => {
    const map1 = new Map()
    let currentMax = 0
    let currentMaxMaj = 0
    for (let i = 0 ; i < A.length ; i++) {
        const currElemNumOfApp = map1.get(A[i])
        const nextCurrValue = (currElemNumOfApp ? currElemNumOfApp:0)+1

        map1.set(A[i], nextCurrValue)

        if(nextCurrValue > currentMax) {
            currentMax = nextCurrValue
            currentMaxMaj = A[i]
        }
        if(currentMax > Math.floor(A.length/2)) {
            break
        }
    }
    return currentMaxMaj
}

describe('majority element', () => {
    test('should return 9', () => {
        expect(majorityElementSpec([1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9])).toEqual(9)
    })
    test('should return 100', () =>
        expect(majorityElementSpec([100])).toEqual(100)
    )
})