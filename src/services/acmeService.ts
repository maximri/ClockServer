import * as Collections from 'typescript-collections'

export type AcmeService = {
    processSingleLog: (singleLog: string)=> void
    getInternalIPs: () => Array<string>
}

export const AcmeServiceFactory = () => {

    const ipSet = new Collections.Set<string>()

    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        processSingleLog(singleLog: string) {

            const kernalIndex = singleLog.indexOf('kernel')

            const isIncoming = singleLog.charAt(kernalIndex + 8) === 'I'

            const onlyTokens = singleLog.slice(singleLog.lastIndexOf(':')+2)
            const tokensTuples = onlyTokens.split(' ').map((token)=> token.split('='))

            const srcIp = tokensTuples.find((tuple)=> tuple[0]==='SRC')[1]
            const destIp = tokensTuples.find((tuple)=> tuple[0]==='DST')[1]

            if (isIncoming) {
                ipSet.add(destIp)
            } else {
                ipSet.add(srcIp)
            }

            return {
                message: ''
            }
        },
        getInternalIPs(): Array<string> {
            return ipSet.toArray()
        }
    }
}
