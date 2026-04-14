<script setup lang="ts">
import { useRegle } from "@regle/core";
import { required, withMessage } from "@regle/rules";
import { FormRoot, FormField, FormFieldError, FormFieldLabel, FormFieldHint, FormSubmit, FormReset, PopoverRoot, PopoverTrigger, PopoverAnchor, PopoverContent } from "../src"

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

    <div class="popover-demo">
      <h2 class="section-title">Popover Demo</h2>
      <p class="section-desc">Powered by Popover API + CSS Anchor Positioning (Side & Align)</p>

      <div class="demo-grid" v-for="side in (['top', 'bottom', 'left', 'right'] as const)" :key="side">
        <h3 class="side-label">Side: {{ side }}</h3>
        <div class="align-group">
          <PopoverRoot v-for="align in (['start', 'center', 'end', 'out-start', 'out-end'] as const)" :key="align">
            <PopoverTrigger class="trigger-btn">
              {{ align }}
            </PopoverTrigger>

            <PopoverContent :side="side" :justify="align" v-slot="{ popoverId }">
              <div class="popover-inner">
                <h3>{{ side }} / {{ align }}</h3>
                <p>Natively positioned content.</p>
                <button :popovertarget="popoverId" popovertargetaction="hide" class="close-btn">
                  Fechar
                </button>
              </div>
            </PopoverContent>
          </PopoverRoot>
        </div>
      </div>
    </div>

    <div class="popover-demo">
      <h2 class="section-title">PopoverAnchor Demo</h2>
      <p class="section-desc">Anchoring to an external element using a CSS selector</p>

      <div id="external-target" class="external-box">
        Sou um elemento externo (#external-target)
      </div>

      <div class="demo-grid">
        <PopoverRoot>
          <PopoverAnchor to="#external-target" />
          <PopoverTrigger class="trigger-btn">
            Abrir Popover no Elemento Externo
          </PopoverTrigger>

          <PopoverContent side="top" justify="center" v-slot="{ popoverId }">
            <div class="popover-inner">
              <h3>Ancorado Externamente!</h3>
              <p>Este popover está usando <b>PopoverAnchor</b> para se prender a um elemento fora da sua hierarquia
                direta.</p>
              <button :popovertarget="popoverId" popovertargetaction="hide" class="close-btn">
                Fechar
              </button>
            </div>
          </PopoverContent>
        </PopoverRoot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playground {
  padding: 2rem;
  background: #0f172a;
  min-height: 100vh;
  color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
}

.popover-demo {
  margin-top: 5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 3rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #60a5fa, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-desc {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.demo-grid {
  margin: 1rem auto;
  width: max-content;
}

.side-label {
  font-size: 0.9rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.align-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.trigger-btn {
  padding: 12px 24px;
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  text-transform: capitalize;
}

.trigger-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #60a5fa;
  transform: translateY(-2px);
}

.external-box {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
  color: #94a3b8;
  width: 320px;
}

.popover-inner {
  padding: 16px;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  max-width: 280px;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    transform: translateY(10px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.popover-inner h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #f1f5f9;
}

.popover-inner p {
  margin: 0 0 16px 0;
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.6;
}

.close-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(to bottom right, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}
</style>
