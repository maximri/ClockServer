import axios, { AxiosResponse } from "axios";

export interface TimeService {
  getTime: () => Promise<Date>;
}

export interface GreetingsService {
  greet: (name: string) => Promise<string>;
}

export const TimeServiceFactory = (timeServerUrl: string): TimeService => {
  return {
    getTime: async () => {
      const {
        data: { time },
      } = await axios.get(timeServerUrl).then((result: AxiosResponse) => {
        return result.data;
      });
      return new Date(time);
    },
  };
};

export const GreetingsServiceFactory: (
  timeService: TimeService
) => GreetingsService = (timeService: TimeService) => {
  const greetingService: GreetingsService = {
    greet: async (name: string) => {
      const currentTime = await timeService.getTime();
      const currentTimeHours = currentTime.getHours();

      if (currentTimeHours < 16 && currentTimeHours >= 14) {
        return "zzz";
      }
      if (currentTimeHours < 20 && currentTimeHours >= 19) {
        return `Good evening ${name}`;
      }
      if (currentTimeHours < 6 && currentTimeHours >= 1) {
        return `Go to sleep ${name}`;
      }
      return `Greetings ${name}!`;
    },
  };

  return greetingService;
};

export interface BrexService {
  parseDatesFromSample: () => Promise<
    { company: string; createdAtMillis: number; name: string }[]
  >;
}

interface BrexItem {
  company: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at: string;
  name: string;
}

export const DefaultBrexService = (): BrexService => {
  return {
    parseDatesFromSample: async () => {
      const brexData = await axios
        .get("https://platform.brexapis.com/interview/test")
        .then((result: AxiosResponse) => result.data);

      return (brexData.data as BrexItem[]).map((item) => {
        return {
          company: item.company,
          createdAtMillis: Date.parse(item.created_at),
          name: item.name,
        };
      });
    },
  };
};
