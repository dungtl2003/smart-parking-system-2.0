import dotenv from "dotenv";
import {resolve} from "path";

type Config = {
    SERVER_PORT: number;
    AT_KEY: string;
    RT_KEY: string;
    CAMERA_SERVER_API: string;
};

const envConfig = dotenv.config({
    path: resolve(".env") as string,
});

if (envConfig.error) {
    console.info("[app-config] Cannot find .env file with dotenv");
} else {
    console.info("[app-config] Using .env file to load environment variables");
}

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.PORT = process.env.PORT || "8000";

if (!process.env.AT_SECRET_KEY || !process.env.RT_SECRET_KEY) {
    throw new Error("[app-config]: secret key is required");
}

const config: Config = {
    SERVER_PORT: parseInt(process.env.PORT, 10),
    AT_KEY: `${process.env.AT_SECRET_KEY}`,
    RT_KEY: `${process.env.RT_SECRET_KEY}`,
    CAMERA_SERVER_API: `${process.env.CAMERA_SERVER_API}`,
};

if (config.CAMERA_SERVER_API) {
    console.info("[app-config] CAMERA_SERVER_API=" + config.CAMERA_SERVER_API);
}

export default config;
