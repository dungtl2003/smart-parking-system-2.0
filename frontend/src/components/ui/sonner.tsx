import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]_bg-background group-[.toaster]_text-foreground group-[.toaster]_border-border group-[.toaster]_shadow-lg",
          description: "group-[.toast]_text-muted-foreground",
          actionButton:
            "group-[.toast]_bg-primary group-[.toast]_text-primary-foreground",
          cancelButton:
            "group-[.toast]_bg-muted group-[.toast]_text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
