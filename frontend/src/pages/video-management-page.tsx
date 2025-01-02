import { FC, useEffect, useRef, useState } from "react";
import { UpperBar, VideoTable } from "@/components/video-management";
import CustomPagination from "@/components/video-management/custom-pagination";
import { Video } from "@/types/model";
import { useRouteLoaderData } from "react-router-dom";
import { toast } from "sonner";
import { videoService } from "@/services";
import { getDateString, getPages } from "@/utils/helpers";
import { DateRange } from "react-day-picker";

const VideoManagement: FC = () => {
  const searchingDelay = useRef<number>(1000);
  const initData = useRouteLoaderData("video-management") as {
    videos: Video[];
    numberOfVideos: number;
  };
  const [videos, setVideos] = useState<Video[]>(initData.videos);
  const [totalPages, setTotalPages] = useState<number>(() =>
    getPages(initData.numberOfVideos)
  );
  const [currentPage, setCurrentPage] = useState<number | undefined>(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = queryParams.get("currentPage");
    return page ? Number(page) : undefined;
  });
  const toasting = useRef<{
    id: string | number;
    state: boolean;
  } | null>();
  const [recaculate, setRecaculate] = useState<boolean>(true);

  useEffect(() => {
    if (toasting.current === undefined) {
      toasting.current = null;
    } else {
      if (!toasting.current?.state) {
        toasting.current = { id: toast.loading("Processing..."), state: true };
      }
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await videoService.apis.getVideos();

        setVideos(response.videos);
        setTotalPages(getPages(response.numberOfVideos));
        if (response.numberOfVideos == 0) setCurrentPage(undefined);
      } finally {
        toast.dismiss(toasting.current!.id);
        toasting.current = null;
      }
    }, searchingDelay.current);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, recaculate]);

  const handleDateRangeChange = (dateRange: DateRange) => {
    setCurrentPage(1);
    handleFilterChange([
      {
        filterKey: "from",
        filterValue: dateRange.from
          ? getDateString(dateRange.from)
          : dateRange.from,
      },
      {
        filterKey: "to",
        filterValue: dateRange.to ? getDateString(dateRange.to) : dateRange.to,
      },
      {
        filterKey: "currentPage",
        filterValue: `${1}`,
      },
    ]);
  };

  const handlePaginationSelection = (page: number) => {
    setCurrentPage(page);
    handleFilterChange([
      {
        filterKey: "currentPage",
        filterValue: `${page}`,
      },
    ]);
  };

  const handleFilterChange = (
    queryParams: {
      filterKey: string;
      filterValue: string | undefined;
    }[]
  ) => {
    const currentUrl = new URL(window.location.href);

    queryParams.forEach((queryParam) => {
      if (queryParam.filterValue) {
        currentUrl.searchParams.set(
          queryParam.filterKey,
          queryParam.filterValue
        );
      } else {
        currentUrl.searchParams.delete(queryParam.filterKey);
      }
    });

    window.history.replaceState({}, "", currentUrl);
    setRecaculate((prevValue) => !prevValue);
  };

  return (
    <div className="my-8">
      <UpperBar onDateRangeChange={handleDateRangeChange} />

      <VideoTable
        className="w-full mt-4"
        videos={videos}
        recaculate={recaculate}
      />

      {/** Pagination */}
      <CustomPagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={handlePaginationSelection}
      />
    </div>
  );
};

export default VideoManagement;
