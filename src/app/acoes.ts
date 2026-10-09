"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_CURRICULO } from "@/lib/curriculos/escolha";

/** Troca o currículo do site inteiro e lembra a escolha por um ano. */
export async function escolherCurriculo(ano: string) {
  if (ano !== "2008" && ano !== "2022") return;
  (await cookies()).set(COOKIE_CURRICULO, ano, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 365 * 24 * 3600,
  });
  revalidatePath("/", "layout");
}
