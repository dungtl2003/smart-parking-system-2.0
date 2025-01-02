import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class CardNotLinkedError extends ResponsableError {
    StatusCode: number = StatusCodes.UNPROCESSABLE_ENTITY;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, CardNotLinkedError.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default CardNotLinkedError;
