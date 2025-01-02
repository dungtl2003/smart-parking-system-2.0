import { FC, HTMLAttributes, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card as CardWrapper,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Card } from "@/types/model";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import TableContextMenu from "@/components/common/table-context-menu";

const columnHeaders = ["", "CARD ID", "CUSTOM NAME", "CUSTOMER"];

interface CardTableProps extends HTMLAttributes<HTMLTableElement> {
  cards: Card[];
  onSelectCard?: (card: Card) => void;
}

const CardTable: FC<CardTableProps> = ({ ...props }) => {
  const [selectedCard, setSelectedCard] = useState<Card | undefined>();

  const handleSelectCard = (card: Card) => {
    setSelectedCard(card);
    props.onSelectCard && props.onSelectCard(card);
  };

  return (
    <CardWrapper className={cn("rounded-2xl shadow-lg", props.className)}>
      <CardHeader className="py-6">
        <CardTitle className="text-8">CARD LIST</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col px-4">
        <ScrollArea className="relavtive h-[58vh]">
          <Table>
            <TableHeader className="z-10 border-b-secondary-foreground border-b-2 sticky top-0 bg-white shadow-lg">
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
              {props.cards.map((card, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "cursor-pointer",
                    selectedCard?.cardId == card.cardId && "bg-slate-200"
                  )}
                  onClick={() => handleSelectCard(card)}
                >
                  <TableCell className="text-center text-base">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    <TableContextMenu
                      textToCopy={card.cardCode}
                      className="h-full"
                    >
                      {card.cardCode}
                    </TableContextMenu>
                  </TableCell>
                  <TableCell className="text-center text-base">
                    {card.name}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    {card.user ? card.user.username : "_"}
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
      </CardContent>
    </CardWrapper>
  );
};

export default CardTable;
