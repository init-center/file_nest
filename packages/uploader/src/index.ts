import { Uppy, UppyFile } from "@uppy/core";
import AwsS3, { AwsS3UploadParameters } from "@uppy/aws-s3";

export function createUploader(
  getUploadParameters: (file: UppyFile) => Promise<AwsS3UploadParameters>
) {
  const uppy = new Uppy();
  uppy.use(AwsS3, {
    shouldUseMultipart: false,
    // 用于返回 presigned URL
    getUploadParameters: getUploadParameters as any,
  });
  return uppy;
}
