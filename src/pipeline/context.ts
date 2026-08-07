export interface CompilerContext {
  source: string;
  fileName: string;
  diagnostics: Diagnostic[];
}

export interface Diagnostic {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  start: number;
  end: number;
}
