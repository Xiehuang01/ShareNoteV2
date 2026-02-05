# HTML学习

## 1.基本框架

~~~html
<!DOCTYPE html> <!-- 文档类型的声明，不属于基本框架里面 -->
<html lang = "en"> <!--lang = "en" 表示语言是英文-->
    <head>
        <!--非用户阅读：网页信息-->
        <title>HTML基础框架_学习</title> 
        <meta charset="UTF-8"> <!-- 编码格式 -->
    </head>
    <body>i
        <!--给用户阅读-->
        Hello,HTML!
    </body>
</html>
~~~



## 2.标题标签

### 2.1基础

~~~html
<body>
    <h1>一级标签</h1>
    <h2>二级标签</h2>
    <h3>三级标签</h3>
    <h4>四级标签</h4>
    <h5>五级标签</h5>
    <h6>六级标签</h6>
</body>
<!--快捷生成：h$*6-->
~~~

![image-20250831172307308](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250831172307308.png)

### 2.1属性

### align：left/center/right [靠左/居中/靠右]





## 3.段落|换行|水平线

### 段落p：

~~~html
<p>Hello,HTML!</p>
~~~

使用段落标签，方便后续修改和调整样式



### 换行br：

~~~html
<p>Hello,HTML!<br>Hello,HTML!</p>
~~~



### 水平线hr：

~~~html
<hr>
~~~

**属性：color|width|size|align  [颜色| 水平线长度|水平线粗细|位置(默认居中)]**

~~~html
<hr color="green" width="300px" size="20px" align="left/right">
~~~





## 4.图片标签

## 4.1基础

~~~html
<img src="image.png" alt="课程学习截图" width="100px" title="课程学习截图">
~~~

- **src：**选择图片的路径（图片必须与index.html在同一个文件下）
- **alt：**当图片无法加载时显示的图片名称
- **width：**图片的宽度 （只设置此项时，高度会随着宽度的变化自动调整）

- **heigh：**图片的高度 （只设置此项时，宽度会随着高度的变化自动调整）
- **title：**当鼠标指针停留在图片上，鼠标指针附近会显示title中的文字



### 4.2图片路径

- **绝对路径：**从盘符开始具体地址：c:/user/learn/1.png

- **相对路径：**
  1. 同级关系：在同一文件夹下面，直接通过名字或者./访问：./1.png
  2. 子级关系：访问者在某一同级文件夹下：./文件夹名/1.png
  3. 父级关系：访问者在上级文件夹中，通过../访问上一级文件夹：../1.png
- **网络路径：**具体的网地址：http://......





## 5.超文本链接

~~~html
<a href="https://www.baidu.com" target="_blank">百度一下</a>
<!--target="_blank：不覆盖当前的标签页打开-->
~~~

- 没访问：蓝色下划线
- 访问过：紫色下划线
- 点击时：红色下划线

**使用text-decoration: none;来去除下划线，使用color: 指定固定的颜色。**

**锚点链接：**

1. 用id定义锚点目标

   ~~~html
   <h1 id="a">1.HTML基本框架<h1>
   ~~~

2. 用<a>和#来使用和标记锚点目标

   ~~~html
   <a href="a">1</a>
   ~~~

   





## 6.文本标签属性

~~~html
<em>着重</em>提高SEO
<i>斜体</i>
<b>加粗</b>
<strong>加重语气</strong>提高SEO
<span>元素没有特殊含义</span>
<del>删除线</del>
~~~



## 7.有序列表

~~~html
<ol type="1/a/A/i/I [数字/小写字母/大写字母/小写罗马数字/大写罗马数字]">
    <li>HTML</li>
	<li>CSS</li>
    <li>JavaScript</li>
</ol>
~~~

**嵌套有序列表：**

~~~html
<ol type="A">
    <li>前端</li>
        <ol type="a">
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
        </ol>
    <li>后端</li>
    <li>数据库</li>
</ol>
~~~







## 8.无序列表

~~~html
<ul type="disc/circle/square/none [实心圆/空心圆/方块/空]">
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ul>
<!--快捷生成：ul>li*5-->
~~~

**嵌套无序列表：**

~~~html
<ul type="disc">
    <li>前端</li>
        <ul type="circle">
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
        </ul>
    <li>后端</li>
    <li>数据库</li>
</ul>
~~~

**无序导航的常见应用：**导航栏

**去除无需标签的标点：**list-style: none;





## 9.表格标签

**<table></table>表格 <tr></tr>行 <td></td>列**

**<thead></thead>表头 <tbody></tbody>表体**

~~~html
<table border="1px" width="200px" height="200px">
    <thead>
    	<!-- <th> 表示：表头单元格（table header cell） -->
        <!-- <td> 表示：普通单元格（table data cell） -->
        <th>A组</th>
        <th>B组</th>
        <th>C组</th>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>2</td>
            <td>3</td>
        </tr>
        <tr>
            <td>4</td>
            <td>5</td>
            <td>6</td>
        </tr>
        <tr>
            <td>7</td>
            <td>8</td>
            <td>9</td>
        </tr>    
    </tbody>
</table>
~~~

**属性：border/width/height [边框/宽度/高度]**

