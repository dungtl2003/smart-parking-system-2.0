import prisma from "@/common/prisma-client";
import {VehicleInsertion, VehicleUpdate} from "@/common/schemas";
import {UserDTO} from "@/common/types";
import {Vehicle} from "@prisma/client";

const insertVehicle = async (
    validPayload: VehicleInsertion,
    user: UserDTO
): Promise<Vehicle> => {
    const data = await prisma.$transaction(async (prisma) => {
        const vehicle = await prisma.vehicle.create({
            data: {
                licensePlate: validPayload.licensePlate,
                cardId: validPayload.cardId,
                userId: user.userId,
            },
            include: {
                card: true,
            },
        });

        await prisma.card.update({
            where: {
                cardId: validPayload.cardId,
            },
            data: {
                userId: user.userId,
            },
        });
        return vehicle;
    });

    return data;
};

const deleteVehicle = async (vehicleId: string): Promise<void> => {
    await prisma.$transaction(async (prisma) => {
        const data = await prisma.vehicle.delete({
            where: {
                vehicleId: vehicleId,
            },
            select: {
                cardId: true,
            },
        });

        if (data.cardId) {
            //update userId column in Card table
            await prisma.card.update({
                where: {
                    cardId: data.cardId,
                },
                data: {
                    userId: null,
                },
            });
        }
    });
};

const updateVehicle = async (
    vehicleId: string,
    validPayload: VehicleUpdate
): Promise<Vehicle> => {
    const data = await prisma.$transaction(async (prisma) => {
        let vehicle = await prisma.vehicle.findFirst({
            where: {
                vehicleId: vehicleId,
            },
        });

        if (!vehicle || vehicle.cardId == null)
            throw new Error("Cannot update vehicle");

        await prisma.card.update({
            where: {
                cardId: vehicle.cardId,
            },
            data: {
                userId: null,
            },
        });

        vehicle = await prisma.vehicle.update({
            where: {
                vehicleId: vehicleId,
            },
            data: {
                licensePlate: validPayload.licensePlate,
                cardId: validPayload.cardId,
            },
            include: {
                card: true,
            },
        });

        await prisma.card.update({
            where: {
                cardId: validPayload.cardId,
            },
            data: {
                userId: vehicle.userId,
            },
        });

        return vehicle;
    });

    return data;
};

export default {
    insertVehicle,
    updateVehicle,
    deleteVehicle,
};
