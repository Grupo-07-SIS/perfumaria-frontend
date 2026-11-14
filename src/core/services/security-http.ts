import { environment } from "../../environment";

export class SecurityHttpError extends Error {
  constructor(public readonly status: number, message: string, public readonly retryAfter: string | null = null) {
    super(message);
    this.name = "SecurityHttpError";
  }
}

/** No interceptors, bearer tokens, session storage or sensitive logging. */
export async function securityRequest<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${environment.backendUrl}${path}`, { ...options, cache: "no-store" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new SecurityHttpError(response.status, body.message || body.mensagem || "Não foi possível concluir a operação. Tente novamente.", response.headers.get("Retry-After"));
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}

export function securityErrorMessage(error: unknown): string {
  if (error instanceof SecurityHttpError && error.status === 429) {
    return `${error.message} Limite de tentativas atingido. ${error.retryAfter ? `Retry-After informado pelo servidor: ${error.retryAfter}${/^\d+$/.test(error.retryAfter) ? " segundos" : ""}.` : "Aguarde o prazo indicado pelo servidor."} A janela de falhas é de 8 horas; reiniciar não zera o contador.`;
  }
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}