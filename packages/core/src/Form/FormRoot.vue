<script setup lang="ts" generic="M">
import type { RegleRoot } from '@regle/core';
import { computed, reactive, shallowRef, toRef, useTemplateRef, type ComponentPublicInstance, type Raw } from 'vue';
import { waitEmit, type WaitableEvent } from '../_shared/waitEmit';
import { useAsync } from '../_shared/useAsync';
import { Primitive, type PrimitiveProps } from '../Primitive';
import { primitiveProps } from '../Primitive/usePrimitive';
import { provideForm, type FormProvider } from './useForm';

export interface FormRootProps extends PrimitiveProps {
    regle?: Raw<RegleRoot<any>>
    onSubmit: WaitableEvent<
        (values: any) => void | Promise<void>
    >
}

const props = withDefaults(defineProps<FormRootProps>(), {
    as: 'form'
})
const modelValue = defineModel<any | M>()

const isSubmitted = shallowRef(false)
const primitiveElement = useTemplateRef<ComponentPublicInstance | HTMLElement>('primitiveElement')

const { execute, isPending } = useAsync(() => waitEmit(props.onSubmit, props.regle ? props.regle.$value : modelValue.value))
const canSubmit = computed(() => !isPending() && !props.regle?.$invalid && !props.regle?.$pending)

async function submit() {
    if (isPending()) return;

    await props.regle?.$validate()

    if (!canSubmit.value) return;

    await execute()
    isSubmitted.value = true
}

function onResetHandler(values?: any | Event) {
    isSubmitted.value = false

    if (!props.regle) {
        if (!(values instanceof Event)) {
            modelValue.value = values
        }
        return;
    }

    if (typeof values !== 'undefined' && !(values instanceof Event)) {
        props.regle.$reset({ toState: values })
        return;
    }

    props.regle.$reset({ toInitialState: true, clearExternalErrors: true })
}

function reset(values?: any) {
    const el = (primitiveElement.value as ComponentPublicInstance)?.$el ?? primitiveElement.value;
    const isNativeForm = !props.asChild && props.as === 'form';

    if (isNativeForm && el instanceof HTMLFormElement) {
        el.reset()
    }

    onResetHandler(values)
}

const ariaAttrs = reactive({
    'role': 'form',
})

const formAttrs = computed(() => {
    const attrs: Record<string, any> = { ...primitiveProps(props) }

    if (props.as !== 'form') {
        Object.assign(attrs, ariaAttrs)
    }

    return attrs
})

async function validate() {
    await props.regle?.$validate()
    return props.regle?.$invalid ?? false
}

const provider: FormProvider<any> = provideForm({
    r$: props.regle,
    values: reactive(props.regle ? toRef(props.regle, '$value') : modelValue),
    attrs: reactive(computed(() => props.as === 'form' ? {} : ariaAttrs)),
    isNativeForm: () => !props.asChild && props.as === 'form',
    isSubmitted: () => isSubmitted.value,
    isSubmitting: isPending,
    isInvalid: () => props.regle?.$invalid ?? false,
    validate,
    submit,
    reset
})

</script>

<template>
    <Primitive ref="primitiveElement" v-bind="formAttrs" @submit.prevent="submit" @reset.prevent="onResetHandler">
        <slot v-bind="provider"></slot>
    </Primitive>
</template>