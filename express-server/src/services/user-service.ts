import {compareSync, hashSync} from "bcrypt";
import {UserLogin, UserSignup, UserUpdate} from "@/common/schemas";
import {UserRole, type User} from "@prisma/client";
import prisma from "@/common/prisma-client";
import {UserDTO, UserInToken} from "@/common/types";
import UserAlreadyExistError from "@/errors/user/user-already-exist";
import {AuthToken, ResponseMessage} from "@/common/constants";
import UserNotFoundError from "@/errors/user/user-not-found";
import WrongPasswordError from "@/errors/user/wrong-password";
import jwtService from "./jwt-service";
import InvalidTokenError from "@/errors/auth/invalid-token";
import UserCannotBeDeleted from "@/errors/user/user-cannot-be-deleted";

const saltOfRound = 10;

const getUserDTOs = async (params: {role?: UserRole}): Promise<UserDTO[]> => {
    const users = await prisma.user.findMany({
        where: {
            role: params.role,
        },
        select: {
            userId: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            vehicles: true,
            cards: true,
        },
    });

    return users;
};

const getUserByEmail = async (email: string): Promise<User | null> => {
    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    return user;
};

const getValidUserDTO = async (
    email: string,
    password: string
): Promise<UserDTO> => {
    const findByEmail = await getUserByEmail(email);

    if (!findByEmail) throw new UserNotFoundError(ResponseMessage.NOT_FOUND);

    // Check whether password is valid
    const match =
        findByEmail.password && compareSync(password, findByEmail.password);
    if (!match) throw new WrongPasswordError(ResponseMessage.WRONG_PASSWORD);

    return {
        userId: findByEmail.userId,
        username: findByEmail.username,
        email: findByEmail.email,
        role: findByEmail.role,
        createdAt: findByEmail.createdAt,
    };
};

const getUserDTO = async (userId: string): Promise<UserDTO | null> => {
    const user = await prisma.user.findUnique({
        where: {
            userId: userId,
        },
        select: {
            userId: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            vehicles: true,
        },
    });

    return user;
};

const login = async (
    prevRT: string | undefined,
    validPayload: UserLogin
): Promise<{refreshToken: string; accessToken: string}> => {
    try {
        if (typeof prevRT == "string") {
            // Get userId from refreshtoken payload
            const userDecoded = jwtService.decodeToken(prevRT) as UserInToken;

            // If refresh token already existed in DB so delete it
            await deleteRefreshToken(prevRT, userDecoded.userId);
        }
    } catch (error: any) {
        console.debug(`[user service]: login : error=${JSON.stringify(error)}`);
    }

    const validUser: UserDTO = await getValidUserDTO(
        validPayload.email,
        validPayload.password
    );

    const payload: UserInToken = {
        userId: validUser.userId,
        username: validUser.username,
        role: validUser.role,
    };

    //create AT, RT
    const accessToken: string | null = jwtService.generateAuthToken(
        payload,
        AuthToken.AC
    );

    const refreshToken: string | null = jwtService.generateAuthToken(
        payload,
        AuthToken.RF
    );

    if (!accessToken || !refreshToken)
        throw new Error(ResponseMessage.GENERATE_TOKEN_ERROR);

    //Push refresh token to DB
    await pushRefreshToken(refreshToken, validUser.userId);
    return {refreshToken, accessToken};
};

const logout = async (token: string, userId: string) => {
    await deleteRefreshToken(token, userId);
};

