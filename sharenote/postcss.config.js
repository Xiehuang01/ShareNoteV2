// 自动把 px 转 rem
export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16, // 与 rem.js 保持一致--px/16转换为rem
      propList: ['*'], // 所有 px 转 rem
      exclude: /node_modules/i // 不转 element-plus 的 px
    }
  }
}
