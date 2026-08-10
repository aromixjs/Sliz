export interface CompilerContext {
  Source: string;
  FileName: string;
  Diagnostics: Diagnostic[];
}


export enum DiagnosticSeverity {
  Error = 'Error',
  Warning = 'Warning',
  Info = 'Info'
}

export interface Diagnostic {
  Severity: DiagnosticSeverity;
  Code: string;
  Message: string;
  Start: number;
  End: number;
}
