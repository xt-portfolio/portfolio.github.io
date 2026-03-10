

// =========================== 电脑模型 ==================================
// ==================== 设备检测和配置 ====================
const istouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const MOBILE_BREAKPOINT = 839;
const screenWidth = window.innerWidth;
const isMobileScreen = screenWidth <= MOBILE_BREAKPOINT;
const HORIZONTAL_OFFSET = isMobileScreen ? -0.6 : 0;

console.log(`触摸屏: ${istouchDevice ? '是' : '否'}, 屏幕: ${screenWidth}px, 偏移: ${HORIZONTAL_OFFSET}`);

// ==================== DOM元素 ====================
const loadingContainer = document.getElementById('loading-container');
const modelContainer = document.getElementById('model-container');
const banner = document.querySelector('.banner');

// ==================== Three.js初始化 ====================
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "default" });//可以改成high-performance
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setClearColor(0x000000, 0);
modelContainer.appendChild(renderer.domElement);

// ==================== 控制器配置 ====================
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// 基础配置：禁用所有功能，后面根据设备类型选择性开启
controls.enableDamping = false;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false;
controls.autoRotate = false;

// 射线检测器用于判断触摸是否在模型上
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isTouchingModel = false;

// 触摸屏设备额外配置
if (istouchDevice) {
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // 完全禁用缩放功能
    controls.enableRotate = false; // 初始禁用，只有在触摸模型时才启用
    controls.rotateSpeed = 0.8;
    controls.maxPolarAngle = Math.PI / 2;
    
    // 触摸开始事件
    renderer.domElement.addEventListener('touchstart', (e) => {
        // 计算触摸点的归一化坐标
        const rect = renderer.domElement.getBoundingClientRect();
        const touch = e.touches[0];
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        // 发射射线检测是否点击到模型
        raycaster.setFromCamera(mouse, camera);
        
        // 收集所有可检测的物体
        const detectObjects = [];
        if (computerModel) detectObjects.push(computerModel);
        if (cardGroup) detectObjects.push(cardGroup);
        
        if (detectObjects.length > 0) {
            const intersects = raycaster.intersectObjects(detectObjects, true);
            isTouchingModel = intersects.length > 0;
            
            if (isTouchingModel) {
                // 触摸到模型：启用旋转，阻止事件传播
                controls.enableRotate = true;
                e.preventDefault();
                e.stopPropagation();
            } else {
                // 没触摸到模型：禁用旋转，让事件传递给页面
                controls.enableRotate = false;
            }
        }
    }, { passive: false });
    
    // 触摸移动事件
    renderer.domElement.addEventListener('touchmove', (e) => {
        if (isTouchingModel) {
            // 正在触摸模型时，阻止页面滚动
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });
    
    // 触摸结束事件
    renderer.domElement.addEventListener('touchend', (e) => {
        isTouchingModel = false;
        controls.enableRotate = false;
        e.stopPropagation();
    }, { passive: false });
    
    // 触摸取消事件
    renderer.domElement.addEventListener('touchcancel', (e) => {
        isTouchingModel = false;
        controls.enableRotate = false;
        e.stopPropagation();
    }, { passive: false });
}

// ==================== 光照（精简）====================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(8, 12, 2);
scene.add(dirLight);

const hemiLight = new THREE.HemisphereLight(0x88ccff, 0x442200, 0.5);
scene.add(hemiLight);

const fillLight = new THREE.PointLight(0xffffff, 1);
fillLight.position.set(2, 3, 4);
scene.add(fillLight);

// ==================== 旋转组 ====================
const rotationGroup = new THREE.Group();
scene.add(rotationGroup);

// ==================== 视频平面 ====================
let videoMaterial, videoTexture;
let isVideoActive = true;

function createVideoPlane() {
    const video = document.createElement('video');
    video.src = 'https://lypml5jmfdky7wfp.public.blob.vercel-storage.com/screen.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.autoplay = true;
    
    video.play().catch(() => {
        document.addEventListener('click', () => video.play(), { once: true });
    });
    
    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    const material = new THREE.MeshStandardMaterial({
        map: videoTexture,
        emissive: 0x333333,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        color: 0xffffff
    });
    
    const geometry = new THREE.PlaneGeometry(1.72, 1.37);
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(HORIZONTAL_OFFSET, 0.12, 0.1);
    rotationGroup.add(plane);
    
    return material;
}

videoMaterial = createVideoPlane();

function toggleVideoBlack() {
    if (!videoMaterial) return;
    isVideoActive = !isVideoActive;
    
    if (isVideoActive) {
        videoMaterial.map = videoTexture;
        videoMaterial.emissive.setHex(0x333333);
        videoMaterial.color.setHex(0xffffff);
    } else {
        videoMaterial.map = null;
        videoMaterial.emissive.setHex(0x000000);
        videoMaterial.color.setHex(0x000000);
    }
    videoMaterial.needsUpdate = true;
}

// ==================== 卡片动画变量 ====================
let cardGroup = null;
let cardMeshes = [];
let cardAnimActive = false;
let cardAnimProgress = 0;
const cardAnimSpeed = 0.06; // 加快动画速度
const moveDistance = 0.8;
const maxRotation = Math.PI;
const delayBeforeRotate = 300;
const delayBeforeMoveBack = 300;

const PHASE_MOVE_FORWARD = 0;
const PHASE_DELAY_1 = 1;
const PHASE_ROTATE_FORWARD = 2;
const PHASE_ROTATE_BACK = 3;
const PHASE_DELAY_2 = 4;
const PHASE_MOVE_BACK = 5;
let currentPhase = PHASE_MOVE_FORWARD;
let delayStartTime = 0;

let initialCardPos = new THREE.Vector3();
let initialCardRot = new THREE.Euler();
const finalCardPos = new THREE.Vector3(0.54 + HORIZONTAL_OFFSET, -1.28, 0.23);

// ==================== 旋钮变量 ====================
let knobLeft = null, knobRight = null;
let knobLeftRotation = 0, knobRightRotation = 0;
const knobRotateStep = Math.PI / 4;

let knobAnimActive = false;
let knobAnimTarget = null;
let knobAnimStartRotation = 0;
let knobAnimTargetRotation = 0;
let knobAnimStartTime = 0;
const knobAnimDuration = 300;

let cardRotationWrapper = null;

// ==================== 卡片入场动画 ====================
let cardEntranceActive = false;
let cardEntranceStartTime = 0;
const ENTRANCE_PHASE_SCALE = 0;
const ENTRANCE_PHASE_WAIT = 1;
const ENTRANCE_PHASE_Z = 2;
let entrancePhase = ENTRANCE_PHASE_SCALE;
let entrancePhaseStartTime = 0;
const scaleDuration = 400;
const waitDuration = 200;
const zDuration = 600;

// ==================== 缓动函数 ====================
const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

// ==================== 射线检测 ====================
let powerButtonMesh = null;

renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const clickableObjects = [];
    if (powerButtonMesh) clickableObjects.push(powerButtonMesh);
    if (knobLeft) clickableObjects.push(knobLeft);
    if (knobRight) clickableObjects.push(knobRight);
    if (cardMeshes.length) cardMeshes.forEach(m => clickableObjects.push(m));
    else if (cardGroup) clickableObjects.push(cardGroup);
    
    if (!clickableObjects.length) return;
    
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    if (!intersects.length) return;
    
    const hitObject = intersects[0].object;
    
    // 电源按钮
    if (powerButtonMesh && (hitObject === powerButtonMesh || powerButtonMesh.children.includes(hitObject))) {
        toggleVideoBlack();
        return;
    }
    
    // 左边旋钮
    if (knobLeft && (hitObject === knobLeft || knobLeft.children.includes(hitObject))) {
        knobAnimTarget = knobLeft;
        knobAnimStartRotation = knobLeftRotation;
        knobAnimTargetRotation = knobLeftRotation + knobRotateStep;
        knobLeftRotation = knobAnimTargetRotation;
        knobAnimActive = true;
        knobAnimStartTime = Date.now();
        return;
    }
    
    // 右边旋钮
    if (knobRight && (hitObject === knobRight || knobRight.children.includes(hitObject))) {
        knobAnimTarget = knobRight;
        knobAnimStartRotation = knobRightRotation;
        knobAnimTargetRotation = knobRightRotation + knobRotateStep;
        knobRightRotation = knobAnimTargetRotation;
        knobAnimActive = true;
        knobAnimStartTime = Date.now();
        return;
    }
    
    // 卡片
    let isCard = false;
    if (cardMeshes.length) isCard = cardMeshes.includes(hitObject);
    else if (cardGroup) isCard = (hitObject === cardGroup || cardGroup.children.includes(hitObject));
    
    if (isCard && !cardAnimActive && cardGroup) {
        initialCardPos.copy(cardGroup.position);
        initialCardRot.copy(cardGroup.rotation);
        cardAnimActive = true;
        cardAnimProgress = 0;
        currentPhase = PHASE_MOVE_FORWARD;
    }
});