![image-20250831192248578](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250831192248578.png)



**合并单元格：**

- 水平合并：colspan （合并列） 

- 垂直合并：rowspan（合并行）

~~~html
<table border="1px" width="200px" height="200px">
    <thead>
        <!-- <th> 表示：表头单元格（table header cell） -->
        <!-- <td> 表示：普通单元格（table data cell） -->
        <th>A组</th>
        <th>B组</th>
        <th>C组</th>
    </thead>
    <tbody>
        <tr>
            <td colspan="2">1 2</td>
            <td rowspan="2">3<br>6</td>
        </tr>
        <tr>
            <td colspan="2" rowspan="2">4 5<br>7 8</td>
        </tr>
        <tr>
            <td>9</td>
        </tr>    
    </tbody>
</table>
~~~

![image-20250831192258384](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250831192258384.png)







## 10.表单

### 10.1 基本

~~~html
<form action="服务器地址" method="get/post [提交数据：少量数据/大量数据]" name="表单名称">控件</form>
~~~

`get`：数据在 URL 上，适合少量查询	`post`：数据放在请求体里，适合提交表单、密码等

**基本控件：**

- 输入框(表单域)
- 按钮(表单按钮)

~~~html
 <form>
    <input>
    <!--提交按钮使用方法1--><input type="submit">
    <!--提交按钮使用方法2：<button>提交</button>-->
</form>
~~~

**表单元素：**

- **type：**

  - 文本框：type="text"

  - 密码框：type="password"

  - 提交按钮：type="submit"(点击按钮，将数据传输给服务器)

    ​				   通过 value来替换文本
    
  - 必须勾选：type="radio"(通过name来分组，cheacked用于设置默认选中选项)
  
  - 多选勾选：type="checkbox"
  
  - 上传文件：type=“file”(通过multiple实现上传多个文件，通过accpet规定上传文件的类型)

~~~html
<from>
    <input type="text" name="账号"><br>
    <input type="password" name="密码"><br>
    <input type="submit" value="登录"> <input type="submit" value="注册">
    <br>
    <p>我已阅读并同意用户使用协议</p>
    <input type="radio" value="agree" name="用户使用协议" checked>同意
    <input type="radio" value="disagree" name="用户使用协议">不同意
    <br>
    <p>选择你感兴趣的分区：</p>
    <input type="checkbox" name="hobby" value="数码" checked>数码专区
    <input type="checkbox" name="hobby" value="美食">美食达人
    <input type="checkbox" name="hobby" value="体育">体育竞技
    <input type="checkbox" name="hobby" value="音乐">音乐专区
    <input type="checkbox" name="hobby" value="其它">其它
    <br>
    <p>请选择你要上传的头像</p>
    <input type="file" name="头像" accept=".jpg,.png">
    <br>
</from>
~~~



### 10.2 其它控件

1. **按钮：**

   ~~~html
   <button></button>
   ~~~

   - 属性：disabled：禁用按钮

2. **下拉列表：**

   ~~~html
   <select name="numberChoose" id="数字选择">
       <option value="1">1</option>
       <option value="2">2</option>
       <option value="3">3</option>
   </select>
   ~~~

   - select属性：

     ​	**name：**是用于提交表单时，传给服务器的参数名

     ​	**id：**方便css和js的定位

   - option属性：

     ​	**selected：**将此option设定为默认选择项

3. **多行文本输入框：**

   ~~~html
   <textarea></textarea>
   ~~~

   **属性：**

   - name：表单名字
   - placeholder：提示信息
   - cols：可直接显示最大文字输入的列数
   - rows：可直接显示最大文字的的行数

4.**辅助标签**

关联某些表单控件，从而提高用户的使用体验

~~~html
<!-- 方法一 -->
<br>
	<input type="checkbox" id="创建桌面快捷方式" name="创建桌面快捷方式">
<label for="创建桌面快捷方式">创建桌面快捷方式</label>

<!-- 方法二 -->
<br>
<label>创建桌面快捷方式
	<input type="checkbox" id="创建桌面快捷方式" name="创建桌面快捷方式">
</label>
~~~







## 11.块元素和行内元素(内联元素)

|               块级元素               |        行内元素(内联元素)        |
| :----------------------------------: | :------------------------------: |
|    独占页面一行，自上向下垂直排列    |            不独占一行            |
|        可以设置width和height         |     不可以设置width和height      |
|  一般可以包含行内元素和其他块级元素  | 一般包含同类元素，不包含块级元素 |
| div、form、h1~h6、hr、p、table、ul等 |   a、b、em、i、span、strong等    |

**【特殊】行内块级元素(特点：不独占一行，但能调整宽高):**button、img、input







## 12.div和HTML5新增标签

### 12.1 div(容器元素)

方便分组管理不同的元素，从而实现网页对应的不同功能性模块

~~~html
<div id="容器名称"> </div>
~~~



### 12.2 H5新增标签

**在H5新增的特性中，可以直接通过如下标签来代替传统的`<div id="容器名称"> </div>`**

~~~html
<div>div容器标签</div>
<header>头部标签</header>
<nav>导航栏</nav>
<article>
    代表一个独立完整的内容块，例如一篇帖子、一篇博客、一个用户评论
    <section>定义文档中的节(例如:章节、页眉、页脚等)</section>
