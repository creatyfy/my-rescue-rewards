import { supabase } from "./client";

// Camada de dados da landing page pública.
// Usa RPCs SECURITY DEFINER (get_public_partners / get_public_prizes /
// get_public_stats) que expõem apenas campos de marketing para visitantes
// deslogados. Se a RPC ainda não existir no banco, cada função devolve um
// fallback vazio para a landing nunca quebrar.

export type Partner = {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
};

export type Prize = {
  id: string;
  name: string;
  imageUrl: string | null;
  pointsCost: number;
  valueReais: number | null;
  stock: number;
};

export type LandingStats = {
  partnerCount: number;
  prizeCount: number;
  pointsDistributed: number;
  redemptionsCount: number;
  membersCount: number;
};

export async function fetchPartners(): Promise<Partner[]> {
  const { data, error } = await supabase.rpc("get_public_partners");
  if (error || !data) return [];
  return (data as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url ?? null,
    description: row.description ?? null,
  }));
}

export async function fetchPrizes(): Promise<Prize[]> {
  const { data, error } = await supabase.rpc("get_public_prizes");
  if (error || !data) return [];
  return (data as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    imageUrl: row.image_url ?? null,
    pointsCost: row.points_cost ?? 0,
    valueReais: row.prize_value_reais ?? null,
    stock: row.stock ?? 0,
  }));
}

export async function fetchLandingStats(): Promise<LandingStats | null> {
  const { data, error } = await supabase.rpc("get_public_stats");
  if (error || !data) return null;
  const raw = data as any;
  return {
    partnerCount: Number(raw.partner_count ?? 0),
    prizeCount: Number(raw.prize_count ?? 0),
    pointsDistributed: Number(raw.points_distributed ?? 0),
    redemptionsCount: Number(raw.redemptions_count ?? 0),
    membersCount: Number(raw.members_count ?? 0),
  };
}
