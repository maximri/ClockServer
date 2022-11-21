import { server } from "../src/app"
import request from "supertest"

describe('Acme Server should', () => {
    const appServer = server({ appServerPort: 3002 })
    const requestFor = request(appServer)

    afterAll(async () => {
        await requestFor.post('/tearDown')
        await appServer.close()
    })

    test("allow processing of single firewall log file and return internal IPs list" +
        "only of cloud services of interest", async () => {
        const internalIp = '11.11.11.84'
        const log = 'Feb  1 00:00:02 bridge kernel: INBOUND TCP: IN=br0 PHYSIN=eth0 OUT=br0 PHYSOUT=eth1 ' +
            'SRC=192.150.249.87 DST=' + internalIp + ' LEN=40 TOS=0x00 PREC=0x00 TTL=110 ' +
            'ID=12973 PROTO=TCP ' +
            'SPT=220 DPT=6129 WINDOW=16384 RES=0x00 SYN URGP=0 DOMAIN=www.dropbox.com'

        const responseOfAddNewCloudService = await requestFor.post('/newCloudService').send({
            'Service name': 'Dropbox',
            'Service domain': 'www.dropbox.com',
            'Risk': 'Medium',
            'Country of origin': 'US',
            'GDPR Compliant': 'Yes'
        })
        expect(responseOfAddNewCloudService.status).toBe(200)

        const responseOfProcessSingleLog = await requestFor.post('/processSingleLog').send({
            log,
        })
        expect(responseOfProcessSingleLog.status).toBe(200)

        const response = await requestFor.get('/getInternalIPs')
        expect(response.status).toBe(200)
        expect(response.body.message).toBe(`["${internalIp}"]`)
    })
})
