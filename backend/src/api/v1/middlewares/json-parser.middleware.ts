import { Request, Response, NextFunction } from 'express';

export const parseJsonFields = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fields.forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (e) {
                    // Keep as string if parsing fails, let validator handle it
                }
            }
        });
        next();
    };
};
