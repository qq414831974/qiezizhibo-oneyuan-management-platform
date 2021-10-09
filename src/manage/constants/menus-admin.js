export const menus_admin = [
    {key: '/index', title: '首页', icon: 'home', public: 1},
    {
        key: '/user', title: '用户管理', icon: 'user',
        public: 1,
        sub: [
            {key: '/user/user', title: '用户管理', icon: 'user',},
            {key: '/user/admin', title: '后台用户管理', icon: 'crown',},
        ]

    },
    {
        key: '/role', title: '权限管理', icon: 'idcard',
        public: 1,
        sub: [
            {key: '/role/role', title: '角色管理', icon: 'user',},
            {key: '/role/permission', title: '权限管理', icon: 'audit',},
        ],
    },
    {
        key: '/exp', title: '经验系统', icon: 'thunderbolt',
        public: 1,
        sub: [
            {key: '/exp/exp', title: '经验系统', icon: 'thunderbolt',},
            {key: '/exp/growth', title: '充值成长', icon: 'property-safety',},
        ]
    },
    {key: '/area', title: '地区管理', icon: 'environment',},
    {
        key: '/oneyuan', title: '比赛管理', icon: 'dribbble',
        public: 1,
        sub: [
            {key: '/oneyuan/oneyuanLeagueMatch', title: '联赛', icon: 'trophy',},
            {key: '/oneyuan/oneyuanMatch', title: '比赛', icon: 'dribbble',},
            {key: '/oneyuan/oneyuanTeam', title: '队伍', icon: 'team',},
            {key: '/oneyuan/oneyuanPlayer', title: '队员', icon: 'user',},
            {key: '/oneyuan/import', title: '导入', icon: 'import',},
        ],
    },
    {
        key: '/pay', title: '交易管理', icon: 'dollar',
        public: 1,
        sub: [
            {key: '/pay/order', title: '订单管理', icon: 'shopping-cart',},
            // {key: '/pay/product', title: '产品管理', icon: 'shopping',},
            {key: '/pay/monopoly', title: '比赛买断', icon: 'money-collect',},
            {key: '/pay/freeTicket', title: '免费观看', icon: 'transaction',},
            {key: '/pay/gift', title: '礼物管理', icon: 'gift',},
            {key: '/pay/bet', title: '竞猜管理', icon: 'dribbble',},
            {key: '/pay/deposit', title: '余额管理', icon: 'dollar',},
            {key: '/pay/cash', title: '提现管理', icon: 'shopping-cart',},
        ],
    },
    {key: '/live', title: '直播管理', icon: 'video-camera',},
    {
        key: '/setting', title: '系统设置', icon: 'setting',
        public: 1,
        sub: [
            {key: '/setting/banner', title: '轮播图', icon: 'picture',},
            {key: '/setting/bulletin', title: '广告/公告', icon: 'notification',},
            // {key: '/setting/scoreboard', title: '比分牌', icon: 'table',},
            {key: '/setting/sharesentence', title: '分享语句', icon: 'share-alt',},
            {key: '/setting/payment', title: '支付设置', icon: 'dollar',},
            // { key: '/setting/wechat', title: '小程序', icon: 'wechat', },
        ],
    },
    {key: '/sys/feedback', title: '投诉反馈', icon: 'customer-service',},
    {key: '/sys/log', title: '操作日志', icon: 'alert',},
];