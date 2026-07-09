import { createHash } from "crypto";

const API_BASE = "https://emailoctopus.com/api/1.6";

export type EmailOctopusSubscribeResult = {
  status: string;
  id?: string;
};

type EmailOctopusContact = {
  id?: string;
  email_address?: string;
  status?: string;
};

type EmailOctopusErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
  code?: string;
  message?: string;
};

function contactHash(email: string) {
  return createHash("md5").update(email.toLowerCase()).digest("hex");
}

function getEmailOctopusConfig() {
  const apiKey = process.env.EMAILOCTOPUS_API_KEY;
  const listId = process.env.EMAILOCTOPUS_LIST_ID;

  if (!apiKey || !listId) {
    throw new Error("EmailOctopus non configurato");
  }

  return { apiKey, listId };
}

function readError(data: EmailOctopusErrorBody) {
  return {
    code: data.error?.code ?? data.code,
    message: data.error?.message ?? data.message ?? "EmailOctopus error",
  };
}

export async function subscribeToEmailOctopus(
  email: string,
): Promise<EmailOctopusSubscribeResult> {
  const { apiKey, listId } = getEmailOctopusConfig();

  const payload = {
    api_key: apiKey,
    email_address: email,
    status: "SUBSCRIBED",
  };

  const createRes = await fetch(`${API_BASE}/lists/${listId}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const createData = (await createRes.json()) as EmailOctopusContact &
    EmailOctopusErrorBody;

  if (createRes.ok) {
    return {
      status: createData.status ?? "SUBSCRIBED",
      id: createData.id,
    };
  }

  const createError = readError(createData);
  if (createError.code !== "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
    throw new Error(createError.message);
  }

  const memberId = contactHash(email);
  const updateRes = await fetch(
    `${API_BASE}/lists/${listId}/contacts/${memberId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const updateData = (await updateRes.json()) as EmailOctopusContact &
    EmailOctopusErrorBody;

  if (!updateRes.ok) {
    throw new Error(readError(updateData).message);
  }

  return {
    status: updateData.status ?? "SUBSCRIBED",
    id: updateData.id,
  };
}
