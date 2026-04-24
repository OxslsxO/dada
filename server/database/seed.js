require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Activity = require('../src/models/Activity');
const config = require('../src/config');

// 测试用户数据
const testUsers = [
  { openid: 'test_openid_1', nickname: '小明', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', gender: 1 },
  { openid: 'test_openid_2', nickname: '小红', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', gender: 2 },
  { openid: 'test_openid_3', nickname: '张三', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey', gender: 1 },
  { openid: 'test_openid_4', nickname: '李四', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sadie', gender: 1 },
  { openid: 'test_openid_5', nickname: '王五', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oreo', gender: 2 }
];

// 活动数据模板
const activityTemplates = [
  { title: '周末一起吃火锅', description: '周末找饭搭子一起吃火锅，AA制，地点在朝阳大悦城', categoryName: '饭搭子', maxMembers: 6, tags: ['火锅', 'AA', '周末'], address: '北京市朝阳区朝阳大悦城' },
  { title: '每周羽毛球', description: '每周六下午打羽毛球，地点在海淀体育馆，需要有基础', categoryName: '运动搭子', maxMembers: 8, tags: ['羽毛球', '运动', '周末'], address: '北京市海淀区海淀体育馆' },
  { title: '王者荣耀开黑', description: '晚上一起开黑打王者，钻石段位以上，来的加', categoryName: '游戏搭子', maxMembers: 5, tags: ['王者荣耀', '游戏', '开黑'], address: '线上' },
  { title: '探店下午茶', description: '周末一起去探店喝下午茶，拍美照，喜欢拍照的来', categoryName: '探店搭子', maxMembers: 4, tags: ['下午茶', '探店', '拍照'], address: '北京市东城区南锣鼓巷' },
  { title: '一起自习', description: '找学习搭子一起去图书馆自习，互相监督', categoryName: '学习搭子', maxMembers: 3, tags: ['学习', '自习', '图书馆'], address: '北京市西城区国家图书馆' },
  { title: '周末去天津', description: '周末一起坐高铁去天津玩，吃狗不理包子，逛五大道', categoryName: '出行搭子', maxMembers: 6, tags: ['天津', '周末', '短途'], address: '北京南站集合' },
  { title: '看电影', description: '最新上映的大片，一起去看，看完可以讨论剧情', categoryName: '娱乐搭子', maxMembers: 4, tags: ['电影', '娱乐', '爆米花'], address: '北京市朝阳区CBD万达影城' },
  { title: '健身打卡', description: '互相监督健身打卡，每周至少3次，地点在丰台健身中心', categoryName: '健身搭子', maxMembers: 5, tags: ['健身', '运动', '打卡'], address: '北京市丰台区健身中心' },
  { title: '遛狗交朋友', description: '周末一起去公园遛狗，让狗狗也交朋友', categoryName: '宠物搭子', maxMembers: 6, tags: ['宠物', '狗狗', '公园'], address: '北京市朝阳区朝阳公园' },
  { title: '剧本杀组队', description: '周末一起玩剧本杀，情感本，有没有兴趣的', categoryName: '其他', maxMembers: 8, tags: ['剧本杀', '聚会', '推理'], address: '北京市海淀区五道口' },
  { title: '烧烤派对', description: '周末一起去户外烧烤，食材我来准备，大家AA', categoryName: '饭搭子', maxMembers: 10, tags: ['烧烤', '户外', '周末'], address: '北京市顺义区汉石桥湿地' },
  { title: '骑行计划', description: '周末骑行去香山，锻炼身体，欣赏风景', categoryName: '运动搭子', maxMembers: 6, tags: ['骑行', '香山', '风景'], address: '北京市海淀区五道口集合' },
  { title: '英雄联盟', description: '晚上一起玩LOL，有兴趣的来', categoryName: '游戏搭子', maxMembers: 5, tags: ['英雄联盟', '游戏', '开黑'], address: '线上' },
  { title: '逛宜家', description: '周末一起逛宜家，顺便吃个热狗', categoryName: '探店搭子', maxMembers: 4, tags: ['宜家', '购物', '周末'], address: '北京市朝阳区四元桥宜家' },
  { title: '考公学习小组', description: '一起准备公务员考试，互相讨论题目', categoryName: '学习搭子', maxMembers: 5, tags: ['考公', '学习', '讨论'], address: '北京市海淀区中关村' },
  { title: '周末去北戴河', description: '周末去北戴河看海，两天一夜，有兴趣的联系', categoryName: '出行搭子', maxMembers: 6, tags: ['北戴河', '看海', '周末'], address: '北京站集合' },
  { title: 'KTV唱歌', description: '周末一起去唱歌，AA制，麦霸快来', categoryName: '娱乐搭子', maxMembers: 8, tags: ['KTV', '唱歌', '周末'], address: '北京市朝阳区工体KTV' },
  { title: '夜跑团', description: '每晚8点一起夜跑，5公里，路线在奥林匹克公园', categoryName: '健身搭子', maxMembers: 10, tags: ['夜跑', '健身', '跑步'], address: '北京市朝阳区奥林匹克公园' },
  { title: '猫咪聚会', description: '带上自家猫咪一起来聚会，交流养猫心得', categoryName: '宠物搭子', maxMembers: 6, tags: ['猫咪', '宠物', '交流'], address: '北京市朝阳区望京' },
  { title: '读书会', description: '每月一次读书会，分享读书心得，本月主题：科幻小说', categoryName: '其他', maxMembers: 8, tags: ['读书', '分享', '学习'], address: '北京市西城区西单图书大厦' }
];

async function seedDatabase() {
  try {
    console.log('正在连接 MongoDB...');
    await mongoose.connect(config.db.uri);
    console.log('✅ MongoDB 连接成功\n');

    // 清空现有数据（可选）
    console.log('正在清空现有测试数据...');
    await User.deleteMany({ openid: { $regex: '^test_openid_' } });
    await Activity.deleteMany({});
    console.log('✅ 已清空现有测试数据\n');

    // 创建测试用户
    console.log('正在创建测试用户...');
    const users = await User.create(testUsers);
    console.log('✅ 已创建', users.length, '个测试用户\n');

    // 创建测试活动
    console.log('正在创建测试活动...');
    const activities = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const template = activityTemplates[i % activityTemplates.length];
      const creatorIndex = i % users.length;
      
      // 生成活动时间（从今天开始的未来14天内）
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + Math.floor(Math.random() * 14) + 1);
      startTime.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 2) * 30, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2 + Math.floor(Math.random() * 3));

      const signupDeadline = new Date(startTime);
      signupDeadline.setDate(signupDeadline.getDate() - 1);

      // 生成当前参与人数（1 到 maxMembers-1）
      const currentMembers = 1 + Math.floor(Math.random() * (template.maxMembers - 1));

      const activity = {
        creatorId: users[creatorIndex]._id,
        title: template.title,
        description: template.description,
        categoryName: template.categoryName,
        images: [],
        startTime,
        endTime,
        signupDeadline,
        address: template.address,
        latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
        longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
        maxMembers: template.maxMembers,
        currentMembers,
        tags: template.tags,
        status: 'published',
        cover: '',
        requirements: '',
        viewCount: Math.floor(Math.random() * 100),
        createdAt: now,
        updatedAt: now
      };

      activities.push(activity);
    }

    await Activity.create(activities);
    console.log('✅ 已创建', activities.length, '个测试活动\n');

    console.log('🎉 数据库填充完成！');
    console.log('\n测试数据概览:');
    console.log('- 用户数:', users.length);
    console.log('- 活动数:', activities.length);
    console.log('- 数据库: dada');

    process.exit(0);
  } catch (err) {
    console.error('❌ 数据库填充失败:', err);
    process.exit(1);
  }
}

seedDatabase();
