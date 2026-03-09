// ------------- Header 显示/隐藏（下滑隐藏，上滑出现） -------------
let lastScrollTop = 0;
const header = document.querySelector('.header');
const scrollThreshold = 10; // 滚动多少像素后才触发隐藏，避免轻微滚动就触发

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    
    // 只在滚动超过阈值后才判断
    if (Math.abs(currentScroll - lastScrollTop) > scrollThreshold) {
        
        // 向下滚动且不是在最顶部
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            // 向下滚动 - 隐藏header
            header.classList.add('header-hidden');
        } else {
            // 向上滚动 - 显示header
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = currentScroll;
    }
});


// 平滑滚动 - 检测触摸屏
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// 只在非触摸屏设备上启用平滑滚动
if (!isTouchDevice) {
    const lenis = new Lenis({
        smooth: true,
        direction: 'vertical',
        gestureDirection: 'vertical',
        lerp: 0.1,
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
        syncTouch: false,
        wheelMultiplier: 1
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}




// 检测非Chrome浏览器
function isNonChrome() {
    const ua = navigator.userAgent.toLowerCase();
    return !(ua.includes('chrome') && 
             !ua.includes('edg') && 
             !ua.includes('opr') && 
             !ua.includes('qqbrowser') &&
             !ua.includes('ubrowser') &&
             !ua.includes('safari') &&
             !ua.includes('firefox'));
}

// GSAP 全局配置
gsap.config({
  force3D: isNonChrome(), // true: 非Chrome开启硬件加速, false: Chrome保持原样
  nullTargetWarn: false,
  trialWarn: false
});

// ScrollTrigger 优化
gsap.registerPlugin(ScrollTrigger);

if (isNonChrome()) {
  // 非Chrome浏览器启用优化
  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    limitCallbacks: true,
    ignoreMobileResize: true,
    syncInterval: 50
  });
}


// 图片懒加载优化
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.project-img');
    
    // 使用 Intersection Observer 实现懒加载
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                
                // 如果图片已经加载完成，取消观察
                if (img.complete) {
                    imageObserver.unobserve(img);
                } else {
                    img.onload = () => imageObserver.unobserve(img);
                }
            } else {
                // 当图片离开视口，可以考虑降低优先级
                const img = entry.target;
                if (!img.complete) {
                    // 图片还在加载中但已离开视口，暂停加载
                    img.loading = 'lazy';
                }
            }
        });
    }, {
        rootMargin: '50px 0px', // 提前50px加载
        threshold: 0.01
    });

    // 观察所有图片
    images.forEach(img => {
        // 设置懒加载属性
        img.loading = 'lazy';
        img.classList.add('lazy-image');
        imageObserver.observe(img);
    });
});

// 内存优化：离开页面时清理
window.addEventListener('beforeunload', function() {
    // 清理 ScrollTrigger
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    // 暂停所有视频
    document.querySelectorAll('video').forEach(video => {
        video.pause();
        video.src = '';
        video.load();
    });
});




//-----------------------全局文字动效----------------------

document.addEventListener('DOMContentLoaded', () => {
    // 处理.split-line元素（行级动画）
    document.querySelectorAll('.split-line').forEach(el => {
        gsap.set(el, { visibility: "hidden" });
        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => animateLines(el),  // 调用行级动画函数
            once: true
        });
    });
    
    // 处理.split-animate元素（字符级动画）
    document.querySelectorAll('.split-animate').forEach(el => {
        gsap.set(el, { visibility: "hidden" });
        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => animateChars(el),  // 调用字符级动画函数
            once: true
        });
    });
    
    // 进度条监听 - 添加安全检查
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', updateProgressBar);
    } else {
        console.warn('进度条元素未找到，请确保存在 id="progressBar" 的元素');
    }
});

// 行级动画函数（仅整体行动画）
function animateLines(element) {
    gsap.set(element, { visibility: "visible" });
    
    const splitLines = new SplitText(element, {
        type: "lines",
        linesClass: "line-child"
    });
    
    gsap.set(splitLines.lines, { y: 30, opacity: 0 });
    
    gsap.to(splitLines.lines, {
        duration: 1.2,
        y: 0,
        opacity: 1,
        stagger: 0.3,
        ease: "power3.out"
    });
}

