import axios, { AxiosResponse } from 'axios'

export interface TimeService {
    getDate: () => Promise<Date>
}
export const TimeServiceFactory = (timeServerUrl: string): TimeService => {
  return {
    getDate: async () => {
      const {
        data: { time },
      } = await axios.get(timeServerUrl).then((result: AxiosResponse) => {
        return result.data
      })
      return new Date(time)
    },
  }
}
