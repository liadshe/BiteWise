"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    constructor(model) {
        this.model = model;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // duplicate the req.query object to avoid mutating it
                const queryObj = Object.assign({}, req.query);
                // remove fields that are not meant for filtering (like page, limit, search)
                const excludedFields = ['page', 'limit', 'search'];
                excludedFields.forEach(el => delete queryObj[el]);
                // create a Mongoose query based on the remaining query parameters
                let query = this.model.find(queryObj);
                // if paging is needed, calculate skip and limit
                if (req.query.page) {
                    const page = parseInt(req.query.page) || 1;
                    const limit = parseInt(req.query.limit) || 10;
                    const skip = (page - 1) * limit;
                    query = query.skip(skip).limit(limit);
                }
                // run query and return results
                const data = yield query;
                res.json(data);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving data");
            }
        });
    }
    ;
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const data = yield this.model.findById(id);
                if (!data) {
                    return res.status(404).send("Item not found");
                }
                else {
                    res.json(data);
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving item by ID");
            }
        });
    }
    ;
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemData = req.body;
            console.log(itemData);
            try {
                const data = yield this.model.create(itemData);
                res.status(201).json(data);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error creating item");
            }
        });
    }
    ;
    del(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const deletedData = yield this.model.findByIdAndDelete(id);
                res.status(200).json(deletedData);
                console.log("delete data -----" + deletedData);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error deleting item");
            }
        });
    }
    ;
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const updatedData = req.body;
            try {
                const data = yield this.model.findByIdAndUpdate(id, updatedData, {
                    new: true,
                });
                res.json(data);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error updating item");
            }
        });
    }
    ;
}
;
exports.default = BaseController;
//# sourceMappingURL=baseController.js.map