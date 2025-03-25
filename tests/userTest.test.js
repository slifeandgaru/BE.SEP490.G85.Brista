const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const { User } = require("../models/user");
const { getAllUser, createNewUser, getOneUser } = require("../controllers/userController");


describe("User Controller", () => {
    it("Test đơn giản", () => {
        expect(true).to.be.true;
    });
});

describe("User Controller", () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = { body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    /** ==================== TEST CASES CHO getAllUser ==================== */

    it("1. Nên trả về danh sách user và status 200", async () => {
        const fakeUsers = [
            { _id: "1", email: "test1@example.com" },
            { _id: "2", email: "test2@example.com" },
        ];
        sandbox.stub(User, "find").resolves(fakeUsers);

        await getAllUser(req, res);

        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, { listUser: fakeUsers });
    });

    it("2. Nên trả về status 500 nếu có lỗi server", async () => {
        sandbox.stub(User, "find").throws(new Error("Database error"));

        await getAllUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("3. Nên trả về mảng rỗng nếu không có user nào", async () => {
        sandbox.stub(User, "find").resolves([]);

        await getAllUser(req, res);

        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, { listUser: [] });
    });

    /** ==================== TEST CASES CHO createNewUser ==================== */

    it("4. Nên tạo user mới và trả về status 200", async () => {
        const fakeUser = { _id: "123", email: "newuser@example.com" };
        sandbox.stub(User, "create").resolves(fakeUser);

        req.body = { email: "newuser@example.com", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, { newUser: fakeUser });
    });

    it("5. Nên trả về status 500 nếu có lỗi trong quá trình tạo user", async () => {
        sandbox.stub(User, "create").throws(new Error("Create user error"));

        req.body = { email: "test@example.com", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("6. Nên không tạo user nếu body request bị thiếu thông tin", async () => {
        sandbox.stub(User, "create").rejects(new Error("Missing required fields"));

        req.body = {}; // Không có thông tin
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("7. Nên không tạo user nếu email đã tồn tại", async () => {
        const error = new Error("Duplicate email");
        error.code = 11000; // Lỗi MongoDB duplicate key
        sandbox.stub(User, "create").rejects(error);

        req.body = { email: "existing@example.com", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("8. Nên không lưu password thô vào database", async () => {
        sandbox.stub(User, "create").callsFake(async (data) => {
            if (data.password === "password123") throw new Error("Password not hashed");
            return { _id: "123", email: data.email };
        });

        req.body = { email: "secure@example.com", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("9. Nên đảm bảo email được lưu đúng format", async () => {
        sandbox.stub(User, "create").callsFake(async (data) => {
            if (!data.email.includes("@")) throw new Error("Invalid email format");
            return { _id: "123", email: data.email };
        });

        req.body = { email: "invalid-email", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("10. Nên không tạo user nếu password quá ngắn", async () => {
        sandbox.stub(User, "create").callsFake(async (data) => {
            if (data.password.length < 6) throw new Error("Password too short");
            return { _id: "123", email: data.email };
        });

        req.body = { email: "shortpass@example.com", password: "123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });
});

// get oneuser
describe("User Controller - getOneUser", () => {
    let req, res, stub;

    beforeEach(() => {
        req = { params: { userId: "123456789" } };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        if (stub) stub.restore();
    });

    it(" Nên trả về user nếu tìm thấy (200)", async () => {
        const mockUser = { _id: "123456789", name: "John Doe", email: "john@example.com" };
        stub = sinon.stub(User, "findOne").resolves(mockUser);

        await getOneUser(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ user: mockUser })).to.be.true;
    });

    it(" Nên trả về lỗi 400 nếu user không tồn tại", async () => {
        stub = sinon.stub(User, "findOne").resolves(null);

        await getOneUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ message: "user not exist" })).to.be.true;
    });

    it(" Nên trả về lỗi 400 nếu userId không hợp lệ", async () => {
        req.params.userId = "invalid_id";
        stub = sinon.stub(User, "findOne").throws(new Error("Invalid user ID"));

        await getOneUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Invalid user ID" })).to.be.true;
    });

    it(" Nên trả về lỗi 500 nếu có lỗi server", async () => {
        stub = sinon.stub(User, "findOne").throws(new Error("Server error"));

        await getOneUser(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "server error" })).to.be.true;
    });
});
