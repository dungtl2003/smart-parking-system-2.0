import { cn } from "@/lib/utils";
import { LinkItem } from "@/types/component";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { FC, HTMLAttributes, LegacyRef, forwardRef } from "react";
import { NavLink } from "react-router-dom";

interface DropdownLinkMenuProps extends HTMLAttributes<HTMLDivElement> {
  item: LinkItem;
}

const DropMenuLinkItem: FC<DropdownLinkMenuProps> = forwardRef(
  (props, ref: LegacyRef<HTMLButtonElement>) => {
    return (
      <DropdownMenuItem
        className={cn(
          "p-2 hover_bg-slate-200 focus-visible_outline-none",
          props.item.visible ? "block" : "hidden"
        )}
      >
        {props.item.src ? (
          <NavLink
            to={props.item.src}
            onClick={props.item.handleClick}
            unstable_viewTransition={true}
            className="focus-visible_outline-none font-thin text-md"
          >
            {props.item.name}
          </NavLink>
        ) : (
          <button
            ref={ref}
            className="focus-visible_outline-none font-thin text-md"
            onClick={props.item.handleClick}
          >
            {props.item.name}
          </button>
        )}
      </DropdownMenuItem>
    );
  }
);

export default DropMenuLinkItem;
