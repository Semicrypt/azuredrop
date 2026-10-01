import {
  BlobSASPermissions,
  SASProtocol,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

import blobServiceClient, {
  accountName,
  containerName as defaultContainerName,
  publicBlobEndpoint,
  sharedKeyCredential,
} from "../config/blob.js";

export async function ensureStorageContainer() {
  const containerClient =
    blobServiceClient
      .getContainerClient(
        defaultContainerName
      );

  await containerClient
    .createIfNotExists();

  return containerClient;
}

export async function getUploadStorage() {
  const containerClient =
    await ensureStorageContainer();

  return {
    containerClient,

    containerName:
      defaultContainerName,

    storageProvider:
      "azure_blob",
  };
}

export async function getFileStorage(
  file
) {
  const targetContainer =
    file.container_name ||
    defaultContainerName;

  if (!targetContainer) {
    const error =
      new Error(
        "Blob container information is missing"
      );

    error.status = 500;

    throw error;
  }

  const containerClient =
    blobServiceClient
      .getContainerClient(
        targetContainer
      );

  return {
    containerClient,

    containerName:
      targetContainer,

    storageProvider:
      "azure_blob",
  };
}

function makePublicBlobUrl(
  blobUrl
) {
  if (!publicBlobEndpoint) {
    return blobUrl;
  }

  const serviceUrl =
    blobServiceClient
      .url
      .replace(
        /\/$/,
        ""
      );

  return blobUrl.replace(
    serviceUrl,
    publicBlobEndpoint.replace(
      /\/$/,
      ""
    )
  );
}

export async function createBlobReadUrl({
  containerName,
  blobName,
  expiresIn = 300,
}) {
  const startsOn =
    new Date(
      Date.now() -
        5 * 60 * 1000
    );

  const expiresOn =
    new Date(
      Date.now() +
        expiresIn * 1000
    );

  const options = {
    containerName,
    blobName,

    permissions:
      BlobSASPermissions.parse(
        "r"
      ),

    startsOn,
    expiresOn,
  };

  let sasToken;

  /*
   * Local development / Azurite:
   * sign using the emulator's
   * development shared key.
   */
  if (sharedKeyCredential) {
    options.protocol =
      SASProtocol.HttpsAndHttp;

    sasToken =
      generateBlobSASQueryParameters(
        options,
        sharedKeyCredential
      ).toString();
  } else {
    /*
     * Azure production:
     * use Microsoft Entra /
     * Managed Identity to obtain
     * a user delegation key.
     */
    options.protocol =
      SASProtocol.Https;

    const userDelegationKey =
      await blobServiceClient
        .getUserDelegationKey(
          startsOn,
          expiresOn
        );

    sasToken =
      generateBlobSASQueryParameters(
        options,
        userDelegationKey,
        accountName
      ).toString();
  }

  const containerClient =
    blobServiceClient
      .getContainerClient(
        containerName
      );

  const blobClient =
    containerClient
      .getBlobClient(
        blobName
      );

  const publicUrl =
    makePublicBlobUrl(
      blobClient.url
    );

  return `${publicUrl}?${sasToken}`;
}