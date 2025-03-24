const { expect } = require("chai");
const sinon = require("sinon");
const { User } = require("../src/models/user");
const { createNewUser } = require("../src/controllers/userController");

describe("User Controller - createNewUser", () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = { body: { email: "test@example.com", password: "password123" } };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("Nên tạo user mới và trả về status 200", async () => {
        const mockUser = {  email: req.body.email };
        sandbox.stub(User, "create").resolves(mockUser);

        await createNewUser(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ message: "create success" })).to.be.true;
    });

    it("Nên trả về status 400 nếu email bị trùng lặp", async () => {
        const error = new Error("Duplicate key");
        error.code = 11000;
        error.keyValue = { email: req.body.email };
        sandbox.stub(User, "create").rejects(error);

        await createNewUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "email is used", error })).to.be.true;
    });

    it("Nên trả về status 500 nếu xảy ra lỗi server", async () => {
        const error = new Error("Server error");
        sandbox.stub(User, "create").rejects(error);

        await createNewUser(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ message: "server error", error })).to.be.true;
    });
});