<script setup lang="ts">
import { computed, reactive, shallowRef, toRef, useId } from 'vue';
import { Primitive, type PrimitiveProps } from '../Primitive';
import { primitiveProps } from '../Primitive/usePrimitive';
import { provideFormField, useRegleField, type FormFieldProvider } from './useFormField';
import type { RegleCollectionStatus } from '@regle/core';

export interface FormFieldProps extends PrimitiveProps {
    id?: string
    /**
     * Path to the field in the form
     */
    path: string
}

const props = withDefaults(defineProps<FormFieldProps>(), {
    asChild: true,
    id: useId
})

function isRegleArrayStatus(value: any): value is RegleCollectionStatus<any, any> {
    return value?.$each !== undefined
}

const field = useRegleField(() => props.path)
const isRequired = computed(() => (field.value as any)?.$rules?.required?.$active ?? false)
const isInvalid = computed(() => field.value?.$error ?? false)

const errors = computed(() => {
    if (!field.value) return [];
    if (isRegleArrayStatus(field.value)) {
        return (field.value.$each as any).$errors
    }

    return (field.value as any).$errors
})

const errorMessageId = shallowRef<string>()
const labelId = shallowRef<string>()
const hintMessageId = shallowRef<string>()

const ariaAttrs = reactive({
    'aria-invalid': computed(() => field.value?.$invalid),
    'aria-required': computed(() => isRequired.value),
    'aria-errormessage': computed(() => errors.value.length ? errorMessageId.value : undefined),
    'aria-describedby': computed(() => hintMessageId.value),
    'aria-labelledby': computed(() => labelId.value),
})

const provider: FormFieldProvider = provideFormField(reactive({
    id: toRef(props, 'id'),
    field,
    errors,
    isRequired,
    isInvalid,
    attrs: ariaAttrs,
    errorMessageId,
}))
</script>

<template>
    <Primitive v-if="field" v-bind="primitiveProps(props)">
        <slot v-bind="provider" :field></slot>
    </Primitive>
</template>