// ==================== 鼠标跟踪（仅非触摸屏）====================
let mouseX = 0, targetRotation = 0, currentRotation = 0;
const maxRotationAngle = 0.2;
const rotationLerpSpeed = 0.05;
let isMouseRotationEnabled = false;
let mouseInContainer = false;

if (!istouchDevice) {
    document.addEventListener('mousemove', (e) => {
        const rect = modelContainer.getBoundingClientRect();
        mouseInContainer = e.clientX >= rect.left && e.clientX <= rect.right && 
                          e.clientY >= rect.top && e.clientY <= rect.bottom;
        
        if (isMouseRotationEnabled && mouseInContainer) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            targetRotation = mouseX * maxRotationAngle;
        }
    });
    
    modelContainer.addEventListener('mouseleave', () => {
        mouseInContainer = false;
    });
}

function enableMouseRotation() {
    if (!istouchDevice) isMouseRotationEnabled = true;
}

// ==================== 视口可见性（优化）====================
let isBannerVisible = true;
let visibilityCheckScheduled = false;

// 使用IntersectionObserver替代scroll监听
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        isBannerVisible = entry.isIntersecting;
        rotationGroup.visible = isBannerVisible;
    });
}, { threshold: 0.1 });

observer.observe(banner);

// 备用滚动检测（兼容性）
window.addEventListener('scroll', () => {
    if (!visibilityCheckScheduled) {
        visibilityCheckScheduled = true;
        requestAnimationFrame(() => {
            const rect = banner.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const isVisible = rect.top < windowHeight && rect.bottom > 0;
            
            if (isVisible !== isBannerVisible) {
                isBannerVisible = isVisible;
                rotationGroup.visible = isBannerVisible;
            }
            visibilityCheckScheduled = false;
        });
    }
}, { passive: true });

// ==================== 加载模型 ====================
const loader = new THREE.GLTFLoader();
let computerModel = null;
let modelsLoaded = 0;
const totalModels = 2;

function checkAllModelsLoaded() {
    modelsLoaded++;
    if (modelsLoaded === totalModels) {
        console.log('🎉 所有模型加载完成，开始入场动画');
        setTimeout(() => loadingContainer?.classList.add('hidden'), 500);
        startEntranceAnimations();
    }
}

// 加载电脑
loader.load('https://lypml5jmfdky7wfp.public.blob.vercel-storage.com/computer.glb', (gltf) => {
    computerModel = gltf.scene;
    
    // 查找交互元素
    computerModel.traverse((child) => {
        if (!child.isMesh) return;
        const name = child.name.toLowerCase();
        
        if (name.includes('power') || name.includes('button') || name.includes('开关')) {
            powerButtonMesh = child;
        } else if (name.includes('knob')) {
            if (name.includes('knob.2') || name.includes('knob2') || name.includes('右')) {
                knobRight = child;
            } else {
                knobLeft = child;
            }
        }
    });
    
    computerModel.position.set(HORIZONTAL_OFFSET, -2.5, 0);
    computerModel.rotation.y = -Math.PI;
    rotationGroup.add(computerModel);
    
    checkAllModelsLoaded();
}, null, checkAllModelsLoaded);

