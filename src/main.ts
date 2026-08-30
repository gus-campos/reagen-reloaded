import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Plugins
import vuetify from '@/app/plugins/vuetify.ts';

// Estilo
import '@/styles/main.scss';
import 'vuetify/styles';

// App
import App from '@/app/App.vue';
import router from '@/app/router/index.ts';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
