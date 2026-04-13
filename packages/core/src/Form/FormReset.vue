<script setup lang="ts">
import { Primitive, type PrimitiveProps } from '../Primitive';
import { useForm } from './useForm';
import { primitiveProps } from '../Primitive/usePrimitive';
import { computed } from 'vue';

export interface FormResetProps extends PrimitiveProps {
    disabled?: boolean
}

const props = withDefaults(defineProps<FormResetProps>(), {
    as: 'button'
})

const { isSubmitting, isNativeForm, reset } = useForm()

const isDisabled = computed(() => props.disabled || isSubmitting())

const primitiveAttrs = computed(() => {
    const attrs: Record<string, any> = primitiveProps(props);

    if (isNativeForm()) {
        attrs.type = 'reset'
    } else {
        attrs.type = 'button'
        attrs.onClick = reset
    }

    return attrs
})
</script>

<template>
    <Primitive v-bind="primitiveAttrs" :disabled="isDisabled">
        <slot>Reset</slot>
    </Primitive>
</template>