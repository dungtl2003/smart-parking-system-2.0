import {ResponseMessage} from "@/common/constants";
import prisma from "@/common/prisma-client";
import {CardInsertion, CardUpdate} from "@/common/schemas";
import {CardVehicle} from "@/common/types";
import CardNotFoundError from "@/errors/card/card-not-found";
import CardNotLinkedError from "@/errors/card/card-not-linked";
import RunoutOfCardError from "@/errors/card/run-out-of-card";
import {Card, Vehicle} from "@prisma/client";

const getCardLinkedToVehicle = async (
    cardCode: string
): Promise<CardVehicle> => {
    const rawData = await prisma.card.findFirst({
        where: {
            cardCode: cardCode,
        },
        include: {
            vehicle: {
                select: {
                    licensePlate: true,
                    user: {
                        select: {
                            username: true,
                        },
                    },
                },
            },
        },
    });

    if (!rawData) {
        console.log(`card not found`);
        throw new CardNotFoundError(`Card with id ${cardCode} cannot be found`);
    } else if (!rawData.vehicle) {
        console.log(`card is not link to vehicle`);
        throw new CardNotLinkedError(`Card is not linked to a vehicle`);
    }

    return {
        cardId: rawData.cardId,
        licensePlate: rawData.vehicle.licensePlate,
        username: rawData.vehicle.user.username,
    };
};

const getCard = async (
    cardId: string
): Promise<(Card & {vehicle: Vehicle | null}) | null> => {
    const card = await prisma.card.findFirst({
        where: {
            cardId: cardId,
        },
        include: {
            vehicle: true,
        },
    });

    return card;
};

const getCards = async (params: {userId?: null | string}): Promise<Card[]> => {
    const cards = await prisma.card.findMany({
        where: {
            userId: params.userId,
        },
        include: {
            user: {
                select: {
                    userId: true,
                    username: true,
                },
            },
        },
    });
    return cards;
};

const isOccupied = async (cardId: string): Promise<boolean> => {
    const card = await prisma.card.findFirst({
        where: {
            cardId: cardId,
        },
    });

    if (!card) throw new CardNotFoundError(ResponseMessage.NOT_FOUND);

    return card.userId !== null;
};

const updateCard = async (
    cardId: string,
    validPayload: CardUpdate
): Promise<Card> => {
    const card = await prisma.card.update({
        where: {
            cardId: cardId,
        },
        data: {
            cardCode: validPayload.cardCode,
            name: validPayload.name,
        },
        include: {
            user: {
                select: {
                    userId: true,
                    username: true,
                },
            },
        },
    });

    return card;
};

const insertCard = async (validPayload: CardInsertion): Promise<Card> => {
    const result = await prisma.card.create({
        data: {
            cardCode: validPayload.cardCode,
            name: validPayload.name,
        },
        include: {
            user: {
                select: {
                    userId: true,
                    username: true,
                },
            },
        },
    });

    return result;
};

const deleteCard = async (cardId: string): Promise<void> => {
    const cardToDelete = await getCard(cardId);
    if (!cardToDelete) throw new CardNotFoundError(ResponseMessage.NOT_FOUND);

    const availableCards = await getCards({userId: null});
    if (availableCards.length <= 0)
        throw new RunoutOfCardError(
            `Run out of cards, please insert more before continue deleting`
        );

    const newCard = availableCards[0];

    await prisma.$transaction(async (prisma) => {
        // update new card for the vehicle
        if (cardToDelete.vehicle)
            await prisma.vehicle.update({
                where: {
                    cardId: cardId,
                },
                data: {
                    cardId: newCard.cardId,
                },
            });

        await prisma.card.delete({
            where: {
                cardId: cardId,
            },
        });
    });
};

export default {
    getCards,
    updateCard,
    insertCard,
    deleteCard,
    isOccupied,
    getCardLinkedToVehicle,
};
