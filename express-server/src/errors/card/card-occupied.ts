import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class CardOccupiedError extends ResponsableError {
    StatusCode: number = StatusCodes.UNPROCESSABLE_ENTITY;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, CardOccupiedError.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default CardOccupiedError;
