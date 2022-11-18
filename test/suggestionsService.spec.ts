
type Trie = {  [key:string]:  { top10Words: Array<string>, trie: Trie}}

type SuggestionService = {
    search: (term: string) => void;
    suggest: (prefix: string) => Array<string>
}

const SuggestionServiceFactory: () => SuggestionService = () => {
    const root:Trie = {}
    const allHistory: {[key:string]: number} = {}
    
    return {
        search: (term: string):void => {
            allHistory[term] = (isNaN(allHistory[term])) ? 1 : (allHistory[term] + 1)
            let node

            node = root[term.charAt(0)]
            if (!node) {
                root[term.charAt(0)] = { trie :{}, top10Words: [] }
                node = root[term.charAt(0)]
            }
            for (let i = 0 ; i < term.length ; i++) {
                if(!node.top10Words.find(word => word === term)) {
                    if(node.top10Words.length < 10){
                        node.top10Words.push(term)
                    } else {
                        const searchTermsWithScore: Array<[string, number]> =
                            node.top10Words.map(word => [word, allHistory[word]])
                        searchTermsWithScore.push([term, allHistory[term]])
                        searchTermsWithScore.sort((a, b) => (a[1] < b[1])? 1 : -1)
                        node.top10Words = searchTermsWithScore.slice(0, 10).map(tuple => tuple[0])
                    }
                }

                if (i !== term.length - 1) {
                    if (!node.trie[term.charAt(i + 1)]) {
                        node.trie[term.charAt(i + 1)] = { trie: {}, top10Words: [] }
                    }
                    node = node.trie[term.charAt(i + 1)]
                }
            }
        },
        suggest: (prefix: string): Array<string> => {
            let node

            node = root[prefix.charAt(0)]
            if (!node) { return [] }

            for (let i = 0 ; i < prefix.length ; i++) {
                if (!node) { return [] }
                if (i === prefix.length - 1){ return node.top10Words.filter(word => word !== undefined) }
                node = node.trie[prefix.charAt(i + 1)]
            }
        }
    }
}

describe('suggestion service unit test', () => {

    let suggestionService: SuggestionService
    beforeEach(() => {
        suggestionService = SuggestionServiceFactory()
    })

    test("should offer auto suggestion based on previous search term",  () => {
        suggestionService.search('book')
        expect(suggestionService.suggest('bo')).toEqual(['book'])

    })

    test("should offer multiple auto suggestion based on previous search term",  () => {
        suggestionService.search('book')
        suggestionService.search('board')
        suggestionService.search('boris')
        expect(suggestionService.suggest('b')).toEqual(['book', 'board', 'boris'])
        expect(suggestionService.suggest('bo')).toEqual(['book', 'board', 'boris'])
        expect(suggestionService.suggest('boo')).toEqual(['book'])
        expect(suggestionService.suggest('book')).toEqual(['book'])
        expect(suggestionService.suggest('boar')).toEqual(['board'])
        expect(suggestionService.suggest('board')).toEqual(['board'])
    })

    test("should offer single result for auto suggestion if search term was searched multiple times",  () => {
        suggestionService.search('book')
        suggestionService.search('book')
        expect(suggestionService.suggest('bo')).toEqual(['book'])
    })

    test("should only suggest top 10 search terms",  () => {
        const expectedRes = []
        for (let i = 0 ; i < 10 ; i++) {
            suggestionService.search(`b${i}`)
            suggestionService.search(`b${i}`)
            expectedRes.push(`b${i}`)
        }
        suggestionService.search(`bi`)
        const actual = suggestionService.suggest('b')

        expect(actual).toEqual(expect.arrayContaining(expectedRes))
    })
})
