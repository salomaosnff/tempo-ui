import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useForm } from "../Form/useForm";
import { get, toPath } from "lodash-es";
import type { RegleCommonStatus, RegleRoot } from "@regle/core";
import { createContext } from "@/_shared/createContext";

/**
 * Hook to access a form field definition from the form context.
 * It transforms a standard path into the Regle structure.
 * 
 * @example
 * useFormField('name') // r$.$fields.name
 * useFormField('user.name') // r$.$fields.user.$fields.name
 * useFormField('list[0].name') // r$.$fields.list.$each[0].$fields.name
 */
export function useRegleField<T extends RegleCommonStatus>(path: MaybeRefOrGetter<string>) {
    const { r$ } = useForm();

    return computed<T | null>(() => {
        if (!r$) return null;

        return getFormField(r$, toValue(path)) as T | null
    });
}

export interface FormFieldProvider {
    id: string
    field: RegleCommonStatus<any, any> | null
    errors: string[]
    isRequired: boolean
    isInvalid: boolean
    attrs: Record<string, any>
    errorMessageId?: string
    hintMessageId?: string
    labelId?: string
}

export function getFormField(r$: RegleRoot<any>, path: string): RegleCommonStatus<any, any> | null {
    const stringPath = toValue(path);

    if (!stringPath) return null;

    const parts = toPath(stringPath);
    const transformedPath: string[] = [];

    for (const part of parts) {
        if (/^\d+$/.test(part)) {
            transformedPath.push('$each', part);
        } else {
            transformedPath.push('$fields', part);
        }
    }

    return get(r$, transformedPath, null);
}

const { inject, provide } = createContext<FormFieldProvider>('FormField');

export { inject as useFormField, provide as provideFormField }