</article>
<aside>侧边栏</aside>
<footer>脚部</footer>
~~~

**【注意】这些新增的H5特性不兼容老版本的浏览器**

![image-20250901111517114](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250901111517114.png)







## 13.视频与音频

### 13.1 视频

~~~html
<video src="video.mp4"></video>
<video src="video.mp4" controls width/height="300px"></video>
~~~

- controls：显示浏览器自带的播放控件
- autoplay：自动播放（想要自动播放，必须要带上muted静音属性）
- loop：循环播放
- muted：静音
- poster：预览图像（没播放时的视频封面）

**视频的兼容性写法：**

~~~html
<video controls>
	<source src="video.mp4" type="video/mp4">
	<source src="video.ogg" type="video/ogg">
	<source src="video.webm" type="video/webm">
    <p>您的浏览器不兼容，视频无法播放</p>
</video>
~~~

- 以上的写法中<video>的src会自动在下列的<source>中依次查找可以兼容并播放的资源
- type属性的作用是让浏览器快速通过type标签的视频类型来判断是否播放，而不是逐一尝试



### 13.2 音频

~~~html
<audio src="music"></audio>
<audio src="music" controls></audio>
~~~

- controls：显示浏览器自带的播放控件
- autoplay：自动播放（需通过JavaScript来实现自动播放）
- loop：循环播放
- muted：静音

**音频的兼容性写法：**

~~~html
<audio controls>
    <source src="music.mp3" type="audio/mp2">
    <p>您的浏览器不兼容，音频无法播放</p>
</audio>
~~~







# CSS学习

## 1.基本框架

~~~css
选择器{
 样式(属性)1;
 样式(属性)2;
 样式(属性)3;
 ......
}
~~~

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        h1{
            color: green;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <h1>Hello,CSS!</h1>
</body>
</html>

<!--中文选择器-->

~~~



## 2.CSS的引入方式

- **内联样式：**

  ~~~css
  <h1 style="color: green;font-size: 20px;">Hello,CSS!</h2>
  ~~~

- **内部样式：**

  只能在同个.html文件中使用

  ~~~css
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
          #你好{
              color: green;
              font-size: 20px;
          }
      </style>
  </head>
  <body>
      <h1 id="你好">Hello,CSS!</h1>
      <h2 style="color: green;font-size: 20px;">Hello,CSS!</h2>
  </body>
  </html>
  ~~~

- **外部样式：**

  可以在多个不同的.html文件中使用

  ~~~css
  <!-- 外部样式.CSS -->
  #外部样式{
      color: red;
      font-size: 30px;
  }
  
  <!-- 1.html -->
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link rel="stylesheet" href="外部样式.css">
  </head>
  <body>
      <h1 id="外部样式">外部样式1</h1>
      <a href="./2.html">外部样式2</a>
  </body>
  </html>
  
  <!-- 2.html -->
   <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link rel="stylesheet" href="外部样式.css">
  </head>
  <body>
      <h1 id="外部样式">外部样式2</h1>
  </body>
  </html>
  
  ~~~







## 3.选择器

### 3.1 全局选择器

~~~css
*{
    <!--为所有的元素进行样式设置-->
}
~~~



### 3.2 元素选择器

~~~css
p/b/div{
    <!--对某类标签进行样式设置-->
}
~~~



### 3.3 类选择器

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
    .你好{
        color: green;
        font-size: 20px;
    }
	.hello{
    	font-size:20px;   
	}
    </style>
</head>
<body>
    <h1 class="你好 hello">Hello,CSS!</h1>
</body>
</html>
~~~



### 3.4 ID选择器

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        #你好{
            color: green;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <h1 id="你好">Hello,CSS!</h1>
    <h2 style="color: green;font-size: 20px;">Hello,CSS!</h2>
</body>
</html>
~~~

**【注意】ID选择器是唯一的，且ID不能以数字开头**



### 3.5 合并选择器

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
    h1,h2{
        color: green;
        font-size: 20px;
    }
    </style>
</head>
<body>
    <h1>Hello,</h1>
    <h2>CSS!</h2>
</body>
</html>
~~~



### 3.6 选择器的优先级

**权重(越大越好)：**

- 元素选择器：1
- 类选择器：10
- ID选择器：100

**【注意】：**行内样式的权重最大(1000)，同级别的情况下按照代码顺序覆盖







## 4.字体属性

