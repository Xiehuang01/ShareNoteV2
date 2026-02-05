import express from "express";
import axios from "axios";
import crypto from "crypto";

const router = express.Router();

// geetest极验配置信息
const geetestConfig = {
  id: '0646f178d6514fc91a6bc0aa848b5b7d', //公钥 public key
  key: 'b925e84653f29440fcbbd7bd5b039086',// 密钥 secret key
  server:'http://gcaptcha4.geetest.com/validate' // 服务地址server url
}

// 设置路由处理函数，用于验证
router.get('/geetest', async (req, res) => {

  console.log('login-req', req.query); // 打印请求查询参数

  // 收到前端传来的参数
  const { captcha_id,lot_number,captcha_output,pass_token,gen_time } = req.query

  // 如果没有该参数直接报错
  if(!captcha_id){
    throw new Error('请求参数有误')
  }

  // captcha_id 错误
  if(captcha_id !== geetestConfig.id){
    throw new Error('请求参数有误')
  }

  // 生成签名, 使用标准的hmac算法，使用用户当前完成验证的流水号lot_number作为原始消息message，使用客户验证私钥作为key
  // 采用sha256散列算法将message和key进行单向散列生成最终的 “sign_token” 签名
  const sign_token = crypto.createHmac("sha256", geetestConfig.key).update(lot_number, 'utf8').digest('hex'); 

  // 向极验发送二次校验接口验证，响应json数据如：{"result": "success", "reason": "", "captcha_args": {}}
  const response = await axios({
    method: "get",
    url:`${geetestConfig.server}`,
    params: {
      captcha_id,
      lot_number,
      captcha_output,
      pass_token,
      gen_time,
      sign_token
    },
  });

  // geetest服务响应异常
  if(response.status != 200){
    throw new Error('Geetest Response Error' + response.status)
  }
  // 验证失败
  if(response.data.result != 'success'){
    throw new Error('Geetest Validate Failed, Reason:' + response.data.reason)
  }

  // 验证成功返回结果
  res.send(response.data).json();
})

export default router;
