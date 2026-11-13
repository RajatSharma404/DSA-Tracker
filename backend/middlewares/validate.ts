import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export interface RequestValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schema: RequestValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as Request["query"];
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as Request["params"];
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const errorMessage = firstIssue?.message || "Validation failed";
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: errorMessage,
            issues: error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
};

