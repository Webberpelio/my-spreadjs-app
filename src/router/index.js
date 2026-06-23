import { createRouter, createWebHistory } from 'vue-router';
import SpreadSheet from '../views/SpreadSheet.vue';
import DataFill from '../views/DataFill.vue';

const routes = [
  {
    path: '/',
    name: 'SpreadSheet',
    component: SpreadSheet
  },
  {
    path: '/data-fill',
    name: 'DataFill',
    component: DataFill
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;