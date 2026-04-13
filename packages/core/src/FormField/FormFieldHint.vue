<script setup lang="ts">
import { Primitive, type PrimitiveProps } from '../Primitive';
import { useFormField } from './useFormField';
import { onBeforeUnmount, useId, watch, watchEffect } from 'vue';
import { primitiveProps } from '../Primitive/usePrimitive';

export interface FormFieldHintProps extends PrimitiveProps {
    id?: string
}

const props = withDefaults(defineProps<FormFieldHintProps>(), {
    as: 'p',
    id: useId
})

const context = useFormField()

watchEffect((cleanup) => {
    context.hintMessageId = props.id

    return cleanup(() => {
        context.hintMessageId = undefined
    })
})
</script>

<template>
    <Primitive v-bind="primitiveProps(props)" :id aria-hidden="true">
        <slot></slot>
    </Primitive>
</template>