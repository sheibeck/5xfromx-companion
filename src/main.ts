import { createApp } from 'vue'
import router from './router'
import './style.scss'
import App from './App.vue'
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

createApp(App).use(router).mount('#app')
