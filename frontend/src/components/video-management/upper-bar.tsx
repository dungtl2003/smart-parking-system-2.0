import { FC, HTMLAttributes, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { getDate, getDateString } from "@/utils/helpers";

interface UpperBarProps extends HTMLAttributes<HTMLDivElement> {
  onDateRangeChange: (dateRange: DateRange) => void;
}

const UpperBar: FC<UpperBarProps> = ({ onDateRangeChange, ...props }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const queryParams = new URLSearchParams(location.search);
    const from = queryParams.get("from");
    const to = queryParams.get("to");
    return {
      from: from ? new Date(getDate(from)) : undefined,
      to: to ? new Date(getDate(to)) : undefined,
    };
  });

  useEffect(() => {
    if (dateRange) {
      onDateRangeChange(dateRange);

      if (!dateRange.to) {
        setDateRange({
          from: dateRange.from,
          to: new Date(),
        });
      }
    }
  }, [dateRange]);

  return (
    <div className={cn("flex items-center space-x-4", props.className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-fit flex items-center gap-4 justify-start text-left !text-gray-600 !text-base focus-visible_!outline-none hover_!outline-none hover_!border-none",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {getDateString(dateRange.from)} -{" "}
                  {getDateString(dateRange.to)}
                </>
              ) : (
                getDateString(dateRange.from)
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default UpperBar;
