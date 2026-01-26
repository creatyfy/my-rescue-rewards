import { useState, useCallback } from "react";

export type CepResult = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

type CepLookupState = {
  loading: boolean;
  error: string | null;
  data: CepResult | null;
};

export function useCepLookup() {
  const [state, setState] = useState<CepLookupState>({
    loading: false,
    error: null,
    data: null,
  });

  const lookup = useCallback(async (cep: string): Promise<CepResult | null> => {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      setState({ loading: false, error: "CEP deve ter 8 dígitos", data: null });
      return null;
    }

    setState({ loading: true, error: null, data: null });

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data: CepResult = await response.json();

      if (data.erro) {
        setState({ loading: false, error: "CEP não encontrado", data: null });
        return null;
      }

      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar CEP";
      setState({ loading: false, error: message, data: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    lookup,
    reset,
  };
}
