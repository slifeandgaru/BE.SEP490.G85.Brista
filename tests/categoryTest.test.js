const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const { Category } = require('../models/category');
const categoryController = require('../controllers/categoryController');

describe('Category Controller', () => {
    let req, res, statusStub, jsonStub;

    beforeEach(() => {
        req = { body: {}, query: {}, file: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    // 1. Test đúng khi file là image
    it('should accept file if mimetype includes image', () => {
        file.mimetype = 'image/jpeg';
        const fileFilter = upload.fileFilter;
        
        fileFilter(req, file, cb);

        expect(cb.calledWith(null, true)).to.be.true;
    });

    // 2. Test lỗi khi file không phải image
    it('should reject file if mimetype is not image', () => {
        file.mimetype = 'application/pdf';
        const fileFilter = upload.fileFilter;

        fileFilter(req, file, cb);

        expect(cb.calledOnce).to.be.true;
        expect(cb.firstCall.args[0]).to.be.an('error');
        expect(cb.firstCall.args[0].message).to.equal('Only accept image files');
    });

    // 3. Test destination function có path đúng
    it('should set correct destination folder', (done) => {
        const storage = upload.storage;
        
        storage.getDestination(req, file, (err, destination) => {
            expect(destination).to.equal('./public/uploads/category');
            done();
        });
    });

    // 4. Test filename function tạo tên file đúng format
    it('should generate filename with correct format', (done) => {
        const storage = upload.storage;
        file.originalname = 'test.png';
        file.fieldname = 'file';

        storage.getFilename(req, file, (err, filename) => {
            expect(filename).to.match(/^file-\d+-\d+\.png$/); // Kiểu file-<timestamp>-<random>.png
            done();
        });
    });

    // 5. Test storage config tồn tại cả destination và filename function
    it('should have destination and filename functions in storage', () => {
        const storage = upload.storage;
        
        expect(storage.getDestination).to.be.a('function');
        expect(storage.getFilename).to.be.a('function');
    });
});
describe('adminCreateCategory', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, file: null };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test case 1: Thành công khi có file
    it('should create a new category successfully with file', async () => {
        req.file = { path: 'uploads/test.jpg' };
        req.body = { categoryName: 'Test Category' };

        const createStub = sinon.stub(Category, 'create').resolves(req.body);

        await categoryController.adminCreateCategory(req, res);

        expect(createStub.calledOnce).to.be.true;
        expect(req.body.thump).to.equal('uploads/test.jpg'); // Thêm thump
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ newCategory: req.body })).to.be.true;
    });

    // Test case 2: Thành công khi không có file
    it('should create a new category successfully without file', async () => {
        req.body = { categoryName: 'Test No File' };

        const createStub = sinon.stub(Category, 'create').resolves(req.body);

        await categoryController.adminCreateCategory(req, res);

        expect(createStub.calledOnce).to.be.true;
        expect(req.body.thump).to.be.undefined; // Không có thump
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ newCategory: req.body })).to.be.true;
    });

    // Test case 3: Bị lỗi Duplicate (code 11000)
    it('should return 400 if category already exists', async () => {
        const error = { code: 11000 };
        sinon.stub(Category, 'create').rejects(error);

        await categoryController.adminCreateCategory(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Category already in use' })).to.be.true;
    });

    // Test case 4: Server Error không xác định
    it('should return 500 on server error', async () => {
        sinon.stub(Category, 'create').rejects(new Error('Database down'));

        await categoryController.adminCreateCategory(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Server error' })).to.be.true;
    });

    // Test case 5: Kiểm tra console.log có in file không
    it('should log file received if file exists', async () => {
        req.file = { path: 'uploads/test.jpg' };
        req.body = { categoryName: 'Test Category' };

        const createStub = sinon.stub(Category, 'create').resolves(req.body);
        const consoleSpy = sinon.spy(console, 'log');

        await categoryController.adminCreateCategory(req, res);

        expect(consoleSpy.calledWithMatch('file recive:')).to.be.true;

        consoleSpy.restore();
    });
});
describe('getAllCategories', () => {
    let req, res;

    beforeEach(() => {
        req = {}; // Không cần gì đặc biệt
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test case 1: Lấy danh sách categories thành công
    it('should return 200 and list of categories', async () => {
        const fakeCategories = [{ _id: '1', categoryName: 'Food' }, { _id: '2', categoryName: 'Drink' }];
        sinon.stub(Category, 'find').resolves(fakeCategories);

        await categoryController.getAllCategories(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ listCategories: fakeCategories })).to.be.true;
    });

    // Test case 2: Trả về mảng rỗng khi không có category
    it('should return 200 and empty array if no categories', async () => {
        sinon.stub(Category, 'find').resolves([]);

        await categoryController.getAllCategories(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ listCategories: [] })).to.be.true;
    });

    // Test case 3: Xử lý lỗi server
    it('should return 500 if server error occurs', async () => {
        sinon.stub(Category, 'find').rejects(new Error('Database error'));

        await categoryController.getAllCategories(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'server error' })).to.be.true;
    });
});
describe('getCategoryById', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test case 1: Truyền thiếu categoryId
    it('should return 400 if categoryId is missing', async () => {
        req.body = {}; // Không có categoryId

        await categoryController.getCategoryById(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Category ID is required" })).to.be.true;
    });

    // Test case 2: Không tìm thấy category theo ID
    it('should return 404 if category not found', async () => {
        req.body = { categoryId: '123' };
        sinon.stub(Category, 'findById').resolves(null);

        await categoryController.getCategoryById(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Category not found" })).to.be.true;
    });

    // Test case 3: Tìm thấy category thành công
    it('should return 200 and category if found', async () => {
        const fakeCategory = { _id: '123', categoryName: 'Food' };
        req.body = { categoryId: '123' };
        sinon.stub(Category, 'findById').resolves(fakeCategory);

        await categoryController.getCategoryById(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ category: fakeCategory })).to.be.true;
    });

    // Test case 4: Lỗi server trong quá trình tìm kiếm
    it('should return 500 if server error occurs', async () => {
        req.body = { categoryId: '123' };
        sinon.stub(Category, 'findById').rejects(new Error('Database error'));

        await categoryController.getCategoryById(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
    });

    // Test case 5: Đảm bảo gọi đúng `Category.findById`
    it('should call Category.findById with correct ID', async () => {
        const findByIdStub = sinon.stub(Category, 'findById').resolves({});
        req.body = { categoryId: 'test-id-123' };

        await categoryController.getCategoryById(req, res);

        expect(findByIdStub.calledOnceWith('test-id-123')).to.be.true;
    });
});
describe('findCategoryRegex', () => {
    let req, res;

    beforeEach(() => {
        req = { query: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test case 1: Tìm kiếm thành công
    it('should return 200 and matched categories', async () => {
        req.query.categoryName = 'food';
        const fakeCategories = [{ _id: '1', categoryName: 'Fast Food' }];
        sinon.stub(Category, 'find').resolves(fakeCategories);

        await categoryController.findCategoryRegex(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ category: fakeCategories })).to.be.true;
    });

    // Test case 2: Gặp lỗi server
    it('should return 500 if server error occurs', async () => {
        req.query.categoryName = 'drink';
        sinon.stub(Category, 'find').rejects(new Error('Database error'));

        await categoryController.findCategoryRegex(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'server error' })).to.be.true;
    });
    it('should return 500 if an error occurs during find', async () => {
        req.query.categoryName = 'invalid-input';
        
        // Gây lỗi giả lập cho Category.find
        sinon.stub(Category, 'find').rejects(new Error('Invalid regex pattern'));

        await categoryController.findCategoryRegex(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({
            message: 'server error'
        })).to.be.true;
    });
});
describe('changeCategoryName', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                categoryId: '123abc',
                categoryName: 'New Category Name'
            }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    //  Test case 1: Đổi tên thành công
    it('should update category name successfully', async () => {
        const updatedCategory = { _id: '123abc', categoryName: 'New Category Name' };
        
        sinon.stub(Category, 'findByIdAndUpdate').resolves(updatedCategory);

        await categoryController.changeCategoryName(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ category: updatedCategory })).to.be.true;
    });

    //  Test case 2: Trường hợp lỗi trùng tên category (error code 11000)
    it('should return 400 if categoryName already exists', async () => {
        const duplicateKeyError = new Error('Duplicate key error');
        duplicateKeyError.code = 11000;

        sinon.stub(Category, 'findByIdAndUpdate').rejects(duplicateKeyError);

        await categoryController.changeCategoryName(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'this categoryName already in use' })).to.be.true;
    });
});
