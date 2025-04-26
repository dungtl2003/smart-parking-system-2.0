import {ScannedLog, ClientEvents, ServerEvents} from "@/common/types";
import {ParkingSlot} from "@prisma/client";
import {Server} from "socket.io";

let io: Server<ClientEvents, ServerEvents>;
let currentParkingStatesId: number = 0;
let lastParkingStates: ParkingSlot[];

// clients to server
const init = (socketIo: Server) => {
    io = socketIo;
    io.on(`connection`, (socket) => {
        console.debug(`An user with socket ID of ${socket.id} connected`);

        socket.on(`user:join`, () => {
            socket.join(`parking-area`);
            console.debug(
                `[socket server] join viewer to parking-area room : { socketID : ${socket.id}}`
            );
        });

        socket.on(`user:leave`, () => {
            socket.leave(`parking-area`);
            console.debug(
                `[socket server] viewer leaving from parking-area room : { socketID : ${socket.id}}`
            );
        });

        socket.on(`cardlist-page:join`, (userId: string) => {
            socket.join(`cardlist-page-${userId}`);
            console.debug(
                `[socket server] join viewer to cardlist-page room : { socketID : ${socket.id}}`
            );
        });

        socket.on(`cardlist-page:leave`, (userId: string) => {
            socket.leave(`cardlist-page-${userId}`);
            console.debug(
                `[socket server] viewer leaving from cardlist-page room : { socketID : ${socket.id}}`
            );
        });

        socket.on(`cardlist-page-authorized:join`, () => {
            socket.join(`cardlist-page-authorized`);
            console.debug(
                `[socket server] join viewer to cardlist-page-authorized room : { socketID : ${socket.id}}`
            );
        });

        socket.on(`cardlist-page-authorized:leave`, () => {
            socket.leave(`cardlist-page-authorized`);
            console.debug(
                `[socket server] viewer leaving from cardlist-page-authorized room : { socketID : ${socket.id}}`
            );
        });

        socket.on(`reconnect:sync`, (latestId: number) => {
            if (!io) {
                console.debug(
                    `[socket-service] reconnect fail: io unavailable`
                );
                return;
            }

            // console.debug(
            //     `[socket server] compare id: `,
            //     latestId,
            //     currentParkingStatesId
            // );
            if (latestId !== currentParkingStatesId) {
                io.to(`parking-area`).emit(
                    "parking-slot:update",
                    {parkingStates: lastParkingStates},
                    currentParkingStatesId
                );
                console.debug(
                    `[socket server] send lastest states `,
                    lastParkingStates
                );
            }
            console.debug(`[socket server] viewer reconnect`);
        });

        socket.on(`disconnect`, () => {
            console.debug(
                `[socket-service] An user with socket ID of ${socket.id} disconnected`
            );
        });
    });
};

// server to clients
const emitToParkingRoom = (data: {parkingStates: ParkingSlot[]}) => {
    if (!io) {
        console.debug(`[socket-service] emitToParkingRoom: io unavailable`);
        return;
    }

    currentParkingStatesId = Date.now();
    io.to(`parking-area`).emit(
        "parking-slot:update",
        data,
        currentParkingStatesId
    );
    lastParkingStates = data.parkingStates;
};

const emitToCardListPageRoom = (data: {log: ScannedLog}) => {
    if (!io) {
        console.debug(
            `[socket-service] emitToCardListPageRoom: io unavailable`
        );
        return;
    }

    io.to(`cardlist-page-${data.log.userId}`).emit("card:update", data);
};

const emitToCardListAuthorizedPageRoom = (data: {log: ScannedLog}) => {
    if (!io) {
        console.debug(
            `[socket-service] emitToCardListAuthorizedPageRoom: io unavailable`
        );
        return;
    }

    io.to(`cardlist-page-authorized`).emit("card:update", data);
};

export default {
    init,
    emitToParkingRoom,
    emitToCardListPageRoom,
    emitToCardListAuthorizedPageRoom,
};