- **color：**颜色设置(1.英文 / 2.rgb(参数,参数,参数,透明的0~1) / 3.#颜色的十六进制数)
- **font-size：**字体大小设置(chrome浏览器能接受的最小字体是12px)
- **font-weight：**字体粗细设置(blod[粗]/lighter[细]/数字(400等于lighter,700等于blod))
- **font-style：**字体斜体(italic[斜体]/normal[正常])
- **font-family：**字体样式选择("微软雅黑")







## 5.背景属性

- background-color：设置元素的背景颜色

- background-image：设置元素的背景图片(url:"图片的路径")

- background-repeat：设置元素背景图片的平铺方式(repeat-x/repeat-y/no-repeat [水平平铺/垂直平铺/不平铺])

- background-size：设置元素背景图片的大小(xpx ypx/x% y%/cover[自动填充裁剪]/contain[尽可能自动填充不裁剪])

- backgroud-postion：设置背景图片的初始渲染位置

  (left top[默认]/left center/left bottom/right top/right center/right bottom/center top/center center/center bottom/x% y%/xpx ypx)  







## 6.文本属性

- text-align：left/center/right [靠左/居中/靠右]
- text-decoration：underline/overline/line-through [下划线/上划线/删除线]
- text-transform：captialize/uppercase/lowercase [首字母大写/全部大写/全部小写]
- text-indent：参数px [设置文本的首行缩进方式]
- line-height：设置行高







## 7.表格属性

- 【table,td】border：1px solid black [边框粗细 边框样式:实线 边框颜色]
- 【table】border-collapse：collapse [折叠边框(双边框变单边框)]
- 【td】width：设置单元格的宽度
- 【td】height：设置单元格的高度
- 【td】text-align：left/center/right {水平}[靠左/居中/靠右]
- 【td】vertical-align：top/center/bottom {垂直}[靠上/居中/靠下]
- 【td】padding：参数px（设置单元格内文字上下左右距离单元格边框的距离）
- 【table,td,th】background-color：设置单元格的背景颜色
- 【table,td,th】color：设置表格中指定文字的颜色







## 8.关系选择器

### 8.1 后代选择器

~~~html
E F{

}
~~~

选择E元素中所有的后代F元素，例如ul包含下**所有的**li元素(包括ol中的li元素)

~~~html
<ul>
    <li></li>
    <li></li>
    <div>
    	<ol> 
            <li></li>
            <li></li>
        </ol>
    </div>
</ul>
~~~



### 8.2 子代选择器

~~~html
E>F{

}
~~~

选择E元素中的第一个后代F元素，例如ul包含**下一级**的li元素(不包括ol中的li元素)

~~~html
<ul>
    <li></li>
    <li></li>
    <div>
    	<ol> 
            <li></li>
            <li></li>
        </ol>
    </di、v>
</ul>
~~~



### 8.3 相邻兄弟选择器

~~~html
E+F{

}
~~~

选择E元素同级且相邻的**下一行**F元素，例如`<h3>A</h3>`的相邻是`<p>B</p>`

~~~html
<h3>A</h3>
<p>B</p>
<p>C</p>
~~~



### 8.4 通用兄虎选择器

### 

~~~html
E~F{

}
~~~

选择E元素同级的**所有的**指定的F元素，例如h3下面的所有p

~~~html
<h3>A</h3>
<p>B</p>
<p>C</p>
~~~







## 9.盒子模型

**盒子模型(box model)：**

- 所有HTML元素可以看作盒子，在CSS中，"box model"这一术语是用来设计和布局时使用

- CSS盒模型本质上是一个盒子，封装周围的HTML元素，它包括：外边距（margin），边框（border），内边距（padding），和实际内容（content）

![image-20250908114039533](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250908114039533.png)

- content：盒子中的内容，可以理解为选择的HTML元素
- padding：由content上下左右向外沿伸多少px(如果写两个参数，则表示上下是第一个参数的内边距，第二个参数为左右的内边距)
- border：参数px 边框样式 边框颜色 (围绕在content或者padding外面的边框)
- margin：透明的，用于设置元素与元素之间保持的距离，参数设置方式与padding同理

**【注意】padding和margin加上-left/right/top/bottom来单独设置不同方向上的边距距离**







## 10.弹性盒子模型

**弹性盒子模型(flex box)：**

- 弹性盒子是 CSS3 的一种新的布局模式
- CSS3 弹性盒是一种当页面需要适应不同的屏幕大小以及设备类型时，确保元素拥有恰当的行为的布局方式
- 引入弹性盒布局模型的目的是提供一种更加有效的方式来对一个容器中的子元素进行排列、对齐和分配空白空间



### 10.1 对于父级盒子开启弹性盒子模型：

~~~css
display:flex
~~~

【注意】：直接开启弹性盒子模型，其子级的盒子模型排列方式会默认变成水平从左到右摆放，可以通过以下代码修改其排列方式

~~~css
flex-direction:row / row-reverse / column / column-reverse
<!--从左到右 / 从右到左 / 从上到下 / 从下到上-->
~~~

- justify-content 调整**垂直**方向的位置：

  ~~~css
  justify-content: flex-start / flex-end / center
  <!--置顶 / 置底 / 居中-->
  ~~~

- align-items 调整**水平**方向上的位置：

  ~~~css
  align-items：flex-start / flex-end / center
  <!--靠左 / 靠右 / 居中-->
  ~~~



### 10.2 对于子元素上的属性：

根据弹性盒子所设置的扩展因子(权重)来设置位置的大小

~~~css
flex:1 / 2 / 3 / ...
~~~

**【注意】：一旦设置了flex属性，width就不在生效**



`flex: 1` 是 **Flexbox 布局**里非常常用的一个简写，它实际上是三个属性的简写形式：

```
flex: <flex-grow> <flex-shrink> <flex-basis>;
```

所以：

```
flex: 1;
```

等价于：

```
flex-grow: 1;
flex-shrink: 1;
flex-basis: 0%;
```

------

**各部分解释**

1. **flex-grow: 1**
   - 表示 **允许放大**，占据父容器剩余空间。
   - 比如父容器有 3 个子元素，都 `flex:1` → 平分剩余空间。
2. **flex-shrink: 1**
   - 表示 **允许缩小**，当空间不足时，按比例缩小。
3. **flex-basis: 0%**
   - 表示初始占据空间为 0，然后按 `flex-grow` 分配剩余空间。

------

**例子**

```
<div class="container">
  <div class="item">A</div>
  <div class="item">B</div>
  <div class="item">C</div>
</div>
.container {
  display: flex;
  width: 600px;
}

.item {
  flex: 1;           /* 三个 item 平分 600px 宽度 */
  height: 100px;
  background-color: pink;
  margin: 5px;
}
```

- 结果：三个 `div` 宽度相等，每个约 200px（减去 margin）。
- 如果其中一个写 `flex: 2`，它就会占据两倍空间。

1. **什么叫占据两倍空间**

假设我们有一个容器：

```
<div class="container">
  <div class="item a">A</div>
  <div class="item b">B</div>
  <div class="item c">C</div>
</div>
.container {
  display: flex;
  width: 600px;
}

.item.a { flex: 1; }
.item.b { flex: 1; }
.item.c { flex: 2; }
```

------

2. **flex 的分配规则**

- `flex` 数字表示 **占据剩余空间的比例**
- 这里 `a:1, b:1, c:2`，所以总比例 = 1 + 1 + 2 = 4
- 剩余空间会按比例分配：
  - a → 1/4
  - b → 1/4
  - c → 2/4 = 1/2

------

3. **宽度计算**

- 容器总宽度 600px
- 假设没有 margin/padding
- 空间分配结果：
  - a: 150px
  - b: 150px
  - c: 300px（比 a 或 b 宽 **两倍**）







## 11.浮动

~~~css
float:left / right; [向左浮动/向右浮动]
~~~

通过设置浮动来让某个元素脱离文档流，从而实现从左到右的排列方式（相当于上移图层）







## 12.清除浮动

### 12.1 浮动的副作用

- 浮动元素会造成**父级元素高度塌陷**
- **后续元素会受到影响**

~~~css
<!--父级元素的高度塌陷的情况：-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .A{
            width: 500px;
            /* height: 500px; */
            background-color: rgb(255, 216, 254);
        }
        .A .a{
            width: 100px;
            height: 100px;
            background-color: rgb(253, 126, 255);
            margin: 5px;
            float: left;
        }
    </style>
</head>
<body>
    <div class="A">
        <div class="a"></div>
        <div class="a"></div>
        <div class="a"></div>

    </div>
</body>
</html>
~~~

![image-20250908234523447](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250908234523447.png)

~~~css
<!--后续的元素受到影响-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .A{
            width: 500px;
            height: 500px;
            background-color: rgb(255, 216, 254);
        }
        .A .a{
            width: 100px;
            height: 100px;
            background-color: rgb(253, 126, 255);
            margin: 5px;
            float: left;
        }
        .b{
            width: 100px;
            height: 100px;
            background-color: rgb(126, 253, 255);
            margin: 5px;
        }
    </style>
</head>
<body>
    <div class="A">
        <div class="a"></div>
        <div class="a"></div>
        <div class="a"></div>
        <div class="b"></div>
    </div>
</body>
</html>
~~~

**如上代码所示，按逻辑没有浮动与A在同一级别不应该出现折叠的情况**

![image-20250909001808454](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909001808454.png)

**所以为了解决上图所示的情况，就应该通过清除浮动来解决问题**

~~~css
<!--方法一：对于子级元素清除浮动-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .A{
            width: 500px;
            height: 220px;
            background-color: rgb(255, 216, 254);
        }
        .A .a{
            width: 100px;
            height: 100px;
            background-color: rgb(253, 126, 255);
            margin: 5px;
            float: left;
        }
        .b{
            width: 100px;
            height: 100px;
            background-color: rgb(251, 0, 255);
            margin: 5px;
            clear: both
        }
    </style>
</head>
<body>
    <div class="A">
        <div class="a"></div>
        <div class="a"></div>
        <div class="a"></div>
        <div class="b"></div>
    </div>
</body>
</html>
~~~

![image-20250909002033118](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909002033118.png)

~~~css
<!--方法二：对于父级元素清除浮动-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .A{
            width: 500px;
            background-color: rgb(255, 216, 254);
            overflow: hidden;
            clear: both;
        }
        .A .a{
            width: 100px;
            height: 100px;
            background-color: rgb(253, 126, 255);
            margin: 5px;
            float: left;
        }
        .b{
            width: 100px;
            height: 100px;
            background-color: rgb(251, 0, 255);
            margin: 5px;
        }
    </style>
</head>
<body>
    <div class="A">
        <div class="a"></div>
        <div class="a"></div>
        <div class="a"></div>
    </div>
    <div class="b"></div>
</body>
</html>
~~~

![image-20250909002403458](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909002403458.png)

~~~css
<!--方法三：伪对象消除法-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .A{
            width: 500px;
            background-color: rgb(255, 216, 254);
        }
        .A::after{
            content: "";
            display: block;
            clear: both;
        }

        .A .a{
            width: 100px;
            height: 100px;
            background-color: rgb(253, 126, 255);
            margin: 5px;
            float: left;
        }
        .b{
            width: 100px;
            height: 100px;
            background-color: rgb(251, 0, 255);
            margin: 5px;
        }
    </style>
</head>
<body>
    <div class="A">
        <div class="a"></div>
        <div class="a"></div>
        <div class="a"></div>
    </div>
    <div class="b"></div>
</body>
</html>
~~~

![image-20250909003015930](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909003015930.png)

详细解释见：[(图文详细)最通俗易懂的CSS 浮动float属性详解_div浮动属性float详解-CSDN博客](https://blog.csdn.net/qq_36595013/article/details/81810219)







## 13.定位

~~~css
position: relative / absolute / fixed; [相对定位 / 绝对定位 / 固定定位]
~~~

**【注意】absolute和fixed会脱离文档流，relative和absolute是相对与有possition的父级来定位的，如果父级没有position这个属性，则逐级向上寻找，直到找到顶层文档**

设定定位之后，可以通过left、top、right、bottom来调整不同方向上的位置



### 13.1 relative

不脱离文档流

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .a{
            width: 100px;
            height: 100px;
            background-color: rgb(255, 216, 250);
            position: relative;
            top: 50px;
            left: 50px;
        }
    </style>
</head>
<body>
    <div class="a"></div>
</body>
</html>
~~~

![image-20250909021314098](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909021314098.png)



### 13.2 absolute

脱离文档流

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .a{
            width: 100px;
            height: 100px;
            background-color: rgb(255, 216, 250);
            position: relative;
            top: 50px;
            left: 50px;
        }
        .b{
            width: 150px;
            height: 150px;
            background-color: rgb(255, 147, 251);
            position: absolute;
            top: 100px;
            left: 100px;
        }
    </style>
</head>
<body>
    <div class="a"></div>
    <div class="b"></div>
</body>
</html>
~~~

![image-20250909021653870](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909021653870.png)

**【注意】每设置一次绝对定位就会往上浮动一层**



### 13.3 fixed

脱离文档流，绝对定位会固定元素，位置不随着页面的滚动而改变位置

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .a{
            width: 100px;
            height: 100px;
            background-color: rgb(255, 216, 250);
            position: relative;
            top: 50px;
            left: 50px;
        }
        .b{
            width: 150px;
            height: 150px;
            background-color: rgb(255, 147, 251);
            position: absolute;
            top: 100px;
            left: 100px;
        }
        .c{
            width: 200px;
            height: 200px;
            background-color: rgb(255, 76, 255);
            position: fixed;
            top: 150px;
            left: 150px;
        }
        h3{
            height: 3500px;
        }
    </style>
</head>
<body>
    <div class="a"></div>
    <div class="b"></div>
    <div class="c"></div>
    <h3></h3>
</body>
</html>
~~~

![image-20250909022815988](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909022815988.png)

![image-20250909022557758](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909022557758.png)



### 13.4 z-index的用法

通过设置z-index设置层级的覆盖优先级

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .a{
            width: 100px;
            height: 100px;
            background-color: rgb(255, 216, 250);
            position: relative;
            top: 50px;
            left: 50px;
            z-index: 10;
        }
        .b{
            width: 150px;
            height: 150px;
            background-color: rgb(255, 147, 251);
            position: absolute;
            top: 100px;
            left: 100px;
            z-index: 5;
        }
        .c{
            width: 200px;
            height: 200px;
            background-color: rgb(255, 76, 255);
            position: fixed;
            top: 150px;
            left: 150px;
            z-index: 0;
        }
        h3{
            height: 3500px;
        }
    </style>
</head>
<body>
    <div class="a"></div>
    <div class="b"></div>
    <div class="c"></div>
    <h3></h3>
</body>
</html>
~~~

![image-20250909023703626](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909023703626.png)







## 14. CSS3的新特性

### 14.1 圆角

~~~css
border-radius: 参数px;
~~~

- 四个值：左上-右上-右下-左下（顺时针）
- 三个值：左上-右上和左下-右下
- 两个值：左上和右下-右上和左下
- 一个值：四个角

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .A{
            display: flex;
        }
        .A div{
            width: 100px;
            height: 100px;
            background-color: rgb(255, 107, 243);
            margin: 10px;
            display: flex;
            font-size: 50px;
            font-weight: bold;
            color: white;
            justify-content: center;
            align-items: center;
        }
        .a{
            border-radius: 10px 30px 50px 70px;
        }
        .b{
            border-radius: 10px 30px 50px;
        }
        .c{
            border-radius: 10px 30px;
        }
        .d{
            border-radius: 30px;
        }

    </style>
</head>
<body>
    <div class="A">
        <div class="a">a</div>
        <div class="b">b</div>
        <div class="c">c</div>
        <div class="d">d</div>
    </div>
</body>
</html>
~~~

![image-20250909030250088](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909030250088.png)



### 14.2 阴影

~~~css
box-shadow: h-shadow v-shadow blur color;
~~~

- h-shadow：[必选]水平阴影的位置
- v-shadow：[必选]垂直阴影的位置
- blur：[可选]模糊距离
- color：[可选]阴影的颜色

~~~css
 box-shadow: 10px 10px 5px rgb(255, 197, 250);
~~~

![image-20250909031008000](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909031008000.png)







## 15.动画

- 动画是是一种样式变化到另外一个样式的效果

- 0%动画开始，100%动画结束

### 15.1 创建动画

~~~css
<style>
/* 方法一 */
    @keyframes animation1{
        0%{

        }
        50%{

        }
        100%{

        }
    }
    /* 方法二 */
    @keyframes animation2{
        from{

        }
        to{

        }
    }
</style>
~~~



### 15.2 使用动画

~~~css
animation: name duration timing-function delay iteration-count dirction;
~~~

- **name**：动画名称
- **duration**：动画持续时间
- **timing-function**：动画播放速率
  - ease：逐渐变慢
  - linear：匀速
  - ease-in：加速
  - ease-out：减速
  - ease-in-out：先加速后减速
- **delay**：动画的开始时间(延迟执行)
- **iteration-count**：动画循环播放次数，infinite为无线次数的循环
- **direction**：动画的播放方向
  - normal：向前播放(默认)
  - altermate：动画播放在第偶数次向前播放，第奇数次向反方向播放
- **animation-play-state**：动画的播放状态
  - running：播放
  - pause：停止播放

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .A{
            width: 100px;
            height: 100px;
            background-color: rgb(255, 0, 208);
            animation: animation1 3s linear 0s infinite normal;
        }
        /* div:hover 鼠标悬停于元素的上方时 */
        .A:hover{
            background-color: rgb(255, 176, 241);
            animation-play-state: paused;
        }
        @keyframes animation1{
            0%{
                background-color: rgb(255, 0, 208);
            }
            50%{
                background-color: rgb(255, 176, 241);
            }
            100%{
                background-color: rgb(255, 0, 208);
            }
        }
    </style>
</head>
<body>
    <div class="A"></div>
</body>
</html>
~~~

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .A{
            width: 100px;
            height: 100px;
            background-color: rgb(255, 0, 208);
            animation: animation1 3s linear 0s infinite normal;
        }
        /* div:hover 鼠标悬停于元素的上方时 */
        .A:hover{
            background-color: rgb(255, 176, 241); 
            animation: animation2 2s ease-in-out 0s infinite normal; /* 自动代替animation1 */
        }
        @keyframes animation1{
            0%{
                background-color: rgb(255, 0, 208);
            }
            50%{
                background-color: rgb(255, 176, 241);
            }
            100%{
                background-color: rgb(255, 0, 208);
            }
        }
        @keyframes animation2{
            0%{
                opacity: 1; /* 透明度 */
                transform: scale(1); /* 以元素的中心点缩对应的倍数 */
            }            
            50%{
                opacity: 0.5;
                transform: scale(1.05);
            }
            100%{
                opacity: 1;
                transform: scale(1);
            }
        }
    </style>
</head>
<body>
    <div class="A"></div>
</body>
</html>
~~~







## 16.meta标签

**VSCode生成的HTML基础架构中meta标签**

~~~html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
~~~

- 这行代码的作用是**让网页在移动设备上自适应屏幕宽度**，并设置初始缩放比例为 1。
- 简单来说，就是让你的网页在手机、平板等设备上显示得更合理，不会出现页面太大或太小，需要手动缩放的情况。







## 17.媒体查询

~~~css
<style>
    /* 手机 */
    @media screen and (max-width: 768px) {
        body {
            background-color:  #ffccef;
        }

    }
    /* 平板 */
    @media screen and (min-width: 769px) and (max-width: 996px) {
        body {
            background-color:  rgb(255, 139, 218);
        }
    }
    /* 电脑 */
    @media screen and (min-width: 996px) {
        body {
            background-color: rgb(255, 0, 174);
        }
    }
</style>
~~~

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 手机 */
        @media screen and (max-width: 768px) {
            body {
                background-color:  #ffccef;
            }
            #phone{
                display: block;
            }
            #pc{
                display: none;
            }
            
        }
        /* 平板 */
        @media screen and (min-width: 769px) and (max-width: 996px) {
            body {
                background-color:  rgb(255, 139, 218);
            }
            #phone{
                display: none;
            }
            #pc{
                display: none;
            }
        }
        /* 电脑 */
        @media screen and (min-width: 996px) {
            body {
                background-color: rgb(255, 0, 174);
            }
            #phone{
                display: none;
            }
            #pc{
                display: block;
            }
        }        
    </style>
