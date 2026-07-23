export interface NavItem {
    text: string;
    link: string;
}

export interface SidebarItem {
    text: string;
    link ? : string;
    items ? : SidebarItem[];
}

export interface SocialLink {
    icon: 'github' | 'twitter' | 'discord';
    link: string;
}

export interface LocaleConfig {
    title: string;
    description: string;
    nav: NavItem[];
    sidebar: SidebarItem[];
    ui: {
        search: string;
        previous: string;
        next: string;
        onThisPage: string;
        getStarted: string;
        viewOnGithub: string;
        searchPlaceholder: string;
        searchNoResults: string;
        searchLoading: string;
        searchCancel: string;
        menu ? : string;
    };
}

export interface DocsConfig {
    defaultLocale: string;
    socialLinks: SocialLink[];
    locales: Record < string,
    LocaleConfig > ;
}

export const config: DocsConfig = {
    defaultLocale: 'en',
    socialLinks: [{
        icon: 'github',
        link: 'https://github.com/nostalgia296/docs'
    }],
    locales: {
        en: {
            title: 'Lai',
            description: 'Personal notes station of Lai.',
            ui: {
                search: 'Search',
                previous: 'Previous',
                next: 'Next',
                onThisPage: 'On this page',
                getStarted: 'Get started',
                viewOnGithub: 'View on GitHub',
                searchPlaceholder: 'Search...',
                searchNoResults: 'No results found',
                searchLoading: 'Searching...',
                searchCancel: 'Cancel',
                menu: 'Menu'
            },
            nav: [{
                text: 'Notes',
                link: '/docs/getting-started'
            }],
            sidebar: [{
                text: 'My Notes',
                items: [{
                        text: 'begining',
                        link: '/docs/getting-started'
                    },
                    {
                        text: 'certbot',
                        link: '/docs/certbot'
                    },
                    {
                        text: 'vortek-termux documention',
                        link: '/docs/vortek'
                    },
                ]
            }]
        },
        zh: {
            title: 'Lai',
            description: 'Lai的个人笔记与知识库。',
            ui: {
                search: '搜索',
                previous: '上一页',
                next: '下一页',
                onThisPage: '本页目录',
                getStarted: '开始使用',
                viewOnGithub: '在 GitHub 上查看',
                searchPlaceholder: '搜索文档...',
                searchNoResults: '未找到结果',
                searchLoading: '搜索中...',
                searchCancel: '取消',
                menu: '菜单'
            },
            nav: [{
                text: '笔记',
                link: '/zh/docs/getting-started'
            }],
            sidebar: [{
                text: '我的笔记',
                items: [{
                        text: '起点',
                        link: '/zh/docs/getting-started'
                    },
                    {
                        text: 'certbot的dns验证模式',
                        link: '/zh/docs/certbot'
                    },
                    {
                        text: 'vortek-termux文档',
                        link: '/zh/docs/vortek'
                    },
                ]
            }]
        }
    }
};