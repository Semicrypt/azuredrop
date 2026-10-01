import {
  BlobServiceClient,
} from "@azure/storage-blob";

import {
  DefaultAzureCredential,
} from "@azure/identity";

const connectionString =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const accountName =
  process.env.AZURE_STORAGE_ACCOUNT_NAME;

let blobServiceClient;

if (connectionString) {
  /*
   * Local development:
   * connect to Azurite.
   */
  blobServiceClient =
    BlobServiceClient.fromConnectionString(
      connectionString
    );
} else {
  /*
   * Azure deployment:
   * authenticate using Managed Identity
   * through DefaultAzureCredential.
   */
  if (!accountName) {
    throw new Error(
      "AZURE_STORAGE_ACCOUNT_NAME is not configured"
    );
  }

  blobServiceClient =
    new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
}

export const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME ||
  "azuredrop-files";

export default blobServiceClient;