// 加载卡片
loader.load('https://lypml5jmfdky7wfp.public.blob.vercel-storage.com/card.glb', (gltf) => {
    const originalCard = gltf.scene;
    
    cardRotationWrapper = new THREE.Group();
    const box = new THREE.Box3().setFromObject(originalCard);
    const center = box.getCenter(new THREE.Vector3());
    
    originalCard.traverse((child) => {
        if (child.isMesh) {
            child.position.sub(center);
            cardMeshes.push(child);
        }
    });
    
    cardRotationWrapper.add(originalCard);
    cardRotationWrapper.position.copy(finalCardPos);
    cardGroup = cardRotationWrapper;
    
    cardGroup.scale.set(0, 0, 0);
    cardGroup.position.set(finalCardPos.x, finalCardPos.y, 1.0);
    
    initialCardPos.copy(cardGroup.position);
    initialCardRot.copy(cardGroup.rotation);
    rotationGroup.add(cardGroup);
    
    checkAllModelsLoaded();
}, null, checkAllModelsLoaded);

// ==================== 入场动画 ====================
let computerAnimActive = false;
let computerAnimStartTime = 0;
const computerAnimDuration = 2800;

function startEntranceAnimations() {
    if (computerModel) {
        computerAnimActive = true;
        computerAnimStartTime = Date.now();
        computerModel.position.set(HORIZONTAL_OFFSET, -2.5, 0);
        computerModel.rotation.y = -Math.PI;
    }
}

// ==================== 视频淡入 ====================
let videoFadeStartTime = 0;
let isVideoFading = false;
const videoFadeDuration = 300;

function startVideoFade() {
    isVideoFading = true;
    videoFadeStartTime = Date.now();
    videoMaterial.opacity = 0;
}

// ==================== 动画循环（优化版）====================
let lastFrameTime = 0;
const FRAME_INTERVAL = 1000 / 60; // 60fps

function animate(time) {
    requestAnimationFrame(animate);
    
    // 帧率限制
    if (time - lastFrameTime < FRAME_INTERVAL) return;
    lastFrameTime = time;
    
    if (!isBannerVisible) return;
    
    const now = Date.now();
    
    // 电脑入场动画
    if (computerAnimActive && computerModel) {
        const elapsed = now - computerAnimStartTime;
        const progress = Math.min(elapsed / computerAnimDuration, 1);
        const eased = easeInOutCubic(progress);
        
        computerModel.position.y = -2.5 + 2.5 * eased;
        computerModel.rotation.y = -Math.PI + Math.PI * eased;
        computerModel.position.x = HORIZONTAL_OFFSET;
        
        if (progress >= 1) {
            computerAnimActive = false;
            computerModel.position.y = 0;
            computerModel.rotation.y = 0;
            
            if (cardGroup && !cardEntranceActive) {
                cardEntranceActive = true;
                entrancePhase = ENTRANCE_PHASE_SCALE;
                entrancePhaseStartTime = now;
            }
        }
    }
    
    // 卡片入场动画
    if (cardEntranceActive && cardGroup) {
        if (entrancePhase === ENTRANCE_PHASE_SCALE) {
            const elapsed = now - entrancePhaseStartTime;
            const progress = Math.min(elapsed / scaleDuration, 1);
            const eased = easeInOutCubic(progress);
            cardGroup.scale.set(eased, eased, eased);
            
            if (progress >= 1) {
                cardGroup.scale.set(1, 1, 1);
                entrancePhase = ENTRANCE_PHASE_WAIT;
                entrancePhaseStartTime = now;
            }
        } else if (entrancePhase === ENTRANCE_PHASE_WAIT) {
            if (now - entrancePhaseStartTime >= waitDuration) {
                entrancePhase = ENTRANCE_PHASE_Z;
                entrancePhaseStartTime = now;
            }
        } else if (entrancePhase === ENTRANCE_PHASE_Z) {
            const elapsed = now - entrancePhaseStartTime;
            const progress = Math.min(elapsed / zDuration, 1);
            const eased = easeInOutCubic(progress);
            cardGroup.position.z = 1.0 - (1.0 - 0.23) * eased;
            
            if (progress >= 1) {
                cardEntranceActive = false;
                cardGroup.position.z = 0.23;
                startVideoFade();
                setTimeout(enableMouseRotation, 700);
            }
        }
    }
    
    // 旋钮动画
    if (knobAnimActive && knobAnimTarget) {
        const elapsed = now - knobAnimStartTime;
        const progress = Math.min(elapsed / knobAnimDuration, 1);
        const eased = easeOutCubic(progress);
        knobAnimTarget.rotation.z = knobAnimStartRotation + (knobAnimTargetRotation - knobAnimStartRotation) * eased;
        
        if (progress >= 1) {
            knobAnimActive = false;
            knobAnimTarget = null;
        }
    }
    
    // 视频淡入
    if (isVideoFading && videoMaterial) {
        const elapsed = now - videoFadeStartTime;
        const progress = Math.min(elapsed / videoFadeDuration, 1);
        videoMaterial.opacity = easeInOutQuad(progress);
        
        if (progress >= 1) {
            isVideoFading = false;
            videoMaterial.opacity = 1;
        }
    }
    
    // 旋转控制（根据设备类型）
    if (istouchDevice) {
        controls.update(); // 触摸屏用OrbitControls
    } else if (isMouseRotationEnabled) {
        // 非触摸屏用鼠标跟踪
        currentRotation += (targetRotation - currentRotation) * rotationLerpSpeed;
        rotationGroup.rotation.y = currentRotation;
    }
    
    // 卡片点击动画
    if (cardGroup && cardAnimActive) {
        if (currentPhase === PHASE_MOVE_FORWARD) {
            cardAnimProgress += cardAnimSpeed;
            if (cardAnimProgress >= 1.0) {
                cardAnimProgress = 1.0;
                currentPhase = PHASE_DELAY_1;
                delayStartTime = now;
            }
            cardGroup.position.z = initialCardPos.z + moveDistance * easeInOutQuad(cardAnimProgress);
        } else if (currentPhase === PHASE_DELAY_1) {
            if (now - delayStartTime >= delayBeforeRotate) {
                currentPhase = PHASE_ROTATE_FORWARD;
                cardAnimProgress = 0;
            }
        } else if (currentPhase === PHASE_ROTATE_FORWARD) {
            cardAnimProgress += cardAnimSpeed;
            if (cardAnimProgress >= 1.0) {
                cardAnimProgress = 1.0;
                currentPhase = PHASE_ROTATE_BACK;
            }
            cardGroup.rotation.z = initialCardRot.z + maxRotation * easeInOutQuad(cardAnimProgress);
        } else if (currentPhase === PHASE_ROTATE_BACK) {
            cardAnimProgress -= cardAnimSpeed;
            if (cardAnimProgress <= 0.0) {
                cardAnimProgress = 0.0;
                currentPhase = PHASE_DELAY_2;
                delayStartTime = now;
            }
            cardGroup.rotation.z = initialCardRot.z + maxRotation * easeInOutQuad(cardAnimProgress);
        } else if (currentPhase === PHASE_DELAY_2) {
            if (now - delayStartTime >= delayBeforeMoveBack) {
                currentPhase = PHASE_MOVE_BACK;
                cardAnimProgress = 1.0;
            }
        } else if (currentPhase === PHASE_MOVE_BACK) {
            cardAnimProgress -= cardAnimSpeed;
            if (cardAnimProgress <= 0.0) {
                cardAnimActive = false;
                cardAnimProgress = 0.0;
                currentPhase = PHASE_MOVE_FORWARD;
                cardGroup.position.copy(initialCardPos);
                cardGroup.rotation.copy(initialCardRot);
            }
            cardGroup.position.z = initialCardPos.z + moveDistance * easeInOutQuad(cardAnimProgress);
        }
    }
    
    renderer.render(scene, camera);
}

