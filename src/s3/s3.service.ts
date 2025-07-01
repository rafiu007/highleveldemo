// src/s3/s3.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  /**
   * Generates a presigned URL for uploading an image to S3
   * @param fileType The MIME type of the file (e.g., 'image/jpeg', 'image/png')
   * @param userId The ID of the user requesting the upload
   * @returns Object containing the upload URL and the final image URL
   */
  async getSignedUploadUrl(fileType: string, userId: string) {
    // Validate file type
    if (!fileType.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Generate a unique file name
    const fileExtension = fileType.split('/')[1];
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

    // Create the command for putting an object in S3
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      ContentType: fileType,
    });

    // Generate the presigned URL
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    // The URL where the image will be accessible after upload
    const imageUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileName}`;

    return {
      uploadUrl: signedUrl,
      imageUrl,
    };
  }

  // Add this method to your S3Service
  async getSignedReadUrl(imageKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: imageKey,
    });

    // Generate URL that expires in 1 hour
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
