<script setup lang="ts">
import { shallowRef } from "vue";
import { PopoverRoot, PopoverContent, PopoverTrigger } from "../src";
</script>
<template>
  <PopoverRoot v-slot="{ currentAnchor }">
    <PopoverContent popover="manual" class="content"> Aqui fica o conteúdo </PopoverContent>
    <PopoverTrigger class="trigger-spiral">Clique aqui</PopoverTrigger>
  </PopoverRoot>
</template>
<style>
.trigger-spiral {
  position: absolute;
  animation: spiral 10s ease-in-out infinite alternate;
}

@keyframes spiral {
  0% {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  10% {
    top: 10%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  20% {
    top: 20%;
    left: 90%;
    transform: translate(-50%, -50%);
  }

  30% {
    top: 50%;
    left: 95%;
    transform: translate(-50%, -50%);
  }

  40% {
    top: 80%;
    left: 85%;
    transform: translate(-50%, -50%);
  }

  50% {
    top: 90%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  60% {
    top: 80%;
    left: 15%;
    transform: translate(-50%, -50%);
  }

  70% {
    top: 50%;
    left: 5%;
    transform: translate(-50%, -50%);
  }

  80% {
    top: 20%;
    left: 10%;
    transform: translate(-50%, -50%);
  }

  90% {
    top: 5%;
    left: 35%;
    transform: translate(-50%, -50%);
  }

  100% {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.content {
  /* Estilos Visuais */
  background: #1b1b1b;
  color: #e0e0e0;
  border-radius: 0.25rem;
  height: 240px;
  width: 480px;

  /* Configuração de Ancoragem */
  position: fixed;
  /* Essencial para o cálculo de colisão */
  /* Certifique-se de que o ID está correto */

  /* Posição Inicial: Topo e Centralizado */
  position-area: top;
  margin-bottom: 8px;
  /* Espaço entre o anchor e o conteúdo */

  /* Fallbacks: Tenta inverter para baixo */
  position-try-fallbacks: flip-block;

  /* Força a reavaliação constante pelo maior espaço disponível */
  position-try-order: most-height;

  /* Garante que o elemento não "estoure" a tela se ambos os lados forem pequenos */
  overflow: auto;

  position-area: top;
  position-try-fallbacks: flip-block;
  position-try-order: most-height;
  container-type: anchored;
}

.content::before {
  content: "";
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-top-color: black;
  /* Mesma cor do fundo do card */
  position: fixed;
  position-anchor: --v-0;
  position-area: top;
  margin-bottom: -10px;
}

@container anchored(fallback: flip-block) {
  .content::before {
    position-area: bottom;
    border: 10px solid transparent;
    border-bottom-color: black;
    margin-top: -10px;
    margin-bottom: auto;
  }
}
</style>
