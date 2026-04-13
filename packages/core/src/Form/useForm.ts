import { createContext } from "@/_shared/createContext";
import type { RegleRoot } from "@regle/core";

export interface FormProvider<T extends object | Record<string, unknown> = any> {
    r$?: RegleRoot<T>,
    values: T
    attrs: Record<string, any>
    isNativeForm(): boolean
    isSubmitted(): boolean
    isSubmitting(): boolean
    isInvalid(): boolean
    validate(): Promise<boolean>
    submit(): Promise<void>
    reset(values?: T): void
}

const { inject, provide } = createContext<FormProvider>('Form')

export {
    inject as useForm,
    provide as provideForm
}