requestAnimationFrame(animate);

// ==================== 窗口大小改变 ====================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // 重新计算偏移
    const newIsMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const newOffset = newIsMobile ? -0.6 : 0;
    
    if (newOffset !== HORIZONTAL_OFFSET) {
        if (computerModel) computerModel.position.x = newOffset;
        if (cardGroup) cardGroup.position.x = 0.54 + newOffset;
        rotationGroup.children.forEach(child => {
            if (child.isMesh && child.material === videoMaterial) {
                child.position.x = newOffset;
            }
        });
    }
});








//---------------------------------------------------------------------------------------
// =============================== Header 显示/隐藏（下滑隐藏，上滑出现） ===================================
//---------------------------------------------------------------------------------------


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
// -------------侧面导航条--------------
// 获取元素
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

// 检测是否为移动设备（屏幕宽度小于等于768px）
const isMobile = window.innerWidth <= 768;

// 如果不是移动设备，才启用导航功能
if (!isMobile) {
    
    // 1. 点击导航项滚动到对应区域
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. 滚动页面时自动高亮当前导航项
    function highlightNavOnScroll() {
        let currentSectionId = '';
        
        // 遍历所有区域，判断哪个区域在视口中
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const scrollY = window.scrollY;

            // 当页面滚动到区域的 30% 位置时，判定为当前区域
            if (scrollY >= sectionTop - 100 && scrollY < sectionTop + sectionHeight - 100) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // 更新导航激活状态
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === currentSectionId) {
                item.classList.add('active');
            }
        });
    }

    // 监听滚动事件（节流优化，避免性能问题）
    let throttleTimer;
    window.addEventListener('scroll', () => {
        if (!throttleTimer) {
            throttleTimer = setTimeout(() => {
                highlightNavOnScroll();
                throttleTimer = null;
            }, 50); // 50ms节流，平衡性能和响应速度
        }
    });

    // 初始化：高亮第一个导航项
    window.addEventListener('load', () => {
        highlightNavOnScroll();
    });
}



// 检测浏览器类型
function isSafari() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('edg');
}

function isNonChrome() {
    const ua = navigator.userAgent.toLowerCase();
    return !(ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr'));
}

// GSAP 全局配置（Safari优化）
gsap.config({
  force3D: !isSafari(), // Safari关掉force3D
  nullTargetWarn: false,
  trialWarn: false
});

// ScrollTrigger 优化
gsap.registerPlugin(ScrollTrigger);

// Safari专用滚动触发器配置
if (isNonChrome()) {
  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    limitCallbacks: true,
    ignoreMobileResize: true,
    syncInterval: isSafari() ? 100 : 50 // Safari降低刷新频率
  });
}

//-----------------------全局文字动效----------------------
document.addEventListener('DOMContentLoaded', () => {
    // 处理.split-line元素（行级动画）
    document.querySelectorAll('.split-line').forEach(el => {
        gsap.set(el, { visibility: "hidden" });
        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => animateLines(el),
            once: true
        });
    });
    
    // 处理.split-animate元素（字符级动画）
    document.querySelectorAll('.split-animate').forEach(el => {
        gsap.set(el, { visibility: "hidden" });
        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => animateChars(el),
            once: true
        });
    });
    
    // 进度条监听
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', updateProgressBar);
    }
});

// 行级动画函数
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

// 字符级动画函数
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

// 进度条更新函数
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;
    
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = scrolled + '%';
}

// ==================== 平滑滚动（浏览器自适应版） ====================

// 检测触摸屏
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// 检测Safari浏览器
function isSafari() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('edg');
}

// 声明lenis变量
let lenis;

// 只在非触摸屏设备上启用平滑滚动
if (!isTouchDevice) {
    if (isSafari()) {
        // ========== Safari专用配置（更流畅） ==========
        console.log('Safari浏览器，使用优化配置');
        lenis = new Lenis({
            smooth: true,
            direction: 'vertical',
            gestureDirection: 'vertical',
            lerp: 0.08,     // 降低卡顿
            duration: 1.5 ,    // 更平滑
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 0.8
        });
    } else {
        // ========== Chrome和其他浏览器配置（原版更流畅） ==========
        console.log('Chrome浏览器，使用标准配置');
        lenis = new Lenis({
            smooth: true,
            direction: 'vertical',
            gestureDirection: 'vertical',
            lerp: 0.1,
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,//触摸速度 触摸屏上的滚动速度倍数
            syncTouch: false,//触摸滚动独立控制，用 touchMultiplier 单独设置速度
            wheelMultiplier: 0.9//滚轮速度小于1(0.5): 滚动变慢，需要多滚几下/大于1(2): 滚动变快，轻轻一滚就滑很
        });
    }

    // RAF循环（所有浏览器共用）
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
} else {
    console.log('触摸屏设备，不启用平滑滚动');
}



// --------------------------中英文----------------------------------
const toggleLangBtn = document.getElementById('toggle-lang');
const langElements = document.querySelectorAll('[data-lang]');
let currentLang = 'en';

