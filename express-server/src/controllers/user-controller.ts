import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import jwtService from "@/services/jwt-service";
import userService from "@/services/user-service";
import {UserLogin, UserSignup, UserUpdate} from "@/common/schemas";
import {UserDTO, UserInToken} from "@/common/types";
import {AuthToken, ResponseMessage} from "@/common/constants";
import MissingTokenError from "@/errors/auth/missing-token";
import ms from "ms";
import UserNotFoundError from "@/errors/user/user-not-found";
import {UserRole} from "@prisma/client";

/**
 * If updated email had already been existed in DB, return conflict status
 *
 * @param {Request} req
 * @param {Response} res
 */
const insertCustomer = async (req: Request, res: Response) => {
    const userSignup = req.body as UserSignup;

    const user = await userService.insertUser(userSignup, UserRole.CUSTOMER);

    res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
        info: user,
    });
};

const insertStaff = async (req: Request, res: Response) => {
    const userSignup = req.body as UserSignup;

    const user = await userService.insertUser(userSignup, UserRole.STAFF);

    res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
        info: user,
    });
};

/**
 * Log user in the user
 * If not, create tokens and send back in header and cookie
 *
 * @param {Request} req
 * @param {Response} res
 */
const login = async (req: Request, res: Response) => {
    const reqBody = req.body as UserLogin;
    const rtInCookies = req.cookies.refreshToken as string | undefined;

    const {refreshToken, accessToken} = await userService.login(
        rtInCookies,
        reqBody
    );

    //set token to cookie
    res.cookie(AuthToken.RF, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: ms(jwtService.REFRESH_TOKEN_LIFE_SPAN),
    });

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: {
            accessToken: accessToken,
        },
    });
};

/**
 * Log user out, remove user's token
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string;

    if (refreshToken) {
        const user = jwtService.decodeToken(refreshToken) as UserInToken;

        await userService.logout(refreshToken, user.userId);
    }

    res.removeHeader("Authorization");
    res.clearCookie(AuthToken.RF);
    res.status(StatusCodes.OK).json({message: ResponseMessage.SUCCESS});
};

/**
 * Make new access token. Also checking if DB is containing this refresh token or not
 * If not, then clear all the refresh token in the DB and user must login again for new valid refresh token
 *
 * @param {Request} req
 * @param {Response} res
 */
const refreshToken = async (req: Request, res: Response) => {
    const rtFromCookie = req.cookies.refreshToken as string;

    if (!rtFromCookie) {
        throw new MissingTokenError(ResponseMessage.TOKEN_MISSING);
    }

    const tokens = await userService.refreshToken(rtFromCookie);
    //set two token to cookie
    res.cookie(AuthToken.RF, tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: ms(jwtService.REFRESH_TOKEN_LIFE_SPAN),
    });
    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: {
            accessToken: tokens.accessToken,
        },
    });
};

/**
 * If updated username had already been existed in DB, return conflict status
 *
 * @param {Request} req
 * @param {Response} res
 */
const updateInfo = async (req: Request, res: Response) => {
    const userID = req.params.id as string;
    const userUpdate = req.body as UserUpdate;

    const updatedUser: UserDTO = await userService.updateUser(
        userID,
        userUpdate
    );

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: updatedUser,
    });
};

/**
 * Can get any kind of user
 * @param req
 * @param res
 */
const getUser = async (req: Request, res: Response) => {
    const userId = req.params.id as string;

    const user: UserDTO | null = await userService.getUserDTO(userId);

    if (!user) {
        throw new UserNotFoundError(ResponseMessage.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: user,
    });
};

const getCustomers = async (req: Request, res: Response) => {
    const users: UserDTO[] = await userService.getUserDTOs({
        role: UserRole.CUSTOMER,
    });

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: users,
    });
};

const getStaffs = async (req: Request, res: Response) => {
    const users: UserDTO[] = await userService.getUserDTOs({
        role: UserRole.STAFF,
    });

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: users,
    });
};

const deleteUser = async (req: Request, res: Response) => {
    const userId = req.params.id as string;

    await userService.deleteUser(userId);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

export default {
    insertCustomer,
    insertStaff,
    login,
    logout,
    refreshToken,
    updateInfo,
    getUser,
    getCustomers,
    getStaffs,
    deleteUser,
};
