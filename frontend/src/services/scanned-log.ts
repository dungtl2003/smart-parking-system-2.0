import { axiosInstance } from "@/config/axios-config";
import { CheckinLog } from "@/types/model";

const cardEndPoint = "/scanned-logs";

const cardService = {
  apis: {
    getLogs: async (): Promise<CheckinLog[]> => {
      const res = await axiosInstance.get<{
        info: CheckinLog[];
      }>(cardEndPoint);

      return res.data.info;
    },
  },
};

export default cardService;
