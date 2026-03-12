export class CliError extends Error {
  code: string;
  hint: string;

  constructor(code: string, message: string, hint: string = "") {
    super(message);
    this.code = code;
    this.hint = hint;
  }
}

export function handleError(err: unknown): never {
  if (err instanceof CliError) {
    const output = {
      code: err.code,
      message: err.message,
      hint: err.hint,
    };
    process.stderr.write(JSON.stringify(output, null, 2) + "\n");
    process.exit(1);
  }

  if (err instanceof Error) {
    const output = {
      code: "UNEXPECTED_ERROR",
      message: err.message,
      hint: "",
    };
    process.stderr.write(JSON.stringify(output, null, 2) + "\n");
    process.exit(1);
  }

  const output = {
    code: "UNKNOWN_ERROR",
    message: String(err),
    hint: "",
  };
  process.stderr.write(JSON.stringify(output, null, 2) + "\n");
  process.exit(1);
}
