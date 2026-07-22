import { useQuery } from "@tanstack/react-query";
import {
  fetchPartners,
  fetchPrizes,
  fetchLandingStats,
} from "@/integrations/supabase/landing";

// Dados públicos da landing. Cache generoso (5 min) — conteúdo institucional
// não precisa revalidar a cada foco de janela.
const staleTime = 5 * 60 * 1000;

export function usePartners() {
  return useQuery({
    queryKey: ["landing", "partners"],
    queryFn: fetchPartners,
    staleTime,
    refetchOnWindowFocus: false,
  });
}

export function usePrizes() {
  return useQuery({
    queryKey: ["landing", "prizes"],
    queryFn: fetchPrizes,
    staleTime,
    refetchOnWindowFocus: false,
  });
}

export function useLandingStats() {
  return useQuery({
    queryKey: ["landing", "stats"],
    queryFn: fetchLandingStats,
    staleTime,
    refetchOnWindowFocus: false,
  });
}
