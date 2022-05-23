import axios, { AxiosResponse } from "axios";

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
