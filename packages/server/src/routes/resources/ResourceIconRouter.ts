import { Resource, Role } from "@savagelabs/types";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import shortid from "shortid";
import { RESOURCES_COLLECTION } from "../../constants";
import {
  Authorize,
  FetchTeam,
  hasPermissionForResource,
} from "../../middleware/Authenticate";
import { isValidBody } from "../../middleware/BodyValidate";
import { bunny, getDatabase } from "../../server";

const resourceIconRouter = express.Router();

// UploadedFile from express-fileupload types seem to be broken
// the data prop does not exist on the type, but does on the actual file.
interface ImgFile {
  name: string;
  data: any;
  size: number;
  encoding: string;
  tempFilePath: string;
  truncated: boolean;
  mimetype: string;
  md5: string;
}

resourceIconRouter.put(
  "/:id",
  [
    param("id").custom((id) => shortid.isValid(id)),
    Authorize,
    FetchTeam,
    hasPermissionForResource("id", Role.ADMIN),
    isValidBody,
  ],
  async (req: Request, res: Response) => {
    const files = req.files;
    // express-fileupload's type is broken. Using custom one to check buffer.
    const icon: ImgFile = files?.icon as ImgFile;
    if (!files || !icon) {
      res.failure("Invalid file body.");
      return;
    }

    // basic quick check to see if its not just renamed, not foolproof, but all it breaks is a profile image soo.
    // valid pngs must start with below hex
    const MAGIC_PNG_BUFFER_START = "89504e47";
    const iconHexIdentifier = icon.data.toString("hex", 0, 4);
    if (iconHexIdentifier !== MAGIC_PNG_BUFFER_START) {
      res.failure("Failed PNG verification");
      return;
    }

    const FIVE_HUNDRED_KB = 500000

    if (icon.size >= FIVE_HUNDRED_KB) {
      res.failure("Profile picture is too large, max limit is 500kb.")
      return;
    }

    const dbId = req.params.id as string;

    let getRes;
    try {
      getRes = await bunny.getResourceIconById(req.params.id as string);
    } catch (err) {
      getRes = { data: err };
    }
    let replaced = false;
    if (!getRes.data.message) {
      // if message then 404 or error, try and delete
      await bunny.deleteResourceIconById(dbId);
      replaced = true;
    }
    try {
       const result = await bunny.putResourceIconById(dbId, icon.data);
       await getDatabase()
      .collection<Resource>(RESOURCES_COLLECTION)
      .updateOne({ _id: req.params.id }, { $set: { hasIcon: true } });
    res.success({ result: result.data, replaced });
    } catch(err: any) {
      console.log(err)
      res.failure("something went wrong..." + err.message)
    }
    
  }
);

resourceIconRouter.get(
  "/:id",
  [
    param("id").custom((id) => shortid.isValid(id)),
    Authorize,
    hasPermissionForResource("id", Role.ADMIN),
    isValidBody,
  ],
  async (req: Request, res: Response) => {
    let result;
    try {
      result = (await bunny.getResourceIconById(req.params.id as string)).data;
    } catch (err: any) {
      result = err.message;
    }
    await getDatabase()
      .collection<Resource>(RESOURCES_COLLECTION)
      .updateOne({ _id: req.params.id }, { $set: { hasIcon: false } });
    res.send(result);
  }
);

resourceIconRouter.delete(
  "/:id",
  [
    param("id").custom((id) => shortid.isValid(id)),
    Authorize,
    hasPermissionForResource("id", Role.ADMIN),
    isValidBody,
  ],
  async (req: Request, res: Response) => {
    const resource = await getDatabase()
      .collection<Resource>(RESOURCES_COLLECTION)
      .findOne({ _id: req.params.id as string });

    if (!resource?.hasIcon) {
      res.failure("resource has no icon.");
      return;
    }

    try {
      const result = await bunny.deleteResourceIconById(
        req.params.id as string
      );

      await getDatabase()
        .collection<Resource>(RESOURCES_COLLECTION)
        .updateOne(
          { _id: req.params.id as string },
          { $set: { hasIcon: false } }
        );
      res.success({ data: result.data });
    } catch (err: any) {
      res.failure(err.response.data.Message);
    }
  }
);

export default resourceIconRouter;
