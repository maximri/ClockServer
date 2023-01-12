type IntervalSchedulingResolver = {
    maxIntervals: (params: {startTimes: Array<number>, durations: Array<number>}) => number
}

const DynamicProgramingIntervalSchedulingResolver = ():IntervalSchedulingResolver => {
  // find the first class to finish
  // delete all intersections with him
  // repeat until no classes left
  return {
    maxIntervals: ({ startTimes, durations }: {startTimes: Array<number>, durations: Array<number>}): number => {
      let sortedByFinishTime = startTimes.map((startTime, index) => {
        return { duration: durations[index], startTime, finishTime: startTime + durations[index] }
      }).sort((a, b) => a.finishTime - b.finishTime)

      const classesPicked = []
      while (sortedByFinishTime.length > 0) {
        const earliestClassFinished = sortedByFinishTime[0]
        classesPicked.push(earliestClassFinished)
        sortedByFinishTime = sortedByFinishTime.filter(({ startTime }) => {
          return earliestClassFinished.finishTime <= startTime
        })
      }
      return classesPicked.length
    }
  }
}
const BruteForceExponentialIntervalSchedulingResolver = (): IntervalSchedulingResolver => {
  return {
    maxIntervals: ({ startTimes, durations }: {startTimes: Array<number>, durations: Array<number>}): number => {
      const sortedWithDuration = startTimes.map((x, i) => {
        return { duration: durations[i], value: x }
      })
      sortedWithDuration.sort((a, b) => a.value - b.value)

      return maxClassesInner(sortedWithDuration)

      function maxClassesInner(arr: Array<{duration: number, value: number}>): number {
        if (arr.length === 0) {
          return 0
        }
        if (arr.length === 1) {
          return 1
        }
        const startNextClass = arr[0].value + arr[0].duration
        const nextClassIndex = arr.findIndex(x => x.value >= startNextClass)
        if (nextClassIndex === -1) {
          return Math.max(1, maxClassesInner(arr.slice(1, arr.length)))
        }

        return Math.max(Math.max(
          maxClassesInner(arr.slice(nextClassIndex)),
          maxClassesInner(arr.slice(nextClassIndex + 1)),
        ) + 1, maxClassesInner(arr.slice(1, arr.length)))
      }
    }
  }
}

describe('Interval scheduling problem should be solved', () => {

  const resolvers = [
    { intervalSchedulingResolver: BruteForceExponentialIntervalSchedulingResolver(), technique: 'BruteForce' },
    { intervalSchedulingResolver: DynamicProgramingIntervalSchedulingResolver(), technique: 'DynamicPrograming' }]

  describe.each(resolvers)('using the technique: $technique for', ({ intervalSchedulingResolver }) => {
    test('an example without overlapping intervals', () => {
      expect(intervalSchedulingResolver.maxIntervals({
        startTimes: [1, 5, 7],
        durations: [1, 1, 1]
      })).toEqual(3)
    })

    test('an example with one overlapping interval', () => {
      expect(intervalSchedulingResolver.maxIntervals({
        startTimes: [1, 2, 4, 6, 8],
        durations: [7, 1, 1, 1, 1]
      })).toEqual(4)
    })

    test('an example with one overlapping interval even if startTimes are not sorted', () => {
      expect(intervalSchedulingResolver.maxIntervals({
        startTimes: [4, 8, 1, 6, 2],
        durations: [1, 1, 7, 1, 1]
      })).toEqual(4)
    })

    test('an example with two overlapping intervals', () => {
      expect(intervalSchedulingResolver.maxIntervals({
        startTimes: [1, 2, 4, 6, 8],
        durations: [7, 1, 7, 1, 1]
      })).toEqual(3)
    })

    test('an example with two overlapping intervals even if startTimes are not sorted', () => {
      expect(intervalSchedulingResolver.maxIntervals({
        startTimes: [8, 2, 6, 4, 1],
        durations: [1, 1, 1, 7, 7]
      })).toEqual(3)
    })

    test('an example where the first class is excluded from result', () => {
      expect(intervalSchedulingResolver.maxIntervals({
        startTimes: [1, 4, 5],
        durations: [5, 1, 1]
      })).toEqual(2)
    })
  })
})
