import express, {Request, Response} from "express";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import morgan from "morgan";
import mongodb from "mongodb";
import dotenv from "dotenv";
import {User} from "./types/User";
import authRouter from "./routes/AuthRouter";
import resourceRouter from "./routes/resources/ResourceRouter";
import categoryRouter from "./routes/CategoryRouter";
import versionRouter from "./routes/VersionRouter";
import betterResponse from "./middleware/ResponseFunctions";
import directoryRouter from "./routes/directory/DirectoryRouter";
import ensureIndexes, {readTokens} from "./database";
import reviewRouter from "./routes/ReviewRouter";
import webhookRouter from "./routes/WebhookRouter";
import {BunnyCDNStorage} from "./bunnycdn";
import fileUpload from "express-fileupload";
import cors from "cors";
import userIconRouter from "./routes/UserRouter";
import checkoutRouter from "./routes/checkout/CheckoutRouter";
import stripeWebhookRouter from "./routes/checkout/StripeWebhookRouter";


dotenv.config();

const mongoClient = new mongodb.MongoClient(
    process.env.MONGODB_URL || "mongodb://localhost:27017",
    {useUnifiedTopology: true}
);
export const getDatabase = () => {
    return mongoClient.db(process.env.MONGODB_DB_NAME || "marketplace");
};

export const tokenMap = new Map<string, User["_id"]>([
    // temp perma token for dev
    ["hehexddd", "xKEGocEfbz"],
]);

// clear dev tokens if running in prod.
if (process.env.NODE_ENV === "production") {
    tokenMap.clear();
    console.log("RUNNING IN PRODUCTION MODE, CLEARED DEV TOKENS.");
} else {
    console.log("RUNNING IN DEVELOPEMNT MODE.");
}

export const bunny = new BunnyCDNStorage();

const app = express();

Sentry.init({
	dsn: "https://46a9ed183bc04d20acbe1ce42fad0cdf@sentry.savagelabs.net/2",
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Tracing.Integrations.Express({ app }),
	],

	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(fileUpload());
app.use(morgan("tiny"));
app.use(betterResponse);

// stripe webhook router needs to use body parser for signatures
// the rest of the stuff just uses express.json()
// I cannot have it do express.json() -> bodyparser.raw
// So we have to setup its own section then register our normal json parser.
app.use("/webhooks", stripeWebhookRouter)

app.use(express.json());

app.use("/auth", authRouter);
app.use("/users/icon", userIconRouter);
app.use("/resources", resourceRouter);
app.use("/category", categoryRouter);
app.use("/directory", directoryRouter);
app.use("/version", versionRouter);
app.use("/review", reviewRouter);
app.use("/checkout", checkoutRouter);
app.use("/userwebhooks", webhookRouter);


app.get("/", (_req: Request, res: Response) => {
    res.success({hello: "there!"});
});

app.use(Sentry.Handlers.errorHandler());

console.log("starting...");
console.log("attemping database connection...");
mongoClient.connect(async () => {
    console.log("connected to database.");
    await ensureIndexes();
    await readTokens();
    app.listen(5000, () => console.log("started marketplace backend."));
});

// generates payments
// const resources = ["CVE0kzSpW", "eUyVEKcjm", "CSMVL75iD"]
// const payments = []
//
// for (let i = 0; i < 10000; i++) {
//     const variance = Math.floor(Math.random() * 250);
//     const payment: Payment = {
//         _id: shortid.generate(),
//         user: "TQhd9S2Ax",
//         recipient: "xKEGocEfbz",
//         status: PaymentStatus.CONFIRMED,
//         payment_intent: "debug payment - doesnt apply here",
//         amount: Math.floor(Math.random() * 10000),
//         timestamp: new Date(new Date().getTime() - (variance * 60 * 60 * 1000 * 24)),
//         resource: resources[Math.floor(Math.random() * resources.length)]!!
//     }
//     payments.push(payment)
// }
//
// await getDatabase().collection<Payment>(PAYMENTS_COLLECTION).insertMany(payments)


// const generateAndPutResource = async (
//   file: any,
//   resourceType: ResourceType,
//   randomCategory: Category
// ) => {
//   // console.log("resource")
//   const resource = {
//     _id: shortid.generate(),
//     name: (rword.generate(1) + "-" + resourceType.substring(0, 1)) as string,
//     price: 0,
//     rating: 0,
//     category: randomCategory!!._id,
//     thread: "lol xd",
//     owner: "xKEGocEfbz",
//     updated: new Date(),
//     downloads: Math.floor(Math.random() * 100000),
//     type: resourceType,
//   };
//   const result = await getDatabase()
//     .collection(RESOURCES_COLLECTION)
//     .insertOne(resource);
//     // console.log("starting version")
//   const resourceResult = result.ops[0];
//   const versions = []
//   for (let i = 0; i <= 15; i++) {
//     const version = {
//       _id: shortid.generate(),
//       version: (Math.random() * 10).toString(),
//       title: rword.generate(1) as string,
//       description: (rword.generate(5) as string[]).join(" "),
//       timestamp: new Date(
//         new Date().getTime() - Math.floor(Math.random() * 1000)
//       ),
//       resource: resourceResult._id,
//       author: "xKEGocEfbz",
//     };
//     versions.push(version)
//   }
//   await getDatabase().collection(VERSIONS_COLLECTION).insertMany(versions);
// };

// const addDummyData = async () => {
//   for (const resourceType of [
//     ResourceType.PLUGIN,
//   ]) {
//     const categories: Category[] = await getDatabase()
//       .collection(CATEGORIES_COLLECTION)
//       .find({ type: resourceType })
//       .toArray();
//     for (let i = 0; i < 10000; i++) {
//       const randomCategory =
//         categories[Math.floor(Math.random() * categories.length)];
//       generateAndPutResource(undefined, resourceType, randomCategory!!);
//     }
//   }
// };
