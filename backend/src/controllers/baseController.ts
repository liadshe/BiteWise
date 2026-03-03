import { Request, Response } from "express";

class BaseController {
    model: any;

    constructor(model: any) {
        this.model = model;
    }

    async getAll(req: Request, res: Response) {
        try {
            // duplicate the req.query object to avoid mutating it
            const queryObj = { ...req.query };

            // remove fields that are not meant for filtering (like page, limit, search)
            const excludedFields = ['page', 'limit', 'search'];
            excludedFields.forEach(el => delete queryObj[el]);

            // create a Mongoose query based on the remaining query parameters
            let query = this.model.find(queryObj);

            // if paging is needed, calculate skip and limit
            if (req.query.page) {
                const page = parseInt(req.query.page as string) || 1;
                const limit = parseInt(req.query.limit as string) || 10;
                const skip = (page - 1) * limit;
                query = query.skip(skip).limit(limit);
            }

            // run query and return results
            const data = await query;
            res.json(data);
            
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving data");
        }
    };

    async getById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const data = await this.model.findById(id);
            if (!data) {
                return res.status(404).send("Item not found");
            } else {
                res.json(data);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving item by ID");
        }
    };

    async create(req: Request, res: Response) {
        const itemData = req.body;
        console.log(itemData);
        try {
            const data = await this.model.create(itemData);
            res.status(201).json(data);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error creating item");
        }
    };

    async del(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const deletedData = await this.model.findByIdAndDelete(id);
            res.status(200).json(deletedData);
            console.log("delete data -----" + deletedData);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting item");
        }
    };

    async update(req: Request, res: Response) {
        const id = req.params.id;
        const updatedData = req.body;
        try {
            const data = await this.model.findByIdAndUpdate(id, updatedData, {
                new: true,
            });
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error updating item");
        }
    };
};

export default BaseController;