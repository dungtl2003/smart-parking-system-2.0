import {SlotState} from "@prisma/client";
import {RequestMethod, ResponseMessage} from "./constants";
import zod, {ZodSchema, ZodString} from "zod";

const blankCheck = (z?: ZodString) =>
    (z || zod.string()).trim().refine((value) => value !== "", {
        message: ResponseMessage.BLANK_INPUT,
    });

const signupSchema = zod
    .object({
        username: blankCheck(),
        email: blankCheck(zod.string().email()),
        password: blankCheck(zod.string().min(6)).optional(),
    })
    .strict();

const loginSchema = zod
    .object({
        email: blankCheck(zod.string().email()),
        password: blankCheck(),
    })
    .strict();

const userUpdateSchema = zod
    .object({
        username: blankCheck().optional(),
        email: blankCheck(zod.string().email()).optional(),
    })
    .strict();

const parkingSlotsUpdateSchema = zod
    .array(
        zod.object({
            slotId: zod.number(),
            state: zod
                .enum([SlotState.AVAILABLE, SlotState.UNAVAILABLE])
                .optional(),
        })
    )
    .refine((value) => value.length > 0, ResponseMessage.ARRAY_IS_EMPTY);

const parkingSlotsInitializationSchema = zod
    .object({
        numberOfSlot: zod.number().gt(0).lt(20),
    })
    .strict();

const cardUpdateSchema = zod
    .object({
        cardCode: blankCheck().optional(),
        name: blankCheck().optional(),
    })
    .strict();

const cardInsertionSchema = zod
    .object({
        cardCode: blankCheck(),
        name: blankCheck(),
    })
    .strict();

const vehicleInsertionSchema = zod
    .object({
        userId: blankCheck(),
        cardId: blankCheck(),
        licensePlate: blankCheck(),
    })
    .strict();

const vehicleUpdateSchema = zod
    .object({
        licensePlate: blankCheck().optional(),
        cardId: blankCheck().optional(),
    })
    .strict();

export type UserSignup = zod.infer<typeof signupSchema>;

export type UserLogin = zod.infer<typeof loginSchema>;

export type UserUpdate = zod.infer<typeof userUpdateSchema>;

export type ParkingSlotsUpdate = zod.infer<typeof parkingSlotsUpdateSchema>;

export type ParkingSlotsInitialization = zod.infer<
    typeof parkingSlotsInitializationSchema
>;

export type CardUpdate = zod.infer<typeof cardUpdateSchema>;

export type CardInsertion = zod.infer<typeof cardInsertionSchema>;

export type VehicleInsertion = zod.infer<typeof vehicleInsertionSchema>;

export type VehicleUpdate = zod.infer<typeof vehicleUpdateSchema>;

export default {
    ["/users/login"]: {
        [RequestMethod.POST]: loginSchema,
    },
    ["/customers/signup"]: {
        [RequestMethod.POST]: signupSchema,
    },
    ["/customers/:id"]: {
        [RequestMethod.PUT]: userUpdateSchema,
    },
    ["/staffs/signup"]: {
        [RequestMethod.POST]: signupSchema,
    },
    ["/parkingSlots"]: {
        [RequestMethod.PUT]: parkingSlotsUpdateSchema,
        [RequestMethod.POST]: parkingSlotsInitializationSchema,
    },
    ["parkingSlots"]: {
        ["update"]: parkingSlotsUpdateSchema,
    },
    ["/cards"]: {
        [RequestMethod.POST]: cardUpdateSchema,
    },
    ["/cards/:id"]: {
        [RequestMethod.PUT]: cardInsertionSchema,
    },
    ["/vehicles"]: {
        [RequestMethod.POST]: vehicleInsertionSchema,
    },
    ["/vehicles/:id"]: {
        [RequestMethod.PUT]: vehicleUpdateSchema,
    },
} as {[key: string]: {[method: string]: ZodSchema}};
