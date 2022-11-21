import { AcmeService, AcmeServiceFactory } from "../src/services/acmeService"

describe('AcmeService should', () => {

    let acmeService: AcmeService
    beforeEach(() => {
        acmeService = AcmeServiceFactory()
    })
    
    test("allow processing of single firewall log file and return internal IPs list",  () => {
        const internalIp = '11.11.11.83'
        const log = 'Feb  1 00:00:02 bridge kernel: INBOUND TCP: IN=br0 PHYSIN=eth0 OUT=br0 PHYSOUT=eth1 ' +
            'SRC=192.150.249.87 DST=' + internalIp + ' LEN=40 TOS=0x00 PREC=0x00 TTL=110 ' +
            'ID=12973 PROTO=TCP ' +
            'SPT=220 DPT=6129 WINDOW=16384 RES=0x00 SYN URGP=0 DOMAIN=www.dropbox.com'

        acmeService.processSingleLog(log)

        const internalIPs = acmeService.getInternalIPs()
        expect(internalIPs).toEqual([internalIp])
    })

    test("allow processing of single firewall log file and return internal IPs list " +
        "for outgoing request too",  () => {
        const internalIp = '11.11.11.71'
        const outgoingLog = 'Feb 27 14:40:06 bridge kernel: OUTG CONN TCP: IN=br0 PHYSIN=eth1 OUT=br0 ' +
            'PHYSOUT=eth0 SRC=' + internalIp + ' DST=77.88.55.80 LEN=40 TOS=0x00 PREC=0x00 TTL=64 ' +
            'ID=50688 DF PROTO=TCP SPT=80 DPT=1325 WINDOW=6432 RES=0x00 ACK URGP=0'

        acmeService.processSingleLog(outgoingLog)

        const internalIPs = acmeService.getInternalIPs()
        expect(internalIPs).toEqual([internalIp])
    })

    test("allow processing of multiple firewall log file and return internal IPs list ",  () => {
        const outgoingInternalIp = '11.11.11.71'
        const outgoingLog = 'Feb 27 14:40:06 bridge kernel: OUTG CONN TCP: IN=br0 PHYSIN=eth1 OUT=br0 ' +
            'PHYSOUT=eth0 SRC=' + outgoingInternalIp + ' DST=77.88.55.80 LEN=40 TOS=0x00 PREC=0x00 TTL=64 ' +
            'ID=50688 DF PROTO=TCP SPT=80 DPT=1325 WINDOW=6432 RES=0x00 ACK URGP=0'

        const incomingInternalIp = '11.11.11.83'
        const incomingLog = 'Feb  1 00:00:02 bridge kernel: INBOUND TCP: IN=br0 PHYSIN=eth0 OUT=br0 PHYSOUT=eth1 ' +
            'SRC=192.150.249.87 DST=' + incomingInternalIp + ' LEN=40 TOS=0x00 PREC=0x00 TTL=110 ' +
            'ID=12973 PROTO=TCP ' +
            'SPT=220 DPT=6129 WINDOW=16384 RES=0x00 SYN URGP=0 DOMAIN=www.dropbox.com'

        acmeService.processSingleLog(outgoingLog)
        acmeService.processSingleLog(incomingLog)

        const internalIPs = acmeService.getInternalIPs()
        expect(internalIPs).toEqual(expect.arrayContaining([incomingInternalIp, incomingInternalIp]))
    })

    test("allow processing of multiple firewall log file and return DISTINCT internal IPs list ",  () => {
        const internalIp = '11.11.11.71'
        const outgoingLog = 'Feb 27 14:40:06 bridge kernel: OUTG CONN TCP: IN=br0 PHYSIN=eth1 OUT=br0 ' +
            'PHYSOUT=eth0 SRC=' + internalIp + ' DST=77.88.55.80 LEN=40 TOS=0x00 PREC=0x00 TTL=64 ' +
            'ID=50688 DF PROTO=TCP SPT=80 DPT=1325 WINDOW=6432 RES=0x00 ACK URGP=0'

        const incomingLog = 'Feb  1 00:00:02 bridge kernel: INBOUND TCP: IN=br0 PHYSIN=eth0 OUT=br0 PHYSOUT=eth1 ' +
            'SRC=192.150.249.87 DST=' + internalIp + ' LEN=40 TOS=0x00 PREC=0x00 TTL=110 ' +
            'ID=12973 PROTO=TCP ' +
            'SPT=220 DPT=6129 WINDOW=16384 RES=0x00 SYN URGP=0 DOMAIN=www.dropbox.com'

        acmeService.processSingleLog(outgoingLog)
        acmeService.processSingleLog(incomingLog)

        const internalIPs = acmeService.getInternalIPs()
        expect(internalIPs).toEqual(expect.arrayContaining([internalIp]))
    })
})
