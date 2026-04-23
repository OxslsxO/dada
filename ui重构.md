小程序首页：\ <!DOCTYPE html>

<html lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>搭哒 - 寻找你的完美搭子</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&amp;family=Be+Vietnam+Pro:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "outline": "#777676",
                      "inverse-primary": "#fd789b",
                      "surface-dim": "#d6d4d4",
                      "surface-container-lowest": "#ffffff",
                      "surface-tint": "#a23255",
                      "on-secondary-container": "#6e3926",
                      "error": "#b31b25",
                      "tertiary": "#5c4bb4",
                      "tertiary-fixed-dim": "#a595ff",
                      "primary-container": "#fd789b",
                      "on-tertiary-fixed": "#170059",
                      "tertiary-dim": "#503ea7",
                      "on-secondary-fixed": "#562615",
                      "on-secondary": "#ffefeb",
                      "surface-container-highest": "#dedcdc",
                      "surface": "#f9f6f5",
                      "secondary": "#864c38",
                      "primary": "#a23255",
                      "primary-dim": "#922549",
                      "primary-fixed-dim": "#ec6b8e",
                      "outline-variant": "#aeadac",
                      "surface-variant": "#dedcdc",
                      "inverse-on-surface": "#9e9c9c",
                      "on-surface": "#2f2f2f",
                      "on-tertiary-fixed-variant": "#39248f",
                      "secondary-fixed-dim": "#fdb298",
                      "surface-container": "#eae8e7",
                      "tertiary-container": "#b3a5ff",
                      "on-error": "#ffefee",
                      "error-container": "#fb5151",
                      "on-primary-fixed": "#020000",
                      "error-dim": "#9f0519",
                      "secondary-container": "#ffc4b1",
                      "on-tertiary-container": "#301887",
                      "on-secondary-fixed-variant": "#79422e",
                      "on-tertiary": "#f6f0ff",
                      "surface-bright": "#f9f6f5",
                      "on-background": "#2f2f2f",
                      "on-primary-container": "#510020",
                      "on-error-container": "#570008",
                      "secondary-fixed": "#ffc4b1",
                      "on-primary-fixed-variant": "#620029",
                      "inverse-surface": "#0e0e0e",
                      "secondary-dim": "#78412d",
                      "tertiary-fixed": "#b3a5ff",
                      "surface-container-low": "#f3f0f0",
                      "surface-container-high": "#e4e2e2",
                      "on-surface-variant": "#5c5b5b",
                      "background": "#f9f6f5",
                      "primary-fixed": "#fd789b",
                      "on-primary": "#ffeff0"
              },
              "borderRadius": {
                      "DEFAULT": "1rem",
                      "lg": "2rem",
                      "xl": "3rem",
                      "full": "9999px"
              },
              "fontFamily": {
                      "headline": ["Plus Jakarta Sans"],
                      "body": ["Be Vietnam Pro"],
                      "label": ["Be Vietnam Pro"]
              }
            },
          },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Be Vietnam Pro', sans-serif;
            background-color: #f9f6f5;
        }
        h1, h2, h3 {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface mb-24">
<!-- Top Navigation Bar -->
<header class="fixed top-0 w-full z-50 flex items-center justify-between px-4 h-14 bg-rose-400 dark:bg-rose-900 shadow-sm">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-white hover:opacity-80 transition-opacity active:scale-95 duration-150" data-icon="menu">menu</span>
<span class="text-xl font-bold text-white tracking-tight">搭哒</span>
</div>
<div class="flex items-center gap-3">
<div class="relative">
<span class="material-symbols-outlined text-white hover:opacity-80 transition-opacity active:scale-95 duration-150" data-icon="notifications">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-rose-400"></span>
</div>
<!-- Mock Capsule Button for Mini Program feel -->
<div class="flex items-center bg-black/10 rounded-full px-3 py-1 gap-3 border border-white/20">
<span class="material-symbols-outlined text-white text-lg" data-icon="more_horiz">more_horiz</span>
<div class="w-[1px] h-3 bg-white/30"></div>
<span class="material-symbols-outlined text-white text-lg" data-icon="radio_button_checked">radio_button_checked</span>
</div>
</div>
</header>
<main class="mt-14 px-4 pt-4">
<!-- Category Bar -->
<div class="flex items-center gap-2 mb-6 sticky top-14 bg-surface py-2 z-40">
<div class="flex-1 overflow-x-auto hide-scrollbar flex gap-2">
<button class="px-5 py-2 rounded-full bg-primary-fixed text-on-primary whitespace-nowrap text-sm font-semibold">全部</button>
<button class="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant whitespace-nowrap text-sm font-medium">饭搭子</button>
<button class="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant whitespace-nowrap text-sm font-medium">运动搭子</button>
<button class="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant whitespace-nowrap text-sm font-medium">游戏搭子</button>
</div>
<button class="p-2 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="tune">tune</span>
</button>
</div>
<!-- Card Grid (Bento/Two-column inspired) -->
<div class="grid grid-cols-2 gap-4">
<!-- Card 1 -->
<div class="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
<div class="relative aspect-[4/5] bg-surface-variant">
<div class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">出行搭子</div>
<div class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
<span class="material-symbols-outlined text-4xl" data-icon="image">image</span>
<span class="text-[10px] px-4 text-center">The image is generating...</span>
</div>
<img class="absolute inset-0 w-full h-full object-cover opacity-0" data-alt="vibrant photo of a group of young people hiking a lush green mountain trail in Guangzhou at sunrise" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdHbmm6tsEs7P4VerXuIRqtDaqjDdDSK9dzBTFu3RPAolPVgqZr9ZQCG26GW2Kd5Pq805qtZPhxBsHGFMCoWfiudTV9_WbdA7Ore0lNiIn1IJmVNGXuxyDhyOJmp_GKjFyh5fN-BEpqT6fZLpsqI3_DXkXwgL_ZMTN96dmcm7W-Jojk2LshctekGo7RCP2wpy_EMGxu5JOlRJmZU3x6C4_Egn7XbB3B3ALF4yYvT_w_0qs2vPQElYtYjRnETfPD7ywBe5LkZfc4fw"/>
</div>
<div class="p-3 flex flex-col gap-2">
<h3 class="text-on-surface font-semibold text-sm line-clamp-1">周末徒步，缺人啦</h3>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm text-error" data-icon="location_on" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span>天河</span>
</div>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm" data-icon="group">group</span>
<span>1/3人</span>
</div>
<div class="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1">
<div class="w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center text-[8px] font-bold text-on-secondary-container">小</div>
<span class="text-[10px] font-medium text-on-surface-variant">小桃</span>
</div>
<button class="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">去加入</button>
</div>
</div>
</div>
<!-- Card 2 -->
<div class="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
<div class="relative aspect-[4/5] bg-surface-variant">
<div class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">饭搭子</div>
<div class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
<span class="material-symbols-outlined text-4xl" data-icon="image">image</span>
<span class="text-[10px] px-4 text-center">The image is generating...</span>
</div>
<img class="absolute inset-0 w-full h-full object-cover opacity-0" data-alt="close up of delicious steaming dim sum basket with shrimp dumplings in a modern minimalist restaurant setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7rSFcLc1OshDi20VR4sZj9OkDpv-VOO0zH7IaJVq5ahyYaZgys7EieD6J-YCG_-eBwpinYIh2P9POnSyR_5EDTB3kDnmpgxCLT6HMWulPlO95_msLIMnDpftmpumFFrOkr8PcuiTqlbcwE-Wf9lU_dBSUyPWhuAjKYbngW4oSPL9NxpiJ67xKhLk9dIH3JRTl4iY0bMRJtgxUYZA56LxSxARS_SRZ-R04BqjOkmRN1HlVH8uRSoee4gd3fa1Vlqk3Xqaxzr-4piE"/>
</div>
<div class="p-3 flex flex-col gap-2">
<h3 class="text-on-surface font-semibold text-sm line-clamp-1">点都德走起，求拼菜</h3>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm text-error" data-icon="location_on" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span>越秀</span>
</div>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm" data-icon="group">group</span>
<span>2/4人</span>
</div>
<div class="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1">
<div class="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center text-[8px] font-bold text-on-primary-container">阿</div>
<span class="text-[10px] font-medium text-on-surface-variant">阿强</span>
</div>
<button class="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">去加入</button>
</div>
</div>
</div>
<!-- Card 3 -->
<div class="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
<div class="relative aspect-[4/5] bg-surface-variant">
<div class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">游戏搭子</div>
<div class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
<span class="material-symbols-outlined text-4xl" data-icon="image">image</span>
<span class="text-[10px] px-4 text-center">The image is generating...</span>
</div>
<img class="absolute inset-0 w-full h-full object-cover opacity-0" data-alt="aesthetic setup of a gaming room with soft pink and blue neon lights and a clean white controller" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbBTpOun1orjrfCseUG-fT4lt39fMOii_OHJrMrwT6Fr6Qo4OyAMy2NlMfhXQm8zRI4ai5DpFmhjCeIgoUe1XiOehSlsSDCTPoEJbKC5OPlnJ1N6nVxdal6-T2108v414uBgOmaLtspgP95jOU8V4GO1DSKKn6y-2kzVCPXGTVvQjhk2TeSoE7fvfae8zR9m57Q-bnBjzJGCfVW9BhOBNpLZK8fYNi569F9rDB-rw1lgHN7gXQzdb6b3Kg3iuCoyMe4xmXS890_Pg"/>
</div>
<div class="p-3 flex flex-col gap-2">
<h3 class="text-on-surface font-semibold text-sm line-clamp-1">王者荣耀双排上分</h3>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm text-error" data-icon="location_on" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span>在线</span>
</div>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm" data-icon="group">group</span>
<span>1/2人</span>
</div>
<div class="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1">
<div class="w-5 h-5 rounded-full bg-tertiary-container flex items-center justify-center text-[8px] font-bold text-on-tertiary-container">L</div>
<span class="text-[10px] font-medium text-on-surface-variant">Lily</span>
</div>
<button class="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">去加入</button>
</div>
</div>
</div>
<!-- Card 4 -->
<div class="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
<div class="relative aspect-[4/5] bg-surface-variant">
<div class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">运动搭子</div>
<div class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
<span class="material-symbols-outlined text-4xl" data-icon="image">image</span>
<span class="text-[10px] px-4 text-center">The image is generating...</span>
</div>
<img class="absolute inset-0 w-full h-full object-cover opacity-0" data-alt="interior of a modern clean badminton court with bright lighting and yellow floor markings" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGndhCWnEb-1jr0MXHrPBd2fXJN7tTHoLWDiExk4Bhf3GpIoH9SggBNcrtH6jLdgIOQPw5Q8rWA3R3b-yb6WITp1tNaPpzohyus3P_ZDkYoQ-_6IiES9C-_MS_7GYFP9IcW2y1ZlbySLb00MGzPitkoy1FOxlJxv17-esWiWI2GjMAcPRW8D83xkyemrKGhhzfVlna1CQnELOllG0WjmvpgIBj57ZzQUQOdc3ZY8JNnhrjJqL_5sgzVsWxnOXrHo4o4TtcriBGIdM"/>
</div>
<div class="p-3 flex flex-col gap-2">
<h3 class="text-on-surface font-semibold text-sm line-clamp-1">晚八点羽毛球混双</h3>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm text-error" data-icon="location_on" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span>番禺</span>
</div>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm" data-icon="group">group</span>
<span>3/4人</span>
</div>
<div class="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1">
<div class="w-5 h-5 rounded-full bg-secondary-fixed flex items-center justify-center text-[8px] font-bold text-on-secondary-fixed">M</div>
<span class="text-[10px] font-medium text-on-surface-variant">Max</span>
</div>
<button class="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">去加入</button>
</div>
</div>
</div>
</div>
</main>
<!-- Bottom Navigation Bar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-t-[32px] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
<div class="flex flex-col items-center justify-center text-[#FF7A9D] font-semibold active:scale-90 duration-200 ease-out hover:text-[#FF7A9D]/80 transition-colors">
<span class="material-symbols-outlined" data-icon="home" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="text-[11px] font-medium">Home</span>
</div>
<div class="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 duration-200 ease-out hover:text-[#FF7A9D]/80 transition-colors">
<span class="material-symbols-outlined" data-icon="add_circle">add_circle</span>
<span class="text-[11px] font-medium">Create</span>
</div>
<div class="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 duration-200 ease-out hover:text-[#FF7A9D]/80 transition-colors relative">
<span class="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
<span class="text-[11px] font-medium">Message</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</div>
<div class="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 duration-200 ease-out hover:text-[#FF7A9D]/80 transition-colors">
<span class="material-symbols-outlined" data-icon="person">person</span>
<span class="text-[11px] font-medium">Mine</span>
</div>
</nav>
</body></html>

\
搭子格子详情：\ <!DOCTYPE html>

<html lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>搭哒 - 寻找你的完美搭子</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&amp;family=Be+Vietnam+Pro:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "outline": "#777676",
                      "inverse-primary": "#fd789b",
                      "surface-dim": "#d6d4d4",
                      "surface-container-lowest": "#ffffff",
                      "surface-tint": "#a23255",
                      "on-secondary-container": "#6e3926",
                      "error": "#b31b25",
                      "tertiary": "#5c4bb4",
                      "tertiary-fixed-dim": "#a595ff",
                      "primary-container": "#fd789b",
                      "on-tertiary-fixed": "#170059",
                      "tertiary-dim": "#503ea7",
                      "on-secondary-fixed": "#562615",
                      "on-secondary": "#ffefeb",
                      "surface-container-highest": "#dedcdc",
                      "surface": "#f9f6f5",
                      "secondary": "#864c38",
                      "primary": "#a23255",
                      "primary-dim": "#922549",
                      "primary-fixed-dim": "#ec6b8e",
                      "outline-variant": "#aeadac",
                      "surface-variant": "#dedcdc",
                      "inverse-on-surface": "#9e9c9c",
                      "on-surface": "#2f2f2f",
                      "on-tertiary-fixed-variant": "#39248f",
                      "secondary-fixed-dim": "#fdb298",
                      "surface-container": "#eae8e7",
                      "tertiary-container": "#b3a5ff",
                      "on-error": "#ffefee",
                      "error-container": "#fb5151",
                      "on-primary-fixed": "#020000",
                      "error-dim": "#9f0519",
                      "secondary-container": "#ffc4b1",
                      "on-tertiary-container": "#301887",
                      "on-secondary-fixed-variant": "#79422e",
                      "on-tertiary": "#f6f0ff",
                      "surface-bright": "#f9f6f5",
                      "on-background": "#2f2f2f",
                      "on-primary-container": "#510020",
                      "on-error-container": "#570008",
                      "secondary-fixed": "#ffc4b1",
                      "on-primary-fixed-variant": "#620029",
                      "inverse-surface": "#0e0e0e",
                      "secondary-dim": "#78412d",
                      "tertiary-fixed": "#b3a5ff",
                      "surface-container-low": "#f3f0f0",
                      "surface-container-high": "#e4e2e2",
                      "on-surface-variant": "#5c5b5b",
                      "background": "#f9f6f5",
                      "primary-fixed": "#fd789b",
                      "on-primary": "#ffeff0"
              },
              "borderRadius": {
                      "DEFAULT": "1rem",
                      "lg": "2rem",
                      "xl": "3rem",
                      "full": "9999px"
              },
              "fontFamily": {
                      "headline": ["Plus Jakarta Sans"],
                      "body": ["Be Vietnam Pro"],
                      "label": ["Be Vietnam Pro"]
              }
            },
          },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Be Vietnam Pro', sans-serif;
            background-color: #f9f6f5;
        }
        h1, h2, h3 {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface mb-24">
<!-- Top Navigation Bar -->
<header class="fixed top-0 w-full z-50 flex items-center justify-between px-4 h-14 bg-rose-400 dark:bg-rose-900 shadow-sm">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-white hover:opacity-80 transition-opacity active:scale-95 duration-150" data-icon="menu">menu</span>
<span class="text-xl font-bold text-white tracking-tight">搭哒</span>
</div>
<div class="flex items-center gap-3">
<div class="relative">
<span class="material-symbols-outlined text-white hover:opacity-80 transition-opacity active:scale-95 duration-150" data-icon="notifications">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-rose-400"></span>
</div>
<!-- Mock Capsule Button for Mini Program feel -->
<div class="flex items-center bg-black/10 rounded-full px-3 py-1 gap-3 border border-white/20">
<span class="material-symbols-outlined text-white text-lg" data-icon="more_horiz">more_horiz</span>
<div class="w-[1px] h-3 bg-white/30"></div>
<span class="material-symbols-outlined text-white text-lg" data-icon="radio_button_checked">radio_button_checked</span>
</div>
</div>
</header>
<main class="mt-14 px-4 pt-4">
<!-- Category Bar -->
<div class="flex items-center gap-2 mb-6 sticky top-14 bg-surface py-2 z-40">
<div class="flex-1 overflow-x-auto hide-scrollbar flex gap-2">
<button class="px-5 py-2 rounded-full bg-primary-fixed text-on-primary whitespace-nowrap text-sm font-semibold">全部</button>
<button class="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant whitespace-nowrap text-sm font-medium">饭搭子</button>
<button class="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant whitespace-nowrap text-sm font-medium">运动搭子</button>
<button class="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant whitespace-nowrap text-sm font-medium">游戏搭子</button>
</div>
<button class="p-2 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="tune">tune</span>
</button>
</div>
<!-- Card Grid (Bento/Two-column inspired) -->
<div class="grid grid-cols-2 gap-4">
<!-- Card 1 -->
<div class="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
<div class="relative aspect-[4/5] bg-surface-variant">
<div class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">出行搭子</div>
<div class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
<span class="material-symbols-outlined text-4xl" data-icon="image">image</span>
<span class="text-[10px] px-4 text-center">The image is generating...</span>
</div>
<img class="absolute inset-0 w-full h-full object-cover opacity-0" data-alt="vibrant photo of a group of young people hiking a lush green mountain trail in Guangzhou at sunrise" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdHbmm6tsEs7P4VerXuIRqtDaqjDdDSK9dzBTFu3RPAolPVgqZr9ZQCG26GW2Kd5Pq805qtZPhxBsHGFMCoWfiudTV9_WbdA7Ore0lNiIn1IJmVNGXuxyDhyOJmp_GKjFyh5fN-BEpqT6fZLpsqI3_DXkXwgL_ZMTN96dmcm7W-Jojk2LshctekGo7RCP2wpy_EMGxu5JOlRJmZU3x6C4_Egn7XbB3B3ALF4yYvT_w_0qs2vPQElYtYjRnETfPD7ywBe5LkZfc4fw"/>
</div>
<div class="p-3 flex flex-col gap-2">
<h3 class="text-on-surface font-semibold text-sm line-clamp-1">周末徒步，缺人啦</h3>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm text-error" data-icon="location_on" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span>天河</span>
</div>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm" data-icon="group">group</span>
<span>1/3人</span>
</div>
<div class="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1">
<div class="w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center text-[8px] font-bold text-on-secondary-container">小</div>
<span class="text-[10px] font-medium text-on-surface-variant">小桃</span>
</div>
<button class="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">去加入</button>
</div>
</div>
</div>
<!-- Card 2 -->
<div class="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
<div class="relative aspect-[4/5] bg-surface-variant">
<div class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">饭搭子</div>
<div class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
<span class="material-symbols-outlined text-4xl" data-icon="image">image</span>
<span class="text-[10px] px-4 text-center">The image is generating...</span>
</div>
<img class="absolute inset-0 w-full h-full object-cover opacity-0" data-alt="close up of delicious steaming dim sum basket with shrimp dumplings in a modern minimalist restaurant setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7rSFcLc1OshDi20VR4sZj9OkDpv-VOO0zH7IaJVq5ahyYaZgys7EieD6J-YCG_-eBwpinYIh2P9POnSyR_5EDTB3kDnmpgxCLT6HMWulPlO95_msLIMnDpftmpumFFrOkr8PcuiTqlbcwE-Wf9lU_dBSUyPWhuAjKYbngW4oSPL9NxpiJ67xKhLk9dIH3JRTl4iY0bMRJtgxUYZA56LxSxARS_SRZ-R04BqjOkmRN1HlVH8uRSoee4gd3fa1Vlqk3Xqaxzr-4piE"/>
</div>
<div class="p-3 flex flex-col gap-2">
<h3 class="text-on-surface font-semibold text-sm line-clamp-1">点都德走起，求拼菜</h3>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm text-error" data-icon="location_on" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span>越秀</span>
</div>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm" data-icon="group">group</span>
<span>2/4人</span>
</div>
<div class="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1">
<div class="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center text-[8px] font-bold text-on-primary-container">阿</div>
<span class="text-[10px] font-medium text-on-surface-variant">阿强</span>
</div>
<button class="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">去加入</button>
</div>
</div>
</div>
<!-- Card 3 -->
<div class="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
<div class="relative aspect-[4/5] bg-surface-variant">
<div class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">游戏搭子</div>
<div class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
<span class="material-symbols-outlined text-4xl" data-icon="image">image</span>
<span class="text-[10px] px-4 text-center">The image is generating...</span>
</div>
<img class="absolute inset-0 w-full h-full object-cover opacity-0" data-alt="aesthetic setup of a gaming room with soft pink and blue neon lights and a clean white controller" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbBTpOun1orjrfCseUG-fT4lt39fMOii_OHJrMrwT6Fr6Qo4OyAMy2NlMfhXQm8zRI4ai5DpFmhjCeIgoUe1XiOehSlsSDCTPoEJbKC5OPlnJ1N6nVxdal6-T2108v414uBgOmaLtspgP95jOU8V4GO1DSKKn6y-2kzVCPXGTVvQjhk2TeSoE7fvfae8zR9m57Q-bnBjzJGCfVW9BhOBNpLZK8fYNi569F9rDB-rw1lgHN7gXQzdb6b3Kg3iuCoyMe4xmXS890_Pg"/>
</div>
<div class="p-3 flex flex-col gap-2">
<h3 class="text-on-surface font-semibold text-sm line-clamp-1">王者荣耀双排上分</h3>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm text-error" data-icon="location_on" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span>在线</span>
</div>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm" data-icon="group">group</span>
<span>1/2人</span>
</div>
<div class="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1">
<div class="w-5 h-5 rounded-full bg-tertiary-container flex items-center justify-center text-[8px] font-bold text-on-tertiary-container">L</div>
<span class="text-[10px] font-medium text-on-surface-variant">Lily</span>
</div>
<button class="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">去加入</button>
</div>
</div>
</div>
<!-- Card 4 -->
<div class="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
<div class="relative aspect-[4/5] bg-surface-variant">
<div class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">运动搭子</div>
<div class="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
<span class="material-symbols-outlined text-4xl" data-icon="image">image</span>
<span class="text-[10px] px-4 text-center">The image is generating...</span>
</div>
<img class="absolute inset-0 w-full h-full object-cover opacity-0" data-alt="interior of a modern clean badminton court with bright lighting and yellow floor markings" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGndhCWnEb-1jr0MXHrPBd2fXJN7tTHoLWDiExk4Bhf3GpIoH9SggBNcrtH6jLdgIOQPw5Q8rWA3R3b-yb6WITp1tNaPpzohyus3P_ZDkYoQ-_6IiES9C-_MS_7GYFP9IcW2y1ZlbySLb00MGzPitkoy1FOxlJxv17-esWiWI2GjMAcPRW8D83xkyemrKGhhzfVlna1CQnELOllG0WjmvpgIBj57ZzQUQOdc3ZY8JNnhrjJqL_5sgzVsWxnOXrHo4o4TtcriBGIdM"/>
</div>
<div class="p-3 flex flex-col gap-2">
<h3 class="text-on-surface font-semibold text-sm line-clamp-1">晚八点羽毛球混双</h3>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm text-error" data-icon="location_on" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span>番禺</span>
</div>
<div class="flex items-center text-[11px] text-on-surface-variant gap-1">
<span class="material-symbols-outlined text-sm" data-icon="group">group</span>
<span>3/4人</span>
</div>
<div class="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1">
<div class="w-5 h-5 rounded-full bg-secondary-fixed flex items-center justify-center text-[8px] font-bold text-on-secondary-fixed">M</div>
<span class="text-[10px] font-medium text-on-surface-variant">Max</span>
</div>
<button class="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">去加入</button>
</div>
</div>
</div>
</div>
</main>
<!-- Bottom Navigation Bar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-t-[32px] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
<div class="flex flex-col items-center justify-center text-[#FF7A9D] font-semibold active:scale-90 duration-200 ease-out hover:text-[#FF7A9D]/80 transition-colors">
<span class="material-symbols-outlined" data-icon="home" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="text-[11px] font-medium">Home</span>
</div>
<div class="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 duration-200 ease-out hover:text-[#FF7A9D]/80 transition-colors">
<span class="material-symbols-outlined" data-icon="add_circle">add_circle</span>
<span class="text-[11px] font-medium">Create</span>
</div>
<div class="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 duration-200 ease-out hover:text-[#FF7A9D]/80 transition-colors relative">
<span class="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
<span class="text-[11px] font-medium">Message</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</div>
<div class="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 duration-200 ease-out hover:text-[#FF7A9D]/80 transition-colors">
<span class="material-symbols-outlined" data-icon="person">person</span>
<span class="text-[11px] font-medium">Mine</span>
</div>
</nav>
</body></html>