function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('zh') ? 'zh' : 'en';
}

function switchLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    toggleLangBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
    
    langElements.forEach(element => {
        if (element.getAttribute('data-lang') === currentLang) {
            element.style.display = element.tagName === 'DIV' ? 'block' : 'inline';
        } else {
            element.style.display = 'none';
        }
    });
    
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    localStorage.setItem('preferredLanguage', currentLang);
}

function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    currentLang = savedLang || detectBrowserLanguage();
    
    toggleLangBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
    
    langElements.forEach(element => {
        if (element.getAttribute('data-lang') === currentLang) {
            element.style.display = element.tagName === 'DIV' ? 'block' : 'inline';
        } else {
            element.style.display = 'none';
        }
    });
    
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
}

toggleLangBtn?.addEventListener('click', switchLanguage);
document.addEventListener('DOMContentLoaded', initLanguage);

// ------------------------------------1.首页---------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const bannerBox = document.querySelector('.banner');
    const keycap = document.querySelector('.move-bg');
    
    if (!bannerBox || !keycap) return;
    
    const parallaxStrength = 10;
    let rafId = null;
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    
    function updateParallax() {
        // 使用requestAnimationFrame平滑更新
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        keycap.style.transform = `translateY(0%) translate(${currentX}px, ${currentY}px)`;
        
        rafId = requestAnimationFrame(updateParallax);
    }
    
    bannerBox.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const relX = x / rect.width;
        const relY = y / rect.height;
        
        const moveX = (relX - 0.5) * 1.5;
        const moveY = (relY - 0.5) * 1.5;
        
        mouseX = moveX * parallaxStrength;
        mouseY = moveY * parallaxStrength;
        
        if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
        }
    });

    bannerBox.addEventListener('mouseleave', function() {
        mouseX = 0;
        mouseY = 0;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        keycap.style.transform = 'translateY(0%)';
    });
});

//skill克隆
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('skillContainer');
    if (container) {
        const items = container.innerHTML;
        container.innerHTML = items + items;
    }
});

//-------------首页banner4个小元素
document.addEventListener('DOMContentLoaded', function() {
    const myDiv = document.getElementById('sprite1');
    const divWidth = myDiv ? myDiv.offsetWidth : 100;

    const sprites = document.querySelectorAll('.banner-sprite');
  
    sprites.forEach(sprite => {
        const frames = parseInt(sprite.getAttribute('data-frames'), 10);
        const spriteImage = sprite.getAttribute('data-sprite');
        const frameWidth = divWidth;
        let currentFrame = 0;
        let interval = null;
        let playingForward = true;
  
        sprite.style.backgroundImage = `url('${spriteImage}')`;
        sprite.style.backgroundRepeat = 'no-repeat';
        sprite.style.willChange = 'background-position'; // Safari优化
  
        function updateFrame() {
            sprite.style.backgroundPositionX = `-${currentFrame * frameWidth}px`;
        }
  
        function animateSprite() {
            if (playingForward) {
                currentFrame++;
                if (currentFrame >= frames) {
                    currentFrame = frames - 1;
                    clearInterval(interval);
                    interval = null;
                    return;
                }
            } else {
                currentFrame--;
                if (currentFrame < 0) {
                    currentFrame = 0;
                    clearInterval(interval);
                    interval = null;
                    return;
                }
            }
            updateFrame();
        }
  
        function startAnimation() {
            if (interval) {
                clearInterval(interval);
            }
            interval = setInterval(animateSprite, 30);
        }
  
        sprite.addEventListener('mouseenter', function() {
            playingForward = true;
            currentFrame = 0;
            startAnimation();
        });
  
        sprite.addEventListener('mouseleave', function() {
            playingForward = false;
            startAnimation();
        });

        updateFrame();
    });
});

// Banner滚动动画
ScrollTrigger.create({
    trigger: '.banner',
    start: 'top',
    end: '+=900',
    scrub: isSafari() ? 0.5 : true, // Safari使用数值 scrub 减少计算
    animation: gsap.timeline()
        .to('.portfolio-lable-box', { rotate: -15, duration: 3, ease: 'power3.out' }, '<')
});








// ---------------------------------------2.个人--------------------------------------------
function initPersonalAnimation() {
    const screenWidth = window.innerWidth;
    const isMobileLayout = screenWidth <= 1199;
    
    const existingTrigger = ScrollTrigger.getById('personal-animation');
    if (existingTrigger) {
        existingTrigger.kill();
    }
    
    const tl = gsap.timeline();
    tl.from('.photo-1', { 
        rotate: -12, 
        duration: isMobileLayout ? 1.2 : 1,
        ease: 'power3.out' 
    });
    
    if (isMobileLayout) {
        ScrollTrigger.create({
            id: 'personal-animation',
            trigger: '.personal',
            start: 'top 80%',
            end: '+=100',
            animation: tl,
            once: true
        });
    } else {
        ScrollTrigger.create({
            id: 'personal-animation',
            trigger: '.personal',
            start: '-12%',
            end: '+=500',
            scrub: isSafari() ? 0.5 : true, // Safari使用数值 scrub
            animation: tl
        });
    }
}

initPersonalAnimation();

window.addEventListener('resize', () => {
    clearTimeout(window.resizedTimer);
    window.resizedTimer = setTimeout(() => {
        initPersonalAnimation();
    }, 200);
});


