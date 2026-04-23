// 测试数据生成器
const { GridsDB, initDB } = require('./db.js');

// 类型与标签映射
const typeWithTags = {
  '饭搭子': ['火锅', '烧烤', '日料', '下午茶', '宵夜', '奶茶', '咖啡', '聚餐', '西餐', '自助餐'],
  '运动搭子': ['羽毛球', '篮球', '跑步', '游泳', '瑜伽', '骑行', '健身', '乒乓球', '足球', '网球'],
  '游戏搭子': ['王者荣耀', '原神', 'LOL', '桌游', '剧本杀', '电竞', '吃鸡', '手游', 'DOTA', 'CS'],
  '探店搭子': ['探店', '逛街', '打卡', '美食', '购物', '拍照', '网红店', '古着店', '书店', '美术馆'],
  '学习搭子': ['考研', '考公', '英语', '自习', '考证', '阅读', '学习', '备考', '编程', '设计'],
  '出行搭子': ['周边游', '露营', '自驾游', '看海', '爬山', '摄影', '旅行', '徒步', '骑行', '野餐'],
  '娱乐搭子': ['电影', 'KTV', '演唱会', '看展', 'livehouse', '音乐节', '话剧', '脱口秀', '密室', '桌游'],
  '健身搭子': ['健身', '撸铁', '瑜伽', '普拉提', '游泳', '跑步', '健身', '塑形', '跳舞', '拳击'],
  '宠物搭子': ['遛狗', '撸猫', '宠物聚会', '宠物摄影', '宠物训练', '宠物美容', '宠物公园', '宠物领养'],
  '其他': []
};

// 地点列表
const locations = [
  '朝阳', '海淀', '东城', '西城', '丰台', '石景山', '通州', '顺义', '昌平', '大兴',
  '南山', '福田', '罗湖', '宝安', '龙岗', '龙华', '坪山', '光明', '盐田', '大鹏',
  '浦东新区', '黄浦区', '静安区', '徐汇区', '长宁区', '普陀区', '虹口区', '杨浦区',
  '天河', '越秀', '海珠', '荔湾', '白云', '番禺', '黄埔', '花都', '南沙', '增城'
];

// 用户昵称列表
const nicknames = [
  '可乐不加冰', '阿柒', '夜猫', '小桃', '阳光男孩', '快乐女生', '美食家', 
  '运动达人', '游戏王', '文艺青年', '背包客', '铲屎官', '学霸', '健身狂人',
  '咖啡爱好者', '音乐迷', '摄影发烧友', '铲屎官', '烘焙师', '滑板少年'
];

// 标题模板
const titleTemplates = [
  '{type}，一起{tag}',
  '周末{tag}，缺人啦',
  '新手友好，{tag}组队',
  '长期{tag}固排',
  '今天有一起{tag}的吗',
  '周末{tag}局，速来',
  '{tag}爱好者集合',
  '下班后{tag}，有人来吗',
  '限{people}人，{tag}组队',
  '找个{tag}搭子'
];

// 描述模板
const descriptionTemplates = [
  '周末有空，想找几个朋友一起{tag}，新手也可以，大家开心最重要！',
  '平时工作比较忙，周末想放松一下，找志同道合的朋友一起{tag}。',
  '刚到这边，想多认识一些朋友，有共同爱好的可以约一下{tag}。',
  '每周都会组织{tag}活动，欢迎新老朋友加入，大家一起玩！',
  '找长期{tag}固排，最好是住在附近的，平时可以约一下。',
  '新手一枚，想找个师傅带带我{tag}，有耐心的朋友请联系！',
  '很久没{tag}了，手都痒了，有一起的吗？费用AA。',
  '计划已久的{tag}活动，现在还差几个人，感兴趣的赶紧报名！'
];

// 生成随机数
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 从数组中随机选择
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 从数组中随机选择多个
function randomChoices(arr, min, max) {
  const count = random(min, max);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 生成一条格子数据
function generateGrid(index) {
  const types = Object.keys(typeWithTags);
  const type = randomChoice(types);
  const tagsForType = typeWithTags[type];
  const tags = randomChoices(tagsForType.length > 0 ? tagsForType : ['约伴'], 1, 3);
  const tag = tags[0];
  const maxMembers = random(2, 15);
  const peopleRange = maxMembers <= 3 ? '2-3人' : (maxMembers <= 6 ? '4-6人' : (maxMembers <= 10 ? '7-10人' : '10人以上'));

  const titleTemplate = randomChoice(titleTemplates);
  const title = titleTemplate
    .replace('{type}', type)
    .replace(/{tag}/g, tag)
    .replace('{people}', peopleRange);

  const descriptionTemplate = randomChoice(descriptionTemplates);
  const description = descriptionTemplate.replace('{tag}', tag);

  const now = new Date();
  const daysOffset = random(0, 14);
  const hoursOffset = random(9, 22);
  const activityTime = new Date(now);
  activityTime.setDate(now.getDate() + daysOffset);
  activityTime.setHours(hoursOffset, random(0, 59), 0, 0);

  const timeRange = daysOffset === 0 ? '今天' : 
                    (daysOffset === 1 ? '明天' : 
                    (daysOffset <= 7 ? '本周' : '周末'));

  return {
    id: Date.now().toString() + index,
    type: type,
    title: title,
    description: description,
    location: randomChoice(locations),
    maxMembers: maxMembers,
    currentMembers: random(1, Math.min(maxMembers - 1, 5)),
    time: activityTime.toISOString(),
    timeText: `${activityTime.getFullYear()}-${(activityTime.getMonth() + 1).toString().padStart(2, '0')}-${activityTime.getDate().toString().padStart(2, '0')} ${activityTime.getHours().toString().padStart(2, '0')}:${activityTime.getMinutes().toString().padStart(2, '0')}`,
    timeRange: timeRange,
    peopleRange: peopleRange,
    tags: tags,
    creator: {
      id: 'user_' + random(1, 20),
      nickname: randomChoice(nicknames),
      avatarUrl: `https://via.placeholder.com/100?text=${index}`,
      verified: Math.random() > 0.5
    },
    cover: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(type + ' ' + tag)}&image_size=landscape_16_9`,
    status: '招募中'
  };
}

// 生成测试数据
function generateTestData(count = 100) {
  console.log(`开始生成 ${count} 条测试数据...`);
  
  const grids = [];
  for (let i = 0; i < count; i++) {
    grids.push(generateGrid(i));
  }
  
  return grids;
}

// 初始化并导入测试数据
function initMockData(count = 100) {
  initDB();
  
  const existingGrids = GridsDB.getAll();
  if (existingGrids.length > 0) {
    // 检查并修复现有数据的creator字段
    const fixedGrids = existingGrids.map(grid => {
      if (!grid.creator) {
        grid.creator = {
          id: 'user_default',
          nickname: '匿名用户',
          avatarUrl: 'https://via.placeholder.com/100',
          verified: false
        };
      }
      return grid;
    });
    
    // 保存修复后的数据
    const db = require('./db.js').getDB();
    db.grids = fixedGrids;
    require('./db.js').saveDB(db);
    
    console.log('已修复数据库中存在的creator字段问题');
    return fixedGrids;
  }
  
  const grids = generateTestData(count);
  
  // 保存到数据库
  const db = require('./db.js').getDB();
  db.grids = grids;
  require('./db.js').saveDB(db);
  
  console.log(`成功导入 ${grids.length} 条测试数据`);
  return grids;
}

module.exports = {
  generateTestData,
  initMockData,
  generateGrid
};
