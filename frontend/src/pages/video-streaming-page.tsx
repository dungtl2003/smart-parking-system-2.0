import { cn } from "@/lib/utils";
import { videoService } from "@/services";
import { buttonVariants } from "@/utils/constants";
import { ArrowLeftToLine } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import {
  NavLink,
  useParams,
  useRouteLoaderData,
  useSearchParams,
} from "react-router-dom";

const ViewVideo: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [videoSrc, setvideoSrc] = useState<string>(
    useRouteLoaderData("view-video-page") as string
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();

  useEffect(() => {
    const getVideo = async () => {
      if (id) {
        const newVideoStr = await videoService.apis.getVideo(id);
        setvideoSrc(newVideoStr);
      }
    };

    getVideo();

    return () => {
      URL.revokeObjectURL(videoSrc);
    };
  }, [id]);

  return (
    <div className="my-8 flex justify-center">
      <NavLink
        to={`/videos?${queryString}`}
        className={cn(
          "absolute left-20 top-28 !rounded-full",
          buttonVariants({ variant: "negative" })
        )}
      >
        <ArrowLeftToLine /> &nbsp; Back To Video List
      </NavLink>
      {videoSrc && (
        <video
          ref={videoRef}
          controls
          autoPlay={true}
          src={videoSrc}
          className="rounded-lg w-1/2"
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default ViewVideo;
