import nock from 'nock'

export const TimeServerDriver = (timeServerUrl: string) => {
  return {
    givenHourIs: (date: Date) => {
      nock(timeServerUrl).get('/').reply(200, { data: { time: date } })
    },
    givenHourIsAlways: (date: Date) => {
      nock(timeServerUrl).get('/').reply(200, { data: { time: date } }).persist()
    },
    clearTimeSetting: () => {
      nock.cleanAll()
    }
  }
}

