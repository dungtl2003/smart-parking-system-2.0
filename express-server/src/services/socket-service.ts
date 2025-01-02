import {ClientEvents, ServerEvents} from "@/common/types";
import {ParkingSlot} from "@prisma/client";
import {Server} from "socket.io";

let io: Server<ClientEvents, ServerEvents>;

const init = (socketIo: Server) => {
    io = socketIo;
    io.on(`connection`, (socket) => {
        console.debug(`An user with socket ID of ${socket.id} connected`);

        socket.on(`user:join`, () => {
            socket.join(`parking-area`);
            console.debug(
                `[socket server]: join viewer to parking-area room : { socketID : ${socket.id}}`
            );
        });

        socket.on(`user:leave`, () => {
            socket.leave(`parking-area`);
            console.debug(
                `[socket server]: viewer leaving from parking-area room : { socketID : ${socket.id}}`
            );
        });

        socket.on(`disconnect`, () => {
            console.debug(
                `An user with socket ID of ${socket.id} disconnected`
            );
        });
    });
};

const emitToParkingRoom = (data: {parkingStates: ParkingSlot[]}) => {
    if (io) {
        io.to(`parking-area`).emit("parking-slot:update", data);
    }
};

export default {init, emitToParkingRoom};
