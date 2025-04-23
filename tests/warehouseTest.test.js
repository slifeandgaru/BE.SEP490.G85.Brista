const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const { expect } = chai;
const { Warehouse } = require("../models/warehouse");
const warehouseController = require("../controllers/warehouseController");

describe("Warehouse Controller", () => {
    let req, res, stubFind, stubFindById, stubCreate, stubUpdate, stubDelete;

    beforeEach(() => {
        req = { params: {}, query: {}, body: {} };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        sinon.restore();
    });

    /**
      getAllWarehouses
     */
    describe("getAllWarehouses", () => {
        it(" Should return paginated list of warehouses (200)", async () => {
            req.query = { page: 1, limit: 10 };
            stubFind = sinon.stub(Warehouse, "find").resolves([{ _id: "1", name: "Main Warehouse" }]);
            sinon.stub(Warehouse, "countDocuments").resolves(1);

            await warehouseController.getAllWarehouses(req, res);
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ totalPages: 1 })).to.be.true;
        });

        it("Should return 500 if an error occurs", async () => {
            stubFind = sinon.stub(Warehouse, "find").throws(new Error("DB Error"));
            await warehouseController.getAllWarehouses(req, res);
            expect(res.status.calledWith(500)).to.be.true;
        });
    });

    /**
     getWarehouseById
     */
    describe("getWarehouseById", () => {
        it(" Should return warehouse by ID (200)", async () => {
            req.params.id = "123";
            stubFindById = sinon.stub(Warehouse, "findById").resolves({ _id: "123", name: "Warehouse A" });

            await warehouseController.getWarehouseById(req, res);
            expect(res.status.calledWith(200)).to.be.true;
        });

        it("Should return 404 if warehouse not found", async () => {
            stubFindById = sinon.stub(Warehouse, "findById").resolves(null);
            await warehouseController.getWarehouseById(req, res);
            expect(res.status.calledWith(404)).to.be.true;
        });
    });

    /**
      createWarehouse
     */
    describe("createWarehouse", () => {
        it("Should create a new warehouse (201)", async () => {
            req.body = { warehouseName: "New Warehouse", warehouseType: "Warehouse", address: "123 Street" };
            stubCreate = sinon.stub(Warehouse.prototype, "save").resolves(req.body);

            await warehouseController.createWarehouse(req, res);
            expect(res.status.calledWith(201)).to.be.true;
        });

        it("Should return 400 if warehouseType is invalid", async () => {
            req.body = { warehouseType: "InvalidType" };
            await warehouseController.createWarehouse(req, res);
            expect(res.status.calledWith(400)).to.be.true;
        });
    });

    /**
     updateWarehouse
     */
    describe("updateWarehouse", () => {
        it("Should update warehouse successfully (200)", async () => {
            req.params.id = "123";
            req.body = { name: "Updated Warehouse" };
            stubUpdate = sinon.stub(Warehouse, "findByIdAndUpdate").resolves({ _id: "123", name: "Updated Warehouse" });

            await warehouseController.updateWarehouse(req, res);
            expect(res.status.calledWith(200)).to.be.true;
        });

        it("Should return 404 if warehouse not found", async () => {
            stubUpdate = sinon.stub(Warehouse, "findByIdAndUpdate").resolves(null);
            await warehouseController.updateWarehouse(req, res);
            expect(res.status.calledWith(404)).to.be.true;
        });
    });

    /**
    deleteWarehouse
     */
    describe("deleteWarehouse", () => {
        it("Should delete warehouse successfully (200)", async () => {
            req.params.id = "123";
            stubDelete = sinon.stub(Warehouse, "findByIdAndDelete").resolves({ _id: "123" });

            await warehouseController.deleteWarehouse(req, res);
            expect(res.status.calledWith(200)).to.be.true;
        });

        it("Should return 404 if warehouse not found", async () => {
            stubDelete = sinon.stub(Warehouse, "findByIdAndDelete").resolves(null);
            await warehouseController.deleteWarehouse(req, res);
            expect(res.status.calledWith(404)).to.be.true;
        });
    });

    /**
    addIngredientToWarehouse
     */
    describe("addIngredientToWarehouse", () => {
        it("Should add ingredient successfully (200)", async () => {
            req.params.warehouseId = "123";
            req.body = { ingredientId: "abc", quantity: 5 };
            const warehouse = { _id: "123", listIngredient: [], save: sinon.stub().resolves() };

            sinon.stub(Warehouse, "findById").resolves(warehouse);

            await warehouseController.addIngredientToWarehouse(req, res);
            expect(res.status.calledWith(200)).to.be.true;
        });

        it("Should return 404 if warehouse not found", async () => {
            sinon.stub(Warehouse, "findById").resolves(null);
            await warehouseController.addIngredientToWarehouse(req, res);
            expect(res.status.calledWith(404)).to.be.true;
        });
    });
});
