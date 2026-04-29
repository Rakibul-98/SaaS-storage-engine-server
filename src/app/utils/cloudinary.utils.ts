import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  thumbnail_url?: string;
};

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  options: {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    public_id?: string;
  } = {},
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "saas-storage",
        resource_type: options.resource_type || "auto",
        public_id: options.public_id,
        transformation:
          options.resource_type === "image"
            ? [{ quality: "auto", fetch_format: "auto" }]
            : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No upload result"));

        const thumbnailUrl =
          result.resource_type === "image"
            ? cloudinary.url(result.public_id, {
                width: 300,
                height: 300,
                crop: "fill",
                quality: "auto",
                format: "webp",
              })
            : undefined;

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          resource_type: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          thumbnail_url: thumbnailUrl,
        });
      },
    );

    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw",
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export { cloudinary };
