import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus_outline-none focus_ring-2 focus_ring-ring focus_ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover_bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover_bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover_bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover_bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover_bg-destructive/90",
        outline:
          "border border-input bg-background hover_bg-accent hover_text-accent-foreground hover_!ring-2 hover_!ring-slate-400 hover_!text-black transition ease-out duration-100",
        secondary:
          "bg-secondary text-secondary-foreground hover_bg-secondary/80",
        normal:
          "bg-white border-2 border-stone-400 !text-black !font-medium hover_!bg-white focus-visible_outline-none focus_!ring-stone-400",
        ghost: "hover_bg-accent hover_text-accent-foreground",
        link: "text-primary underline-offset-4 hover_underline",
        positive:
          "bg-green-600 text-white rounded-md px-2 text-md hover_!bg-green-100 hover_!text-green-400 hover_!ring-2 hover_!ring-green-600 transition ease-out duration-100",
        neutral:
          "bg-blue-600 text-white rounded-md px-2 text-md hover_!bg-blue-100 hover_!text-blue-400 hover_!ring-2 hover_!ring-blue-600 transition ease-out duration-100",
        negative:
          "bg-primary text-white rounded-md px-2 text-md hover_!bg-primary-softer hover_!text-primary-foreground hover_!ring-2 hover_!ring-primary transition ease-out duration-100",
        dashed:
          "!text-slate-600 border-dashed border-slate-600 border-2 rounded-md bg-white hover_!bg-slate-600 hover_!ring-none hover_!text-white transition ease-out duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export { badgeVariants, buttonVariants };
