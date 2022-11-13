import axios, { AxiosResponse } from "axios"

export interface TimeService {
    getTime: () => Promise<Date>
}
export const TimeServiceFactory = (timeServerUrl: string): TimeService => {
    return {
        getTime: async () => {
            const {
                data: { time },
            } = await axios.get(timeServerUrl).then((result: AxiosResponse) => {
                return result.data
            })
            return new Date(time)
        },
    }
}