// 数字滚动效果
function initNumberCountAnimation() {
    const numberCards = document.querySelectorAll('.number-card');
    const numbers = document.querySelectorAll('.number-card h1');
    
    const targetNumbers = [10, 56];
    const duration = 1200;
    const randomInterval = 80;
    let hasAnimated = [false, false];
    
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight * 0.8 && rect.bottom >= 0;
    }
    
    function animateNumberWithRandom(index, targetNum, element) {
        if (hasAnimated[index]) return;
        
        hasAnimated[index] = true;
        
        let startTime = null;
        let lastRandomTime = 0;
        let currentDisplayNum = 0;
        
        function randomPhase(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime < 1200) {
                if (currentTime - lastRandomTime > randomInterval) {
                    lastRandomTime = currentTime;
                    const progress = elapsedTime / 1200;
                    const maxRandom = Math.max(1, Math.floor(targetNum * (1 - progress * 0.6)));
                    currentDisplayNum = Math.floor(Math.random() * maxRandom);
                    element.textContent = currentDisplayNum;
                }
                requestAnimationFrame(randomPhase);
            } else {
                smoothPhase(currentTime);
            }
        }
        
        function smoothPhase(currentTime) {
            const totalElapsed = currentTime - startTime;
            const smoothProgress = Math.min((totalElapsed - 1200) / (duration - 1200), 1);
            
            function easeOutQuart(t) {
                return 1 - Math.pow(1 - t, 4);
            }
            
            const easedProgress = easeOutQuart(smoothProgress);
            currentDisplayNum = Math.floor(easedProgress * targetNum);
            element.textContent = currentDisplayNum;
            
            if (smoothProgress < 1) {
                requestAnimationFrame(smoothPhase);
            } else {
                element.textContent = targetNum;
            }
        }
        
        requestAnimationFrame(randomPhase);
    }
    
    function checkAndTriggerAnimation() {
        numberCards.forEach((card, index) => {
            if (isElementInViewport(card) && !hasAnimated[index]) {
                const numberElement = numbers[index];
                setTimeout(() => {
                    animateNumberWithRandom(index, targetNumbers[index], numberElement);
                }, index * 200);
            }
        });
    }
    
    window.addEventListener('scroll', checkAndTriggerAnimation, { passive: true });
    window.addEventListener('resize', checkAndTriggerAnimation, { passive: true });
    setTimeout(checkAndTriggerAnimation, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNumberCountAnimation);
} else {
    initNumberCountAnimation();
}

