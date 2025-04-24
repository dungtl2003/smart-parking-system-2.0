import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import useCurrentUser from "@/hooks/use-current-user";

interface DropdownAvatarProps extends HTMLAttributes<HTMLDivElement> {}

const DropdownAvatar: React.FC<DropdownAvatarProps> = ({
  className,
  ...props
}) => {
  const { currentUser } = useCurrentUser();

  return (
    <div
      className={cn("flex flex-row items-center space-x-[0.5rem]", className)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="overflow-hidden rounded-full h-14 w-14 focus-visible_outline-none"
          >
            <Avatar className="h-[3.5rem] w-[3.5rem] focus-visible_!outline-none ">
              <AvatarImage
                width={40}
                height={40}
                alt="AVT"
                className="focus-visible_!outline-none"
              />
              <AvatarFallback className="text-stone-800 hover_border-4 hover_border-primary hover_bg-primary-softer hover_text-primary focus-visible_outline-none">
                <User size={40} />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        {currentUser && (
          <DropdownMenuContent align="center">
            {props.children}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
      <div className="font-semibold max-w-52 text-[1.2rem] truncate ...">
        {currentUser?.username}
      </div>
    </div>
  );
};

export default DropdownAvatar;
