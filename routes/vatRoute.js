const express = require("express");
const router = express.Router();
const vatController = require("../controllers/vatController");

router.get("/get-all-vat", vatController.getAllVAT);
router.get("/get-vat-by-id/:id", vatController.getVATById);
router.post("/create-new-vat", vatController.createVAT);
router.put("/update-vat/:id", vatController.updateVAT);
router.delete("delete-vat/:id", vatController.deleteVAT);

module.exports = router;
