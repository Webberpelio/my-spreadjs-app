<script setup>
</script>

<template>
  <div class="app-wrapper">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-links">
        <router-link to="/" class="nav-link">表格设计器</router-link>
        <router-link to="/template-list" class="nav-link">模板列表</router-link>
      </div>
    </nav>
    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.navbar {
  background: #333;
  padding: 0 20px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  display: inline-block;
  padding: 14px 20px;
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.nav-link:hover {
  background: #555;
}

.nav-link.router-link-active {
  background: #4a90d9;
}
</style>