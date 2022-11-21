import * as Collections from 'typescript-collections'

export type AcmeService = {
    processSingleLog: (singleLog: string)=> void
    getInternalIPs: () => Array<string>
    addCloudService(cloudService: CloudService): void
}

export type CloudService = {
    'Service name': string,
    'Service domain': string,
    'Risk': string,
    'Country of origin': string,
    'GDPR Compliant': string
}

export const AcmeServiceFactory = (): AcmeService => {

    const ipSet = new Collections.Set<string>()
    const cloudServices = new Collections.Set<CloudService>()

    return {
        addCloudService(cloudService: CloudService): void {
            cloudServices.add(cloudService)
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        processSingleLog(singleLog: string) {

            const kernalIndex = singleLog.indexOf('kernel')

            const isIncoming = singleLog.charAt(kernalIndex + 8) === 'I'

            const onlyTokens = singleLog.slice(singleLog.lastIndexOf(':')+2)
            const tokensTuples = onlyTokens.split(' ').map((token)=> token.split('='))

            const srcIp = tokensTuples.find((tuple)=> tuple[0]==='SRC')[1]
            const destIp = tokensTuples.find((tuple)=> tuple[0]==='DST')[1]
            const domain = tokensTuples.find((tuple)=> tuple[0]==='DOMAIN')[1]


            const isRelevantCloudService = cloudServices.toArray()
                .find((cloudService: CloudService)=> cloudService["Service domain"] === domain)

            if (isRelevantCloudService) {
                if (isIncoming) {
                    ipSet.add(destIp)
                } else {
                    ipSet.add(srcIp)
                }
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
