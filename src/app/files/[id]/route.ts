import db from "@/server/db";
import {
  type GetObjectCommandInput,
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { z } from "zod";

const querySchema = z.object({
  width: z
    .number()
    .min(100, {
      message: "Width must be at least 100",
    })
    .max(2048, {
      message: "Width must be at most 2048",
    })
    .optional(),
  height: z
    .number()
    .min(100, {
      message: "Height must be at least 100",
    })
    .max(2048, {
      message: "Height must be at most 2048",
    })
    .optional(),
  rotate: z
    .number()
    .min(-180, {
      message: "Rotate must be at least -180",
    })
    .max(180, {
      message: "Rotate must be at most 180",
    })
    .optional(),
  quality: z
    .number()
    .min(1, {
      message: "Quality must be at least 1",
    })
    .max(100, {
      message: "Quality must be at most 100",
    })
    .optional(),
  fit: z
    .enum(["cover", "contain", "fill", "inside", "outside"], {
      message: "Fit must be one of cover, contain, fill, inside, outside",
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const file = await db.query.files.findFirst({
    where: (files, { eq }) => eq(files.id, id),
    with: {
      app: {
        with: {
          storage: true,
        },
      },
    },
  });

  if (!file || file.app.deletedAt) {
    return new NextResponse(null, {
      status: 404,
    });
  }

  if (!file?.app.storage) {
    return new NextResponse(null, {
      status: 400,
    });
  }

  const storage = file.app.storage;

  const params: GetObjectCommandInput = {
    Bucket: storage.configuration.bucket,
    Key: file.path,
  };

  const s3Client = new S3Client({
    endpoint: storage.configuration.endpoint,
    region: storage.configuration.region,
    credentials: {
      accessKeyId: storage.configuration.accessKeyId,
      secretAccessKey: storage.configuration.secretAccessKey,
    },
  });

  const command = new GetObjectCommand(params);
  const response = await s3Client.send(command);

  const byteArray = await response.Body?.transformToByteArray();
  if (!byteArray) {
    return new NextResponse(null, {
      status: 500,
    });
  }

  // not image, return original file
  if (!file.contentType.startsWith("image/")) {
    return new NextResponse(byteArray, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const searchParams = new URL(request.url).searchParams;

  const parseResult = querySchema.safeParse({
    width: searchParams.get("width")
      ? Number(searchParams.get("width"))
      : undefined,
    height: searchParams.get("height")
      ? Number(searchParams.get("height"))
      : undefined,
    rotate: searchParams.get("rotate")
      ? Number(searchParams.get("rotate"))
      : undefined,
    quality: searchParams.get("quality")
      ? Number(searchParams.get("quality"))
      : undefined,
    fit: searchParams.get("fit") ?? undefined,
  });
  if (!parseResult.success) {
    return new NextResponse(parseResult.error.issues[0].message, {
      status: 422,
    });
  }

  const { width, height, rotate, quality, fit } = parseResult.data;

  if (!width && !rotate && !height) {
    return new NextResponse(byteArray, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const image = sharp(byteArray, {
    animated: true,
  });

  if (rotate) {
    image.rotate(rotate);
  }

  if (width || height) {
    image.resize(width, height, {
      fit,
    });
  }

  const imgBuffer = await image
    .webp({
      quality,
    })
    .toBuffer();

  return new NextResponse(imgBuffer, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
