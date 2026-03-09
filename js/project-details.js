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




// 【Cloudinary图片自动优化】放在你的JS文件任意位置即可
function optimizeCloudinaryImages() {
  // 找到所有Cloudinary图片
  const cloudinaryImages = document.querySelectorAll('img[src*="cloudinary.com"]');
  
  cloudinaryImages.forEach(img => {
    const originalSrc = img.src;
    // 插入自适应优化参数
    const optimizedSrc = originalSrc.replace(
      /image\/upload\//,
      'image/upload/w_auto,q_auto:eco,f_auto/'
    );
    img.src = optimizedSrc;
  });
}

// 关键：等页面所有元素加载完成后再执行（兼容所有引入方式）
if (document.readyState === 'complete') {
  // 页面已加载完，直接执行
  optimizeCloudinaryImages();
} else {
  // 页面还在加载，等加载完成后执行
  window.addEventListener('load', optimizeCloudinaryImages);
}





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





// -------------------------------------------图片懒加载优化---------------------
// 统一的 DOM 加载完成回调（合并所有初始化逻辑）
document.addEventListener('DOMContentLoaded', function() {
  // ===================== 1. 视频视口控制逻辑（重点修改手机端部分） =====================
  const videos = document.querySelectorAll('video');
  
  // 检测是否为手机设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // 手机端配置：添加 autoplay + 确保满足自动播放条件
  if (isMobile) {
    console.log('手机端：启用视频自动播放（静音+内联）');
    videos.forEach(video => {
      // 核心：添加 autoplay 属性
      video.setAttribute('autoplay', 'true');
      video.setAttribute('autoplay', 'autoplay'); // 兼容不同浏览器写法
      
      // 必须：静音（移动端 autoplay 强制要求）
      video.muted = true;
      video.defaultMuted = true; // 确保默认静音
      
      // 必须：内联播放（iOS 核心配置）
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true'); // 兼容微信/X5内核
      
      // 预加载优化
      video.preload = 'auto'; // 移动端改为 auto，确保视频能快速加载播放
      
      // 主动触发播放（兼容部分浏览器 autoplay 策略）
      video.load(); // 重新加载视频源，确保属性生效
      // 尝试自动播放（包裹在 try/catch 避免报错）
      video.play().catch(e => {
        console.log('移动端自动播放需要用户交互触发:', e);
        // 降级方案：监听用户首次点击页面后播放
        document.addEventListener('touchstart', function playOnFirstTouch() {
          video.play().then(() => {
            console.log('用户交互后视频自动播放成功');
          }).catch(err => console.log('交互后播放仍失败:', err));
          // 只触发一次，避免重复绑定
          document.removeEventListener('touchstart', playOnFirstTouch);
        }, { once: true });
      });
    });
  } else {
    // PC/平板端：启用视口视频控制（原有逻辑完全保留）
    console.log('PC/平板端：启用视口视频控制');
    
    // 创建视频观察器
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.paused) {
            video.play().catch(e => {
              console.log('视频自动播放可能被浏览器阻止，用户需要交互');
            });
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, { threshold: 0.4 });//视频在视口中可见面积 ≥ 40% 的时候，才触发播放。
    
    // 初始化视频并绑定监听
    videos.forEach(video => {
      videoObserver.observe(video);
      video.preload = 'metadata';
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      
      // 视频错误/加载监听
      video.addEventListener('error', function() {
        console.log('视频加载错误:', this.src);
      });
      video.addEventListener('loadeddata', function() {
        console.log('视频已加载');
      });
      
      // 播放状态监听
      video.addEventListener('pause', function() {
        const rect = video.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibleRatio = visibleHeight / rect.height;
        
        if (visibleRatio >= 0.4 && rect.top < viewportHeight * 0.6 && rect.bottom > viewportHeight * 0.4) {
          video.play().catch(e => console.log('重新播放失败'));
        }
      });
    });
    
    // 页面可见性监听
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        videos.forEach(video => video.pause());
      } else {
        videos.forEach(video => {
          const rect = video.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          if (rect.top < viewportHeight * 0.6 && rect.bottom > viewportHeight * 0.4 && video.paused) {
            video.play().catch(e => console.log('页面可见后播放失败'));
          }
        });
      }
    });
    
    // 滚动防抖监听（补充视频观察器）
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        videos.forEach(video => {
          const rect = video.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const isInViewport = rect.top < viewportHeight * 0.6 && rect.bottom > viewportHeight * 0.4;
          
          if (isInViewport && video.paused) {
            video.play().catch(e => console.log('滚动后播放失败'));
          } else if (!isInViewport && !video.paused) {
            video.pause();
          }
        });
      }, 100);
    });
  }

  // ===================== 2. 图片懒加载逻辑（已移除）=====================
  // 完全移除了图片懒加载相关的所有代码
  
});