</head>
<body>
    <h3 id="phone">手机下单，立享优惠！</h3>
    <h3 id="pc">电脑下单，立享优惠！</h3>
</body>
</html>
~~~

![image-20250909115640836](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909115640836.png)







## 18.CSS雪碧图(CSS精灵图)

### 18.1 雪碧图的作用：

- 减少图片的字节
- 减少网页的http请求，从而大大提高页面的性能



### 18.2 雪碧图的使用

![image-20250909121749814](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909121749814.png)

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .icon1  {
            /* span是行内元素(内联元素)，不能设置宽高 */
            /* 所以要通过display: block来将其变为块级元素 */
            /* 同理如果想要变成行内元素，可以通过display: inline来实现*/
            width: 45px;
            height: 45px;
            display: block;
            background-image: url(emoji.png);
            border:1px solid rgb(255, 0, 200);
            /* 改变图标的显示位置 */
            background-position: 0px -5px;
        }
    </style>
</head>
<body>
    <span class="icon1"></span>
</body>
</html>
~~~

![image-20250909122153013](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909122153013.png)

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .icons {
            display: flex;
        }
        .icon1  {
            /* span是行内元素(内联元素)，不能设置宽高 */
            /* 所以要通过display: block来将其变为块级元素 */
            /* 同理如果想要变成行内元素，可以通过display: iinline来实现*/
            width: 45px;
            height: 45px;
            display: block;
            background-image: url(emoji.png);
            border:1px solid rgb(255, 0, 200);
            /* 改变图标的显示位置 */
            background-position: 0px -5px;
            margin: 5px;
        }

        .icon2  {
            width: 45px;
            height: 45px;
            display: block;
            background-image: url(emoji.png);
            border:1px solid rgb(255, 0, 200);
            /* 改变图标的显示位置 */
            background-position: -210px -55px;
            margin: 5px;
        }

    </style>
