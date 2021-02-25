import {Authorize} from "../../middleware/Authenticate";
import {isValidBody} from "../../middleware/BodyValidate";
import express, {Request, Response} from "express";
import {getDatabase} from "../../server";
import {Seller} from "../../types/User";
import {PAYMENTS_COLLECTION, RESOURCES_COLLECTION, SELLER_COLLECTION, USERS_COLLECTION} from "../../constants";
import getStripeAPI from "./stripe/StripeAPI";
import Axios from "axios";
import {body, param} from "express-validator";
import Payment, {PaymentStatus} from "../../types/Payment";
import shortid from "shortid";


const checkoutInfoRouter = express.Router();

checkoutInfoRouter.get(
    "/link",
    [Authorize, isValidBody],
    async (req: Request, res: Response) => {
        const seller = await getDatabase()
            .collection<Seller>(SELLER_COLLECTION)
            .findOne({user: req.user!!._id});

        if (seller === null) {
            res.failure("seller not found.");
            return;
        }
        const stripeAPI = getStripeAPI();

        const link = await stripeAPI.accounts.createLoginLink(
            seller.stripe_account,
            {apiKey: process.env.STRIPE_SECRET_KEY}
        );

        res.success({link: link});
    }
);

checkoutInfoRouter.get(
    "/balance",
    [Authorize, isValidBody],
    async (req: Request, res: Response) => {
        const seller = await getDatabase()
            .collection<Seller>(SELLER_COLLECTION)
            .findOne({user: req.user!!._id})

        if (seller === null) {
            res.failure("seller not found.")
            return
        }

        const balance = await Axios.get("https://api.stripe.com/v1/balance", {
            headers: {
                Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                "Stripe-Account": seller.stripe_account
            }
        })

        res.success({balance: balance.data})
    }
)


checkoutInfoRouter.get("/purchases/:page",
    [param("page").isNumeric(), Authorize, isValidBody],
    async (req: Request, res: Response) => {
        const page = req.params.page as unknown as number;

        const pageAmount = 5

        const payments = await getDatabase().collection<Payment>(PAYMENTS_COLLECTION).aggregate([
            {$match: {recipient: req.user!!._id, status: PaymentStatus.CONFIRMED}},
            {$sort: {timestamp: -1}},
            {$skip: (page - 1) * pageAmount},
            {$limit: pageAmount},
            {
                $lookup: {
                    from: RESOURCES_COLLECTION,
                    localField: "resource",
                    foreignField: "_id",
                    as: "resource",
                },
            },
            {
                $lookup: {
                    from: USERS_COLLECTION,
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {$unwind: "$user"},
            {$unwind: "$resource"},
            {$unset: ["user.email", "user.role", "user.password", "user.purchases"]}
        ]).toArray()

        res.success({payments})
    })


checkoutInfoRouter.post("/purchase-chart", [
    body("resource").optional(),
    body("start", "end").isNumeric().bail().customSanitizer(v => new Date(v)),
    Authorize, isValidBody
], async (req: Request, res: Response) => {

    let resource = req.body.resource;

    console.log(req.body.start, new Date(req.body.end))

    const filter: any = {
        recipient: req.user!!._id,
        timestamp: {
            $lte: new Date(req.body.end),
            $gte: new Date(req.body.start)
        }
    }
    if (resource) {
        const result = shortid.isValid(resource)
        if (!result) {
            res.failure("invalid resource id.")
            return
        }
        filter.resource = resource
        console.log("resource was valid.")
    }

    

    const payments =
        await getDatabase().collection<Payment>(PAYMENTS_COLLECTION)
            .find(filter)
            .sort({timestamp: -1}).toArray()


    res.success({payments})
})

checkoutInfoRouter.get(
    "/seller",
    [Authorize, isValidBody],
    async (req: Request, res: Response) => {
        const seller = await getDatabase()
            .collection<Seller>(SELLER_COLLECTION)
            .findOne({user: req.user!!._id});
        res.success({isSeller: seller !== null});
    }
);


export default checkoutInfoRouter