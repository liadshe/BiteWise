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
            yield new Promise(resolve => setTimeout(() => resolve(), 5000));
            try {
                if (req.query) {
                    const filterData = yield this.model.find(req.query);
                    return res.json(filterData);
                }
                else {
                    const data = yield this.model.find();
                    res.json(data);
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving movies");
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
                    return res.status(404).send("Movie not found");
                }
                else {
                    res.json(data);
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving movie by ID");
            }
        });
    }
    ;
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const movieData = req.body;
            console.log(movieData);
            try {
                const data = yield this.model.create(movieData);
                res.status(201).json(data);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error creating movie");
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
                res.status(500).send("Error deleting movie");
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
                res.status(500).send("Error updating movie");
            }
        });
    }
    ;
}
;
exports.default = BaseController;
//# sourceMappingURL=baseController.js.map