</head>
<body>
    <span class="icons">
        <span class="icon1"></span>
        <span class="icon2"></span>
    </span>    
</body>
</html>
~~~

![image-20250909123419111](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909123419111.png)







## 19.字体图标

**使用方法：**

1. 去找到字体图标资源库，例如：[iconfont-阿里巴巴矢量图标库](https://www.iconfont.cn/?spm=a313x.collections_detail.i3.2.7fba3a81ZLaNYg)
2. 下载对应的代码
3. 通过Font class的方式引用图标：
   - 第一步：引入项目下面生成的 fontclass 代码：
     `<link rel="stylesheet" href="./iconfont.css">`
   - 第二步：挑选相应图标并获取类名，应用于页面：
     `<span class="iconfont icon-xxx"></span>`

~~~css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="./font/iconfont.css">
    <style>
        .google {
            font-size: 50px;
            color: rgb(255, 0, 230);
        }
        .chrome {
            font-size: 50px;
            color: rgb(255, 0, 230);
        }
    </style>
</head>
<body>
    <span class="iconfont icon-google google"></span>
    <span class="iconfont icon-chrome-fill chrome"></span>
</body>
</html>
~~~

![image-20250909130829827](C:\Users\13008\AppData\Roaming\Typora\typora-user-images\image-20250909130829827.png)







# Javascript学习

## 1.变量

### 1.1 变量的定义

~~~javascript
var num = 10;
~~~

**变量定义的规范，字母、_、$开头，其中数字不能开头**





### 1.2 变量提升

~~~javascript
console.log(a);
var a = 10;
~~~

按道理变量未定义应该报错，但是目前代码只会显示undefined，这就是变量提升，在JavaScript中hui默认把上面的代码，解析为如下代码

~~~javascript
var a;
console.log(a);
a = 10;
~~~





## 2.JavaScript文件的引入

**在head或者body标签中引入**

~~~javascript
<script src="本地对立JavaScript文件 或者 网路JavaScript文件"></script>
~~~



## 3.注释

- 单行注释：//
- 多行注释：/**/



## 4.JavaScript的输出

~~~javascript
//1.控制台输出
console.log("Hello，JavaScript!");
//2.弹窗输出
alert("Hello，JavaScript!");
//3.输出到页面上
document.write("Hello，JavaScript!");
~~~



## 5.数据类型

- **基础数据类型**：

  - 数值类型：var a = 10;
  - 字符串：var str = "Hello, JavaScript!";
  - 布尔类型：var flag = true;

- **合成数据类型：**

  var character1 = {

  ​	name:"xxx",

  ​	job: "法师",

  ​	road:”法师“

  }

- **空数据类型：**

  - null
  - undefined

  在开发中，null一般表示对象为空，而undefined一般表示的是数值为空(未赋值)，但本质两者没有什么区别，是历史遗留问题。



## 6.typeof运算符

~~~javascript
//1.判断数据类型
var a = 10;
var b = "Hello, JavaScript!";
console.log(typeof a);
console.log(typeof b);
-->number
-->string


~~~



## 7.运算符

### 7.1 算数运算符

### 7.2 赋值运算符

### 7.3 比较运算符

- **== 非严格比较：**只是比较值
- **=== 严格比较：**比较值和其数据类型

- **!= 非严相等：**只是比较值
- **!== 严格相等：**比较值和其数据类型



## 8.布尔运算符

- **取反 !**

  以下六个值取反为true

  - !null
  - !undefined
  - !0
  - !""
  - !NaN
  - !false

- **与 &&**

- **或 ||**



## 9.条件语句

### 9.1 if-else语句

### 9.2 switch语句

### 9.3 三目运算符



## 10.循环语句

### 10.1 for循环

### 10.2 while循环

### 10.3 break 和 continue

- **break跳出和结束循环**
- **continue跳出本次循环**



## 11.字符串

嵌套

