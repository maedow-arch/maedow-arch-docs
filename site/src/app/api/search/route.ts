import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// Recherche alimentée par les pages générées par `scripts/sync-docs.mjs`.
export const { GET } = createFromSource(source);
