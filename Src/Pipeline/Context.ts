export interface CompilerContext {
  Source: string;
  FileName: string;
  Diagnostics: Diagnostic[];
}

export enum DiagnosticSeverity {
  Error = "Error",
  Warning = "Warning",
  Info = "Info",
}


export enum DiagnosticCode {
  UnterminatedExpression = 'SLIZ001',
  UnterminatedDoctype = 'SLIZ002',
  ExpectedTagName = 'SLIZ003'
}


export interface Diagnostic {
  Severity: DiagnosticSeverity;
  Code: DiagnosticCode;
  Message: string;
  Start: number;
  End: number;
}
