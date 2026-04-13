import { createApp } from 'vue'
import { RegleVuePlugin } from '@regle/core';
import App from './App.vue'



createApp(App).use(RegleVuePlugin).mount('#app')
