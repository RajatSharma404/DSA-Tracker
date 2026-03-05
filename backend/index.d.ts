declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
}
export {};
//# sourceMappingURL=index.d.ts.map