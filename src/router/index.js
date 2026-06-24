import { createRouter, createWebHistory } from 'vue-router';
import SpreadSheet from '../views/SpreadSheet.vue';
import DataFill from '../views/DataFill.vue';
import TemplateList from '../views/TemplateList.vue';

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
  },
  {
    path: '/template-list',
    name: 'TemplateList',
    component: TemplateList
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;