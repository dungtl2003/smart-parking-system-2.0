import {Server} from "socket.io";
import {Server as ExpressServer} from "node:http";
import {instrument} from "@socket.io/admin-ui";
import {ClientEvents, ServerEvents} from "@/common/types";
import socketService from "@/services/socket-service";
import {options} from "@/common/cors-config";

interface Option {
    debug: boolean;
}

class SocketServer {
    private _io: Server<ClientEvents, ServerEvents>;
    private _debug: boolean;

    public constructor(expressServer: ExpressServer, opts?: Option) {
        this._io = new Server<ClientEvents, ServerEvents>(expressServer, {
            cors: options,
        });
        this._debug = opts?.debug || false;

        instrument(this._io, {
            auth: false,
            mode: "development",
        });

        this.listen();
    }

    private listen(): void {
        socketService.init(this._io);
        console.debug("[socket server]: Server is listening");
    }

    public getIO() {
        return this._io;
    }

    public close(): void {
        this._io.close((error) => {
            if (error) throw error;

            console.log("[socket server]: Stopped");
        });
    }

    private debug(msg: string): void {
        this._debug && console.debug(`[socket server]: ${msg}`);
    }
}

export default SocketServer;