// 字符级动画函数（行+字符动画）
function animateChars(element) {
    gsap.set(element, { visibility: "visible" });
    
    const splitLines = new SplitText(element, {
        type: "lines",
        linesClass: "line-parent"
    });
    
    splitLines.lines.forEach((line, index) => {
        const splitChars = new SplitText(line, {
            type: "chars",
            charsClass: "char-child"
        });
        
        gsap.set(splitChars.chars, { y: "100%", opacity: 0 });
        
        gsap.to(splitChars.chars, {
            duration: 1,
            y: 0,
            opacity: 1,
            stagger: 0.03,
            delay: index * 0.2,
            ease: "power3.out"
        });
    });
}

// 进度条更新函数 - 添加空值检查
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    
    // 检查元素是否存在
    if (!progressBar) {
        return;
    }
    
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = scrolled + '%';
}





// 方案一：无历史记录时隐藏返回按钮
document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.querySelector('.btn-link');
    
    // 检查是否有上一级历史记录
    if (history.length <= 1) {
        backBtn.style.display = 'none';
    } else {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            history.back();
        });
    }
});


// --------------------------更多project----------------------------------
// 为每个.projectImg-container创建独立的滚动动画
// document.querySelectorAll('.projectImg-container').forEach(container => {
//   ScrollTrigger.create({
//     trigger: container.closest('.more-projectCards'), // 使用父项目作为触发器
//     start: 'top 90%', // 当元素顶部到达视口80%位置时开始
//     end: 'bottom 60%', // 当元素底部到达视口20%位置时结束
//     markers: false, // 生产环境可以关闭标记
//     scrub: true, // 随滚动同步动画
//     animation: gsap.timeline()
//       // 选择当前容器内的所有img和video
//       .from(container.querySelectorAll('img, video'), {
//         scale: 1.1, // 初始放大状态
//         duration: 1,
//         ease: 'power1.out'
//       })
//   });
// });



// --------------------------项目首图-----------------------------------


// // 替换你原有的 Project-banner ScrollTrigger 代码
// if (window.innerWidth > 839) {
//   ScrollTrigger.create({
//     trigger: '.project-content',
//     start: '-=800', // 明确锚点（Safari 需指定参考轴）
//     end: '+=900',
//     scrub: 1, // 增加 scrub 缓冲值（Safari 更平滑）
//     // pin: true,
//     // markers:true,//显示位置标记
//     pinSpacing: false, // 关闭自动 pin 间距（避免 Safari 计算错误）
//     animation: gsap.timeline({
//       defaults: {
//         ease: 'power2.out',
//         force3D: false // 强制关闭 3D 加速
//       }
//     }).to('.Project-banner', { 
//       y: -50,
//       duration: 30,
//       transform: 'translateY(-50px)', // 显式写 transform（Safari 兼容）
//       willChange: 'transform' // 精准指定 will-change
//     })
//   });
// }

ScrollTrigger.create({
  trigger: '.project-content',
  start: '+=100 top',
  end: '+=50 bottom',
  scrub: 1,
  pin: true,
  pinSpacing: false,
  animation: gsap.timeline({
    defaults: { force3D: false }
  }).to('.Project-banner', { 
    opacity: 0,
    duration: 3,
    willChange: 'opacity'
  })
});



// --------------------------footer-----------------------------------

