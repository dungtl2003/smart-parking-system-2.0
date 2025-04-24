import { Plus, SquarePen, Trash2 } from "lucide-react";
import { FC, HTMLAttributes, useState } from "react";
import { Card as CardWrapper, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Card } from "@/types/model";
import CardActionDialog from "./card-action-dialog";
import { CardFormProps } from "@/utils/schema";
import DeleteCardAlertDialog from "./delete-card-alert-dialog";
import { ActionResult } from "@/types/component";
import { Button } from "@/components/ui/button";
import { IoIosRefresh } from "react-icons/io";
import { LoadingSpinner } from "@/components/effect";

interface UserToolsProps extends HTMLAttributes<HTMLDivElement> {
  selectedCard: Card | undefined;
  onDeleteButtonClicked: () => Promise<ActionResult>;
  onUpdateButtonClick: (data: CardFormProps) => Promise<ActionResult>;
  onAddButtonClicked: (data: CardFormProps) => Promise<ActionResult>;
  onRefreshButtonClicked: () => Promise<void>;
}

const CardToolBar: FC<UserToolsProps> = ({ ...props }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRefreshButton = async () => {
    setIsSubmitting(true);
    await props.onRefreshButtonClicked();
    setIsSubmitting(false);
  };

  return (
    <CardWrapper className={cn("rounded-xl shadow-lg", props.className)}>
      <CardContent className="p-4 space-y-4 flex flex-col">
        {/** add button */}
        <Button className="p-2 hover_text-black" onClick={handleRefreshButton}>
          {isSubmitting ? (
            <LoadingSpinner size={25} className="text-white" />
          ) : (
            <IoIosRefresh size={25} className="hover_text-black" />
          )}
        </Button>
        <CardActionDialog type="Add" onSave={props.onAddButtonClicked}>
          <Button variant="positive" className="text-xl">
            <Plus />
          </Button>
        </CardActionDialog>

        {props.selectedCard ? (
          <>
            <CardActionDialog
              type="Edit"
              card={props.selectedCard}
              onSave={props.onUpdateButtonClick}
            >
              <Button variant="neutral">
                <SquarePen />
              </Button>
            </CardActionDialog>

            <DeleteCardAlertDialog onDeleteCard={props.onDeleteButtonClicked}>
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
