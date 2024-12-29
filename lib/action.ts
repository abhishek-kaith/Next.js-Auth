import { z } from 'zod';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export interface ActionResponse<T, U = undefined> {
    fieldError?: Partial<Record<keyof T, string | undefined>>;
    defaultValues?: Partial<T>;
    status?: 'success' | 'error' | 'pending';
    message?: string;
    result?: U;
}

/**
 * T = ZodSchema<T>
 * U = Type of value retured as result
 * {
 *     fieldError?: Partial<Record<keyof T, string | undefined>>;
 *     defaultValues?: Partial<T>;
 *     status?: 'success' | 'error' | 'pending';
 *     message?: string;
 *     result?: U; // value result of action logic
 * }
 * */
export function createActionHandler<T, U = undefined>(
    schema: z.ZodSchema<T> | null,
    actionLogic: (parsedData: T, prevState: ActionResponse<T, U>) => Promise<ActionResponse<T, U>>,
): (prevState: ActionResponse<T, U>, data: FormData) => Promise<ActionResponse<T, U>> {
    return async (prev, data): Promise<ActionResponse<T, U>> => {
        let parsedData: T | undefined;

        if (schema) {
            const { error, parsedData: validatedData } = handleFormActionData(data, schema);
            if (error) {
                return error;
            }
            parsedData = validatedData;
        }

        try {
            return await actionLogic(parsedData as T, prev);
        } catch (err) {
            if (isRedirectError(err)) {
                throw err;
            }
            console.error(actionLogic.name, err);
            return {
                status: 'error',
                message: 'Something went wrong. Please try again later.',
                defaultValues: parsedData,
            };
        }
    };
}

function handleFormActionData<T>(
    data: FormData,
    schema: z.ZodSchema<T>,
): {
    error?: ActionResponse<T>;
    parsedData?: T;
} {
    const obj = Object.fromEntries(data.entries());
    const parsed = schema.safeParse(obj);
    if (parsed.success) {
        return {
            parsedData: parsed.data,
        };
    }
    return {
        error: {
            fieldError: Object.fromEntries(
                parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
            ) as Partial<Record<keyof T, string | undefined>>,
            status: 'error',
            message: 'Validation failed. Please correct the highlighted fields.',
            defaultValues: obj as Partial<T>,
        },
    };
}
