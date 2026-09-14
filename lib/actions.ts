"use server";

import { revalidatePath } from "next/cache";
import { applyAction, context } from "@/lib/state";

async function run(
  formData: FormData,
  action: string,
  payload: Record<string, unknown>,
) {
  const ctx = await context();
  if (!ctx) throw new Error("Não autorizado.");
  await applyAction(ctx, action, payload);
  const path = formData.get("path");
  if (typeof path === "string" && path) revalidatePath(path);
}

export async function approveVenueAction(formData: FormData) {
  await run(formData, "venue.approve", { id: formData.get("id") });
}

export async function rejectVenueAction(formData: FormData) {
  await run(formData, "venue.reject", { id: formData.get("id") });
}

export async function approveCampaignAction(formData: FormData) {
  await run(formData, "campaign.approve", { id: formData.get("id") });
}

export async function rejectCampaignAction(formData: FormData) {
  await run(formData, "campaign.reject", { id: formData.get("id") });
}

export async function pauseCampaignAction(formData: FormData) {
  await run(formData, "campaign.pause", { id: formData.get("id") });
}

export async function resumeCampaignAction(formData: FormData) {
  await run(formData, "campaign.resume", { id: formData.get("id") });
}

export async function approveCreativeAction(formData: FormData) {
  await run(formData, "creative.approve", { id: formData.get("id") });
}

export async function rejectCreativeAction(formData: FormData) {
  await run(formData, "creative.reject", {
    id: formData.get("id"),
    reason: formData.get("reason") ?? "",
  });
}

export async function resolveTicketAction(formData: FormData) {
  await run(formData, "ticket.resolve", { id: formData.get("id") });
}

export async function createTicketAction(formData: FormData) {
  await run(formData, "ticket.create", {
    title: formData.get("title"),
    description: formData.get("description"),
    screenId: formData.get("screenId"),
  });
}

export async function renameOrganizationAction(formData: FormData) {
  await run(formData, "organization.rename", { name: formData.get("name") });
}
