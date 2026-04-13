<script setup lang="ts">
import { useRegle } from "@regle/core";
import { required, withMessage } from "@regle/rules";
import { FormRoot, FormField, FormFieldError, FormFieldLabel, FormFieldHint, FormSubmit, FormReset } from "../src"

async function wait() {
  return new Promise<void>((resolve) => setTimeout(resolve, 3000))
}

const { r$ } = useRegle({
  name: ''
}, {
  name: { required: withMessage(required, 'Campo obrigatório') },
})

async function register() {
  console.log('enviado!')
}
</script>

<template>
  <div class="playground">
    <FormRoot :regle="r$" @submit="register">
      <FormField path="name" v-slot="{ field, id, isRequired, errorMessageId, hintMessageId, errors }">
        <FormFieldLabel>Nome</FormFieldLabel>
        <input type="text" :id :required="isRequired" v-model="field.$value" style="display: block"
          :aria-invalid="errors.length > 0" :aria-errormessage="errorMessageId" :aria-describedby="hintMessageId" />
        <FormFieldHint>Digite um valor...</FormFieldHint>
        <FormFieldError />
      </FormField>

      <FormSubmit>Enviar</FormSubmit>
      <FormReset>Resetar</FormReset>

      <pre>{{ r$.$invalid }}</pre>
    </FormRoot>
  </div>
</template>

<style scoped>
.playground {
  padding: 2rem;
}
</style>
