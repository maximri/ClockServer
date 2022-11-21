import * as Collections from 'typescript-collections'
import * as dns from "dns"

export type AcmeService = {
    processSingleLog: (singleLog: string)=> Promise<void>
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

export type DnsResolver = {
    resolve: (ip: string) => Promise<string | undefined>
}

export const NativeNodeJsDnsResolver = (): DnsResolver => {
    return {
        async resolve(ip: string): Promise<string | undefined> {
            let res: string | undefined

            await dns.reverse(ip, (err, addresses) => {
                if (addresses && addresses.length > 0) {
                    res = addresses.at(0)
                } else {
                    res = undefined
                }
            })

            return res
        }
    }
}

export const AcmeServiceFactory = (dnsResolver: DnsResolver = NativeNodeJsDnsResolver()): AcmeService => {

    const ipSet = new Collections.Set<string>()
    const cloudServices = new Collections.Set<CloudService>()

    async function findDomain(ip: string) {
        const maybeDns = await dnsResolver.resolve(ip)
        return maybeDns ? maybeDns : 'www.justToContinueTheFlow.com'
    }

    return {
        addCloudService(cloudService: CloudService): void {
            cloudServices.add(cloudService)
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async processSingleLog(singleLog: string) {

            const kernalIndex = singleLog.indexOf('kernel')

            const isIncoming = singleLog.charAt(kernalIndex + 8) === 'I'

            const onlyTokens = singleLog.slice(singleLog.lastIndexOf(':') + 2)
            const tokensTuples = onlyTokens.split(' ').map((token) => token.split('='))

            const srcIp = tokensTuples.find((tuple) => tuple[0] === 'SRC')[1]
            const destIp = tokensTuples.find((tuple) => tuple[0] === 'DST')[1]
            const maybeDomain = tokensTuples.find((tuple) => tuple[0] === 'DOMAIN')
            const domain = (maybeDomain) ? maybeDomain[1] : await findDomain(isIncoming ? srcIp : destIp)

            const isRelevantCloudService =
                cloudServices.toArray().find((cloudService: CloudService) => cloudService["Service domain"] === domain)

            if (isRelevantCloudService) {
                if (isIncoming) {
                    ipSet.add(destIp)
                } else {
                    ipSet.add(srcIp)
                }
            }
        },
        getInternalIPs(): Array<string> {
            return ipSet.toArray()
        }
    }
}