const refreshToken = async (
    prevRT: string
): Promise<{accessToken: string; refreshToken: string}> => {
    try {
        const userDecoded = jwtService.verifyAuthToken(
            prevRT,
            AuthToken.RF
        ) as UserInToken;

        //Hacker's request: must clear all refresh token to login again
        const existing: boolean = await checkIfRefreshTokenExistInDB(
            prevRT,
            userDecoded.userId
        );

        if (!existing) {
            console.debug(
                `[user service]: refresh token: unknown refresh token`
            );
            await clearUserRefreshTokens(userDecoded.userId);
            throw new InvalidTokenError(ResponseMessage.TOKEN_INVALID);
        }

        //Down here token must be valid
        const userDTO = await getUserDTO(userDecoded.userId);

        if (!userDTO) throw new UserNotFoundError(ResponseMessage.NOT_FOUND);

        await deleteRefreshToken(prevRT, userDecoded.userId);
        const payload: UserInToken = {
            userId: userDTO.userId,
            username: userDTO.username,
            role: userDTO.role,
        };

        //create AT, RT
        const accessToken: string | null = jwtService.generateAuthToken(
            payload,
            AuthToken.AC
        );

        const refreshToken: string | null = jwtService.generateAuthToken(
            payload,
            AuthToken.RF
        );

        if (!accessToken || !refreshToken)
            throw new Error(ResponseMessage.GENERATE_TOKEN_ERROR);

        //Push refresh token to DB
        await pushRefreshToken(refreshToken, userDTO.userId);
        return {accessToken, refreshToken};
    } catch {
        throw new InvalidTokenError(ResponseMessage.TOKEN_INVALID);
    }
};

const insertUser = async (
    validPayload: UserSignup,
    role: UserRole
): Promise<UserDTO> => {
    const duplicatedUserAccount = await getUserByEmail(validPayload.username);

    if (duplicatedUserAccount)
        throw new UserAlreadyExistError(ResponseMessage.USER_ALREADY_EXISTS);

    const user = await prisma.user.create({
        data: {
            username: validPayload.username,
            email: validPayload.email,
            password: validPayload.password
                ? hashSync(validPayload.password, saltOfRound)
                : null,
            role: role,
        },
        select: {
            userId: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    return user;
};

const updateUser = async (
    userId: string,
    validPayload: UserUpdate
): Promise<UserDTO> => {
    if (validPayload.email) {
        const userHolder: User | null = await getUserByEmail(
            validPayload.email
        );

        if (userHolder && userHolder.userId !== userId)
            throw new UserAlreadyExistError(
                ResponseMessage.USER_ALREADY_EXISTS
            );
    }

    const user = await prisma.user.update({
        where: {
            userId: userId,
        },
        data: {
            username: validPayload.username,
        },
        select: {
            userId: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    return user;
};

const deleteRefreshToken = async (refreshToken: string, userId: string) => {
    const newRefreshTokens: string[] = await prisma.user
        .findFirst({where: {userId: userId}})
        .then((user) => {
            if (!user) {
                throw new UserNotFoundError(ResponseMessage.NOT_FOUND);
            }
            return user.refreshTokens.filter((token) => token !== refreshToken);
        });

    await prisma.user.update({
        where: {
            userId: userId,
        },
        data: {
            refreshTokens: newRefreshTokens,
        },
    });
};

const pushRefreshToken = async (refreshToken: string, userId: string) => {
    await prisma.user.update({
        where: {
            userId: userId,
        },
        data: {
            refreshTokens: {
                push: refreshToken,
            },
        },
    });
};

const clearUserRefreshTokens = async (userId: string) => {
    await prisma.user.update({
        where: {userId: userId},
        data: {
            refreshTokens: [],
        },
    });
};

const deleteUser = async (userId: string) => {
    const user = await getUserDTO(userId);

    if (!user) throw new UserNotFoundError(ResponseMessage.NOT_FOUND);

    if (user.role == UserRole.ADMIN)
        throw new UserCannotBeDeleted("This user can't be deleted");

    await prisma.user.delete({
        where: {
            userId: userId,
        },
    });
};

const checkIfRefreshTokenExistInDB = async (
    refreshToken: string,
    userId: string
): Promise<boolean> => {
    await getUserDTO(userId);

    const user: User | null = await prisma.user.findFirst({
        where: {
            userId: userId,
            refreshTokens: {has: refreshToken},
        },
    });

    return user !== null;
};

export default {
    getUserDTOs,
    getUserDTO,
    insertUser,
    login,
    refreshToken,
    logout,
    deleteUser,
    updateUser,
};
