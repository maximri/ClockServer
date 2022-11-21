import * as Collections from 'typescript-collections'
import * as dns from "dns"
import LineReader from 'n-readlines-next'
import { parse } from 'csv-parse'
import * as fs from "fs"
import * as path from "path"

export type AcmeService = {
    processSingleLog: (singleLog: string)=> Promise<void>
    getInternalIPs: () => Array<string>
    addCloudService(cloudService: CloudService): void
    loadBunchOfLogs():Promise<void>
    loadBunchOfCloudServices():Promise<void>
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
    const ipToDomain = new Map<string,string>()

    async function getDomain(maybeDomain: Array<string> | undefined, domainIp: string) {
        async function findDomain(ip: string) {
            if (ipToDomain.has(ip)) {
                return ipToDomain.get(ip)
            }

            const maybeDns = await dnsResolver.resolve(ip)
            if (maybeDns) {
                ipToDomain.set(ip, maybeDns)
                return maybeDns
            }

            return 'www.justToContinueTheFlow.com'
        }

        if (maybeDomain) {
            ipToDomain.set(domainIp, maybeDomain[1])
            return maybeDomain[1]
        }

        return (maybeDomain) ? maybeDomain[1] : await findDomain(domainIp)
    }

    return {
        addCloudService(cloudService: CloudService): void {
            cloudServices.add(cloudService)
        },
        async processSingleLog(singleLog: string) {

            const kernalIndex = singleLog.indexOf('kernel')
            const isIncoming = singleLog.charAt(kernalIndex + 8) === 'I'
            // const incomingLog = 'Feb  1 00:00:02 bridge kernel: INBOUND TC
            // P: IN=br0 PHYSIN=eth0 OUT=br0 PHYSOUT=eth1 ' +
            //     'SRC=192.150.249.87 DST=' + internalIp + ' LEN=40 TOS=0x00 PREC=0x00 TTL=110 ' +
            //     'ID=12973 PROTO=TCP ' +
            //     'SPT=220 DPT=6129 WINDOW=16384 RES=0x00 SYN URGP=0 DOMAIN=www.dropbox.com'

            const onlyTokens = singleLog.slice(singleLog.lastIndexOf(':') + 2)
            const tokensTuples = onlyTokens.split(' ').map((token) => token.split('='))

            const srcIp = tokensTuples.find((tuple) => tuple[0] === 'SRC')[1]
            const destIp = tokensTuples.find((tuple) => tuple[0] === 'DST')[1]
            const maybeDomain = tokensTuples.find((tuple) => tuple[0] === 'DOMAIN')
            const domain = await getDomain(maybeDomain, isIncoming ? srcIp : destIp)

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
        },
        async loadBunchOfCloudServices(): Promise<void> {
            const csvFilePath = path.resolve(__dirname, '../../data/ServiceDBv1.csv')

            const headers = ['Service name', 'Service domain', 'Risk', 'Country of origin', 'GDPR Compliant']
            const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' })

            await parse(fileContent, {
                delimiter: ',',
                columns: headers,
            }, (error, result: CloudService[]) => {
                if (error) {
                    console.error(error)
                }

                result.forEach((cloudService: CloudService) => {
                        if (cloudService["Service domain"] !== 'Service domain') {
                            this.addCloudService(cloudService)
                        }
                    }
                )
            }) 

        },
        async loadBunchOfLogs(): Promise<void> {
            const liner = new LineReader('/Users/maximri/Dev/ClockServer/data/firewall.log')

            let line: any
            let lineNumber = 0
            // eslint-disable-next-line no-cond-assign
            while (line = liner.next()) {
                if (lineNumber === 307524)
                    return
                const lineInString = line.toString('ascii')
                try {
                    await this.processSingleLog(lineInString)
                } catch (e){
                    console.log('failed processing line', lineInString)
                }
                lineNumber++
            }

        }
    }
}
