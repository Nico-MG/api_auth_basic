import UserExists from "../errors/userExists.js";
import PasswordNotMatch from "../errors/passwordNotMatch.js";
import UserNotFound from "../errors/userNotFound.js";
import db from "../dist/db/models/index.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

const createUser = async (req) => {
	const { name, email, password, password_second, cellphone } = req.body;
	if (password !== password_second) {
		throw new PasswordNotMatch();
	}
	const user = await db.User.findOne({
		where: {
			email: email,
		},
	});
	if (user) {
		throw new UserExists();
	}

	const encryptedPassword = await bcrypt.hash(password, 10);

	const newUser = await db.User.create({
		name,
		email,
		password: encryptedPassword,
		cellphone,
		status: true,
	});
	return newUser;
};

const bulkCreateUsers = async (req) => {
	const users = req.body;
	let usersInsertedCount = 0;
	let usersNotInsertedCount = 0;

	for (const user of users) {
		const userReq = { body: user };
		try {
			await createUser(userReq);
			usersInsertedCount++;
		} catch (error) {
			usersNotInsertedCount++;
		}
	}
	return { usersInsertedCount, usersNotInsertedCount };
};

const getUserById = async (id) => {
	const user = await db.User.findOne({
		where: {
			id: id,
			status: true,
		},
	});
	if (!user) {
		throw new UserNotFound();
	}
	return user;
};

const getAllUsers = async () => {
	return await db.User.findAll({
		where: {
			status: true,
		},
	});
};

const findUsers = async (req) => {
	const { active, name, login_after_date, login_before_date } = req.query;

	const userQuery = {};
	const sessionQuery = {};

	active && (userQuery.status = active === "true" ? true : false);
	name && (userQuery.name = { [Op.like]: `%${name}%` });

	login_after_date &&
		(sessionQuery.createdAt = {
			...sessionQuery.createdAt,
			[Op.gte]: new Date(login_after_date),
		});
	login_before_date &&
		(sessionQuery.createdAt = {
			...sessionQuery.createdAt,
			[Op.lte]: new Date(login_before_date),
		});

	const includeObj =
		Object.keys(sessionQuery).length > 0
			? [
					{
						model: db.Session,
						where: sessionQuery,
						attributes: [],
					},
				]
			: [];

	return await db.User.findAll({
		where: userQuery,
		include: includeObj,
	});
};

const updateUser = async (req) => {
	const user = db.User.findOne({
		where: {
			id: req.params.id,
			status: true,
		},
	});
	if (!user) {
		throw new UserNotFound();
	}
	const payload = {};
	payload.name = req.body.name ?? user.name;
	payload.password = req.body.password
		? await bcrypt.hash(req.body.password, 10)
		: user.password;
	payload.cellphone = req.body.cellphone ?? user.cellphone;
	await db.User.update(payload, {
		where: {
			id: req.params.id,
		},
	});
};

const deleteUser = async (id) => {
	const user = db.User.findOne({
		where: {
			id: id,
			status: true,
		},
	});
	if (!user) {
		throw new UserNotFound();
	}
	await db.User.update(
		{
			status: false,
		},
		{
			where: {
				id: id,
			},
		},
	);
};

export default {
	createUser,
	bulkCreateUsers,
	getUserById,
	getAllUsers,
	findUsers,
	updateUser,
	deleteUser,
};
