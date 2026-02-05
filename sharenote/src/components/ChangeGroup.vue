<script setup>
import { ref } from 'vue'

const mask = ref(null)
const changeGroup = ref(null)

// 关闭切换分组
const turnoffChangeGroup = () => {
  changeGroup.value.style.display = 'none'
  mask.value.style.display = 'none'
}
// 开启切换分组
const turnonChangeGroup = () => {
  changeGroup.value.style.display = 'flex'
  mask.value.style.display = 'flex'
}
defineExpose({
  turnonChangeGroup
})
</script>

<template>
  <!-- 切换分组 -->
  <div id="changeGroup" ref="changeGroup">
    <ul>
      <li><div>12345612345678901234561234567890</div></li>
      <li v-for="n in 8" :key="n"><div>123456</div></li>
    </ul>
    <div
      class="delNotice"
      style="width: 100%; text-align: center; font-size: 10px; margin-top: 5px"
    >
      &lt;&lt; 向左滑动退出分组
    </div>
  </div>

  <!-- 遮罩 -->
  <div id="mask-dialog" ref="mask" @click="turnoffChangeGroup"></div>
</template>

<!-- 窗口2--切换分组 -->
<style lang="scss" scoped>
#mask-dialog {
  display: none;
  width: 100vw;
  height: 100vh;
  position: absolute;
  background-color: rgba(20, 20, 20, 0.3);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(1px);
  z-index: 999;
}
#changeGroup {
  width: 500px;
  // height: 300px;
  min-height: 60px;
  max-height: 220px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: rgba(8, 15, 32, 0.15);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 0px;
  box-sizing: border-box;
  padding: 10px 15px;
  border-radius: 15px;
  display: none;
  flex-direction: column;
  justify-content: center;
  z-index: 1000;
  ul {
    // width: 100%;
    height: 100%;
    max-height: 200px;
    margin: 0;
    padding-left: 0;
    // padding-right: 10px; // 预留滚动条的位置
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
    overflow-y: auto;
    scrollbar-width: none;
    li {
      list-style: none;
      width: 100%;
      height: 40px;
      flex-shrink: 0;
      // background-color: pink;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.2s;
      div {
        width: 60%;
        text-align: center;
        transition: 0.2s;
        font-size: 17px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    li:nth-child(even) {
      border-top: 1px dotted rgb(75, 82, 97);
      border-bottom: 1px dotted rgb(75, 82, 97);
    }
    li:hover {
      background-color: rgba(15, 44, 48, 0.5);
      border-radius: 12px;
      color: rgb(22, 222, 156);
    }
    li:hover div {
      transform: scale(1.2);
    }
  }
  // 聚焦效果
  ul:hover li {
    filter: none;
    opacity: 1;
  }

  /* 关键点：当 hover 某个 li 时，让非 hover 的 li 模糊+变淡 */
  ul:hover li:not(:hover) {
    filter: blur(1.5px);
    opacity: 0.5;
  }
  ul:hover ~ .delNotice {
    filter: blur(1.5px);
    opacity: 0.5;
  }
}
</style>
