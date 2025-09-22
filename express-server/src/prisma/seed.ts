import {SlotState, UserRole} from "@prisma/client";
import {hashSync} from "bcrypt";
import prisma from "../common/prisma-client";

// ------FOR DATA INTIALIZATION---------------------------------------------------

const defaultAdminAccount = {
    username: "huy",
    role: UserRole.ADMIN,
    password: "123123",
    email: "huy@gmail.com",
};

const defaultSlotNumber = 6;

const defaultCardList = [
    {cardCode: "0X6D-0XE2-0XD7-0X21", name: "1"},
    {cardCode: "0X23-0X0A-0X54-0X11", name: "2"},
    {cardCode: "0XE3-0X9A-0X66-0X10", name: "3"},
    {cardCode: "0X43-0X34-0X54-0X10", name: "4"},
    {cardCode: "0X40-0X1E-0X4A-0X12", name: "5"},
    {cardCode: "0X6A-0XD5-0X17-0XA4", name: "6"},
];

// ---------------------------------------------------------

const saltOfRound = 10;

async function main() {
    // insert default admin account if not existed
    const admin = await prisma.user.findFirst({
        where: {role: "ADMIN"},
    });

    if (!admin) {
        await prisma.user.create({
            data: {
                ...defaultAdminAccount,
                password: hashSync(defaultAdminAccount.password, saltOfRound),
            },
        });
    }

    // insert default slots if not existed
    const slots = Array.from({length: defaultSlotNumber}, (_, i) => ({
        slotId: i + 1,
        state: SlotState.AVAILABLE,
    }));

    await Promise.all(
        slots.map((slot) =>
            prisma.parkingSlot.upsert({
                where: {slotId: slot.slotId},
                update: {state: slot.state},
                create: slot,
            })
        )
    );

    // insert default cards if Card table is empty
    const cards = await prisma.card.count();

    if (cards === 0) {
        await prisma.card.createMany({
            data: defaultCardList,
        });
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
