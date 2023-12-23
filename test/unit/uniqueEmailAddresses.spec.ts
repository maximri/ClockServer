function numUniqueEmails(emails: string[]): number {
    const emailsSet = new Set()
    emails.forEach(email => {
        const [localName, domainName] = email.split('@')
        const localNameWithoutDots = localName.split('.').join('')
        const localNameWithoutPlus = localNameWithoutDots.split('+')[0]
        emailsSet.add(`${localNameWithoutPlus}@${domainName}`)
    })

    return emailsSet.size
}

describe('unique email addresses', () => {
    test('should return 2', () => {
        const emails = ["test.email+alex@leetcode.com",
            "test.e.mail+bob.cathy@leetcode.com","testemail+david@lee.tcode.com"]
            expect(numUniqueEmails(emails)).toEqual(2)
    })
})