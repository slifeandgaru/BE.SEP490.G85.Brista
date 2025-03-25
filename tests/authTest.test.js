const { expect } = require("chai");
const sinon = require("sinon");
const { User } = require("../models/user");
const { checkEmailAndPassword } = require("../services/authServices");
const { getMyInfo } = require("../controllers/userController");
const { createNewUser } = require("../controllers/userController");

// createNewUser
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
// Login
describe("User Controller - loginUser", () => {
    let req, res, stub;

    beforeEach(() => {
        req = { body: { email: "test@example.com", password: "123456" } };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        if (stub) stub.restore();
    });

    it(" Nên đăng nhập thành công và trả về token", async () => {
        const mockUser = { user: { createToken: () => "fake-jwt-token" } };
        stub = sinon.stub(require("../services/authServices"), "checkEmailAndPassword").resolves(mockUser);

        await loginUser(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ message: "login success", token: "fake-jwt-token" })).to.be.true;
    });

    it(" Nên trả về lỗi 400 nếu email hoặc mật khẩu sai", async () => {
        const mockError = { error: "Invalid credentials" };
        stub = sinon.stub(require("../services/authServices"), "checkEmailAndPassword").resolves(mockError);

        await loginUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "Invalid credentials" })).to.be.true;
    });

    it(" Nên trả về lỗi 400 nếu không có email", async () => {
        req.body.email = undefined;
        const mockError = { error: "Email is required" };
        stub = sinon.stub(require("../services/authServices"), "checkEmailAndPassword").resolves(mockError);

        await loginUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "Email is required" })).to.be.true;
    });

    it(" Nên trả về lỗi 400 nếu không có mật khẩu", async () => {
        req.body.password = undefined;
        const mockError = { error: "Password is required" };
        stub = sinon.stub(require("../services/authServices"), "checkEmailAndPassword").resolves(mockError);

        await loginUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "Password is required" })).to.be.true;
    });

    it(" Nên trả về lỗi 500 nếu có lỗi server", async () => {
        stub = sinon.stub(require("../services/authServices"), "checkEmailAndPassword").throws(new Error("Server error"));

        await loginUser(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "server error" })).to.be.true;
    });
});
// get info
describe("User Controller - getMyInfo", () => {
    let req, res, stub;

    beforeEach(() => {
        req = { user: { id: "123456789" } };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        if (stub) stub.restore();
    });

    it(" Nên trả về thông tin người dùng thành công (200)", async () => {
        const mockUser = { _id: "123456789", name: "John Doe", email: "john@example.com", shop: "Shop123" };
        stub = sinon.stub(User, "findOne").resolves(mockUser);

        await getMyInfo(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith(mockUser)).to.be.true;
    });

    it(" Nên trả về lỗi 404 nếu không tìm thấy user", async () => {
        stub = sinon.stub(User, "findOne").resolves(null);

        await getMyInfo(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: "User not found" })).to.be.true;
    });

    it(" Nên trả về lỗi 400 nếu thiếu user ID", async () => {
        req.user.id = null;
        await getMyInfo(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "User ID is required" })).to.be.true;
    });

    it(" Nên trả về lỗi 400 nếu user ID không hợp lệ", async () => {
        req.user.id = "invalid-id";
        stub = sinon.stub(User, "findOne").throws(new Error("Invalid user ID"));

        await getMyInfo(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Invalid user ID" })).to.be.true;
    });

    it(" Nên trả về lỗi 500 nếu có lỗi server", async () => {
        stub = sinon.stub(User, "findOne").throws(new Error("Server error"));

        await getMyInfo(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "server error" })).to.be.true;
    });
});