import { SchemaResponse } from "@/types/enum";
import z, { ZodString } from "zod";

const notBlankString = (validate: ZodString = z.string()) =>
  validate.trim().refine((value) => value !== "", {
    message: SchemaResponse.REQUIRED,
  });

const customerEditionSchema = z.object({
  username: notBlankString(),
  email: notBlankString(z.string().email()),
});

const customerAdditionSchema = z.object({
  username: notBlankString(),
  password: notBlankString(z.string().min(6)),
  retypepassword: notBlankString(z.string().min(6)),
  email: notBlankString(z.string().email()),
});

const staffSchema = z.object({
  username: notBlankString(),
  password: notBlankString(z.string().min(6)),
  retypepassword: notBlankString(z.string().min(6)),
  email: notBlankString(z.string().email()),
});

const cardSchema = z.object({
  cardCode: notBlankString(),
  name: notBlankString(),
});

const loginSchema = z.object({
  password: z.string().min(6, { message: SchemaResponse.PASSWORD_INVALID }),
  email: notBlankString(z.string().email()),
});

export type LoginFormProps = z.infer<typeof loginSchema>;

export type CustomerEditionFormProps = z.infer<typeof customerEditionSchema>;

export type CustomerAdditionFormProps = z.infer<typeof customerAdditionSchema>;

export type CardFormProps = z.infer<typeof cardSchema>;

export type StaffFormProps = z.infer<typeof staffSchema>;

export {
  customerEditionSchema,
  customerAdditionSchema,
  loginSchema,
  cardSchema,
  staffSchema,
};
