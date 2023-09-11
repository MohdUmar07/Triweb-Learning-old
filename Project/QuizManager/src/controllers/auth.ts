import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import User from "../models/user";
import ProjectError from "../helper/error";



interface ReturnResponse {
    status: "success" | "error",
    message: String,
    data: {} | [];
}

const registerUser = async (req: Request, res: Response, next: NextFunction) => {



    let resp: ReturnResponse;
    try {

        // --> how to decode base64 <-- //
        // const name = req.body.name;
        // const email = req.body.email;
        // const passwordFromReq = req.body.password;

        // let data = 'stackbash.com';
        // let buff = Buffer.from(passwordFromReq);
        // let password = buff.toString('base64');
        // const user = new User({name,email,password});

        const name = req.body.name;
        const email = req.body.email;
        let password = await bcrypt.hash(req.body.password, 12);


        const user = new User({ name, email, password });
        const result = await user.save();
        if (!result) {
            resp = { status: "error", message: "No result found", data: {} }
            res.send(resp);
        } else {
            resp = { status: "success", message: "Registration done!", data: { userId: result._id } };
            res.send(resp)
        }
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {

    let resp: ReturnResponse;
    try {
        const email = req.body.email;
        const password = req.body.password;

        // find user with email -- 
        const user = await User.findOne({ email });
        if (!user) {
            const err = new ProjectError("User not found")
            err.statusCode = 401;
            throw err;
        } else {

            // verfy password using bcrypt
            const status = await bcrypt.compare(password, user.password);

            // than decide0
            if (status) {

                const token = jwt.sign({ userId: user._id }, "thisismyveryveryimportantsecretkey", { expiresIn: "1h" });

                resp = { status: "success", message: "Logged in", data: { token } };
                res.send(resp);
            } else {

                const err = new ProjectError("User and password is incorrect")
                err.statusCode = 401;
                throw err;
            }

        }

    } catch (error) {
        next(error);
    }

}

export { registerUser, loginUser };