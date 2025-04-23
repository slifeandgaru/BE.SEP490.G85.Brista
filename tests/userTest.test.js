const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const { User } = require("../models/user");
const { getAllUser, createNewUser, getOneUser, updateUserInfo, changePassword   } = require("../controllers/userController");



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

    // getAllUser

    it("Nên trả về danh sách user và status 200", async () => {
        const fakeUsers = [
            { _id: "1", email: "test1@example.com" },
            { _id: "2", email: "test2@example.com" },
        ];
        sandbox.stub(User, "find").resolves(fakeUsers);

        await getAllUser(req, res);

        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, { listUser: fakeUsers });
    });

    it("Nên trả về status 500 nếu có lỗi server", async () => {
        sandbox.stub(User, "find").throws(new Error("Database error"));

        await getAllUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("Nên trả về mảng rỗng nếu không có user nào", async () => {
        sandbox.stub(User, "find").resolves([]);

        await getAllUser(req, res);

        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, { listUser: [] });
    });

    //createNewUser

    it("Nên tạo user mới và trả về status 200", async () => {
        const fakeUser = { _id: "123", email: "newuser@example.com" };
        sandbox.stub(User, "create").resolves(fakeUser);

        req.body = { email: "newuser@example.com", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, { newUser: fakeUser });
    });

    it("Nên trả về status 500 nếu có lỗi trong quá trình tạo user", async () => {
        sandbox.stub(User, "create").throws(new Error("Create user error"));

        req.body = { email: "test@example.com", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("Nên không tạo user nếu body request bị thiếu thông tin", async () => {
        sandbox.stub(User, "create").rejects(new Error("Missing required fields"));

        req.body = {}; // Không có thông tin
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("Nên không tạo user nếu email đã tồn tại", async () => {
        const error = new Error("Duplicate email");
        error.code = 11000; // Lỗi MongoDB duplicate key
        sandbox.stub(User, "create").rejects(error);

        req.body = { email: "existing@example.com", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("Nên không lưu password thô vào database", async () => {
        sandbox.stub(User, "create").callsFake(async (data) => {
            if (data.password === "password123") throw new Error("Password not hashed");
            return { _id: "123", email: data.email };
        });

        req.body = { email: "secure@example.com", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("Nên đảm bảo email được lưu đúng format", async () => {
        sandbox.stub(User, "create").callsFake(async (data) => {
            if (!data.email.includes("@")) throw new Error("Invalid email format");
            return { _id: "123", email: data.email };
        });

        req.body = { email: "invalid-email", password: "password123" };
        await createNewUser(req, res);

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWithMatch(res.json, { message: "server error" });
    });

    it("Nên không tạo user nếu password quá ngắn", async () => {
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
        req = { params: { userId: "2" } };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        if (stub) stub.restore();
    });

    it(" Nên trả về user nếu tìm thấy (200)", async () => {
        const mockUser = { _id: "12345", name: "chung", email: "chung@gmail.com" };
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
// update
describe("User Controller - updateUserInfo", () => {
    let req, res, stubFindById, stubUpdate, stubUnlink;

    beforeEach(() => {
        req = { 
            params: { userId: "123456789" }, 
            body: { name: "Updated Name" },
            file: null
        };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        sinon.restore();
    });

    it(" Nên cập nhật thông tin user thành công (200)", async () => {
        const mockUser = { _id: "123456789", name: "Old Name", avatar: "public/avatar.jpg" };
        const updatedUser = { _id: "123456789", name: "Updated Name" };

        stubFindById = sinon.stub(User, "findById").resolves(mockUser);
        stubUpdate = sinon.stub(User, "findOneAndUpdate").resolves(updatedUser);

        await updateUserInfo(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ user: updatedUser })).to.be.true;
    });

    it(" Nên cập nhật avatar nếu có file tải lên", async () => {
        req.file = { path: "uploads/new-avatar.jpg" };
        const mockUser = { _id: "123456789", name: "Old Name", avatar: "public/avatar.jpg" };
        const updatedUser = { _id: "123456789", name: "Updated Name", avatar: "uploads/new-avatar.jpg" };

        stubFindById = sinon.stub(User, "findById").resolves(mockUser);
        stubUpdate = sinon.stub(User, "findOneAndUpdate").resolves(updatedUser);
        stubUnlink = sinon.stub(fs, "unlink").callsFake((path, cb) => cb(null));

        await updateUserInfo(req, res);

        expect(stubUnlink.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ user: updatedUser })).to.be.true;
    });

    it(" Nên cập nhật địa chỉ nếu có", async () => {
        req.body.address = "123 New Street";
        const mockUser = { _id: "123456789", name: "Old Name", avatar: "avatar.jpg" };
        const updatedUser = { _id: "123456789", name: "Updated Name", address: ["123 New Street"] };

        stubFindById = sinon.stub(User, "findById").resolves(mockUser);
        stubUpdate = sinon.stub(User, "findOneAndUpdate").resolves(updatedUser);

        await updateUserInfo(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ user: updatedUser })).to.be.true;
    });

    it(" Nên trả về lỗi 400 nếu email đã tồn tại", async () => {
        stubFindById = sinon.stub(User, "findById").resolves({});
        stubUpdate = sinon.stub(User, "findOneAndUpdate").throws({ code: 11000, keyValue: { email: "used@example.com" } });

        await updateUserInfo(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ message: "email is used" })).to.be.true;
    });

    it(" Nên trả về lỗi 500 nếu có lỗi server", async () => {
        stubFindById = sinon.stub(User, "findById").throws(new Error("Server error"));

        await updateUserInfo(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "server error" })).to.be.true;
    });
});

describe("User Controller - changePassword", () => {
    let req, res, stubFindById, stubUpdateOne, stubBcryptCompare;

    beforeEach(() => {
        req = {
            params: { userId: "123456789" },
            body: { oldPass: "oldpassword", newPass: "newpassword" }
        };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("Nên đổi mật khẩu thành công (200)", async () => {
        const mockUser = { _id: "123456789", password: "$2b$10$hashedpassword" };

        stubFindById = sinon.stub(User, "findById").resolves(mockUser);
        stubBcryptCompare = sinon.stub(bcrypt, "compare").resolves(true);
        stubUpdateOne = sinon.stub(User, "updateOne").resolves({});

        await changePassword(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ message: "update success" })).to.be.true;
    });

    it("Nên trả về lỗi 400 nếu mật khẩu cũ không đúng", async () => {
        const mockUser = { _id: "123456789", password: "$2b$10$hashedpassword" };

        stubFindById = sinon.stub(User, "findById").resolves(mockUser);
        stubBcryptCompare = sinon.stub(bcrypt, "compare").resolves(false);

        await changePassword(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "wrong password" })).to.be.true;
    });

    it("Nên trả về lỗi 404 nếu không tìm thấy user", async () => {
        stubFindById = sinon.stub(User, "findById").resolves(null);

        await changePassword(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "server error" })).to.be.true;
    });

    it("Nên trả về lỗi 400 nếu mật khẩu mới không hợp lệ", async () => {
        req.body.newPass = "";
        const mockUser = { _id: "123456789", password: "$2b$10$hashedpassword" };

        stubFindById = sinon.stub(User, "findById").resolves(mockUser);
        stubBcryptCompare = sinon.stub(bcrypt, "compare").resolves(true);
        stubUpdateOne = sinon.stub(User, "updateOne").throws(new Error("Validation error"));

        await changePassword(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "server error" })).to.be.true;
    });

    it(" Nên trả về lỗi 500 nếu có lỗi server", async () => {
        stubFindById = sinon.stub(User, "findById").throws(new Error("Server error"));

        await changePassword(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "server error" })).to.be.true;
    });
});
