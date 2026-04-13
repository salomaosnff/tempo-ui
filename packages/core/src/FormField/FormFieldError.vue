<script setup lang="ts">
import { Primitive, type PrimitiveProps } from '../Primitive';
import { useFormField } from './useFormField';
import { computed, onBeforeUnmount, reactive, useId, watch, watchEffect } from 'vue';
import { primitiveProps } from '../Primitive/usePrimitive';

export interface FormFieldErrorProps extends PrimitiveProps {
    id?: string
}

const props = withDefaults(defineProps<FormFieldErrorProps>(), {
    as: 'p',
    id: useId
})

const context = useFormField()
const message = computed(() => context.errors[0])

const ariaAttrs = reactive({
    'role': 'alert',
    'aria-live': 'polite',
})

const primitiveAttrs = computed(() => {
    return { ...primitiveProps(props), ...ariaAttrs, id: props.id }
})

watchEffect((cleanup) => {
    context.errorMessageId = context.errors?.length ? props.id : undefined

    return cleanup(() => {
        context.errorMessageId = undefined
    })
})
</script>

<template>
    <Primitive v-if="context.errors?.length" v-bind="primitiveAttrs">
        <slot :message :id :attrs="ariaAttrs">{{ message }}</slot>
    </Primitive>
</template>