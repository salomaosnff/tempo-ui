<script setup lang="ts">
import { Primitive, type PrimitiveProps } from '../Primitive';
import { useForm } from './useForm';
import { primitiveProps } from '../Primitive/usePrimitive';
import { computed } from 'vue';

export interface FormSubmitProps extends PrimitiveProps {
    disabled?: boolean
}

const props = withDefaults(defineProps<FormSubmitProps>(), {
    as: 'button'
})

const { isSubmitting, isInvalid, isNativeForm, submit, isSubmitted } = useForm()

const isDisabled = computed(() => props.disabled || isSubmitting() || isInvalid() || isSubmitted())

const primitiveAttrs = computed(() => {
    const attrs: Record<string, any> = primitiveProps(props);

    if (isNativeForm()) {
        attrs.type = 'submit'
    } else {
        attrs.type = 'button'
        attrs.onClick = submit
    }

    return attrs
})
</script>

<template>
    <Primitive v-bind="primitiveAttrs" :disabled="isDisabled">
        <slot>Submit</slot>
    </Primitive>
</template>