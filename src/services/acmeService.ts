export const AcmeService = () => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        processSingleLog(singleLog: string) {
            return {
                message: ''
            }
        },
        getInternalIPs(): Array<string> {
            return ['11.11.11.84']
        }
    }
}
