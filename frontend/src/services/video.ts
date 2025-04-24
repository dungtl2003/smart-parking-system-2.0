import { axiosInstance } from "@/config/axios-config";
import { Video } from "@/types/model";
import { Args } from "@/utils/helpers";

const videoEndPoint = "/videos";

const videoService = {
  apis: {
    getVideos: async (): Promise<{
      videos: Video[];
      numberOfVideos: number;
    }> => {
      const queryParams = new URLSearchParams(location.search);
      const records = Object.fromEntries([...queryParams]);
      const res = await axiosInstance.get<{
        info: { videos: Video[]; numberOfVideos: number };
      }>(`${videoEndPoint}?`, { params: records });

      return res.data.info;
    },
    getVideo: async (args: Args | string): Promise<string> => {
      let videoId: string;
      if (typeof args === "string") {
        videoId = args;
      } else {
        videoId = args.params.id!;
      }

      const videoUrl = `${videoEndPoint}/${encodeURIComponent(videoId)}`;
      const response = await axiosInstance.get(videoUrl, {
        responseType: "blob",
      });

      const videoBlob = response.data;
      const videoObjectUrl = URL.createObjectURL(videoBlob);
      return videoObjectUrl;
    },
  },
};

export default videoService;
