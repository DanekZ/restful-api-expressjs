import e from "express";
import userController from "../controller/user-controller.js";

const publicRouter = e.Router();

publicRouter.post("/api/users", userController.register);
publicRouter.post("/api/users/login", userController.login);

export {publicRouter}