const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const { authenticate, isAdmin } = require("../middleware/auth.middleware")

// All routes are protected and admin-only
router.use(authenticate, isAdmin)

router.get("/", userController.getAllUsers)
router.get("/:id", userController.getUserById)
router.post("/", userController.createUser)
router.put("/:id", userController.updateRoleUser)
router.delete("/:id", userController.deleteUser)

module.exports = router