// ScrollTrigger.create({
//     trigger:'footer',// 触发对象
//     start:'0%',//开始位置
//     end:'bottom',//结束位置
//     // markers:true,//显示位置标记
//     scrub:true,//随着鼠标上下滚动显示出现
//     pin:true,
//     animation:
//     gsap.timeline()
//     .to('.footer-mask',{ y:'-48%',duration: 100,ease: 'power1.out',})
//     .from('.QRcode-box',{rotate:20,duration: 100,ease: 'power3.out',},'<')
// });
document.addEventListener('DOMContentLoaded', () => {
  // 1. 获取核心元素
  const footer = document.querySelector('footer');
  const emptyMask = document.querySelector('.empty-mask');
  
  // 2. 空值检查 + 无 mask 时直接显示 footer
  if (!footer) {
    console.warn('未找到 footer 元素');
    return;
  }
  // 核心修改：如果没有 empty-mask，直接显示 footer
  if (!emptyMask) {
    console.warn('未找到 empty-mask 元素，直接显示 footer');
    footer.classList.add('show');
    return; // 无 mask 时无需绑定滚动监听，直接退出
  }

  // 3. 核心配置（仅当有 mask 时生效）
  const triggerOffset = 100; // 额外偏移 100px
  let triggerThreshold = window.innerHeight + triggerOffset; // 100vh + 100px
  let isFooterVisible = false; // footer 是否显示（初始隐藏）
  let isScrolling = false; // 节流标记

  // 4. 窗口缩放时更新阈值（适配窗口大小变化）
  function updateThreshold() {
    triggerThreshold = window.innerHeight + triggerOffset;
  }
  window.addEventListener('resize', updateThreshold, { passive: true });

  // 5. 滚动处理函数（节流 + RAF 优化）
  function handleFooterToggle() {
    if (isScrolling) return;
    isScrolling = true;

    requestAnimationFrame(() => {
      // 获取 empty-mask 相对于视口顶部的距离
      const maskRect = emptyMask.getBoundingClientRect();
      const maskTopToViewport = maskRect.top;

      // 逻辑1：empty-mask 距离视口顶部 ≤ 100vh+100px → 显示 footer
      if (maskTopToViewport <= triggerThreshold && !isFooterVisible) {
        footer.classList.add('show');
        isFooterVisible = true;
      }
      // 逻辑2：empty-mask 距离视口顶部 > 100vh+100px → 隐藏 footer
      else if (maskTopToViewport > triggerThreshold && isFooterVisible) {
        footer.classList.remove('show');
        isFooterVisible = false;
      }

      isScrolling = false;
    });
  }

  // 6. 绑定滚动事件（passive: true 提升流畅度）
  window.addEventListener('scroll', handleFooterToggle, { passive: true });

  // 7. 页面初始化时执行一次（避免初始状态异常）
  handleFooterToggle();

  // 8. 内存优化：页面卸载时清理监听
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', handleFooterToggle);
    window.removeEventListener('resize', updateThreshold);
  });
});



// ----------------------------------图片不能下载----------------------------------
// document.addEventListener('contextmenu', function(e) {
//   e.preventDefault();
//   var alertBox = document.createElement('div');
//   var alertText = document.createTextNode('不可以复制或下载图片哦~');
//   alertBox.appendChild(alertText);
//   alertBox.style.width = '200px';
//   alertBox.style.height = '40px';
//   alertBox.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
//   alertBox.style.color = '#fff';
//   alertBox.style.fontSize = '14px';
//   alertBox.style.borderRadius = '4px';
//   alertBox.style.position = 'fixed';
//   alertBox.style.top = '50%';
//   alertBox.style.left = '50%';
//   alertBox.style.transform = 'translate(-50%, -50%)';
//   alertBox.style.textAlign = 'center';
//   alertBox.style.lineHeight = '40px';
//   document.body.appendChild(alertBox);
//   setTimeout(function() {
//     alertBox.style.opacity = '0';
//     setTimeout(function() {
//       document.body.removeChild(alertBox);
//     }, 500);
//   }, 1000);
// });







// --------------------------中英文----------------------------------
// 获取语言切换按钮
const toggleLangBtn = document.getElementById('toggle-lang');

// 获取所有需要切换语言的元素
const langElements = document.querySelectorAll('[data-lang]');

// 当前语言状态（默认为英文）
let currentLang = 'en';

// 自动检测浏览器语言
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    // 只有当浏览器语言是中文时才返回中文
    return browserLang.startsWith('zh') ? 'zh' : 'en';
}

// 切换语言函数
function switchLanguage() {
    // 切换语言
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    
    // 更新按钮文本
    toggleLangBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
    
    // 切换所有元素的显示状态
    langElements.forEach(element => {
        if (element.getAttribute('data-lang') === currentLang) {
            element.style.display = element.tagName === 'DIV' ? 'block' : 'inline';
        } else {
            element.style.display = 'none';
        }
    });
    
    // 更新HTML的lang属性
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    
    // 保存用户选择到本地存储
    localStorage.setItem('preferredLanguage', currentLang);
}

