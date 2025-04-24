"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/utils/constants";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm_flex-row space-y-4 sm_space-x-4 sm_space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "negative" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover_opacity-100"
        ),
        nav_button_previous: "absolute left-1 !bg-primary opacity-100",
        nav_button_next: "absolute right-1 !bg-primary opacity-100",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&_has([aria-selected].day-range-end)]_rounded-r-md [&_has([aria-selected].day-outside)]_bg-accent/50 [&_has([aria-selected])]_bg-accent first_[&_has([aria-selected])]_rounded-l-md last_[&_has([aria-selected])]_rounded-r-md focus-within_relative focus-within_z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected_opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          buttonVariants({ variant: "negative" }),
          "text-white hover_bg-primary hover_text-primary-foreground"
        ),
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected_bg-accent/50 aria-selected_text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "bg-primary-softer !text-black opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
