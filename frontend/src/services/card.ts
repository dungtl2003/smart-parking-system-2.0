import { AxiosResponse } from "axios";
import { axiosInstance } from "@/config/axios-config";
import { Card } from "@/types/model";
import { CardFormProps } from "@/utils/schema";

const cardEndPoint = "/cards";

const cardService = {
  apis: {
    getCards: async (available: boolean = false): Promise<Card[]> => {
      let url = cardEndPoint;
      url = `${url}?available=${available ? 1 : 0}`;

      const res = await axiosInstance.get<{
        info: Card[];
      }>(url);
      return res.data.info;
    },
    createCard: async (data: CardFormProps): Promise<Card> => {
      const response = await axiosInstance.post<{ info: Card }>(
        `${cardEndPoint}`,
        {
          cardCode: data.cardCode.trim(),
          name: data.name.trim(),
        }
      );

      return response.data.info;
    },
    updateCard: async (cardId: string, data: CardFormProps): Promise<Card> => {
      const res = await axiosInstance.put<{ info: Card }>(
        `${cardEndPoint}/${cardId}`,
        {
          cardCode: data.cardCode.trim(),
          name: data.name.trim(),
        }
      );
      return res.data.info;
    },
    deleteCard: async (cardId: string): Promise<AxiosResponse> => {
      const res = await axiosInstance.delete(`${cardEndPoint}/${cardId}`);
      return res;
    },
  },
  addCard: (newCard: Card, prevCards: Card[]) => {
    return [newCard, ...prevCards];
  },
  updateCard: (selectedCard: Card, prevCards: Card[]) => {
    return [
      selectedCard,
      ...prevCards.filter((e) => e.cardId !== selectedCard.cardId),
    ];
  },
  deleteCard: (selectedCard: Card, prevCards: Card[]) => {
    return [...prevCards.filter((e) => e.cardId !== selectedCard.cardId)];
  },
};

export default cardService;