// skill列表的鼠标跟随效果
document.addEventListener('DOMContentLoaded', function() {
    const skillLists = document.querySelectorAll('.skill-list');
    let followImage = null;
    let isFollowing = false;
    let currentAlignFunction = null;
    
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
        followImage.className = 'skillImg-follow';
        followImage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
            pointer-events: none;
            width: 250px;
            aspect-ratio: 16/9;
            object-fit: cover;
            opacity: 0;
            transform: none; /* 修改点1: 从 translate(-50%, -50%) 改为 none，移除居中变换 */
        `;
        document.body.appendChild(followImage);
        
        let firstEnter = true;
        
        // 对齐函数 - 控制图片位置
        const align = (e) => {
            if (!followImage || !isFollowing) return;
            
            // 计算右下角位置：图片左上角相对于指针的偏移
            const offsetX = 0; // 向右偏移20像素
            const offsetY = 0; // 向下偏移20像素
            
            if (firstEnter) {
                gsap.set(followImage, { 
                    x: e.clientX + offsetX,  /* 修改点2: 添加向右偏移，让图片在指针右侧 */
                    y: e.clientY + offsetY   /* 修改点3: 添加向下偏移，让图片在指针下方 */
                });
                firstEnter = false;
            } else {
                gsap.to(followImage, { 
                    x: e.clientX + offsetX,  /* 修改点4: 同上，保持右下角位置 */
                    y: e.clientY + offsetY,  /* 修改点5: 同上，保持右下角位置 */
                    duration: 1.5,
                    ease: "power3"
                });
            }
        };
        
        // 保存对齐函数引用以便清理
        currentAlignFunction = align;
        
        const fade = gsap.to(followImage, {
            autoAlpha: 1,
            ease: "none",
            paused: true,
            duration: 0.1,
            onReverseComplete: () => {
                isFollowing = false;
                firstEnter = true;
            }
        });
        
        // 为每个skill列表项添加鼠标事件
        skillLists.forEach((skillItem) => {
            const image = skillItem.querySelector('img');
            if (!image) return;
            
            skillItem.addEventListener("mouseenter", (e) => {
                firstEnter = true;
                followImage.src = image.src;
                fade.play();
                isFollowing = true;
                document.addEventListener("mousemove", align);
                align(e);
            });
            
            skillItem.addEventListener("mouseleave", () => {
                fade.reverse();
                document.removeEventListener("mousemove", align);
            });
        });
        
        // 监听整个skill-lists容器的鼠标离开事件
        const skillListsContainer = document.querySelector('.skill-lists');
        if (skillListsContainer) {
            skillListsContainer.addEventListener('mouseleave', (e) => {
                // 检查鼠标是否真的离开了skill容器区域
                const rect = skillListsContainer.getBoundingClientRect();
                const isOutsideContainer = 
                    e.clientY < rect.top - 10 || 
                    e.clientY > rect.bottom + 10 || 
                    e.clientX < rect.left - 10 || 
                    e.clientX > rect.right + 10;
                
                if (isOutsideContainer && isFollowing) {
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
            
            // 监听整个文档的鼠标移动，检查是否在skill容器外
            document.addEventListener('mousemove', (e) => {
                if (!isFollowing) return;
                
                const rect = skillListsContainer.getBoundingClientRect();
                const isOutsideContainer = 
                    e.clientY < rect.top - 10 || 
                    e.clientY > rect.bottom + 10 || 
                    e.clientX < rect.left - 10 || 
                    e.clientX > rect.right + 10;
                
                if (isOutsideContainer) {
                    // 鼠标在skill容器外，隐藏跟随图片
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
    }
    
    // 确保页面加载后立即初始化效果
    setTimeout(() => {
        initMouseFollowEffect();
    }, 100);
});

gsap.from('.skill-list', {
    scrollTrigger: ".skill-list",
    y: 30,
    stagger: 0.3,
    duration: 1,
    ease: 'power1.out',
});

// ---------------------------------------3.项目--------------------------------------------


// // 先检查 GSAP/ScrollTrigger 是否存在（避免未引入时报错）
// if (window.gsap && window.ScrollTrigger) {
//   // ========== 全局性能配置（关键：减少计算开销） ==========
//   gsap.config({
//     force3D: true, // 强制开启硬件加速，动画走 GPU
//     nullTargetWarn: false // 关闭无目标警告，减少控制台开销
//   });

//   // ========== 优化1：每个 .project-right 独立创建 ScrollTrigger 实例 ==========
//   const projectRightElements = document.querySelectorAll('.project-right');
//   if (projectRightElements.length) {
//     // 遍历每个 .project-right 元素，为其创建独立的动画和触发器
//     projectRightElements.forEach((el, index) => {
//       // 给每个元素单独开启硬件加速
//       el.style.willChange = 'transform';
//       el.style.transform = 'translateZ(0)';

//       // 为当前元素创建专属的 ScrollTrigger 实例
//       ScrollTrigger.create({
//         trigger: el, // 触发器为当前元素本身（核心：独立触发）
//         start: 'top 80%', // 元素顶部到达视口80%位置时开始
//         end: '+=500', // 动画持续600px滚动距离
//         scrub: 0.1, // 微小延迟减少高频更新
//         animation: gsap.from(el, { // 仅针对当前元素的动画
//           y: 80,
//           duration: 1.5,
//           ease: 'power1.out',
//           force3D: true
//         }),
//         // 优化：仅在可视范围内激活
//         toggleActions: 'play none none reverse',
//         // 优化：降低刷新优先级，减少性能开销
//         refreshPriority: -1,
//         // 可选：给每个实例加唯一标识，方便调试
//         id: `project-right-${index}`
//       });
//     });
//   }

//   // ========== 优化2：.project-middle 保持批量处理（仅1个） ==========
//   const projectMiddleElements = document.querySelectorAll('.project-middle');
//   if (projectMiddleElements.length) {
//     projectMiddleElements.forEach(el => {
//       el.style.willChange = 'transform';
//       el.style.transform = 'translateZ(0)';
//     });

//     ScrollTrigger.create({
//       trigger: '.project-middle',
//       start: 'top 80%',
//       end: '+=500',
//       scrub: 0.1,
//       animation: gsap.timeline({
//         defaults: { duration: 1.5, ease: 'power1.out' }
//       }).from(projectMiddleElements, { 
//         y: 40,
//         stagger: 0.1,
//         force3D: true
//       }),
//       toggleActions: 'play none none reverse',
//       refreshPriority: -1
//     });
//   }

//   // ========== 全局优化：减少 ScrollTrigger 全局开销 ==========
//   ScrollTrigger.config({
//     limitCallbacks: true, // 限制回调频率
//     ignoreMobileResize: true // 移动端忽略频繁的 resize
//   });

//   // 页面卸载时清理所有实例，避免内存泄漏
//   window.addEventListener('beforeunload', () => {
//     ScrollTrigger.getAll().forEach(trigger => trigger.kill());
//     gsap.killTweensOf('*');
//   });
// }
// --------------------------------------4.其他设计-----------------------------------


// 检查是否不是移动设备（屏幕宽度大于1199px）
if (window.innerWidth > 1199) {
  
  // 检测Safari浏览器
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (!isSafari) {
    // 非Safari浏览器（Chrome/Firefox等）：使用滚动驱动动画
    ScrollTrigger.create({
      trigger: '.img-roll', // 触发对象
      start: '-75%', // 开始位置
      end: '+=500', // 结束位置
      // markers:true,//显示位置标记
      scrub: true, // 随着鼠标上下滚动显示出现
      // pin:true,
      animation: gsap.timeline()
        .from('.img-roll', {y:80, duration: 1, ease: 'power3.out'})
    });
  }
  // Safari浏览器：什么都不做，完全取消动画
}





// --------------------------------------5.笔记-----------------------------------
// 书籍内容数据 - 支持中英文
const booksContentData = {
    'zh': [
        {
            title: "HTML, CSS, JS",
            description: "从基础的HTML页面结构到复杂的CSS样式设计，再到JavaScript交互逻辑，系统学习前端开发的核心技术与交互动效的实现，理解开发逻辑与实现方式，提升与开发团队的沟通效率，确保设计稿的精准还原与最佳用户体验。"
        },
        {
            title: "AI | 随想录",
            description: "探索AI绘画与视频生成的创作新边界，系统学习Stable Diffusion等工具，掌握风格关键词与高效工作流，提升设计效率，激发创意灵感与视觉表现力。"
        },
        {
            title: "AE | 动效学习",
            description: "深入学习UI动效设计原理，掌握交互动画、微交互与页面过渡效果，创造流畅自然的用户体验，提升产品界面的视觉层次与交互品质。"
        },
        {
            title: "C4D | 三维探索",
            description: "学习Cinema 4D三维技术在UI设计中的应用，掌握三维图标、场景搭建与质感表现，为界面设计增添深度感、空间感与视觉冲击力。"
        }
    ],
    'en': [
        {
            title: "HTML, CSS, JS",
            description: "Mastering core front-end fundamentals (HTML/CSS/JS) from structure to interaction, I focus on motion effect and interaction implementation to enhance developers communication and design accuracy."
        },
        {
            title: "AI Reflections",
            description: "Explore new frontiers in AI painting and video generation, systematically learn tools like Stable Diffusion, master style keywords and efficient workflows to enhance design efficiency and inspire creative ideas and visual expression."
        },
        {
            title: "AE Motion Learning",
            description: "Deeply learn UI motion design principles, master interactive animations, micro-interactions and page transition effects to create smooth, natural user experiences and enhance the visual hierarchy and interactive quality of product interfaces."
        },
        {
            title: "C4D 3D Exploration",
            description: "Learn the application of Cinema 4D 3D technology in UI design, master 3D icons, scene construction and texture representation to add depth, spatiality and visual impact to interface design."
        }
    ]
};

// 获取DOM元素
const booksItems = document.querySelectorAll('.books__item');
const dynamicTitle = document.getElementById('dynamic-title');
const dynamicDescription = document.getElementById('dynamic-description');

// 当前语言状态
let currentBooksLang = 'en';
let currentHoverIndex = 0;

// 更新书籍内容函数
function updateBookContent(bookIndex) {
    const data = booksContentData[currentBooksLang] || booksContentData['en'];
    
    if (data && data[bookIndex] && dynamicTitle && dynamicDescription) {
        // 添加更新动画类
        dynamicTitle.classList.add('content-updating');
        dynamicDescription.classList.add('content-updating');
        
        // 延迟后更新内容并显示
        setTimeout(() => {
            // 更新内容
            dynamicTitle.textContent = data[bookIndex].title;
            dynamicDescription.textContent = data[bookIndex].description;
            
            // 移除更新类，添加更新完成类
            dynamicTitle.classList.remove('content-updating');
            dynamicDescription.classList.remove('content-updating');
            dynamicTitle.classList.add('content-updated');
            dynamicDescription.classList.add('content-updated');
            
            // 清除动画类
            setTimeout(() => {
                dynamicTitle.classList.remove('content-updated');
                dynamicDescription.classList.remove('content-updated');
            }, 500);
        }, 200);
    }
}

// 更新语言函数
function updateBooksLanguage(lang) {
    if (lang === currentBooksLang) return; // 语言没变就不更新
    
    currentBooksLang = lang;
    console.log(`切换书籍语言到: ${lang}`);
    
    // 更新当前显示的内容
    updateBookContent(currentHoverIndex);
}

// 书籍悬停事件处理
function handleBookHover(index) {
    currentHoverIndex = index;
    updateBookContent(index);
}

function handleBookLeave() {
    // 鼠标离开时保持当前显示的内容
}

// 初始化书籍悬停事件
function initBooksHoverEvents() {
    booksItems.forEach((book, index) => {
        book.removeEventListener('mouseenter', handleBookHover);
        book.removeEventListener('mouseleave', handleBookLeave);
        
        // 使用包装函数传递index
        book.addEventListener('mouseenter', () => handleBookHover(index));
        book.addEventListener('mouseleave', handleBookLeave);
    });
    
    // 默认显示第一本书的内容
    updateBookContent(0);
}

// 监听主项目的语言切换（事件驱动，不用定时器）
function setupLanguageSync() {
    // 方法1：监听主toggle按钮的点击
    const mainToggleBtn = document.getElementById('toggle-lang');
    if (mainToggleBtn) {
        mainToggleBtn.addEventListener('click', function() {
            const newLang = this.textContent === 'EN' ? 'zh' : 'en';
            updateBooksLanguage(newLang);
        });
    }
    
    // 方法2：监听自定义事件（推荐！）
    window.addEventListener('languageChanged', function(e) {
        if (e.detail && e.detail.lang) {
            updateBooksLanguage(e.detail.lang);
        }
    });
    
    // 方法3：监听localStorage变化（当其他标签页修改时）
    window.addEventListener('storage', function(e) {
        if (e.key === 'preferredLanguage') {
            updateBooksLanguage(e.newValue || 'en');
        }
    });
    
    // 初始同步语言
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        updateBooksLanguage(savedLang);
    }
}

// 主项目切换语言时调用这个函数
function triggerLanguageChange(lang) {
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { lang: lang } 
    }));
}

// 初始化函数
function initBooksModule() {
    console.log('初始化书籍模块...');
    
    // 初始语言设置
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    currentBooksLang = savedLang;
    
    // 初始化悬停事件
    initBooksHoverEvents();
    
    // 设置语言同步（事件驱动，无定时器）
    setupLanguageSync();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBooksModule);
} else {
    initBooksModule();
}

// 暴露函数供外部调用
window.updateBooksLanguage = updateBooksLanguage;
window.triggerLanguageChange = triggerLanguageChange;

// --------------------------footer-----------------------------------


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

// 图片悬停效果（如果需要保留的话，补充上）
document.querySelectorAll('.project-item').forEach(element => {
  element.style.cursor = 'default !important';
  
  element.addEventListener('mouseover', () => {
    parts = 6;
    circle.style.backgroundColor = '#006effd2';
    circle.style.backgroundImage = 'url(https://res.cloudinary.com/daurd7ca7/image/upload/v1773067752/view_y73efu.png)';
    circle.style.backgroundSize = 'cover';
    circle.style.width = '70px';
    circle.style.height = '70px';
    circle.style.border = '1px solid #83838300';
    circle.style.mixBlendMode = 'normal';
  });

  element.addEventListener('mouseleave', () => {
    parts = 3;
    circle.style.backgroundColor = '#ffffff00';
    circle.style.mixBlendMode = 'normal';
    circle.style.border = '1px solid #838383ff';
    circle.style.width = '30px';
    circle.style.height = '30px';
    circle.style.backgroundImage = 'none';    
  });
});


// --------------------------contact鼠标-----------------------------------

// 获取contact容器和所有拖尾图片
const contactContainer = document.getElementById('footerContainer');
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

// 鼠标移动事件
let animationTimer = null;
let isMouseInContainer = false;

contactContainer.addEventListener("mousemove", function (e) {
  // 检查鼠标是否在.no-trail元素上
  const noTrailElements = document.querySelectorAll('.no-trail');
  let isOverNoTrail = false;
  
  noTrailElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
      isOverNoTrail = true;
    }
  });
  
  // 如果在.no-trail元素上，不触发拖尾
  if (isOverNoTrail) {
    // 立即隐藏所有图片
    imgTails.forEach(imgTail => {
      imgTail.style.transition = 'opacity 200ms ease';
      imgTail.style.opacity = '0';
    });
    return;
  }
  
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
  
  // 设置新的定时器
  animationTimer = setTimeout(() => {
    for (let i = imgTails.length - 1; i >= 0; i--) {
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
  
  if (animationTimer) {
    clearTimeout(animationTimer);
  }
  
  imgTails.forEach((imgTail) => {
    imgTail.style.transition = `opacity 300ms ease`;
    imgTail.style.opacity = "0";
  });
});

// 动画函数
function animationCircle() {
  const noTrailElements = document.querySelectorAll('.no-trail');
  let mouseEvent;
  
  // 检查当前鼠标是否在.no-trail元素上
  try {
    mouseEvent = new MouseEvent('mousemove');
  } catch(e) {
    requestAnimationFrame(animationCircle);
    return;
  }
  
  // 判断是否应该停止动画（简化逻辑）
  if (!isMouseInContainer) {
    requestAnimationFrame(animationCircle);
    return;
  }
  
  let x = coords.x;
  let y = coords.y;
  
  imgTails.forEach((imgTail, index) => {
    imgTail.style.left = (x - 60) + "px";
    imgTail.style.top = (y - 60) + "px";
    
    imgTail.x = x;
    imgTail.y = y;
    
    const nextCircle = imgTails[index + 1] || imgTails[0];
    x += (nextCircle.x - x) * 0.93;
    y += (nextCircle.y - y) * 0.93;
  });
  
  requestAnimationFrame(animationCircle);
}

// 启动动画循环
animationCircle();

// 控制面板交互（如果存在的话）
if (document.getElementById('delay')) {
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
}