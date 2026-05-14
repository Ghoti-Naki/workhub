export function isValidAutomationSecret(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.AUTOMATION_SECRET;

  if (!expected) return false;
  if (!authHeader) return false;

  return authHeader === `Bearer ${expected}`;
}
