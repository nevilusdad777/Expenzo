export {};

declare global {
  namespace Express {
    interface Request {
      session?: {
        unlocked: boolean;
        userId: string;
      };
    }
  }
}

export function getUserId(req: Express.Request): string {
  const userId = req.session?.userId;
  if (!userId) throw new Error('Missing authenticated user');
  return userId;
}