// 初始化语言设置
function initLanguage() {
    // 检查是否有用户保存的语言偏好
    const savedLang = localStorage.getItem('preferredLanguage');
    
    if (savedLang) {
        // 使用用户保存的语言
        currentLang = savedLang;
    } else {
        // 使用浏览器语言（非中文默认显示英文）
        currentLang = detectBrowserLanguage();
    }
    
    // 应用初始语言设置
    toggleLangBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
    
    // 显示对应语言的元素
    langElements.forEach(element => {
        if (element.getAttribute('data-lang') === currentLang) {
            element.style.display = element.tagName === 'DIV' ? 'block' : 'inline';
        } else {
            element.style.display = 'none';
        }
    });
    
    // 更新HTML的lang属性
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
}

// 添加按钮事件监听
toggleLangBtn.addEventListener('click', switchLanguage);

// 页面加载时初始化语言
document.addEventListener('DOMContentLoaded', initLanguage);






document.addEventListener('DOMContentLoaded', function() {
    // 获取nextProject容器元素
    const nextProjectContainer = document.querySelector('.nextProject-container');
    // 获取图片元素
    const targetImage = nextProjectContainer ? nextProjectContainer.querySelector('img') : null;
    
    let followImage = null;
    let isFollowing = false;
    let currentAlignFunction = null;
    
    // 如果没有找到容器或图片，直接返回
    if (!nextProjectContainer || !targetImage) {
        console.warn('未找到nextProject容器或图片元素');
        return;
    }
    
    // 清理鼠标跟随效果
    function cleanupMouseFollowEffect() {
        if (followImage) {
            gsap.set(followImage, { autoAlpha: 0 });
        }
        if (currentAlignFunction) {
            document.removeEventListener("mousemove", currentAlignFunction);
            currentAlignFunction = null;
        }
        isFollowing = false;
    }
    
    // 初始化鼠标跟随效果
    function initMouseFollowEffect() {
        // 如果已经存在跟随图片，先彻底移除
        if (followImage && followImage.parentNode) {
            followImage.parentNode.removeChild(followImage);
            followImage = null;
        }
        
        // 清理事件监听
        cleanupMouseFollowEffect();
        
        // 创建跟随鼠标的图片元素
        followImage = document.createElement('img');
        followImage.className = 'nextProjectImg-follow';
        followImage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
            pointer-events: none;
            width: 300px; /* 可以根据需要调整尺寸 */
            aspect-ratio: 16/9;
            object-fit: cover;
            opacity: 0;
            transform: none;
        `;
        document.body.appendChild(followImage);
        
        let firstEnter = true;
        
        // 对齐函数 - 控制图片位置
        const align = (e) => {
            if (!followImage || !isFollowing) return;
            
            // 图片相对于鼠标指针的偏移量（可调整）
            const offsetX = 20; // 向右偏移20px
            const offsetY = 20; // 向下偏移20px
            
            if (firstEnter) {
                gsap.set(followImage, { 
                    x: e.clientX + offsetX,
                    y: e.clientY + offsetY
                });
                firstEnter = false;
            } else {
                gsap.to(followImage, { 
                    x: e.clientX + offsetX,
                    y: e.clientY + offsetY,
                    duration: 1.5,
                    ease: "power3"
                });
            }
        };
        
        // 保存对齐函数引用以便清理
        currentAlignFunction = align;
        
        // 创建淡入淡出动画
        const fade = gsap.to(followImage, {
            autoAlpha: 1,
            ease: "none",
            paused: true,
            duration: 0.2,
            onReverseComplete: () => {
                isFollowing = false;
                firstEnter = true;
            }
        });
        
        // 为nextProject容器添加鼠标事件
        nextProjectContainer.addEventListener("mouseenter", (e) => {
            // 设置跟随图片的src
            followImage.src = targetImage.src;
            followImage.alt = targetImage.alt;
            
            // 开始淡入动画
            fade.play();
            isFollowing = true;
            
            // 添加鼠标移动监听
            document.addEventListener("mousemove", align);
            // 初始化位置
            align(e);
        });
        
        nextProjectContainer.addEventListener("mouseleave", () => {
            // 开始淡出动画
            fade.reverse();
            // 移除鼠标移动监听
            document.removeEventListener("mousemove", align);
        });
        
        // 额外的安全检查：监听文档鼠标移动，防止图片残留
        document.addEventListener('mousemove', (e) => {
            if (!isFollowing) return;
            
            // 检查鼠标是否真的离开了nextProject容器区域
            const rect = nextProjectContainer.getBoundingClientRect();
            const isOutsideContainer = 
                e.clientY < rect.top - 10 || 
                e.clientY > rect.bottom + 10 || 
                e.clientX < rect.left - 10 || 
                e.clientX > rect.right + 10;
            
            if (isOutsideContainer) {
                // 强制隐藏跟随图片
                gsap.to(followImage, {
                    autoAlpha: 0,
                    duration: 0.1,
                    onComplete: () => {
                        document.removeEventListener("mousemove", align);
                        isFollowing = false;
                        firstEnter = true;
                    }
                });
            }
        });
    }
    
    // 确保页面加载完成后初始化效果
    setTimeout(() => {
        initMouseFollowEffect();
    }, 100);
});

// --------------------------鼠标-----------------------------------
/// 鼠标
/// 鼠标（仅保留circle + 保留所有原有功能）
const circle = document.getElementById('cursor-circle');
let dotX = 0, dotY = 0, circleX = 0, circleY = 0;
// 初始parts值
let parts = 3;

// 新增：检测是否在列表布局中
function isListLayout() {
  const cardsContainer = document.querySelector('.projectCards-container');
  return cardsContainer && cardsContainer.classList.contains('list');
}

// 更新指针位置（移除dot + 限制坐标范围）
const updateCursorPosition = (e) => {
  // 限制坐标不超出可视区域，避免横向滚动条
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  dotX = Math.min(Math.max(e.clientX, 0), viewportWidth - 1);
  dotY = Math.min(Math.max(e.clientY, 0), viewportHeight - 1);
  
  updateCursorStyles();
  circle.style.opacity = 1; // 仅控制circle显示
};

// 更新光标样式（改用fixed定位，移除scrollX/scrollY）
const updateCursorStyles = () => {
  // fixed定位无需叠加scrollX/scrollY，天然跟随视口
  circle.style.top = `${circleY}px`;
  circle.style.left = `${circleX}px`;
};

// 平滑动画（逻辑不变）
const circleAnimation = () => {
  // 使用当前parts值进行计算
  circleX += (dotX - circleX) / parts;
  circleY += (dotY - circleY) / parts;
  updateCursorStyles();
  requestAnimationFrame(circleAnimation);
};

// 事件监听
document.addEventListener('mousemove', updateCursorPosition);

// 移除冗余的scroll事件（fixed定位无需更新）
// let isScrolling;
// window.addEventListener('scroll', () => {
//   cancelAnimationFrame(isScrolling);
//   isScrolling = requestAnimationFrame(() => {
//     updateCursorStyles();
//   });
// });

// 初始化动画
requestAnimationFrame(circleAnimation);

// 新增：监听布局变化，在列表布局时隐藏 circle
function observeLayoutChanges() {
  const layoutButtons = document.querySelectorAll('.layout-btn');
  layoutButtons.forEach(button => {
    button.addEventListener('click', function() {
      const layoutType = this.getAttribute('data-layout');
      if (layoutType === 'list') {
        circle.style.display = 'none';
      } else {
        // 其他布局时恢复 circle
        circle.style.display = 'block';
      }
    });
  });
}

// 初始化布局监听
observeLayoutChanges();

// 链接/按钮悬停效果（保留列表布局判断）
document.querySelectorAll('a, button').forEach(element => {
  element.addEventListener('mouseover', () => {
    // 新增：在列表布局时不应用此效果
    if (isListLayout()) return;
    
    circle.style.width = '60px';
    circle.style.height = '60px';
    circle.style.border = '1px solid #838383ff';
  });

  element.addEventListener('mouseleave', () => {
    // 新增：在列表布局时不应用此效果
    if (isListLayout()) return;
    
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
  });
});

// footer键盘悬停效果（保留列表布局判断）
document.querySelectorAll('.keyboard a,.navLinks').forEach(element => {
  element.addEventListener('mouseover', () => {
    // 新增：在列表布局时不应用此效果
    if (isListLayout()) return;
    
    circle.style.backgroundColor = '#ffffff80';
    circle.style.width = '70px';
    circle.style.height = '70px';
    circle.style.mixBlendMode = 'overlay';
    circle.style.filter = 'blur(8px)';
  });

  element.addEventListener('mouseleave', () => {
    // 新增：在列表布局时不应用此效果
    if (isListLayout()) return;
    
    circle.style.backgroundColor = '#ffffff00';
    circle.style.mixBlendMode = 'normal';
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
    circle.style.filter = 'blur(0px)';
  });
});

// 图片悬停效果 - 增加parts值修改（保留列表布局判断）
document.querySelectorAll('.itemHover').forEach(element => {
  element.style.cursor = 'default !important';
  
  element.addEventListener('mouseover', () => {
    // 新增：在列表布局时不应用此效果
    if (isListLayout()) {
      circle.style.display = 'none';
      return;
    }
    
    // 鼠标悬停图片时，将parts改为5（跟随速度变慢）
    parts = 6;
    circle.style.backgroundColor = '#006effd2';
    circle.style.backgroundImage = 'url(../img/index/view.png)';
    circle.style.backgroundSize = 'cover';
    circle.style.width = '70px';
    circle.style.height = '70px';
    circle.style.border = '1px solid #83838300';
    circle.style.mixBlendMode = 'normal';
  });

  element.addEventListener('mouseleave', () => {
    // 新增：在列表布局时不应用此效果
    if (isListLayout()) {
      circle.style.display = 'block';
      return;
    }
    
    // 离开时恢复parts原值3
    parts = 3;
    circle.style.backgroundColor = '#ffffff00';
    circle.style.mixBlendMode = 'normal';
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
    circle.style.backgroundImage = 'none';    
  });
});

// 布局按钮/筛选标签/列表容器悬停效果（移除dot相关，仅处理circle）
document.querySelectorAll('.layout-btn,.filter-tab,.projectCards-container.list').forEach(element => {
  element.addEventListener('mouseover', () => {
    // 新增：检查是否是列表容器本身
    if (element.classList.contains('projectCards-container')) {
      // 列表容器悬停时隐藏 circle（替代原dot隐藏逻辑）
      circle.style.display = 'none';
    } else {
      // 其他元素保持原有逻辑
      circle.style.width = '0px';
      circle.style.height = '0px';
      circle.style.border = '1px solid #ffffff00';
    }
  });

  element.addEventListener('mouseleave', () => {
    // 新增：检查是否是列表容器本身
    if (element.classList.contains('projectCards-container')) {
      // 离开列表容器时，根据当前布局决定是否恢复 circle
      if (!isListLayout()) {
        circle.style.display = 'block';
        circle.style.width = '30px';
        circle.style.height = '30px';
      }
    } else {
      // 其他元素保持原有逻辑
      circle.style.border = '1px solid #838383ff';
      circle.style.width = '30px';
      circle.style.height = '30px';
    }
  });
});

// 新增：页面加载时检查初始布局（移除dot，处理circle）
document.addEventListener('DOMContentLoaded', function() {
  if (isListLayout()) {
    circle.style.display = 'none'; // 列表布局默认隐藏circle
  }
});
// --------------------------contact鼠标-----------------------------------

// 获取contact容器
const contactContainer = document.getElementById('footerContainer');
const navLinks = document.getElementById('navLinks');

// 在contact容器内获取所有拖尾图片
const imgTails = contactContainer.querySelectorAll(".imgTail");

// 动画配置
let animationDelay = 300; // 消失延迟 (ms)
let animationDuration = 500; // 消失动画时间 (ms)
let staggerDelay = 100; // 图片之间的消失间隔 (ms)

// 初始化变量
const coords = { 
  x: contactContainer.offsetWidth / 2, 
  y: contactContainer.offsetHeight / 2 
};

// 初始化图片位置和状态
imgTails.forEach((imgTail, index) => {
  imgTail.x = coords.x;
  imgTail.y = coords.y;
  imgTail.style.opacity = 0;
  imgTail.style.transform = "scale(1)";
});

// 鼠标移动事件 - 绑定到contact容器
let animationTimer = null;
let isMouseInContainer = false;
let isOverNav = false; // 是否在导航栏上

contactContainer.addEventListener("mousemove", function (e) {
  // 如果鼠标在导航栏上，不触发拖尾效果
  if (isOverNav) return;
  
  // 获取容器位置
  const rect = contactContainer.getBoundingClientRect();
  
  // 计算相对于容器的坐标
  coords.x = e.clientX - rect.left;
  coords.y = e.clientY - rect.top;
  
  // 清除之前的定时器
  if (animationTimer) {
    clearTimeout(animationTimer);
  }
  
  // 重置所有图片状态
  imgTails.forEach((imgTail) => {
    imgTail.style.transition = "none";
    imgTail.style.opacity = 1;
    imgTail.style.transform = "scale(1)";
  });
  
  // 设置新的定时器，在延迟后触发图片依次消失
  animationTimer = setTimeout(() => {
    // 从最后一张图片开始消失（索引从大到小）
    for (let i = imgTails.length - 1; i >= 0; i--) {
      // 计算每张图片的延迟（最后一张最先消失）
      const delay = (imgTails.length - 1 - i) * staggerDelay;
      
      setTimeout(() => {
        imgTails[i].style.transition = `transform ${animationDuration}ms ease, opacity ${animationDuration}ms ease`;
        imgTails[i].style.transform = "scale(0)";
        imgTails[i].style.opacity = "0";
      }, delay);
    }
  }, animationDelay);
  
  isMouseInContainer = true;
});

// 鼠标离开容器事件
contactContainer.addEventListener("mouseleave", function() {
  isMouseInContainer = false;
  
  // 清除动画定时器
  if (animationTimer) {
    clearTimeout(animationTimer);
  }
  
  // 立即隐藏所有图片
  imgTails.forEach((imgTail) => {
    imgTail.style.transition = `opacity 300ms ease`;
    imgTail.style.opacity = "0";
  });
});

// 导航栏鼠标事件
navLinks.addEventListener("mouseenter", function() {
  isOverNav = true;
  
  // 立即隐藏所有拖尾图片
  imgTails.forEach((imgTail) => {
    imgTail.style.transition = `all 1000ms ease`;
    // imgTail.style.opacity = "0";
    imgTail.style.scale = "0";

  });
  
  // 清除动画定时器
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
});

navLinks.addEventListener("mouseleave", function() {
  isOverNav = false;
  imgTails.forEach((imgTail) => {
    imgTail.style.scale = "1";
  });
});

// 动画函数 - 更新位置
function animationCircle() {
  if (!isMouseInContainer || isOverNav) {
    requestAnimationFrame(animationCircle);
    return;
  }
  
  let x = coords.x;
  let y = coords.y;
  
  imgTails.forEach((imgTail, index) => {
    // 更新位置
    imgTail.style.left = (x - 60) + "px";
    imgTail.style.top = (y - 60) + "px";
    
    // 存储当前位置
    imgTail.x = x;
    imgTail.y = y;
    
    // 计算下一个位置（保持图片之间的距离）
    const nextCircle = imgTails[index + 1] || imgTails[0];
    x += (nextCircle.x - x) * 0.93;
    y += (nextCircle.y - y) * 0.93;
  });
  
  requestAnimationFrame(animationCircle);
}

// 启动动画循环
animationCircle();

// 控制面板交互
document.getElementById('delay').addEventListener('input', function() {
  animationDelay = parseInt(this.value);
  document.getElementById('delayValue').textContent = animationDelay + ' ms';
});

document.getElementById('duration').addEventListener('input', function() {
  animationDuration = parseInt(this.value);
  document.getElementById('durationValue').textContent = animationDuration + ' ms';
});

document.getElementById('stagger').addEventListener('input', function() {
  staggerDelay = parseInt(this.value);
  document.getElementById('staggerValue').textContent = staggerDelay + ' ms';
}); 