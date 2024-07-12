import { Router } from "express";
import UserService from "../services/UserService.js";
import NumberMiddleware from "../middlewares/number.middleware.js";
import UserMiddleware from "../middlewares/user.middleware.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", async (req, res) => {
	const response = await UserService.createUser(req);
	res.status(response.code).json(response.message);
});

router.get(
	"/:id/user",
	[
		NumberMiddleware.isNumber,
		UserMiddleware.isValidUserById,
		AuthMiddleware.validateToken,
		UserMiddleware.hasPermissions,
	],
	async (req, res) => {
		const response = await UserService.getUserById(req.params.id);
		res.status(response.code).json(response.message);
	},
);

router.put(
	"/:id",
	[
		NumberMiddleware.isNumber,
		UserMiddleware.isValidUserById,
		AuthMiddleware.validateToken,
		UserMiddleware.hasPermissions,
	],
	async (req, res) => {
		const response = await UserService.updateUser(req);
		res.status(response.code).json(response.message);
	},
);

router.delete(
	"/:id",
	[
		NumberMiddleware.isNumber,
		UserMiddleware.isValidUserById,
		AuthMiddleware.validateToken,
		UserMiddleware.hasPermissions,
	],
	async (req, res) => {
		const response = await UserService.deleteUser(req.params.id);
		res.status(response.code).json(response.message);
	},
);

router.get("/getAllUsers", [
	AuthMiddleware.validateToken,
	UserMiddleware.hasPermissions,
], async (req, res) => {
	const response = await UserService.getAllUsers();
	res.status(response.code).json(response.message);
});

router.get("/findUsers", [
    NumberMiddleware.isNumber,
    UserMiddleware.isValidUserById,
    AuthMiddleware.validateToken,
    UserMiddleware.hasPermissions,
], async (req, res) => {
    req.query.status = req.query.status ?? true;
    req.query.from = req.query.from ?? "1900-01-01";
    req.query.to = req.query.to ?? "2100-01-01";
    const response = await UserService.findUsers(req.query);
    res.status(response.code).json(response.message);
});

router.post('/bulkCreate',[
	NumberMiddleware.isNumber,
	UserMiddleware.isValidUserById,
	AuthMiddleware.validateToken,
	UserMiddleware.hasPermissions,
],async (req, res) => {
	const response = await UserService.bulkCreate(req.body);
	res.status(response.code).json(response.message);
});

export default router;
