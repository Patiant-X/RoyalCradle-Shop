import dotenv from 'dotenv';
dotenv.config();
const { YOCO_WEBHOOK_SECRET } =
  process.env;
import crypto from 'crypto';
import getRawBody from 'raw-body';
import express from 'express'

/**
 * his middleware is used to parse the raw request body of incoming requests.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @return {Err} returns an error if the ObjectId is invalid.
 */

export function parseRawRequestBody(req, res, next) {
  getRawBody(
    req,
    {
      length: req.headers['content-length'],
      encoding: 'utf-8',
    },
    (err, rawBody) => {
      if (err){
        return next(err);
      } 
      req.rawBody = rawBody;
     
    }

  ); // Perform time interval check for avoiding replay attacks
      const timestamp = parseInt(req.headers['webhook-timestamp']);
      const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
      const timeDifference = currentTimestamp - timestamp;

      // Check if the time difference is within the acceptable threshold (3 minutes = 180 seconds)
      if (timeDifference > 180) {
          return res.status(403).send('Webhook request timestamp expired');
      }
      next();
}


export function webhookSecret(req, res, next) {
  const headers = req.headers;
  const requestBody = req.rawBody;

  // Construct the signed content
  const id = headers['webhook-id'];
  const timestamp = headers['webhook-timestamp'];

  const signedContent = `${id}.${timestamp}.${requestBody}`;

  // Determine the expected signature
  const secret = YOCO_WEBHOOK_SECRET // Replace with your Yoco webhook secret
  const secretBytes = Buffer.from(secret.split('_')[1], 'base64');

  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Extract the signature from the webhook-signature header
  const signature = headers['webhook-signature'].split(' ')[0].split(',')[1];

  // Compare the signatures using constant-time string comparison
  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );

  if (signaturesMatch) {
    // The webhook signature is valid
    next();
  } else {
    // The webhook signature is invalid
    res.status(403).send('Forbidden');
  }
}