// =统一的页面卸载清理逻辑（整合所有清理操作） ==
window.addEventListener('beforeunload', function() {
  // 1. 清理 ScrollTrigger（如有）
  if (window.ScrollTrigger) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
  
  // 2. 清理视频资源（释放内存）
  document.querySelectorAll('video').forEach(video => {
    video.pause();
    video.src = ''; // 清空视频源，释放资源
    video.load();
  });
  
  // 3. 移除图片懒加载观察器的清理代码
  // 图片懒加载已移除，不需要清理
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




//------------------footer-------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const banner = document.querySelector('.Project-banner');
  const footer = document.querySelector('footer');
  if (!banner || !footer) return;

  // 核心配置：把 const 改为 let，允许后续更新
  let triggerThreshold = window.innerHeight; // 100vh 触发阈值
  let isBannerVisible = true;
  let isScrolling = false;

  // 窗口缩放时更新阈值（现在可以正常赋值）
  function updateThreshold() {
    triggerThreshold = window.innerHeight;
  }
  window.addEventListener('resize', updateThreshold, { passive: true });

  // 滚动处理函数（节流 + RAF 优化）
  function handleScrollToggle() {
    if (isScrolling) return;
    isScrolling = true;

    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;

      // 滚动超过 100vh：隐藏 banner，显示 footer
      if (currentScrollY >= triggerThreshold && isBannerVisible) {
        banner.classList.add('hide');
        footer.classList.add('show');
        isBannerVisible = false;
      }
      // 滚动回到 100vh 内：显示 banner，隐藏 footer
      else if (currentScrollY < triggerThreshold && !isBannerVisible) {
        banner.classList.remove('hide');
        footer.classList.remove('show');
        isBannerVisible = true;
      }

      isScrolling = false;
    });
  }

  // 绑定滚动事件（passive: true 提升流畅度）
  window.addEventListener('scroll', handleScrollToggle, { passive: true });

  // 页面卸载时清理监听
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', handleScrollToggle);
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
// 仅保留circle光标元素
const circle = document.getElementById('cursor-circle');
let dotX = 0, dotY = 0, circleX = 0, circleY = 0;
let parts = 3;

// 更新指针位置（核心修复：限制鼠标坐标在可视区域内）
const updateCursorPosition = (e) => {
  // 1. 获取页面可视区域的宽度和高度
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // 2. 限制坐标不超出可视区域范围
  dotX = Math.min(Math.max(e.clientX, 0), viewportWidth - 1);
  dotY = Math.min(Math.max(e.clientY, 0), viewportHeight - 1);
  
  updateCursorStyles();
  circle.style.opacity = 1; // 仅显示circle
};

// 更新光标样式（仅处理circle）
const updateCursorStyles = () => {
  circle.style.top = `${circleY}px`;
  circle.style.left = `${circleX}px`;
};

// 平滑动画（仅驱动circle）
const circleAnimation = () => {
  circleX += (dotX - circleX) / parts;
  circleY += (dotY - circleY) / parts;
  updateCursorStyles();
  requestAnimationFrame(circleAnimation);
};

// 事件监听
document.addEventListener('mousemove', updateCursorPosition);

// 初始化动画
requestAnimationFrame(circleAnimation);

// 链接/按钮悬停效果
document.querySelectorAll('a, button').forEach(element => {
  element.addEventListener('mouseover', () => {
    circle.style.width = '60px';
    circle.style.height = '60px';
    circle.style.border = '1px solid #838383ff';
  });

  element.addEventListener('mouseleave', () => {
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
  });
});

