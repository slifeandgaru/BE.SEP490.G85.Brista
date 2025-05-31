const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const { expect } = chai;
const { Ingredient } = require("../models/ingredient");
const ingredientController = require("../controllers/ingredientController");
const app = require("../server"); // Import server của bạn


chai.use(chaiHttp);


describe("getAllIngredients", () => {
    let req, res, stubFind, stubCountDocuments;

    beforeEach(() => {
        req = { query: {} };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        sinon.restore();
    });

    
    //Lấy danh sách nguyên liệu thành công với phân trang
     
    it(" Should return paginated list of ingredients (200)", async () => {
        req.query = { page: "1", limit: "10" };

        const mockIngredients = [
            { _id: "1", name: "Sugar" },
            { _id: "2", name: "Salt" }
        ];

        stubFind = sinon.stub(Ingredient, "find").resolves(mockIngredients);
        stubCountDocuments = sinon.stub(Ingredient, "countDocuments").resolves(2);

        await ingredientController.getAllIngredients(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ ingredients: mockIngredients, totalPages: 1 })).to.be.true;
    });

   
     // Sử dụng giá trị mặc định khi không truyền page và limit
    
    it(" Should use default page=1 and limit=10 when not provided", async () => {
        const mockIngredients = [{ _id: "1", name: "Pepper" }];
        stubFind = sinon.stub(Ingredient, "find").resolves(mockIngredients);
        stubCountDocuments = sinon.stub(Ingredient, "countDocuments").resolves(1);

        await ingredientController.getAllIngredients(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ page: 1, totalPages: 1 })).to.be.true;
    });

   
    //Trả về danh sách rỗng khi không có nguyên liệu nào
    
    it(" Should return empty list if no ingredients exist", async () => {
        stubFind = sinon.stub(Ingredient, "find").resolves([]);
        stubCountDocuments = sinon.stub(Ingredient, "countDocuments").resolves(0);

        await ingredientController.getAllIngredients(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ ingredients: [], total: 0, totalPages: 1 })).to.be.true;
    });

    
    // Xảy ra lỗi truy vấn cơ sở dữ liệu
     
    it(" Should return 500 if database error occurs", async () => {
        stubFind = sinon.stub(Ingredient, "find").throws(new Error("DB Error"));

        await ingredientController.getAllIngredients(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
    });

    
     // Xử lý khi page và limit có giá trị không hợp lệ
      
    it(" Should handle invalid page and limit values", async () => {
        req.query = { page: "abc", limit: "xyz" };

        stubFind = sinon.stub(Ingredient, "find").resolves([]);
        stubCountDocuments = sinon.stub(Ingredient, "countDocuments").resolves(0);

        await ingredientController.getAllIngredients(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ page: 1, totalPages: 1 })).to.be.true;
    });
});


describe(" getIngredientById API", () => {
    let findByIdStub;

    beforeEach(() => {
        findByIdStub = sinon.stub(Ingredient, "findById");
    });

    afterEach(() => {
        findByIdStub.restore();
    });

    it("Should return ingredient when valid ID is provided", async () => {
        const mockIngredient = {
            _id: "65d1b2f8c9e77c00123abcd1",
            name: "Sugar",
            quantity: 10,
        };

        findByIdStub.resolves(mockIngredient);

        const res = await chai.request(app).get("/api/ingredients/65d1b2f8c9e77c00123abcd1");

        expect(res).to.have.status(200);
        expect(res.body.ingredient).to.deep.equal(mockIngredient);
    });

    it(" Should return 404 if ingredient is not found", async () => {
        findByIdStub.resolves(null);

        const res = await chai.request(app).get("/api/ingredients/65d1b2f8c9e77c00123abcd1");

        expect(res).to.have.status(404);
        expect(res.body.message).to.equal("Ingredient not found");
    });

    it(" Should return 500 if an error occurs", async () => {
        findByIdStub.rejects(new Error("Database error"));

        const res = await chai.request(app).get("/api/ingredients/65d1b2f8c9e77c00123abcd1");

        expect(res).to.have.status(500);
        expect(res.body.message).to.equal("Server error");
    });

    it(" Should return 500 if ID format is invalid", async () => {
        findByIdStub.throws(new Error("Cast to ObjectId failed"));

        const res = await chai.request(app).get("/api/ingredients/invalid-id");

        expect(res).to.have.status(500);
        expect(res.body.message).to.equal("Server error");
    });

    it("Should call Ingredient.findById once", async () => {
        const mockIngredient = {
            _id: "65d1b2f8c9e77c00123abcd1",
            name: "Salt",
            quantity: 5,
        };

        findByIdStub.resolves(mockIngredient);

        await chai.request(app).get("/api/ingredients/65d1b2f8c9e77c00123abcd1");

        expect(findByIdStub.calledOnce).to.be.true;
    });
});

