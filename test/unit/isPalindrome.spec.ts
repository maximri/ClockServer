function isPalindrome(s: string): boolean {
    interface IStack<T> {
        push(item: T): void;
        pop(): T | undefined;
        peek(): T | undefined;
        size(): number;
    }
    class Stack<T> implements IStack<T> {
        private storage: T[] = []
        constructor(private capacity: number = Infinity) {}

        push(item: T): void {
            if (this.size() === this.capacity) {
                throw Error("Stack has reached max capacity, you cannot add more items")
            }
            this.storage.push(item)
        }

        pop(): T | undefined {
            return this.storage.pop()
        }

        peek(): T | undefined {
            return this.storage[this.size() - 1]
        }

        size(): number {
            return this.storage.length
        }
    }

    const stack = new Stack<string>()

    let count = 0
    const lowerCaseS = s.toLowerCase()

    for(let i =0 ; i<s.length ; i++) {
        const code = lowerCaseS.charCodeAt(i)
        if((code >47 && code < 58) || (code > 64 && code < 91) || (code > 96 && code < 123)) {
            count= count+1
            stack.push(lowerCaseS.charAt(i))
        }
    }

    if (count === 0) {
        return true
    }

    const stack2 = new Stack<string>()
    for(let i =0 ; i < Math.floor(count/2) ; i++) {
        stack2.push(stack.pop())
    }

    if(count%2===1) {
        stack.pop()
    }
    for(let i =0 ; i < count/2 ; i++) {
        if(stack2.pop() !== stack.pop()) {
            return false
        }
    }
    return true
}

describe('isPalindrome', () => {
    it('should remove all non alpha and trim and check if palindrome and return true', ()=> {
        expect(isPalindrome('A man, a plan, a canal: Panama')).toBeTruthy()
    })
    it('should remove all non alpha and trim and check if palindrome and return false', ()=> {
        expect(isPalindrome('"race a car"')).toBeFalsy()
    })
    it('for only space', () => {
        expect(isPalindrome(" ")).toBeTruthy()
    })

    it('for only a letters', () => {
        expect(isPalindrome("aa")).toBeTruthy()
        expect(isPalindrome("aaa")).toBeTruthy()
    })
})