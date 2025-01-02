import { Button } from "@/components/ui/button";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { FC, HTMLAttributes } from "react";
import { Card as CardWrapper, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Card } from "@/types/model";
import CardActionDialog from "./card-action-dialog";
import { CardFormProps } from "@/utils/schema";
import DeleteCardAlertDialog from "./delete-card-alert-dialog";
import { ActionResult } from "@/types/component";

interface UserToolsProps extends HTMLAttributes<HTMLDivElement> {
  selectedCard: Card | undefined;
  handleDeleteCard: () => Promise<ActionResult>;
  handleUpdateCard: (data: CardFormProps) => Promise<ActionResult>;
  handleAddCard: (data: CardFormProps) => Promise<ActionResult>;
}

const CardToolBar: FC<UserToolsProps> = ({ ...props }) => {
  return (
    <CardWrapper className={cn("rounded-xl shadow-lg", props.className)}>
      <CardContent className="p-4 space-y-4 flex flex-col">
        {/** add button */}
        <CardActionDialog type="Add" onSave={props.handleAddCard}>
          <Button variant="positive" className="text-xl">
            <Plus />
          </Button>
        </CardActionDialog>

        {props.selectedCard ? (
          <>
            <CardActionDialog
              type="Edit"
              card={props.selectedCard}
              onSave={props.handleUpdateCard}
            >
              <Button variant="neutral">
                <SquarePen />
              </Button>
            </CardActionDialog>

            <DeleteCardAlertDialog onDeleteCard={props.handleDeleteCard}>
              <Button variant="negative">
                <Trash2 />
              </Button>
            </DeleteCardAlertDialog>
          </>
        ) : (
          <>
            <SquarePen className="mx-4 !mt-6" />
            <Trash2 className="mx-4 !mt-6" />
          </>
        )}
      </CardContent>
    </CardWrapper>
  );
};

export default CardToolBar;