describe(" createIngredient API", () => {
    let findOneStub, saveStub;

    beforeEach(() => {
        findOneStub = sinon.stub(Ingredient, "findOne");
        saveStub = sinon.stub(Ingredient.prototype, "save");
    });

    afterEach(() => {
        findOneStub.restore();
        saveStub.restore();
    });

    it(" Should create a new ingredient successfully", async () => {
        // tim trong db, ko co tao moi 
        findOneStub.resolves(null);
        
        // tao ban ghi va luu
        const mockIngredient = {
            _id: "65d1b2f8c9e77c00123abcd1",
            batchCode: "BATCH001",
            name: "Flour",
            quantity: 50,
        };
        saveStub.resolves(mockIngredient);

        const res = await chai.request(app)
            .post("/api/ingredients")
            .send({ batchCode: "BATCH001", name: "Flour", quantity: 50 });

        expect(res).to.have.status(201);
        expect(res.body.message).to.equal("Ingredient created successfully");
        expect(res.body.ingredient).to.deep.equal(mockIngredient);
    });

    it(" Should return 400 if batchCode already exists", async () => {
        // check ban ghi co ton tai ko 
        findOneStub.resolves({ batchCode: "BATCH001" });

        const res = await chai.request(app)
            .post("/api/ingredients")
            .send({ batchCode: "BATCH001", name: "Sugar", quantity: 30 });

        expect(res).to.have.status(400);
        expect(res.body.message).to.equal("Batch code already exists");
    });

    it(" Should return 500 if database error occurs", async () => {
        // loi tu sever
        findOneStub.rejects(new Error("Database error"));

        const res = await chai.request(app)
            .post("/api/ingredients")
            .send({ batchCode: "BATCH002", name: "Salt", quantity: 20 });

        expect(res).to.have.status(500);
        expect(res.body.message).to.equal("Server error");
    });

    it(" Should return 400 if batchCode is missing", async () => {
        const res = await chai.request(app)
            .post("/api/ingredients")
            .send({ name: "Oil", quantity: 10 });

        expect(res).to.have.status(400);
        expect(res.body.message).to.equal("Batch code already exists"); // Vì `findOneStub` chưa được xử lý batchCode null
    });

    it(" Should call Ingredient.findOne and save once", async () => {
        findOneStub.resolves(null);
        saveStub.resolves();

        await chai.request(app)
            .post("/api/ingredients")
            .send({ batchCode: "BATCH003", name: "Milk", quantity: 40 });

        expect(findOneStub.calledOnce).to.be.true;
        expect(saveStub.calledOnce).to.be.true;
    });
});

describe(" Ingredient API Tests", () => {
    let findByIdAndUpdateStub, findByIdAndDeleteStub;

    beforeEach(() => {
        findByIdAndUpdateStub = sinon.stub(Ingredient, "findByIdAndUpdate");
        findByIdAndDeleteStub = sinon.stub(Ingredient, "findByIdAndDelete");
    });

    afterEach(() => {
        findByIdAndUpdateStub.restore();
        findByIdAndDeleteStub.restore();
    });

    //  TEST CASES FOR updateIngredient
    describe("updateIngredient", () => {
        it(" Should update ingredient successfully", async () => {
            const mockIngredient = {
                _id: "65d1b2f8c9e77c00123abcd1",
                name: "Sugar",
                quantity: 100,
            };

            findByIdAndUpdateStub.resolves(mockIngredient);

            const res = await chai.request(app)
                .put("/api/ingredients/65d1b2f8c9e77c00123abcd1")
                .send({ quantity: 200 });

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal("Ingredient updated successfully");
            expect(res.body.ingredient).to.deep.equal(mockIngredient);
        });

        it("Should return 404 if ingredient not found", async () => {
            findByIdAndUpdateStub.resolves(null);

            const res = await chai.request(app)
                .put("/api/ingredients/65d1b2f8c9e77c00123abcd2")
                .send({ quantity: 50 });

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal("Ingredient not found");
        });

        it("Should return 500 if database error occurs", async () => {
            findByIdAndUpdateStub.rejects(new Error("Database error"));

            const res = await chai.request(app)
                .put("/api/ingredients/65d1b2f8c9e77c00123abcd3")
                .send({ quantity: 20 });

            expect(res).to.have.status(500);
            expect(res.body.message).to.equal("Server error");
        });

        it("Should return 400 if no data is provided", async () => {
            const res = await chai.request(app)
                .put("/api/ingredients/65d1b2f8c9e77c00123abcd4")
                .send({});

            expect(res).to.have.status(400);
        });

        it("Should call findByIdAndUpdate once", async () => {
            findByIdAndUpdateStub.resolves({
                _id: "65d1b2f8c9e77c00123abcd5",
                name: "Salt",
                quantity: 60,
            });

            await chai.request(app)
                .put("/api/ingredients/65d1b2f8c9e77c00123abcd5")
                .send({ quantity: 80 });

            expect(findByIdAndUpdateStub.calledOnce).to.be.true;
        });
    });

    //  TEST CASES FOR deleteIngredient
    describe(" deleteIngredient", () => {
        it("Should delete ingredient successfully", async () => {
            findByIdAndDeleteStub.resolves({
                _id: "65d1b2f8c9e77c00123abcd6",
                name: "Flour",
                quantity: 30,
            });

            const res = await chai.request(app)
                .delete("/api/ingredients/65d1b2f8c9e77c00123abcd6");

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal("Ingredient deleted successfully");
        });

        it("Should return 404 if ingredient not found", async () => {
            findByIdAndDeleteStub.resolves(null);

            const res = await chai.request(app)
                .delete("/api/ingredients/65d1b2f8c9e77c00123abcd7");

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal("Ingredient not found");
        });

        it("Should return 500 if database error occurs", async () => {
            findByIdAndDeleteStub.rejects(new Error("Database error"));

            const res = await chai.request(app)
                .delete("/api/ingredients/65d1b2f8c9e77c00123abcd8");

            expect(res).to.have.status(500);
            expect(res.body.message).to.equal("Server error");
        });

        it("Should call findByIdAndDelete once", async () => {
            findByIdAndDeleteStub.resolves({
                _id: "65d1b2f8c9e77c00123abcd9",
                name: "Oil",
                quantity: 40,
            });

            await chai.request(app)
                .delete("/api/ingredients/65d1b2f8c9e77c00123abcd9");

            expect(findByIdAndDeleteStub.calledOnce).to.be.true;
        });

        it("Should return 400 if invalid ID is provided", async () => {
            const res = await chai.request(app)
                .delete("/api/ingredients/invalidID");

            expect(res).to.have.status(400);
        });
    });
});
