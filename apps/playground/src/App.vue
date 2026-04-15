<script setup lang="ts">
import { ButtonArea, ButtonContent, ButtonLoading, ButtonRoot } from '@tempoui/core'

async function handleClick() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, 2000)
  })
}
</script>

<template>
  <ButtonRoot @click="handleClick">
    <ButtonArea>
      <ButtonContent>Clique</ButtonContent>
      <ButtonLoading>Carregando...</ButtonLoading>
    </ButtonArea>
  </ButtonRoot>
</template>

<style scoped></style>
