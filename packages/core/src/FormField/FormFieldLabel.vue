<script setup lang="ts">
import { Primitive, type PrimitiveProps } from '../Primitive';
import { useFormField } from './useFormField';
import { useId, watch } from 'vue';
import { primitiveProps } from '../Primitive/usePrimitive';

export interface FormFieldLabelProps extends PrimitiveProps {
    id?: string
}

const props = withDefaults(defineProps<FormFieldLabelProps>(), {
    as: 'label',
    id: useId
})

const context = useFormField()

watch(() => props.id, (id) => {
    if (context) {
        context.labelId = id
    }

    console.log(context.labelId)
}, { immediate: true })
</script>

<template>
    <Primitive v-bind="primitiveProps(props)" :id :for="context.id">
        <slot></slot>
    </Primitive>
</template>