// footer键盘悬停效果
document.querySelectorAll('.keyboard a,.navLinks').forEach(element => {
  element.addEventListener('mouseover', () => {
    circle.style.backgroundColor = '#ffffff80';
    circle.style.width = '70px';
    circle.style.height = '70px';
    circle.style.mixBlendMode = 'overlay';
    circle.style.filter = 'blur(8px)';
  });

  element.addEventListener('mouseleave', () => {
    circle.style.backgroundColor = '#ffffff00';
    circle.style.mixBlendMode = 'normal';
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
    circle.style.filter = 'blur(0px)';
  });
});


// --------------------------contact鼠标-----------------------------------

// 等待 DOM 完全加载后再执行，避免获取不到元素
document.addEventListener('DOMContentLoaded', () => {
  // ========== 1. 空值检查：获取元素时判断是否存在 ==========
  // 获取contact容器
  const contactContainer = document.getElementById('footerContainer');
  // 获取导航栏
  const navLinks = document.getElementById('navLinks');
  
  // 如果核心容器不存在，直接退出，避免后续报错
  if (!contactContainer) {
    console.warn('未找到 id 为 footerContainer 的元素');
    return;
  }

  // 在contact容器内获取所有拖尾图片（添加空值保护）
  const imgTails = contactContainer.querySelectorAll(".imgTail");
  // 如果没有拖尾图片，直接退出
  if (!imgTails.length) {
    console.warn('footerContainer 内未找到 .imgTail 元素');
    return;
  }

  // ========== 2. 动画配置 ==========
  let animationDelay = 300; // 消失延迟 (ms)
  let animationDuration = 500; // 消失动画时间 (ms)
  let staggerDelay = 100; // 图片之间的消失间隔 (ms)

  // ========== 3. 初始化变量（添加容错：避免容器无宽高） ==========
  const coords = { 
    x: contactContainer.offsetWidth ? contactContainer.offsetWidth / 2 : 0, 
    y: contactContainer.offsetHeight ? contactContainer.offsetHeight / 2 : 0 
  };

  // ========== 4. 初始化图片位置和状态 ==========
  imgTails.forEach((imgTail, index) => {
    imgTail.x = coords.x;
    imgTail.y = coords.y;
    imgTail.style.opacity = 0;
    imgTail.style.transform = "scale(1)";
  });

  // ========== 5. 初始化状态变量 ==========
  let animationTimer = null;
  let isMouseInContainer = false;
  let isOverNav = false; // 是否在导航栏上

  // ========== 6. 鼠标移动事件 - 绑定到contact容器（已确保容器存在） ==========
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

  // ========== 7. 鼠标离开容器事件 ==========
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

  // ========== 8. 导航栏鼠标事件（添加空值检查：navLinks 可能不存在） ==========
  if (navLinks) {
    navLinks.addEventListener("mouseenter", function() {
      isOverNav = true;
      
      // 立即隐藏所有拖尾图片
      imgTails.forEach((imgTail) => {
        imgTail.style.transition = `all 1000ms ease`;
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
  } else {
    console.warn('未找到 id 为 navLinks 的元素，导航栏交互失效');
  }

  // ========== 9. 动画函数 - 更新位置 ==========
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

  // ========== 10. 启动动画循环 ==========
  requestAnimationFrame(animationCircle);

  // ========== 11. 控制面板交互（添加空值检查：面板元素可能不存在） ==========
  const delayInput = document.getElementById('delay');
  const delayValue = document.getElementById('delayValue');
  const durationInput = document.getElementById('duration');
  const durationValue = document.getElementById('durationValue');
  const staggerInput = document.getElementById('stagger');
  const staggerValue = document.getElementById('staggerValue');

  // 仅当元素存在时绑定事件
  if (delayInput && delayValue) {
    delayInput.addEventListener('input', function() {
      animationDelay = parseInt(this.value) || 300; // 容错：非数字时用默认值
      delayValue.textContent = animationDelay + ' ms';
    });
  }

  if (durationInput && durationValue) {
    durationInput.addEventListener('input', function() {
      animationDuration = parseInt(this.value) || 500;
      durationValue.textContent = animationDuration + ' ms';
    });
  }

  if (staggerInput && staggerValue) {
    staggerInput.addEventListener('input', function() {
      staggerDelay = parseInt(this.value) || 100;
      staggerValue.textContent = staggerDelay + ' ms';
    });
  }
});