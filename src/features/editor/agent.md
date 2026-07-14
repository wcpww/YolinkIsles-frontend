# 注意事项

1. 尽量在该目录下（features/editor）做变动，如果需要import其他feature的组件，使用复制的方式；这样做是为了PR的时候可以避免冲突。
2. 把query解耦到hooks；用于显示的Page Component应该放到pages下，可以参考feature/home的做法

# 数据模型

和features/post-detail中post相同

# 要求

我想完成一个发布文章的界面
1. 实现一个用于编辑的组件，可以让用户输入post中的字段，例如标题、tags等。
2. 对于contentJson，应该使用tiptap的toJSON方法，请参考features/post-detail/mock中的示例
3. 用户可以编辑文本、设置封面图片（你先不用管图片url的问题，但要写好图片上传的逻辑，后续我会增加图片对象存储的功能）
4. 用户可以将草稿存储在本地，也可以马上上传，上传后应该显示上传成功，并且回到主页。

# 接口

你需要完成createPost接口，请在editor/下写好接口文档

完成以上工作后，用一个Md写接下来可以做的事情
