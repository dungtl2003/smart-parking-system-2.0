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
    {cardCode: "0x6D-0xE2-0xD7-0x21", name: "1"},
    {cardCode: "0x23-0x0A-0x54-0x11", name: "2"},
    {cardCode: "0xE3-0x9A-0x66-0x10", name: "3"},
    {cardCode: "0x43-0x34-0x54-0x10", name: "4"},
    {cardCode: "0x40-0x1E-0x4A-0x12", name: "5"},
    {cardCode: "0x6A-0xD5-0x17-0xA4", name: "6"},
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

    // insert default cards
    const cards = await prisma.card.findMany({
        select: {cardId: true, cardCode: true},
        where: {
            cardCode: {
                in: defaultCardList.map((card) => card.cardCode),
            },
        },
    });

    await Promise.all(
        cards.map((card) =>
            prisma.card.upsert({
                where: {cardId: card.cardId},
                update: {},
                create: {
                    name: ``,
                    cardCode: card.cardCode,
                },
            })
        )
    );
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
