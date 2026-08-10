export enum DiagnosticSeverity {
  Error = "Error",
  Warning = "Warning",
  Info = "Info",
}

export enum DiagnosticCode {
  UnterminatedExpression = "SLIZ001",
  UnterminatedDoctype = "SLIZ002",
  ExpectedTagName = "SLIZ003",
  UnterminatedAttributeValue = 'SLIZ004',
  ExpectedTagEnd = 'SLIZ005',
  UnterminatedComment = 'SLIZ006',
  NestedComment = 'SLIZ007',
  UnterminatedScript = 'SLIZ008',
  UnterminatedStyle = 'SLIZ009'
}

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: DiagnosticCode;
  message: string;
  start: number;
  end: number;
}
export interface CompilerContext {
  source: string;
  fileName: string;
  diagnostics: Diagnostic[];
}
