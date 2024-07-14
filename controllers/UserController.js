import UserExists from "../errors/userExists.js";
import PasswordNotMatch from "../errors/passwordNotMatch.js";
import UserNotFound from "../errors/userNotFound.js";
import { Router } from "express";
import UserService from "../services/UserService.js";
import NumberMiddleware from "../middlewares/number.middleware.js";
import UserMiddleware from "../middlewares/user.middleware.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const response = await UserService.createUser(req);
    return res.status(201).json({ message: `User created successfully with ID: ${response.id}` });
  } catch (error) {
    if (error instanceof UserExists) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof PasswordNotMatch) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error de servidor" });
  }
});

router.post("/bulkCreate", async (req, res) => {
  try {
    const response = await UserService.bulkCreateUsers(req);
    return res.status(201).json({ message: `${response.usersInsertedCount} users created successfully, ${response.usersNotInsertedCount} users not inserted` });
  } catch (error) {
    return res.status(500).json({ message: "Error de servidor" });
  }
});

router.get(
  "/getAllUsers",
  [AuthMiddleware.validateToken, UserMiddleware.hasPermissions],
  async (req, res) => {
    try {
      const response = await UserService.getAllUsers();
      return res.status(200).json({ message: response });
    } catch (error) {
      return res.status(500).json({ message: "Error de servidor" });
    }
  }
);

router.get(
    "/findUsers",
    [AuthMiddleware.validateToken, UserMiddleware.hasPermissions],
    async (req, res) => {
        try {
            const response = await UserService.findUsers(req);
            return res.status(200).json({ message: response });
        } catch (error) {
            return res.status(500).json({ message: "Error de servidor" });
        }
      }
)

router.get(
  "/:id",
  [
    NumberMiddleware.isNumber,
    UserMiddleware.isValidUserById,
    AuthMiddleware.validateToken,
    UserMiddleware.hasPermissions,
  ],
  async (req, res) => {
    try {
      const response = await UserService.getUserById(req.params.id);
      return res.status(200).json({ message: response });
    } catch (error) {
      if (error instanceof UserNotFound) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Error de servidor" });
    }
  }
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
    try {
      const response = await UserService.updateUser(req);
      return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      if (error instanceof UserNotFound) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Error de servidor" });
    }
  }
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
    try {
      const response = await UserService.deleteUser(req.params.id);
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      if (error instanceof UserNotFound) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Error de servidor" });
    }
  }
);

export default router;
