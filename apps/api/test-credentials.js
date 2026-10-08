import "dotenv/config";
import pg from "pg";
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const { Client } = pg;

async function runTests() {
  console.log("==========================================");
  console.log("🔍 TESTING NEONDB CREDENTIALS & SERVICES");
  console.log("==========================================\n");

  let allPassed = true;

  // 1. DATABASE TEST
  console.log("1️⃣ [Postgres Database] Testing connection...");
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    const res = await client.query("SELECT NOW() as current_time, current_database() as db, current_user as usr, version() as ver;");
    console.log("   ✅ Database Connection SUCCESSFUL!");
    console.log(`      Database: ${res.rows[0].db}`);
    console.log(`      User:     ${res.rows[0].usr}`);
    console.log(`      Server Time: ${res.rows[0].current_time}`);
    await client.end();
  } catch (err) {
    allPassed = false;
    console.error("   ❌ Database Connection FAILED:", err.message);
  }

  console.log("\n------------------------------------------\n");

  // 2. NEON AUTH TEST
  console.log("2️⃣ [Neon Auth] Testing JWKS & Auth endpoints...");
  try {
    const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
    console.log(`   Fetching JWKS: ${jwksUrl}`);
    const jwksRes = await fetch(jwksUrl);
    if (!jwksRes.ok) {
      throw new Error(`HTTP ${jwksRes.status}: ${jwksRes.statusText}`);
    }
    const jwksData = await jwksRes.json();
    console.log("   ✅ Neon Auth JWKS Endpoint ACCESSIBLE!");
    console.log(`      Keys found: ${jwksData.keys ? jwksData.keys.length : 0}`);
  } catch (err) {
    allPassed = false;
    console.error("   ❌ Neon Auth Test FAILED:", err.message);
  }

  console.log("\n------------------------------------------\n");

  // 3. STORAGE TEST
  console.log("3️⃣ [Object Storage] Testing S3 client & bucket operations...");
  try {
    const s3 = new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION || "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });

    console.log("   Listing buckets...");
    const listRes = await s3.send(new ListBucketsCommand({}));
    const buckets = (listRes.Buckets || []).map((b) => b.Name);
    console.log(`   ✅ Buckets found in storage: [${buckets.join(", ")}]`);

    const targetBucket = buckets.includes("uploads") ? "uploads" : (buckets[0] || process.env.AWS_S3_BUCKET || "assets");
    console.log(`   Targeting bucket: "${targetBucket}"`);

    const testKey = "test/test-connection.txt";
    const testContent = `Korfball Bantul Test Upload - ${new Date().toISOString()}`;

    console.log(`   Uploading test object to "${targetBucket}/${testKey}"...`);
    await s3.send(
      new PutObjectCommand({
        Bucket: targetBucket,
        Key: testKey,
        Body: testContent,
        ContentType: "text/plain",
      })
    );
    console.log("   ✅ Upload SUCCESSFUL!");

    console.log("   Generating presigned GET URL (expires in 60s)...");
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: targetBucket, Key: testKey }),
      { expiresIn: 60 }
    );
    console.log(`   ✅ Presigned URL Generated:`);
    console.log(`      ${signedUrl.substring(0, 90)}...`);

    // Verify fetching presigned URL
    console.log("   Verifying download from presigned URL...");
    const getRes = await fetch(signedUrl);
    if (!getRes.ok) {
      throw new Error(`Failed to download via presigned URL: HTTP ${getRes.status}`);
    }
    const downloadedText = await getRes.text();
    if (downloadedText === testContent) {
      console.log("   ✅ Presigned Download & Content Verification SUCCESSFUL!");
    } else {
      console.log("   ⚠️ Content mismatch:", downloadedText);
    }
  } catch (err) {
    allPassed = false;
    console.error("   ❌ Object Storage Test FAILED:", err.message);
  }

  console.log("\n==========================================");
  if (allPassed) {
    console.log("🎉 ALL SERVICES TESTED AND OPERATIONAL!");
  } else {
    console.log("⚠️ SOME TESTS FAILED. PLEASE CHECK DETAILS ABOVE.");
  }
  console.log("==========================================");

  process.exit(allPassed ? 0 : 1);
}

runTests();
