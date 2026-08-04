export interface ExtractedExpression {
   id: string;
   source: string;
   start: number;
   end: number;
}


export interface PreProcessError {
   message: string;
   start: number;
}