export interface CompilerContext {
  source: string;
  fileName: string;
  diagnostics: Diagnostic[];
}

export enum DiagnosticSeverity {
  Error = "Error",
  Warning = "Warning",
  Info = "Info",
}

export enum DiagnosticCode {
  UnterminatedExpression = 'SLIZ001',
  UnterminatedDoctype = 'SLIZ002',
  ExpectedTagName = 'SLIZ003',
}

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: DiagnosticCode;
  message: string;
  start: number;
  end: number;
}
