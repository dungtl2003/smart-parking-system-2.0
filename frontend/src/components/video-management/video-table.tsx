import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FC, HTMLAttributes, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Video } from "@/types/model";
import { formatDateTime } from "@/utils/helpers";
import { NavLink, useSearchParams } from "react-router-dom";
import { buttonVariants } from "@/utils/constants";

const columnHeaders = ["DATE TIME", "ACTION"];

interface VideoTableProps extends HTMLAttributes<HTMLDivElement> {
  videos: Video[];
  recaculate?: boolean;
  onSelectVideo?: (video: Video) => void;
}

const VideoTable: FC<VideoTableProps> = ({ ...props }) => {
  const [selectedVideo, setSelectedVideo] = useState<Video>();
  const [searchParams] = useSearchParams();
  const [queryString, setQueryString] = useState<string>(
    searchParams.toString()
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setQueryString(queryParams.toString());
  }, [props.recaculate]);

  const selectVideo = (video: Video) => {
    setSelectedVideo(video);
    props.onSelectVideo && props.onSelectVideo(video);
  };

  return (
    <Card className={cn("rounded-2xl shadow-lg", props.className)}>
      <CardContent className="flex flex-col p-4 h-[60vh]">
        {props.videos.length !== 0 ? (
          <ScrollArea className="relative h-[60vh] pr-3 pb-3">
            <Table>
              <TableHeader className="z-10 border-b-secondary-foreground shadow-lg bg-white border-b-2 sticky top-0">
                <tr>
                  {columnHeaders.map((item, key) => {
                    return (
                      <TableHead
                        key={key}
                        className="text-nowrap text-center text-black font-extrabold text-[1rem]"
                      >
                        {item}
                      </TableHead>
                    );
                  })}
                </tr>
              </TableHeader>
              <TableBody>
                {props.videos.map((video, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      "cursor-pointer",
                      selectedVideo?.videoId === video.videoId && "bg-slate-200"
                    )}
                    onClick={() => selectVideo(video)}
                  >
                    <TableCell className="text-center text-base">
                      {`${formatDateTime(video.createdAt)}`}
                    </TableCell>
                    <TableCell className="text-center text-base">
                      <NavLink
                        to={`/videos/${video.videoId}?${queryString}`}
                        unstable_viewTransition
                        className={cn(
                          "mt-auto",
                          buttonVariants({ variant: "negative" })
                        )}
                      >
                        View
                      </NavLink>
                    </TableCell>
                  </TableRow>
                ))}
                <tr>
                  <td>
                    <Separator />
                  </td>
                </tr>
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center my-auto">
            <img
              width={200}
              src="/empty-folder.png"
              alt="emptyCart"
              className="opacity-70"
            />
            <span className="text-xl font-normal text-slate-500 mb-10">
              No video found...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoTable;
