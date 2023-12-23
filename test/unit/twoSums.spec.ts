function twoSum(nums: number[], target: number) {
    const myMap = new Map<number, string>()

    for (let i = 0 ; i < nums.length ; i++) {
        if(myMap.get(nums[i]) && nums[i]*2 === target) {
            return [+myMap.get(nums[i]), i]
        } else {
            myMap.set(nums[i], i.toString())
        }
    }

    for (let i = 0 ; i < nums.length  ; i++) {
        const hamashlim = myMap.get(target-(+nums[i]))
        
        if (hamashlim && nums[i]*2 !== target) {
          return  [+myMap.get(nums[i]), +hamashlim]
        } 
    }
    
    return undefined
}

describe('two sums', () => {
    it('should find indices of the two numbers such that they add up to target', () => {
        const nums = [2, 7, 11, 15]
        const target = 9
        expect(twoSum(nums, target)).toEqual([0, 1])
    })

    it('should find indices of the two numbers such that they add up to target when same number', () => {
        const nums = [3, 3]
        const target = 6
        expect(twoSum(nums, target)).toEqual([0, 1])
    })

    it('also with negative', ()=> {
        const nums = [-1,-2,-3,-4,-5]
        const target = -8

        expect(twoSum(nums, target)).toEqual([2, 4])
    })
    it('also for wtf', () => {
        const nums = [3,2,4]
        const target = 6

        expect(twoSum(nums, target)).toEqual([1,2])
    })

    it('also for big ones', ()=> {
        const nums = [1,6142,8192,10239]
        const target = 18431

        expect(twoSum(nums, target)).toEqual([2,3])
    })
})