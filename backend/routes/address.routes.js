const express = require("express")
const router = express.Router()
const addressController = require("../controllers/address.controller")
const { authenticate } = require("../middleware/auth.middleware")

// Tất cả routes đều yêu cầu đăng nhập
router.use(authenticate)

router.get("/", addressController.getUserAddresses)
router.get("/default", addressController.getDefaultAddress)
router.post("/", addressController.createAddress)
router.put("/:id", addressController.updateAddress)
router.delete("/:id", addressController.deleteAddress)
router.patch("/:id/default", addressController.setDefaultAddress)

module.exports = router
