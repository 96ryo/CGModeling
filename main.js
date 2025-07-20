/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! cannon-es */ "./node_modules/cannon-es/dist/cannon-es.js");
/* harmony import */ var three_examples_jsm_loaders_MTLLoader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three/examples/jsm/loaders/MTLLoader.js */ "./node_modules/three/examples/jsm/loaders/MTLLoader.js");
/* harmony import */ var three_examples_jsm_loaders_OBJLoader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three/examples/jsm/loaders/OBJLoader.js */ "./node_modules/three/examples/jsm/loaders/OBJLoader.js");





let debagMode = false;
class ThreeJSContainer {
    scene;
    light;
    camera;
    orbitControls;
    fallen;
    displayMesh;
    sphereMesh;
    sphereBody;
    sideBeltLBody;
    pinMesh;
    pinBody;
    pinBodies = [];
    pinMeshes;
    groundWidth;
    garterRadius;
    // 画面部分の作成(表示する枠ごとに)*
    createRendererDOM = (width, height, cameraPos) => {
        const renderer = new three__WEBPACK_IMPORTED_MODULE_3__.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_3__.Color(0x000000));
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする
        //カメラの設定
        this.camera = new three__WEBPACK_IMPORTED_MODULE_3__.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.copy(cameraPos);
        this.camera.lookAt(new three__WEBPACK_IMPORTED_MODULE_3__.Vector3(0, 0, 0));
        this.orbitControls = new three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__.OrbitControls(this.camera, renderer.domElement);
        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render = (time) => {
            this.orbitControls.update();
            renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        const pinCountLabel = document.createElement('div');
        pinCountLabel.id = 'pinCountLabel';
        pinCountLabel.style.position = 'absolute';
        pinCountLabel.style.top = '10px';
        pinCountLabel.style.left = '10px';
        pinCountLabel.style.color = 'white';
        pinCountLabel.style.fontSize = '24px';
        pinCountLabel.style.fontFamily = 'Arial';
        pinCountLabel.style.zIndex = '100';
        pinCountLabel.innerText = '倒れたピン: 0';
        document.body.appendChild(pinCountLabel);
        return renderer.domElement;
    };
    cameraAct() {
        setTimeout(() => {
            this.camera.position.set(80, 20, 10);
            this.orbitControls.target.set(120, 5, 0);
            this.orbitControls.update();
        }, 500);
        setTimeout(() => {
            this.camera.position.set(-80, 15, 0);
            this.orbitControls.target.set(0, 0, 0);
            this.orbitControls.update();
        }, 10500);
    }
    countFallenPins() {
        let fallenCount = 0;
        for (const body of this.pinBodies) {
            const up = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(0, 1, 0);
            const bodyUp = body.quaternion.vmult(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(0, 1, 0));
            const dot = up.dot(bodyUp);
            const angle = Math.acos(dot);
            const angleDeg = angle * (180 / Math.PI);
            if (angleDeg > 15) {
                fallenCount++;
            }
        }
        return fallenCount;
    }
    createTextDisplay(text, position, rotation = new three__WEBPACK_IMPORTED_MODULE_3__.Euler(0, 0, 0), fontSize = 20) {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = `${fontSize}px Arial`;
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.2;
        // 一行なら上下中央揃え、複数行なら上詰め
        let baseY = lines.length === 1
            ? (canvas.height + fontSize) / 2
            : 40;
        lines.forEach((line, index) => {
            ctx.fillText(line, 25, baseY + index * lineHeight);
        });
        const texture = new three__WEBPACK_IMPORTED_MODULE_3__.CanvasTexture(canvas);
        const material = new three__WEBPACK_IMPORTED_MODULE_3__.MeshBasicMaterial({ map: texture, side: three__WEBPACK_IMPORTED_MODULE_3__.DoubleSide, transparent: true });
        const geometry = new three__WEBPACK_IMPORTED_MODULE_3__.PlaneGeometry(40, 20);
        const mesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.rotation.copy(rotation);
        mesh.scale.set(2.5, 2.5, 2.5);
        this.scene.add(mesh);
        mesh.userData = { canvas, texture, ctx, fontSize };
        return mesh;
    }
    updateTextDisplay(mesh, text, fontSize = 24, pins) {
        const data = mesh.userData;
        const ctx = data.ctx;
        const canvas = data.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = `${fontSize}px Arial`;
        const lines = (pins === 10) ? ["STRIKE!!!"] : text.split('\n');
        const lineHeight = fontSize * 1.2;
        const baseY = lines.length === 1
            ? (canvas.height + fontSize) / 2
            : 40;
        lines.forEach((line, index) => {
            ctx.fillText(line, 25, baseY + index * lineHeight);
        });
        data.texture.needsUpdate = true;
    }
    createScene = () => {
        this.scene = new three__WEBPACK_IMPORTED_MODULE_3__.Scene();
        if (debagMode) {
            // グリッド表示
            const gridHelper = new three__WEBPACK_IMPORTED_MODULE_3__.GridHelper(1000, 1000);
            this.scene.add(gridHelper);
            // 軸表示
            const axesHelper = new three__WEBPACK_IMPORTED_MODULE_3__.AxesHelper(1000);
            this.scene.add(axesHelper);
        }
        const world = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.World({ gravity: new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(0, -100, 0) });
        world.defaultContactMaterial.friction = 0.01;
        world.defaultContactMaterial.restitution = 0.3;
        let loadOBJ = (objFilePath, mtlFilePath) => {
            let object = new three__WEBPACK_IMPORTED_MODULE_3__.Object3D;
            const mtlLoader = new three_examples_jsm_loaders_MTLLoader_js__WEBPACK_IMPORTED_MODULE_1__.MTLLoader();
            mtlLoader.load(mtlFilePath, (material) => {
                material.preload();
                const objLoader = new three_examples_jsm_loaders_OBJLoader_js__WEBPACK_IMPORTED_MODULE_2__.OBJLoader();
                objLoader.setMaterials(material);
                objLoader.load(objFilePath, (obj) => {
                    object.add(obj);
                });
            });
            return object;
        };
        const pinMeshes = [];
        const pinBodies = [];
        const baseX = 120; // 奥行き方向の座標（X）
        const baseY = 10; // 高さ
        const baseZ = 0; // 横方向の中央
        const spacing = 6; // ピン同士の間隔
        let pinIndex = 0;
        for (let row = 0; row < 4; row++) {
            const pinsInRow = row + 1;
            const startZ = baseZ - (spacing * (pinsInRow - 1) / 2);
            for (let i = 0; i < pinsInRow; i++) {
                const z = startZ + i * spacing;
                const x = baseX + row * spacing;
                // ピンの見た目
                const pinMesh = loadOBJ("./pin.obj", "./pin.mtl");
                pinMesh.scale.set(1.5, 1.5, 1.5);
                pinMesh.position.set(x, baseY, z);
                this.scene.add(pinMesh);
                pinMeshes.push(pinMesh);
                // ピンの物理演算体
                const pinShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Cylinder(2, 2, 9, 16);
                const pinBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({ mass: 1 });
                pinBody.addShape(pinShape);
                pinBody.position.set(x, baseY, z);
                world.addBody(pinBody);
                pinBodies.push(pinBody);
                // 最初の1個をthis.pinMeshに（既存処理と互換）
                if (pinIndex === 0) {
                    this.pinMesh = pinMesh;
                    this.pinBody = pinBody;
                }
                pinIndex++;
            }
        }
        this.pinMeshes = pinMeshes;
        this.pinBodies = pinBodies;
        const resetPins = () => {
            this.pinBodies.forEach((pinBody, index) => {
                const row = Math.floor((Math.sqrt(8 * index + 1) - 1) / 2);
                const indexInRow = index - (row * (row + 1)) / 2;
                const pinsInRow = row + 1;
                const startZ = 0 - (spacing * (pinsInRow - 1) / 2);
                const z = startZ + indexInRow * spacing;
                const x = baseX + row * spacing;
                const y = baseY;
                // CANNON Bodyの状態リセット
                pinBody.position.set(x, y, z);
                pinBody.velocity.setZero();
                pinBody.angularVelocity.setZero();
                pinBody.quaternion.set(0, 0, 0, 1);
                // THREE Meshの状態リセット
                const mesh = this.pinMeshes[index];
                mesh.position.set(x, y, z);
                mesh.rotation.set(0, 0, 0);
            });
        };
        // かべ
        const wallWidth = 400;
        const wallHeight = 300;
        const wallDepth = 2;
        const wallMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({ color: new three__WEBPACK_IMPORTED_MODULE_3__.Color("rgba(254, 134, 74, 1)") });
        const wallGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(wallDepth, wallHeight, wallWidth);
        const wallMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(165, wallHeight / 2 - 20, 0);
        this.scene.add(wallMesh);
        // カベ物理
        const wallShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(wallDepth / 2, wallHeight / 2, wallWidth / 2));
        const wallBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({
            mass: 0,
        });
        wallBody.addShape(wallShape);
        wallBody.position.set(wallMesh.position.x, wallMesh.position.y, wallMesh.position.z);
        wallBody.quaternion.set(wallMesh.quaternion.x, wallMesh.quaternion.y, wallMesh.quaternion.z, wallMesh.quaternion.w);
        world.addBody(wallBody);
        // 床
        const floorWidth = 400;
        const floorHeight = 100;
        const floorDepth = 1;
        const floorMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({ color: 0xE6C79C });
        const floorGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(floorHeight, floorDepth, floorWidth);
        const floorMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(floorGeometry, floorMaterial);
        floorMesh.position.set(-floorHeight / 2, -floorDepth / 2, 0);
        // EdgesGeometry を使って、BoxGeometry のエッジ（枠線）を取得
        const floorEdges = new three__WEBPACK_IMPORTED_MODULE_3__.EdgesGeometry(floorGeometry);
        // ラインマテリアル（黒い線）を作成
        const lineMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.LineBasicMaterial({ color: 0x000000 }); // 枠線の色（黒）
        // ラインを生成し、位置を floorMesh に合わせる
        const floorLine = new three__WEBPACK_IMPORTED_MODULE_3__.LineSegments(floorEdges, lineMaterial);
        floorLine.position.copy(floorMesh.position);
        floorLine.rotation.copy(floorMesh.rotation); // 回転がある場合も対応
        // シーンに追加
        this.scene.add(floorLine);
        this.scene.add(floorMesh);
        const floorShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(floorHeight / 2, floorDepth / 2, floorWidth / 2));
        const floorBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({
            mass: 0,
            position: new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(floorMesh.position.x, floorMesh.position.y, floorMesh.position.z),
        });
        floorBody.addShape(floorShape);
        world.addBody(floorBody);
        const num = 7;
        for (let i = 0; i < num; i++) {
            const centerX = 0;
            const centerY = 0;
            const centerZ = -132 + 44 * i;
            // レーン
            const boxMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({ color: 0xE6C79C });
            const groundWidth = 30;
            const groundHeight = 150;
            const groundDepth = 4;
            const boxGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(groundHeight, groundDepth, groundWidth);
            const groundMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(boxGeometry, boxMaterial);
            groundMesh.receiveShadow = true;
            groundMesh.position.set(centerX + groundHeight / 2, centerY - groundDepth / 2, centerZ);
            this.groundWidth = groundWidth;
            this.scene.add(groundMesh);
            // レーン
            const groundShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(groundHeight / 2, groundDepth / 2, groundWidth / 2));
            const groundBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({ mass: 0 });
            groundBody.addShape(groundShape);
            groundBody.position.set(groundMesh.position.x, groundMesh.position.y, groundMesh.position.z);
            groundBody.quaternion.set(groundMesh.quaternion.x, groundMesh.quaternion.y, groundMesh.quaternion.z, groundMesh.quaternion.w);
            world.addBody(groundBody);
            // ガーター
            const garterRadius = 2;
            const garterHeight = groundHeight;
            const garterMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({
                color: 0x000000,
                side: three__WEBPACK_IMPORTED_MODULE_3__.DoubleSide
            });
            const garterGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.CylinderGeometry(garterRadius, garterRadius, garterHeight, 10, 1, true, Math.PI, Math.PI);
            this.garterRadius = garterRadius;
            // 左ガーター
            const garterMeshL = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(garterGeometry, garterMaterial);
            garterMeshL.receiveShadow = true;
            garterMeshL.rotation.set(0, 0, Math.PI / 2);
            garterMeshL.position.set(centerX + garterHeight / 2, centerY, centerZ - (groundWidth / 2 + garterRadius));
            this.scene.add(garterMeshL);
            // 右ガーター
            const garterMeshR = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(garterGeometry, garterMaterial);
            garterMeshR.receiveShadow = true;
            garterMeshR.rotation.set(0, 0, Math.PI / 2);
            garterMeshR.position.set(centerX + garterHeight / 2, centerY, centerZ + groundWidth / 2 + garterRadius);
            this.scene.add(garterMeshR);
            // ガーター下
            const underGarterDepth = 8;
            const undertGarterGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(garterHeight, underGarterDepth, 2 * garterRadius);
            //左ガーター下
            const undertGarterLMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(undertGarterGeometry, garterMaterial);
            undertGarterLMesh.position.set(centerX + garterHeight / 2, centerY - (garterRadius + underGarterDepth / 2), centerZ - (groundWidth / 2 + garterRadius));
            this.scene.add(undertGarterLMesh);
            // 左ガーター下（演算空間）
            const undertGarterLShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(garterHeight / 2, underGarterDepth / 2, garterRadius));
            const undertGarterLBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({ mass: 0 }); // 固定（静的オブジェクト）
            undertGarterLBody.addShape(undertGarterLShape);
            undertGarterLBody.position.set(undertGarterLMesh.position.x, undertGarterLMesh.position.y, undertGarterLMesh.position.z);
            undertGarterLBody.quaternion.set(undertGarterLMesh.quaternion.x, undertGarterLMesh.quaternion.y, undertGarterLMesh.quaternion.z, undertGarterLMesh.quaternion.w);
            world.addBody(undertGarterLBody);
            //右ガーター下
            const undertGarterRMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(undertGarterGeometry, garterMaterial);
            undertGarterRMesh.position.set(centerX + garterHeight / 2, centerY - (garterRadius + underGarterDepth / 2), centerZ + groundWidth / 2 + garterRadius);
            this.scene.add(undertGarterRMesh);
            // 右ガーター下（演算空間）
            const undertGarterRShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(garterHeight / 2, underGarterDepth / 2, garterRadius));
            const undertGarterRBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({ mass: 0 }); // 固定（静的オブジェクト）
            undertGarterRBody.addShape(undertGarterRShape);
            undertGarterRBody.position.set(undertGarterRMesh.position.x, undertGarterRMesh.position.y, undertGarterRMesh.position.z);
            undertGarterRBody.quaternion.set(undertGarterRMesh.quaternion.x, undertGarterRMesh.quaternion.y, undertGarterRMesh.quaternion.z, undertGarterRMesh.quaternion.w);
            world.addBody(undertGarterRBody);
            // 横向きベルト
            const beltWidth = groundWidth + 4 * garterRadius;
            const beltHeight = 15;
            const beltDepth = 5;
            const beltMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({ color: 0xffffff });
            const beltGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(beltHeight, beltDepth, beltWidth);
            const beltMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(beltGeometry, beltMaterial);
            beltMesh.position.set(centerX + groundHeight + beltHeight / 2, centerY - (groundDepth + beltDepth / 2), centerZ);
            this.scene.add(beltMesh);
            // 横向きベルト物理演算
            const beltShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(beltHeight / 2, beltDepth / 2, beltWidth / 2));
            const beltBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({ mass: 0 });
            beltBody.addShape(beltShape);
            beltBody.position.set(beltMesh.position.x, beltMesh.position.y, beltMesh.position.z);
            beltBody.quaternion.set(beltMesh.quaternion.x, beltMesh.quaternion.y, beltMesh.quaternion.z, beltMesh.quaternion.w);
            world.addBody(beltBody);
            // 縦ベルト
            const sideBeltWidth = 6;
            const sideBeltHeight = groundHeight + beltHeight;
            const sideBeltDepth = 2;
            const sideBeltMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({ color: 0xffffff });
            const sideBeltGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(sideBeltHeight, sideBeltDepth, sideBeltWidth);
            if (i != 0) {
                // 左サイドベルト
                const sideBeltLMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(sideBeltGeometry, sideBeltMaterial);
                sideBeltLMesh.position.set(centerX + sideBeltHeight / 2, centerY - (groundDepth + beltDepth), centerZ - (groundWidth / 2 + 2 * garterRadius + sideBeltWidth / 2));
                this.scene.add(sideBeltLMesh);
                const sideBeltMass = 0;
                const sideBeltShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(sideBeltHeight / 2, sideBeltDepth / 2, sideBeltWidth / 2));
                const sideBeltMaterialPhys = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Material('sideBeltMaterial');
                // 左サイドベルト　物理演算
                const sideBeltLBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({
                    mass: sideBeltMass,
                    material: sideBeltMaterialPhys,
                });
                this.sideBeltLBody = sideBeltLBody;
                sideBeltLBody.addShape(sideBeltShape);
                sideBeltLBody.position.set(sideBeltHeight / 2, -(groundDepth + beltDepth), -(groundWidth / 2 + 2 * garterRadius + sideBeltWidth / 2));
                world.addBody(sideBeltLBody);
                // ボール運ぶ機械
                const machineMesh = loadOBJ("./machine.obj", "./machine.mtl");
                const machineX = centerX - 30;
                const machineY = centerY + 2;
                const machineZ = centerZ - (groundWidth / 2 + sideBeltWidth / 2 + 2 * garterRadius);
                const machineLaneHeight = 40;
                const machineLaneDepth = 2;
                const machineLaneX = machineX - machineLaneHeight / 2;
                const stopperHeight = 2;
                if (i % 2 === 1) {
                    machineMesh.position.set(machineX, machineY, machineZ);
                    machineMesh.rotation.set(0, -Math.PI / 2, 0);
                    machineMesh.scale.set(2, 2, 2);
                    this.scene.add(machineMesh);
                    const machineLaneMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({ color: 0xffffff });
                    const machineLaneGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(machineLaneHeight, machineLaneDepth, sideBeltWidth);
                    const machineLaneMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(machineLaneGeometry, machineLaneMaterial);
                    machineLaneMesh.position.set(machineLaneX, machineY, machineZ);
                    this.scene.add(machineLaneMesh);
                    const machineLaneShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(machineLaneHeight / 2, machineLaneDepth / 2, sideBeltWidth / 2));
                    const machineLaneBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({
                        mass: 0,
                        shape: machineLaneShape,
                        position: new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(machineLaneMesh.position.x, machineLaneMesh.position.y, machineLaneMesh.position.z)
                    });
                    world.addBody(machineLaneBody);
                    const stopperMaterial = machineLaneMaterial;
                    const stopperGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(stopperHeight, machineLaneDepth, sideBeltWidth);
                    const stopperMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(stopperGeometry, stopperMaterial);
                    stopperMesh.position.set(machineLaneX - machineLaneHeight / 2, machineY + machineLaneDepth, machineZ);
                    this.scene.add(stopperMesh);
                    const stopperShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(stopperHeight / 2, machineLaneDepth / 2, sideBeltWidth / 2));
                    const stopperBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({
                        mass: 0,
                        shape: stopperShape,
                        position: new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(stopperMesh.position.x, stopperMesh.position.y, stopperMesh.position.z)
                    });
                    world.addBody(stopperBody);
                }
                // カバー
                const coverWidth = sideBeltWidth;
                const coverHeight = groundHeight;
                const coverDepth = 4;
                const coverMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({ color: 0xff0000 });
                const coverGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.BoxGeometry(coverHeight, coverDepth, coverWidth);
                const coverShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(coverHeight / 2, coverDepth / 2, coverWidth / 2));
                const coverMeshL = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(coverGeometry, coverMaterial);
                coverMeshL.position.set(centerX + coverHeight / 2, centerY + coverDepth / 2 - garterRadius, centerZ - (groundWidth / 2 + 2 * garterRadius + coverWidth / 2));
                this.scene.add(coverMeshL);
                const coverBodyL = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({
                    mass: 0,
                    shape: coverShape,
                    position: new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Vec3(coverMeshL.position.x, coverMeshL.position.y, coverMeshL.position.z)
                });
                world.addBody(coverBodyL);
            }
            if (i === Math.floor(num / 2)) {
                // 球
                const sphereRadius = 2;
                const sphereMaterial = new three__WEBPACK_IMPORTED_MODULE_3__.MeshPhongMaterial({ color: 0xff0000 });
                const sphereGeometry = new three__WEBPACK_IMPORTED_MODULE_3__.SphereGeometry(sphereRadius);
                const sphereMesh = new three__WEBPACK_IMPORTED_MODULE_3__.Mesh(sphereGeometry, sphereMaterial);
                this.sphereMesh = sphereMesh;
                sphereMesh.position.set(centerX - 5, centerY + 5, centerZ + 2);
                this.scene.add(sphereMesh);
                // 球演算
                const sphereShape = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Sphere(sphereRadius);
                const sphereBody = new cannon_es__WEBPACK_IMPORTED_MODULE_4__.Body({ mass: 10 });
                this.sphereBody = sphereBody;
                sphereBody.addShape(sphereShape);
                sphereBody.position.set(sphereMesh.position.x, sphereMesh.position.y, sphereMesh.position.z);
                sphereBody.quaternion.set(sphereMesh.quaternion.x, sphereMesh.quaternion.y, sphereMesh.quaternion.z, sphereMesh.quaternion.w);
                // 初速を与える
                sphereBody.velocity.set(0, 0, 0);
                // 横向きベルトとの衝突判定
                sphereBody.addEventListener('collide', (event) => {
                    const otherBody = event.body;
                    // beltBody に衝突したときのみ処理
                    if (otherBody === beltBody) {
                        sphereBody.velocity.set(0, 0, -40);
                    }
                    if (otherBody === this.sideBeltLBody) {
                        sphereBody.velocity.set(-120, 0, 0);
                    }
                });
                world.addBody(sphereBody);
            }
        }
        // ライト設定
        this.light = new three__WEBPACK_IMPORTED_MODULE_3__.DirectionalLight(0xffffff);
        const lvec = new three__WEBPACK_IMPORTED_MODULE_3__.Vector3(-10, 10, 1).clone().normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);
        let arrowAction = true;
        let enterAction = true;
        // 中央ディスプレイ
        this.displayMesh = this.createTextDisplay("倒れたピン: 0", new three__WEBPACK_IMPORTED_MODULE_3__.Vector3(100, 50, 0), new three__WEBPACK_IMPORTED_MODULE_3__.Euler(0, -Math.PI / 2, 0), 24);
        // 右ディスプレイ
        const displayMesh2 = this.createTextDisplay("ヒント \n球を投げている間も \nキー操作が...", new three__WEBPACK_IMPORTED_MODULE_3__.Vector3(100, 50, 100), new three__WEBPACK_IMPORTED_MODULE_3__.Euler(0, -Math.PI / 2, 0), 18);
        // 左ディスプレイ
        const displayMesh3 = this.createTextDisplay("操作説明 \n左右キー：ボール移動 \nEnter：投げる \nr：リセット", new three__WEBPACK_IMPORTED_MODULE_3__.Vector3(100, 50, -100), new three__WEBPACK_IMPORTED_MODULE_3__.Euler(0, -Math.PI / 2, 0), 18);
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Enter':
                    if (enterAction) {
                        this.sphereBody.velocity.set(150, 0, 0);
                        this.cameraAct();
                        enterAction = false;
                        setTimeout(() => {
                            arrowAction = false;
                        }, 2000);
                        setTimeout(() => {
                            const fallen = this.countFallenPins();
                            this.fallen = fallen;
                            console.log(`倒れたピンの本数: ${fallen}`);
                            const label = document.getElementById('pinCountLabel');
                            if (label)
                                label.innerText = `倒れたピン: ${fallen}`;
                            this.updateTextDisplay(this.displayMesh, `倒れたピン: ${fallen}`, 24, fallen);
                        }, 8000);
                    }
                    break;
                case 'ArrowRight':
                    if (arrowAction) {
                        if (this.sphereBody.position.z < this.groundWidth / 2 + this.garterRadius) {
                            this.sphereBody.position.z += 0.5;
                        }
                    }
                    break;
                case 'ArrowLeft':
                    if (arrowAction) {
                        if (this.sphereBody.position.z > -(this.groundWidth / 2 + this.garterRadius)) {
                            this.sphereBody.position.z -= 0.5;
                        }
                    }
                    break;
                case 'r':
                case 'R':
                    resetPins();
                    this.sphereBody.position.set(-5, 5, 2);
                    this.sphereBody.velocity.set(0, 0, 0);
                    this.sphereBody.angularVelocity.set(0, 0, 0);
                    setTimeout(() => {
                        arrowAction = true;
                        enterAction = true;
                    }, 1000);
                    break;
            }
        });
        let update = (time) => {
            world.fixedStep();
            this.sphereMesh.position.set(this.sphereBody.position.x, this.sphereBody.position.y, this.sphereBody.position.z);
            this.sphereMesh.quaternion.set(this.sphereBody.quaternion.x, this.sphereBody.quaternion.y, this.sphereBody.quaternion.z, this.sphereBody.quaternion.w);
            if (this.sphereBody.position.y <= -10) {
                this.sphereBody.position.set(-34, 5, -22);
                this.sphereBody.velocity.set(-2, 0, 0);
                this.sphereBody.angularVelocity.set(0, 0, 0);
            }
            for (let i = 0; i < pinMeshes.length; i++) {
                pinMeshes[i].position.set(pinBodies[i].position.x, pinBodies[i].position.y, pinBodies[i].position.z);
                pinMeshes[i].quaternion.set(pinBodies[i].quaternion.x, pinBodies[i].quaternion.y, pinBodies[i].quaternion.z, pinBodies[i].quaternion.w);
            }
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };
}
window.addEventListener("DOMContentLoaded", init);
function init() {
    let container = new ThreeJSContainer();
    let viewport = container.createRendererDOM(640, 480, new three__WEBPACK_IMPORTED_MODULE_3__.Vector3(-80, 15, 0));
    document.body.appendChild(viewport);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcgprendering"] = self["webpackChunkcgprendering"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_cannon-es_dist_cannon-es_js-node_modules_three_examples_jsm_controls_Orb-06f8e5"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFaERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQgeyBPcmJpdENvbnRyb2xzIH0gZnJvbSBcInRocmVlL2V4YW1wbGVzL2pzbS9jb250cm9scy9PcmJpdENvbnRyb2xzXCI7XG5pbXBvcnQgKiBhcyBDQU5OT04gZnJvbSAnY2Fubm9uLWVzJztcbmltcG9ydCB7IE1UTExvYWRlciB9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL01UTExvYWRlci5qcyc7XG5pbXBvcnQgeyBPQkpMb2FkZXIgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vbG9hZGVycy9PQkpMb2FkZXIuanMnO1xuXG5sZXQgZGViYWdNb2RlID0gZmFsc2U7XG5cbmNsYXNzIFRocmVlSlNDb250YWluZXIge1xuICAgIHByaXZhdGUgc2NlbmU6IFRIUkVFLlNjZW5lO1xuICAgIHByaXZhdGUgbGlnaHQ6IFRIUkVFLkxpZ2h0O1xuICAgIHByaXZhdGUgY2FtZXJhOiBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYTtcbiAgICBwcml2YXRlIG9yYml0Q29udHJvbHM6IE9yYml0Q29udHJvbHM7XG4gICAgcHJpdmF0ZSBmYWxsZW47XG4gICAgcHJpdmF0ZSBkaXNwbGF5TWVzaDogVEhSRUUuTWVzaDtcbiAgICBwcml2YXRlIHNwaGVyZU1lc2g6IFRIUkVFLk1lc2g7XG4gICAgcHJpdmF0ZSBzcGhlcmVCb2R5OiBDQU5OT04uQm9keTtcbiAgICBwcml2YXRlIHNpZGVCZWx0TEJvZHk6IENBTk5PTi5Cb2R5O1xuICAgIHByaXZhdGUgcGluTWVzaDogVEhSRUUuT2JqZWN0M0Q7XG4gICAgcHJpdmF0ZSBwaW5Cb2R5OiBDQU5OT04uQm9keTtcbiAgICBwcml2YXRlIHBpbkJvZGllczogQ0FOTk9OLkJvZHlbXSA9IFtdO1xuICAgIHByaXZhdGUgcGluTWVzaGVzOiBUSFJFRS5PYmplY3QzRFtdO1xuICAgIHByaXZhdGUgZ3JvdW5kV2lkdGg7XG4gICAgcHJpdmF0ZSBnYXJ0ZXJSYWRpdXM7XG5cblxuXG5cbiAgICAvLyDnlLvpnaLpg6jliIbjga7kvZzmiJAo6KGo56S644GZ44KL5p6g44GU44Go44GrKSpcbiAgICBwdWJsaWMgY3JlYXRlUmVuZGVyZXJET00gPSAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNhbWVyYVBvczogVEhSRUUuVmVjdG9yMykgPT4ge1xuICAgICAgICBjb25zdCByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4gICAgICAgIHJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IobmV3IFRIUkVFLkNvbG9yKDB4MDAwMDAwKSk7XG4gICAgICAgIHJlbmRlcmVyLnNoYWRvd01hcC5lbmFibGVkID0gdHJ1ZTsgLy/jgrfjg6Pjg4njgqbjg57jg4Pjg5fjgpLmnInlirnjgavjgZnjgotcblxuICAgICAgICAvL+OCq+ODoeODqeOBruioreWumlxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg3NSwgd2lkdGggLyBoZWlnaHQsIDAuMSwgMTAwMCk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLmNvcHkoY2FtZXJhUG9zKTtcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcblxuICAgICAgICB0aGlzLm9yYml0Q29udHJvbHMgPSBuZXcgT3JiaXRDb250cm9scyh0aGlzLmNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5jcmVhdGVTY2VuZSgpO1xuICAgICAgICAvLyDmr47jg5Xjg6zjg7zjg6Djga51cGRhdGXjgpLlkbzjgpPjgafvvIxyZW5kZXJcbiAgICAgICAgLy8gcmVxZXN0QW5pbWF0aW9uRnJhbWUg44Gr44KI44KK5qyh44OV44Os44O844Og44KS5ZG844G2XG4gICAgICAgIGNvbnN0IHJlbmRlcjogRnJhbWVSZXF1ZXN0Q2FsbGJhY2sgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vcmJpdENvbnRyb2xzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuXG4gICAgICAgIGNvbnN0IHBpbkNvdW50TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcGluQ291bnRMYWJlbC5pZCA9ICdwaW5Db3VudExhYmVsJztcbiAgICAgICAgcGluQ291bnRMYWJlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHBpbkNvdW50TGFiZWwuc3R5bGUudG9wID0gJzEwcHgnO1xuICAgICAgICBwaW5Db3VudExhYmVsLnN0eWxlLmxlZnQgPSAnMTBweCc7XG4gICAgICAgIHBpbkNvdW50TGFiZWwuc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICBwaW5Db3VudExhYmVsLnN0eWxlLmZvbnRTaXplID0gJzI0cHgnO1xuICAgICAgICBwaW5Db3VudExhYmVsLnN0eWxlLmZvbnRGYW1pbHkgPSAnQXJpYWwnO1xuICAgICAgICBwaW5Db3VudExhYmVsLnN0eWxlLnpJbmRleCA9ICcxMDAnO1xuICAgICAgICBwaW5Db3VudExhYmVsLmlubmVyVGV4dCA9ICflgJLjgozjgZ/jg5Tjg7M6IDAnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBpbkNvdW50TGFiZWwpO1xuXG4gICAgICAgIHJldHVybiByZW5kZXJlci5kb21FbGVtZW50O1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW1lcmFBY3QoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uc2V0KDgwLCAyMCwgMTApO1xuICAgICAgICAgICAgdGhpcy5vcmJpdENvbnRyb2xzLnRhcmdldC5zZXQoMTIwLCA1LCAwKTtcbiAgICAgICAgICAgIHRoaXMub3JiaXRDb250cm9scy51cGRhdGUoKTtcbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnNldCgtODAsIDE1LCAwKTtcbiAgICAgICAgICAgIHRoaXMub3JiaXRDb250cm9scy50YXJnZXQuc2V0KDAsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy5vcmJpdENvbnRyb2xzLnVwZGF0ZSgpO1xuICAgICAgICB9LCAxMDUwMCk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGNvdW50RmFsbGVuUGlucygpOiBudW1iZXIge1xuICAgICAgICBsZXQgZmFsbGVuQ291bnQgPSAwO1xuXG4gICAgICAgIGZvciAoY29uc3QgYm9keSBvZiB0aGlzLnBpbkJvZGllcykge1xuICAgICAgICAgICAgY29uc3QgdXAgPSBuZXcgQ0FOTk9OLlZlYzMoMCwgMSwgMCk7XG4gICAgICAgICAgICBjb25zdCBib2R5VXAgPSBib2R5LnF1YXRlcm5pb24udm11bHQobmV3IENBTk5PTi5WZWMzKDAsIDEsIDApKTtcbiAgICAgICAgICAgIGNvbnN0IGRvdCA9IHVwLmRvdChib2R5VXApO1xuICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmFjb3MoZG90KTtcbiAgICAgICAgICAgIGNvbnN0IGFuZ2xlRGVnID0gYW5nbGUgKiAoMTgwIC8gTWF0aC5QSSk7XG5cbiAgICAgICAgICAgIGlmIChhbmdsZURlZyA+IDE1KSB7XG4gICAgICAgICAgICAgICAgZmFsbGVuQ291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxsZW5Db3VudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVRleHREaXNwbGF5KFxuICAgICAgICB0ZXh0OiBzdHJpbmcsXG4gICAgICAgIHBvc2l0aW9uOiBUSFJFRS5WZWN0b3IzLFxuICAgICAgICByb3RhdGlvbjogVEhSRUUuRXVsZXIgPSBuZXcgVEhSRUUuRXVsZXIoMCwgMCwgMCksXG4gICAgICAgIGZvbnRTaXplOiBudW1iZXIgPSAyMFxuICAgICk6IFRIUkVFLk1lc2gge1xuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMud2lkdGggPSAyNTY7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSAxMjg7XG4gICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xuXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgICBjdHguZm9udCA9IGAke2ZvbnRTaXplfXB4IEFyaWFsYDtcblxuICAgICAgICBjb25zdCBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBjb25zdCBsaW5lSGVpZ2h0ID0gZm9udFNpemUgKiAxLjI7XG5cbiAgICAgICAgLy8g5LiA6KGM44Gq44KJ5LiK5LiL5Lit5aSu5o+D44GI44CB6KSH5pWw6KGM44Gq44KJ5LiK6Kmw44KBXG4gICAgICAgIGxldCBiYXNlWSA9IGxpbmVzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgPyAoY2FudmFzLmhlaWdodCArIGZvbnRTaXplKSAvIDJcbiAgICAgICAgICAgIDogNDA7XG5cbiAgICAgICAgbGluZXMuZm9yRWFjaCgobGluZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dChsaW5lLCAyNSwgYmFzZVkgKyBpbmRleCAqIGxpbmVIZWlnaHQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0ZXh0dXJlID0gbmV3IFRIUkVFLkNhbnZhc1RleHR1cmUoY2FudmFzKTtcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRleHR1cmUsIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDQwLCAyMCk7XG4gICAgICAgIGNvbnN0IG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuXG4gICAgICAgIG1lc2gucG9zaXRpb24uY29weShwb3NpdGlvbik7XG4gICAgICAgIG1lc2gucm90YXRpb24uY29weShyb3RhdGlvbik7XG4gICAgICAgIG1lc2guc2NhbGUuc2V0KDIuNSwgMi41LCAyLjUpO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZChtZXNoKTtcblxuICAgICAgICBtZXNoLnVzZXJEYXRhID0geyBjYW52YXMsIHRleHR1cmUsIGN0eCwgZm9udFNpemUgfTtcblxuICAgICAgICByZXR1cm4gbWVzaDtcbiAgICB9XG5cblxuXG4gICAgcHJpdmF0ZSB1cGRhdGVUZXh0RGlzcGxheShtZXNoOiBUSFJFRS5NZXNoLCB0ZXh0OiBzdHJpbmcsIGZvbnRTaXplOiBudW1iZXIgPSAyNCwgcGluczogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBtZXNoLnVzZXJEYXRhO1xuICAgICAgICBjb25zdCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCA9IGRhdGEuY3R4O1xuICAgICAgICBjb25zdCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ID0gZGF0YS5jYW52YXM7XG5cbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcbiAgICAgICAgY3R4LmZvbnQgPSBgJHtmb250U2l6ZX1weCBBcmlhbGA7XG5cbiAgICAgICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gKHBpbnMgPT09IDEwKSA/IFtcIlNUUklLRSEhIVwiXSA6IHRleHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBjb25zdCBsaW5lSGVpZ2h0ID0gZm9udFNpemUgKiAxLjI7XG5cbiAgICAgICAgY29uc3QgYmFzZVkgPSBsaW5lcy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gKGNhbnZhcy5oZWlnaHQgKyBmb250U2l6ZSkgLyAyXG4gICAgICAgICAgICA6IDQwO1xuXG4gICAgICAgIGxpbmVzLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQobGluZSwgMjUsIGJhc2VZICsgaW5kZXggKiBsaW5lSGVpZ2h0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGF0YS50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cblxuXG5cblxuICAgIHByaXZhdGUgY3JlYXRlU2NlbmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuXG4gICAgICAgIGlmIChkZWJhZ01vZGUpIHtcbiAgICAgICAgICAgIC8vIOOCsOODquODg+ODieihqOekulxuICAgICAgICAgICAgY29uc3QgZ3JpZEhlbHBlciA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwMDAsIDEwMDApO1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQoZ3JpZEhlbHBlcik7XG4gICAgICAgICAgICAvLyDou7jooajnpLpcbiAgICAgICAgICAgIGNvbnN0IGF4ZXNIZWxwZXIgPSBuZXcgVEhSRUUuQXhlc0hlbHBlcigxMDAwKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKGF4ZXNIZWxwZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd29ybGQgPSBuZXcgQ0FOTk9OLldvcmxkKHsgZ3Jhdml0eTogbmV3IENBTk5PTi5WZWMzKDAsIC0xMDAsIDApIH0pO1xuICAgICAgICB3b3JsZC5kZWZhdWx0Q29udGFjdE1hdGVyaWFsLmZyaWN0aW9uID0gMC4wMTtcbiAgICAgICAgd29ybGQuZGVmYXVsdENvbnRhY3RNYXRlcmlhbC5yZXN0aXR1dGlvbiA9IDAuMztcblxuICAgICAgICBsZXQgbG9hZE9CSiA9IChvYmpGaWxlUGF0aDogc3RyaW5nLCBtdGxGaWxlUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBsZXQgb2JqZWN0ID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgICAgICAgICAgY29uc3QgbXRsTG9hZGVyID0gbmV3IE1UTExvYWRlcigpO1xuICAgICAgICAgICAgbXRsTG9hZGVyLmxvYWQobXRsRmlsZVBhdGgsIChtYXRlcmlhbCkgPT4ge1xuICAgICAgICAgICAgICAgIG1hdGVyaWFsLnByZWxvYWQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmpMb2FkZXIgPSBuZXcgT0JKTG9hZGVyKCk7XG4gICAgICAgICAgICAgICAgb2JqTG9hZGVyLnNldE1hdGVyaWFscyhtYXRlcmlhbCk7XG4gICAgICAgICAgICAgICAgb2JqTG9hZGVyLmxvYWQob2JqRmlsZVBhdGgsIChvYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmFkZChvYmopO1xuXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBpbk1lc2hlczogVEhSRUUuT2JqZWN0M0RbXSA9IFtdO1xuICAgICAgICBjb25zdCBwaW5Cb2RpZXM6IENBTk5PTi5Cb2R5W10gPSBbXTtcblxuXG4gICAgICAgIGNvbnN0IGJhc2VYID0gMTIwOyAgIC8vIOWlpeihjOOBjeaWueWQkeOBruW6p+aome+8iFjvvIlcbiAgICAgICAgY29uc3QgYmFzZVkgPSAxMDsgICAvLyDpq5jjgZVcbiAgICAgICAgY29uc3QgYmFzZVogPSAwOyAgICAvLyDmqKrmlrnlkJHjga7kuK3lpK5cbiAgICAgICAgY29uc3Qgc3BhY2luZyA9IDY7ICAvLyDjg5Tjg7PlkIzlo6vjga7plpPpmpRcblxuICAgICAgICBsZXQgcGluSW5kZXggPSAwO1xuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA0OyByb3crKykge1xuICAgICAgICAgICAgY29uc3QgcGluc0luUm93ID0gcm93ICsgMTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0WiA9IGJhc2VaIC0gKHNwYWNpbmcgKiAocGluc0luUm93IC0gMSkgLyAyKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaW5zSW5Sb3c7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBzdGFydFogKyBpICogc3BhY2luZztcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gYmFzZVggKyByb3cgKiBzcGFjaW5nO1xuXG4gICAgICAgICAgICAgICAgLy8g44OU44Oz44Gu6KaL44Gf55uuXG4gICAgICAgICAgICAgICAgY29uc3QgcGluTWVzaCA9IGxvYWRPQkooXCIuL3Bpbi5vYmpcIiwgXCIuL3Bpbi5tdGxcIik7XG4gICAgICAgICAgICAgICAgcGluTWVzaC5zY2FsZS5zZXQoMS41LCAxLjUsIDEuNSk7XG4gICAgICAgICAgICAgICAgcGluTWVzaC5wb3NpdGlvbi5zZXQoeCwgYmFzZVksIHopO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHBpbk1lc2gpO1xuICAgICAgICAgICAgICAgIHBpbk1lc2hlcy5wdXNoKHBpbk1lc2gpO1xuICAgICAgICAgICAgICAgIC8vIOODlOODs+OBrueJqeeQhua8lOeul+S9k1xuICAgICAgICAgICAgICAgIGNvbnN0IHBpblNoYXBlID0gbmV3IENBTk5PTi5DeWxpbmRlcigyLCAyLCA5LCAxNik7XG4gICAgICAgICAgICAgICAgY29uc3QgcGluQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDEgfSk7XG4gICAgICAgICAgICAgICAgcGluQm9keS5hZGRTaGFwZShwaW5TaGFwZSk7XG4gICAgICAgICAgICAgICAgcGluQm9keS5wb3NpdGlvbi5zZXQoeCwgYmFzZVksIHopO1xuICAgICAgICAgICAgICAgIHdvcmxkLmFkZEJvZHkocGluQm9keSk7XG4gICAgICAgICAgICAgICAgcGluQm9kaWVzLnB1c2gocGluQm9keSk7XG5cbiAgICAgICAgICAgICAgICAvLyDmnIDliJ3jga4x5YCL44KSdGhpcy5waW5NZXNo44Gr77yI5pei5a2Y5Yem55CG44Go5LqS5o+b77yJXG4gICAgICAgICAgICAgICAgaWYgKHBpbkluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGluTWVzaCA9IHBpbk1lc2g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGluQm9keSA9IHBpbkJvZHk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGluSW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBpbk1lc2hlcyA9IHBpbk1lc2hlcztcbiAgICAgICAgdGhpcy5waW5Cb2RpZXMgPSBwaW5Cb2RpZXM7XG5cblxuICAgICAgICBjb25zdCByZXNldFBpbnMgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBpbkJvZGllcy5mb3JFYWNoKChwaW5Cb2R5LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoKE1hdGguc3FydCg4ICogaW5kZXggKyAxKSAtIDEpIC8gMik7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXhJblJvdyA9IGluZGV4IC0gKHJvdyAqIChyb3cgKyAxKSkgLyAyO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBpbnNJblJvdyA9IHJvdyArIDE7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRaID0gMCAtIChzcGFjaW5nICogKHBpbnNJblJvdyAtIDEpIC8gMik7XG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IHN0YXJ0WiArIGluZGV4SW5Sb3cgKiBzcGFjaW5nO1xuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBiYXNlWCArIHJvdyAqIHNwYWNpbmc7XG4gICAgICAgICAgICAgICAgY29uc3QgeSA9IGJhc2VZO1xuXG4gICAgICAgICAgICAgICAgLy8gQ0FOTk9OIEJvZHnjga7nirbmhYvjg6rjgrvjg4Pjg4hcbiAgICAgICAgICAgICAgICBwaW5Cb2R5LnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcbiAgICAgICAgICAgICAgICBwaW5Cb2R5LnZlbG9jaXR5LnNldFplcm8oKTtcbiAgICAgICAgICAgICAgICBwaW5Cb2R5LmFuZ3VsYXJWZWxvY2l0eS5zZXRaZXJvKCk7XG4gICAgICAgICAgICAgICAgcGluQm9keS5xdWF0ZXJuaW9uLnNldCgwLCAwLCAwLCAxKTtcblxuICAgICAgICAgICAgICAgIC8vIFRIUkVFIE1lc2jjga7nirbmhYvjg6rjgrvjg4Pjg4hcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNoID0gdGhpcy5waW5NZXNoZXNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIG1lc2gucG9zaXRpb24uc2V0KHgsIHksIHopO1xuICAgICAgICAgICAgICAgIG1lc2gucm90YXRpb24uc2V0KDAsIDAsIDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cblxuXG4gICAgICAgIC8vIOOBi+OBuVxuICAgICAgICBjb25zdCB3YWxsV2lkdGggPSA0MDA7XG4gICAgICAgIGNvbnN0IHdhbGxIZWlnaHQgPSAzMDA7XG4gICAgICAgIGNvbnN0IHdhbGxEZXB0aCA9IDI7XG4gICAgICAgIGNvbnN0IHdhbGxNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7IGNvbG9yOiBuZXcgVEhSRUUuQ29sb3IoXCJyZ2JhKDI1NCwgMTM0LCA3NCwgMSlcIikgfSk7XG4gICAgICAgIGNvbnN0IHdhbGxHZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSh3YWxsRGVwdGgsIHdhbGxIZWlnaHQsIHdhbGxXaWR0aCk7XG4gICAgICAgIGNvbnN0IHdhbGxNZXNoID0gbmV3IFRIUkVFLk1lc2god2FsbEdlb21ldHJ5LCB3YWxsTWF0ZXJpYWwpO1xuICAgICAgICB3YWxsTWVzaC5wb3NpdGlvbi5zZXQoMTY1LCB3YWxsSGVpZ2h0IC8gMiAtIDIwLCAwKTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQod2FsbE1lc2gpO1xuXG4gICAgICAgIC8vIOOCq+ODmeeJqeeQhlxuICAgICAgICBjb25zdCB3YWxsU2hhcGUgPSBuZXcgQ0FOTk9OLkJveChuZXcgQ0FOTk9OLlZlYzMod2FsbERlcHRoIC8gMiwgd2FsbEhlaWdodCAvIDIsIHdhbGxXaWR0aCAvIDIpKTtcbiAgICAgICAgY29uc3Qgd2FsbEJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoe1xuICAgICAgICAgICAgbWFzczogMCxcbiAgICAgICAgfSk7XG4gICAgICAgIHdhbGxCb2R5LmFkZFNoYXBlKHdhbGxTaGFwZSk7XG4gICAgICAgIHdhbGxCb2R5LnBvc2l0aW9uLnNldCh3YWxsTWVzaC5wb3NpdGlvbi54LCB3YWxsTWVzaC5wb3NpdGlvbi55LCB3YWxsTWVzaC5wb3NpdGlvbi56KTtcbiAgICAgICAgd2FsbEJvZHkucXVhdGVybmlvbi5zZXQoXG4gICAgICAgICAgICB3YWxsTWVzaC5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICB3YWxsTWVzaC5xdWF0ZXJuaW9uLnksXG4gICAgICAgICAgICB3YWxsTWVzaC5xdWF0ZXJuaW9uLnosXG4gICAgICAgICAgICB3YWxsTWVzaC5xdWF0ZXJuaW9uLndcbiAgICAgICAgKTtcbiAgICAgICAgd29ybGQuYWRkQm9keSh3YWxsQm9keSk7XG5cbiAgICAgICAgLy8g5bqKXG4gICAgICAgIGNvbnN0IGZsb29yV2lkdGggPSA0MDA7XG4gICAgICAgIGNvbnN0IGZsb29ySGVpZ2h0ID0gMTAwO1xuICAgICAgICBjb25zdCBmbG9vckRlcHRoID0gMTtcbiAgICAgICAgY29uc3QgZmxvb3JNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7IGNvbG9yOiAweEU2Qzc5QyB9KTtcbiAgICAgICAgY29uc3QgZmxvb3JHZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShmbG9vckhlaWdodCwgZmxvb3JEZXB0aCwgZmxvb3JXaWR0aCk7XG4gICAgICAgIGNvbnN0IGZsb29yTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGZsb29yR2VvbWV0cnksIGZsb29yTWF0ZXJpYWwpO1xuICAgICAgICBmbG9vck1lc2gucG9zaXRpb24uc2V0KC1mbG9vckhlaWdodCAvIDIsIC1mbG9vckRlcHRoIC8gMiwgMCk7XG4gICAgICAgIC8vIEVkZ2VzR2VvbWV0cnkg44KS5L2/44Gj44Gm44CBQm94R2VvbWV0cnkg44Gu44Ko44OD44K477yI5p6g57ea77yJ44KS5Y+W5b6XXG4gICAgICAgIGNvbnN0IGZsb29yRWRnZXMgPSBuZXcgVEhSRUUuRWRnZXNHZW9tZXRyeShmbG9vckdlb21ldHJ5KTtcbiAgICAgICAgLy8g44Op44Kk44Oz44Oe44OG44Oq44Ki44Or77yI6buS44GE57ea77yJ44KS5L2c5oiQXG4gICAgICAgIGNvbnN0IGxpbmVNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiAweDAwMDAwMCB9KTsgLy8g5p6g57ea44Gu6Imy77yI6buS77yJXG4gICAgICAgIC8vIOODqeOCpOODs+OCkueUn+aIkOOBl+OAgeS9jee9ruOCkiBmbG9vck1lc2gg44Gr5ZCI44KP44Gb44KLXG4gICAgICAgIGNvbnN0IGZsb29yTGluZSA9IG5ldyBUSFJFRS5MaW5lU2VnbWVudHMoZmxvb3JFZGdlcywgbGluZU1hdGVyaWFsKTtcbiAgICAgICAgZmxvb3JMaW5lLnBvc2l0aW9uLmNvcHkoZmxvb3JNZXNoLnBvc2l0aW9uKTtcbiAgICAgICAgZmxvb3JMaW5lLnJvdGF0aW9uLmNvcHkoZmxvb3JNZXNoLnJvdGF0aW9uKTsgLy8g5Zue6Lui44GM44GC44KL5aC05ZCI44KC5a++5b+cXG5cbiAgICAgICAgLy8g44K344O844Oz44Gr6L+95YqgXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGZsb29yTGluZSk7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGZsb29yTWVzaCk7XG5cbiAgICAgICAgY29uc3QgZmxvb3JTaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMyhmbG9vckhlaWdodCAvIDIsIGZsb29yRGVwdGggLyAyLCBmbG9vcldpZHRoIC8gMikpO1xuICAgICAgICBjb25zdCBmbG9vckJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoe1xuICAgICAgICAgICAgbWFzczogMCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgQ0FOTk9OLlZlYzMoXG4gICAgICAgICAgICAgICAgZmxvb3JNZXNoLnBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgZmxvb3JNZXNoLnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgZmxvb3JNZXNoLnBvc2l0aW9uLnpcbiAgICAgICAgICAgICksXG4gICAgICAgIH0pXG4gICAgICAgIGZsb29yQm9keS5hZGRTaGFwZShmbG9vclNoYXBlKTtcbiAgICAgICAgd29ybGQuYWRkQm9keShmbG9vckJvZHkpO1xuXG5cbiAgICAgICAgY29uc3QgbnVtID0gNztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2VudGVyWCA9IDA7XG4gICAgICAgICAgICBjb25zdCBjZW50ZXJZID0gMDtcbiAgICAgICAgICAgIGNvbnN0IGNlbnRlclogPSAtMTMyICsgNDQgKiBpO1xuXG4gICAgICAgICAgICAvLyDjg6zjg7zjg7NcbiAgICAgICAgICAgIGNvbnN0IGJveE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHsgY29sb3I6IDB4RTZDNzlDIH0pO1xuICAgICAgICAgICAgY29uc3QgZ3JvdW5kV2lkdGggPSAzMDtcbiAgICAgICAgICAgIGNvbnN0IGdyb3VuZEhlaWdodCA9IDE1MDtcbiAgICAgICAgICAgIGNvbnN0IGdyb3VuZERlcHRoID0gNDtcbiAgICAgICAgICAgIGNvbnN0IGJveEdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KGdyb3VuZEhlaWdodCwgZ3JvdW5kRGVwdGgsIGdyb3VuZFdpZHRoKTtcbiAgICAgICAgICAgIGNvbnN0IGdyb3VuZE1lc2ggPSBuZXcgVEhSRUUuTWVzaChib3hHZW9tZXRyeSwgYm94TWF0ZXJpYWwpO1xuICAgICAgICAgICAgZ3JvdW5kTWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIGdyb3VuZE1lc2gucG9zaXRpb24uc2V0KGNlbnRlclggKyBncm91bmRIZWlnaHQgLyAyLCBjZW50ZXJZIC0gZ3JvdW5kRGVwdGggLyAyLCBjZW50ZXJaKTtcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kV2lkdGggPSBncm91bmRXaWR0aDtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKGdyb3VuZE1lc2gpO1xuXG4gICAgICAgICAgICAvLyDjg6zjg7zjg7NcbiAgICAgICAgICAgIGNvbnN0IGdyb3VuZFNoYXBlID0gbmV3IENBTk5PTi5Cb3gobmV3IENBTk5PTi5WZWMzKGdyb3VuZEhlaWdodCAvIDIsIGdyb3VuZERlcHRoIC8gMiwgZ3JvdW5kV2lkdGggLyAyKSk7XG4gICAgICAgICAgICBjb25zdCBncm91bmRCb2R5ID0gbmV3IENBTk5PTi5Cb2R5KHsgbWFzczogMCB9KTtcbiAgICAgICAgICAgIGdyb3VuZEJvZHkuYWRkU2hhcGUoZ3JvdW5kU2hhcGUpO1xuICAgICAgICAgICAgZ3JvdW5kQm9keS5wb3NpdGlvbi5zZXQoZ3JvdW5kTWVzaC5wb3NpdGlvbi54LCBncm91bmRNZXNoLnBvc2l0aW9uLnksIGdyb3VuZE1lc2gucG9zaXRpb24ueik7XG4gICAgICAgICAgICBncm91bmRCb2R5LnF1YXRlcm5pb24uc2V0KFxuICAgICAgICAgICAgICAgIGdyb3VuZE1lc2gucXVhdGVybmlvbi54LFxuICAgICAgICAgICAgICAgIGdyb3VuZE1lc2gucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgICAgIGdyb3VuZE1lc2gucXVhdGVybmlvbi56LFxuICAgICAgICAgICAgICAgIGdyb3VuZE1lc2gucXVhdGVybmlvbi53XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgd29ybGQuYWRkQm9keShncm91bmRCb2R5KTtcblxuXG5cblxuICAgICAgICAgICAgLy8g44Ks44O844K/44O8XG4gICAgICAgICAgICBjb25zdCBnYXJ0ZXJSYWRpdXMgPSAyO1xuICAgICAgICAgICAgY29uc3QgZ2FydGVySGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgZ2FydGVyTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAweDAwMDAwMCxcbiAgICAgICAgICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGdhcnRlckdlb21ldHJ5ID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoZ2FydGVyUmFkaXVzLCBnYXJ0ZXJSYWRpdXMsIGdhcnRlckhlaWdodCwgMTAsIDEsIHRydWUsIE1hdGguUEksIE1hdGguUEkpO1xuICAgICAgICAgICAgdGhpcy5nYXJ0ZXJSYWRpdXMgPSBnYXJ0ZXJSYWRpdXM7XG5cbiAgICAgICAgICAgIC8vIOW3puOCrOODvOOCv+ODvFxuICAgICAgICAgICAgY29uc3QgZ2FydGVyTWVzaEwgPSBuZXcgVEhSRUUuTWVzaChnYXJ0ZXJHZW9tZXRyeSwgZ2FydGVyTWF0ZXJpYWwpO1xuICAgICAgICAgICAgZ2FydGVyTWVzaEwucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgICAgICBnYXJ0ZXJNZXNoTC5yb3RhdGlvbi5zZXQoMCwgMCwgTWF0aC5QSSAvIDIpO1xuICAgICAgICAgICAgZ2FydGVyTWVzaEwucG9zaXRpb24uc2V0KGNlbnRlclggKyBnYXJ0ZXJIZWlnaHQgLyAyLCBjZW50ZXJZLCBjZW50ZXJaIC0gKGdyb3VuZFdpZHRoIC8gMiArIGdhcnRlclJhZGl1cykpO1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQoZ2FydGVyTWVzaEwpO1xuXG4gICAgICAgICAgICAvLyDlj7Pjgqzjg7zjgr/jg7xcbiAgICAgICAgICAgIGNvbnN0IGdhcnRlck1lc2hSID0gbmV3IFRIUkVFLk1lc2goZ2FydGVyR2VvbWV0cnksIGdhcnRlck1hdGVyaWFsKTtcbiAgICAgICAgICAgIGdhcnRlck1lc2hSLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgICAgICAgICAgZ2FydGVyTWVzaFIucm90YXRpb24uc2V0KDAsIDAsIE1hdGguUEkgLyAyKTtcbiAgICAgICAgICAgIGdhcnRlck1lc2hSLnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgICAgICBjZW50ZXJYICsgZ2FydGVySGVpZ2h0IC8gMixcbiAgICAgICAgICAgICAgICBjZW50ZXJZLFxuICAgICAgICAgICAgICAgIGNlbnRlclogKyBncm91bmRXaWR0aCAvIDIgKyBnYXJ0ZXJSYWRpdXNcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLmFkZChnYXJ0ZXJNZXNoUik7XG5cblxuXG4gICAgICAgICAgICAvLyDjgqzjg7zjgr/jg7zkuItcbiAgICAgICAgICAgIGNvbnN0IHVuZGVyR2FydGVyRGVwdGggPSA4O1xuICAgICAgICAgICAgY29uc3QgdW5kZXJ0R2FydGVyR2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoZ2FydGVySGVpZ2h0LCB1bmRlckdhcnRlckRlcHRoLCAyICogZ2FydGVyUmFkaXVzKTtcblxuXG4gICAgICAgICAgICAvL+W3puOCrOODvOOCv+ODvOS4i1xuICAgICAgICAgICAgY29uc3QgdW5kZXJ0R2FydGVyTE1lc2ggPSBuZXcgVEhSRUUuTWVzaCh1bmRlcnRHYXJ0ZXJHZW9tZXRyeSwgZ2FydGVyTWF0ZXJpYWwpO1xuICAgICAgICAgICAgdW5kZXJ0R2FydGVyTE1lc2gucG9zaXRpb24uc2V0KFxuICAgICAgICAgICAgICAgIGNlbnRlclggKyBnYXJ0ZXJIZWlnaHQgLyAyLFxuICAgICAgICAgICAgICAgIGNlbnRlclkgLSAoZ2FydGVyUmFkaXVzICsgdW5kZXJHYXJ0ZXJEZXB0aCAvIDIpLFxuICAgICAgICAgICAgICAgIGNlbnRlclogLSAoZ3JvdW5kV2lkdGggLyAyICsgZ2FydGVyUmFkaXVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHVuZGVydEdhcnRlckxNZXNoKTtcblxuICAgICAgICAgICAgLy8g5bem44Ks44O844K/44O85LiL77yI5ryU566X56m66ZaT77yJXG4gICAgICAgICAgICBjb25zdCB1bmRlcnRHYXJ0ZXJMU2hhcGUgPSBuZXcgQ0FOTk9OLkJveChuZXcgQ0FOTk9OLlZlYzMoZ2FydGVySGVpZ2h0IC8gMiwgdW5kZXJHYXJ0ZXJEZXB0aCAvIDIsIGdhcnRlclJhZGl1cykpO1xuICAgICAgICAgICAgY29uc3QgdW5kZXJ0R2FydGVyTEJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAwIH0pOyAvLyDlm7rlrprvvIjpnZnnmoTjgqrjg5bjgrjjgqfjgq/jg4jvvIlcbiAgICAgICAgICAgIHVuZGVydEdhcnRlckxCb2R5LmFkZFNoYXBlKHVuZGVydEdhcnRlckxTaGFwZSk7XG4gICAgICAgICAgICB1bmRlcnRHYXJ0ZXJMQm9keS5wb3NpdGlvbi5zZXQoXG4gICAgICAgICAgICAgICAgdW5kZXJ0R2FydGVyTE1lc2gucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICB1bmRlcnRHYXJ0ZXJMTWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIHVuZGVydEdhcnRlckxNZXNoLnBvc2l0aW9uLnpcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB1bmRlcnRHYXJ0ZXJMQm9keS5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgICAgICB1bmRlcnRHYXJ0ZXJMTWVzaC5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICAgICAgdW5kZXJ0R2FydGVyTE1lc2gucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgICAgIHVuZGVydEdhcnRlckxNZXNoLnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgICAgICB1bmRlcnRHYXJ0ZXJMTWVzaC5xdWF0ZXJuaW9uLndcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB3b3JsZC5hZGRCb2R5KHVuZGVydEdhcnRlckxCb2R5KTtcblxuICAgICAgICAgICAgLy/lj7Pjgqzjg7zjgr/jg7zkuItcbiAgICAgICAgICAgIGNvbnN0IHVuZGVydEdhcnRlclJNZXNoID0gbmV3IFRIUkVFLk1lc2godW5kZXJ0R2FydGVyR2VvbWV0cnksIGdhcnRlck1hdGVyaWFsKTtcbiAgICAgICAgICAgIHVuZGVydEdhcnRlclJNZXNoLnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgICAgICBjZW50ZXJYICsgZ2FydGVySGVpZ2h0IC8gMixcbiAgICAgICAgICAgICAgICBjZW50ZXJZIC0gKGdhcnRlclJhZGl1cyArIHVuZGVyR2FydGVyRGVwdGggLyAyKSxcbiAgICAgICAgICAgICAgICBjZW50ZXJaICsgZ3JvdW5kV2lkdGggLyAyICsgZ2FydGVyUmFkaXVzXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQodW5kZXJ0R2FydGVyUk1lc2gpO1xuXG4gICAgICAgICAgICAvLyDlj7Pjgqzjg7zjgr/jg7zkuIvvvIjmvJTnrpfnqbrplpPvvIlcbiAgICAgICAgICAgIGNvbnN0IHVuZGVydEdhcnRlclJTaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMyhnYXJ0ZXJIZWlnaHQgLyAyLCB1bmRlckdhcnRlckRlcHRoIC8gMiwgZ2FydGVyUmFkaXVzKSk7XG4gICAgICAgICAgICBjb25zdCB1bmRlcnRHYXJ0ZXJSQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDAgfSk7IC8vIOWbuuWumu+8iOmdmeeahOOCquODluOCuOOCp+OCr+ODiO+8iVxuICAgICAgICAgICAgdW5kZXJ0R2FydGVyUkJvZHkuYWRkU2hhcGUodW5kZXJ0R2FydGVyUlNoYXBlKTtcbiAgICAgICAgICAgIHVuZGVydEdhcnRlclJCb2R5LnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgICAgICB1bmRlcnRHYXJ0ZXJSTWVzaC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIHVuZGVydEdhcnRlclJNZXNoLnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgdW5kZXJ0R2FydGVyUk1lc2gucG9zaXRpb24uelxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHVuZGVydEdhcnRlclJCb2R5LnF1YXRlcm5pb24uc2V0KFxuICAgICAgICAgICAgICAgIHVuZGVydEdhcnRlclJNZXNoLnF1YXRlcm5pb24ueCxcbiAgICAgICAgICAgICAgICB1bmRlcnRHYXJ0ZXJSTWVzaC5xdWF0ZXJuaW9uLnksXG4gICAgICAgICAgICAgICAgdW5kZXJ0R2FydGVyUk1lc2gucXVhdGVybmlvbi56LFxuICAgICAgICAgICAgICAgIHVuZGVydEdhcnRlclJNZXNoLnF1YXRlcm5pb24ud1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHdvcmxkLmFkZEJvZHkodW5kZXJ0R2FydGVyUkJvZHkpO1xuXG5cblxuICAgICAgICAgICAgLy8g5qiq5ZCR44GN44OZ44Or44OIXG4gICAgICAgICAgICBjb25zdCBiZWx0V2lkdGggPSBncm91bmRXaWR0aCArIDQgKiBnYXJ0ZXJSYWRpdXM7XG4gICAgICAgICAgICBjb25zdCBiZWx0SGVpZ2h0ID0gMTU7XG4gICAgICAgICAgICBjb25zdCBiZWx0RGVwdGggPSA1O1xuICAgICAgICAgICAgY29uc3QgYmVsdE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHsgY29sb3I6IDB4ZmZmZmZmIH0pO1xuICAgICAgICAgICAgY29uc3QgYmVsdEdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KGJlbHRIZWlnaHQsIGJlbHREZXB0aCwgYmVsdFdpZHRoKTtcbiAgICAgICAgICAgIGNvbnN0IGJlbHRNZXNoID0gbmV3IFRIUkVFLk1lc2goYmVsdEdlb21ldHJ5LCBiZWx0TWF0ZXJpYWwpO1xuICAgICAgICAgICAgYmVsdE1lc2gucG9zaXRpb24uc2V0KFxuICAgICAgICAgICAgICAgIGNlbnRlclggKyBncm91bmRIZWlnaHQgKyBiZWx0SGVpZ2h0IC8gMixcbiAgICAgICAgICAgICAgICBjZW50ZXJZIC0gKGdyb3VuZERlcHRoICsgYmVsdERlcHRoIC8gMiksXG4gICAgICAgICAgICAgICAgY2VudGVyWlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKGJlbHRNZXNoKTtcblxuICAgICAgICAgICAgLy8g5qiq5ZCR44GN44OZ44Or44OI54mp55CG5ryU566XXG4gICAgICAgICAgICBjb25zdCBiZWx0U2hhcGUgPSBuZXcgQ0FOTk9OLkJveChuZXcgQ0FOTk9OLlZlYzMoYmVsdEhlaWdodCAvIDIsIGJlbHREZXB0aCAvIDIsIGJlbHRXaWR0aCAvIDIpKTtcbiAgICAgICAgICAgIGNvbnN0IGJlbHRCb2R5ID0gbmV3IENBTk5PTi5Cb2R5KHsgbWFzczogMCB9KTtcbiAgICAgICAgICAgIGJlbHRCb2R5LmFkZFNoYXBlKGJlbHRTaGFwZSk7XG4gICAgICAgICAgICBiZWx0Qm9keS5wb3NpdGlvbi5zZXQoXG4gICAgICAgICAgICAgICAgYmVsdE1lc2gucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICBiZWx0TWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIGJlbHRNZXNoLnBvc2l0aW9uLnpcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBiZWx0Qm9keS5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgICAgICBiZWx0TWVzaC5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICAgICAgYmVsdE1lc2gucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgICAgIGJlbHRNZXNoLnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgICAgICBiZWx0TWVzaC5xdWF0ZXJuaW9uLndcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB3b3JsZC5hZGRCb2R5KGJlbHRCb2R5KTtcblxuXG4gICAgICAgICAgICAvLyDnuKbjg5njg6vjg4hcbiAgICAgICAgICAgIGNvbnN0IHNpZGVCZWx0V2lkdGggPSA2O1xuICAgICAgICAgICAgY29uc3Qgc2lkZUJlbHRIZWlnaHQgPSBncm91bmRIZWlnaHQgKyBiZWx0SGVpZ2h0O1xuICAgICAgICAgICAgY29uc3Qgc2lkZUJlbHREZXB0aCA9IDI7XG4gICAgICAgICAgICBjb25zdCBzaWRlQmVsdE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHsgY29sb3I6IDB4ZmZmZmZmIH0pO1xuICAgICAgICAgICAgY29uc3Qgc2lkZUJlbHRHZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShzaWRlQmVsdEhlaWdodCwgc2lkZUJlbHREZXB0aCwgc2lkZUJlbHRXaWR0aCk7XG5cbiAgICAgICAgICAgIGlmIChpICE9IDApIHtcbiAgICAgICAgICAgICAgICAvLyDlt6bjgrXjgqTjg4njg5njg6vjg4hcbiAgICAgICAgICAgICAgICBjb25zdCBzaWRlQmVsdExNZXNoID0gbmV3IFRIUkVFLk1lc2goc2lkZUJlbHRHZW9tZXRyeSwgc2lkZUJlbHRNYXRlcmlhbCk7XG4gICAgICAgICAgICAgICAgc2lkZUJlbHRMTWVzaC5wb3NpdGlvbi5zZXQoXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlclggKyBzaWRlQmVsdEhlaWdodCAvIDIsXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlclkgLSAoZ3JvdW5kRGVwdGggKyBiZWx0RGVwdGgpLFxuICAgICAgICAgICAgICAgICAgICBjZW50ZXJaIC0gKGdyb3VuZFdpZHRoIC8gMiArIDIgKiBnYXJ0ZXJSYWRpdXMgKyBzaWRlQmVsdFdpZHRoIC8gMilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHNpZGVCZWx0TE1lc2gpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpZGVCZWx0TWFzcyA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2lkZUJlbHRTaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMyhzaWRlQmVsdEhlaWdodCAvIDIsIHNpZGVCZWx0RGVwdGggLyAyLCBzaWRlQmVsdFdpZHRoIC8gMikpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpZGVCZWx0TWF0ZXJpYWxQaHlzID0gbmV3IENBTk5PTi5NYXRlcmlhbCgnc2lkZUJlbHRNYXRlcmlhbCcpO1xuICAgICAgICAgICAgICAgIC8vIOW3puOCteOCpOODieODmeODq+ODiOOAgOeJqeeQhua8lOeul1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpZGVCZWx0TEJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoe1xuICAgICAgICAgICAgICAgICAgICBtYXNzOiBzaWRlQmVsdE1hc3MsXG4gICAgICAgICAgICAgICAgICAgIG1hdGVyaWFsOiBzaWRlQmVsdE1hdGVyaWFsUGh5cyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNpZGVCZWx0TEJvZHkgPSBzaWRlQmVsdExCb2R5XG4gICAgICAgICAgICAgICAgc2lkZUJlbHRMQm9keS5hZGRTaGFwZShzaWRlQmVsdFNoYXBlKTtcbiAgICAgICAgICAgICAgICBzaWRlQmVsdExCb2R5LnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgICAgICAgICAgc2lkZUJlbHRIZWlnaHQgLyAyLFxuICAgICAgICAgICAgICAgICAgICAtKGdyb3VuZERlcHRoICsgYmVsdERlcHRoKSxcbiAgICAgICAgICAgICAgICAgICAgLShncm91bmRXaWR0aCAvIDIgKyAyICogZ2FydGVyUmFkaXVzICsgc2lkZUJlbHRXaWR0aCAvIDIpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB3b3JsZC5hZGRCb2R5KHNpZGVCZWx0TEJvZHkpO1xuXG5cblxuICAgICAgICAgICAgICAgIC8vIOODnOODvOODq+mBi+OBtuapn+aisFxuICAgICAgICAgICAgICAgIGNvbnN0IG1hY2hpbmVNZXNoID0gbG9hZE9CSihcIi4vbWFjaGluZS5vYmpcIiwgXCIuL21hY2hpbmUubXRsXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hY2hpbmVYID0gY2VudGVyWCAtIDMwO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hY2hpbmVZID0gY2VudGVyWSArIDI7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFjaGluZVogPSBjZW50ZXJaIC0gKGdyb3VuZFdpZHRoIC8gMiArIHNpZGVCZWx0V2lkdGggLyAyICsgMiAqIGdhcnRlclJhZGl1cyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFjaGluZUxhbmVIZWlnaHQgPSA0MDtcbiAgICAgICAgICAgICAgICBjb25zdCBtYWNoaW5lTGFuZURlcHRoID0gMjtcbiAgICAgICAgICAgICAgICBjb25zdCBtYWNoaW5lTGFuZVggPSBtYWNoaW5lWCAtIG1hY2hpbmVMYW5lSGVpZ2h0IC8gMjtcbiAgICAgICAgICAgICAgICBjb25zdCBzdG9wcGVySGVpZ2h0ID0gMjtcbiAgICAgICAgICAgICAgICBpZiAoaSAlIDIgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFjaGluZU1lc2gucG9zaXRpb24uc2V0KG1hY2hpbmVYLCBtYWNoaW5lWSwgbWFjaGluZVopXG4gICAgICAgICAgICAgICAgICAgIG1hY2hpbmVNZXNoLnJvdGF0aW9uLnNldCgwLCAtTWF0aC5QSSAvIDIsIDApO1xuICAgICAgICAgICAgICAgICAgICBtYWNoaW5lTWVzaC5zY2FsZS5zZXQoMiwgMiwgMik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKG1hY2hpbmVNZXNoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYWNoaW5lTGFuZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHsgY29sb3I6IDB4ZmZmZmZmIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYWNoaW5lTGFuZUdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KG1hY2hpbmVMYW5lSGVpZ2h0LCBtYWNoaW5lTGFuZURlcHRoLCBzaWRlQmVsdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWFjaGluZUxhbmVNZXNoID0gbmV3IFRIUkVFLk1lc2gobWFjaGluZUxhbmVHZW9tZXRyeSwgbWFjaGluZUxhbmVNYXRlcmlhbClcbiAgICAgICAgICAgICAgICAgICAgbWFjaGluZUxhbmVNZXNoLnBvc2l0aW9uLnNldChtYWNoaW5lTGFuZVgsIG1hY2hpbmVZLCBtYWNoaW5lWik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKG1hY2hpbmVMYW5lTWVzaCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWFjaGluZUxhbmVTaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMyhtYWNoaW5lTGFuZUhlaWdodCAvIDIsIG1hY2hpbmVMYW5lRGVwdGggLyAyLCBzaWRlQmVsdFdpZHRoIC8gMikpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYWNoaW5lTGFuZUJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFzczogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoYXBlOiBtYWNoaW5lTGFuZVNoYXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBDQU5OT04uVmVjMyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWNoaW5lTGFuZU1lc2gucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWNoaW5lTGFuZU1lc2gucG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWNoaW5lTGFuZU1lc2gucG9zaXRpb24uelxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgd29ybGQuYWRkQm9keShtYWNoaW5lTGFuZUJvZHkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0b3BwZXJNYXRlcmlhbCA9IG1hY2hpbmVMYW5lTWF0ZXJpYWw7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0b3BwZXJHZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShzdG9wcGVySGVpZ2h0LCBtYWNoaW5lTGFuZURlcHRoLCBzaWRlQmVsdFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RvcHBlck1lc2ggPSBuZXcgVEhSRUUuTWVzaChzdG9wcGVyR2VvbWV0cnksIHN0b3BwZXJNYXRlcmlhbCk7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BwZXJNZXNoLnBvc2l0aW9uLnNldChtYWNoaW5lTGFuZVggLSBtYWNoaW5lTGFuZUhlaWdodCAvIDIsIG1hY2hpbmVZICsgbWFjaGluZUxhbmVEZXB0aCwgbWFjaGluZVopO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjZW5lLmFkZChzdG9wcGVyTWVzaCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RvcHBlclNoYXBlID0gbmV3IENBTk5PTi5Cb3gobmV3IENBTk5PTi5WZWMzKHN0b3BwZXJIZWlnaHQgLyAyLCBtYWNoaW5lTGFuZURlcHRoIC8gMiwgc2lkZUJlbHRXaWR0aCAvIDIpKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdG9wcGVyQm9keSA9IG5ldyBDQU5OT04uQm9keSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hhcGU6IHN0b3BwZXJTaGFwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgQ0FOTk9OLlZlYzMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcHBlck1lc2gucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9wcGVyTWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BwZXJNZXNoLnBvc2l0aW9uLnpcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgd29ybGQuYWRkQm9keShzdG9wcGVyQm9keSk7XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICAvLyDjgqvjg5Djg7xcbiAgICAgICAgICAgICAgICBjb25zdCBjb3ZlcldpZHRoID0gc2lkZUJlbHRXaWR0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3ZlckhlaWdodCA9IGdyb3VuZEhlaWdodDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3ZlckRlcHRoID0gNDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3Zlck1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHsgY29sb3I6IDB4ZmYwMDAwIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvdmVyR2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoY292ZXJIZWlnaHQsIGNvdmVyRGVwdGgsIGNvdmVyV2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY292ZXJTaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMyhjb3ZlckhlaWdodCAvIDIsIGNvdmVyRGVwdGggLyAyLCBjb3ZlcldpZHRoIC8gMikpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvdmVyTWVzaEwgPSBuZXcgVEhSRUUuTWVzaChjb3Zlckdlb21ldHJ5LCBjb3Zlck1hdGVyaWFsKTtcbiAgICAgICAgICAgICAgICBjb3Zlck1lc2hMLnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyWCArIGNvdmVySGVpZ2h0IC8gMixcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyWSArIGNvdmVyRGVwdGggLyAyIC0gZ2FydGVyUmFkaXVzLFxuICAgICAgICAgICAgICAgICAgICBjZW50ZXJaIC0gKGdyb3VuZFdpZHRoIC8gMiArIDIgKiBnYXJ0ZXJSYWRpdXMgKyBjb3ZlcldpZHRoIC8gMilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKGNvdmVyTWVzaEwpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY292ZXJCb2R5TCA9IG5ldyBDQU5OT04uQm9keSh7XG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDAsXG4gICAgICAgICAgICAgICAgICAgIHNoYXBlOiBjb3ZlclNoYXBlLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IENBTk5PTi5WZWMzKFxuICAgICAgICAgICAgICAgICAgICAgICAgY292ZXJNZXNoTC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgICAgICAgICAgY292ZXJNZXNoTC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgICAgICAgICAgY292ZXJNZXNoTC5wb3NpdGlvbi56XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB3b3JsZC5hZGRCb2R5KGNvdmVyQm9keUwpO1xuICAgICAgICAgICAgfVxuXG5cblxuXG5cbiAgICAgICAgICAgIGlmIChpID09PSBNYXRoLmZsb29yKG51bSAvIDIpKSB7XG4gICAgICAgICAgICAgICAgLy8g55CDXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BoZXJlUmFkaXVzID0gMjtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGhlcmVNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7IGNvbG9yOiAweGZmMDAwMCB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGhlcmVHZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShzcGhlcmVSYWRpdXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNwaGVyZU1lc2ggPSBuZXcgVEhSRUUuTWVzaChzcGhlcmVHZW9tZXRyeSwgc3BoZXJlTWF0ZXJpYWwpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3BoZXJlTWVzaCA9IHNwaGVyZU1lc2g7XG4gICAgICAgICAgICAgICAgc3BoZXJlTWVzaC5wb3NpdGlvbi5zZXQoXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlclggLSA1LFxuICAgICAgICAgICAgICAgICAgICBjZW50ZXJZICsgNSxcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyWiArIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHNwaGVyZU1lc2gpO1xuXG4gICAgICAgICAgICAgICAgLy8g55CD5ryU566XXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BoZXJlU2hhcGUgPSBuZXcgQ0FOTk9OLlNwaGVyZShzcGhlcmVSYWRpdXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNwaGVyZUJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAxMCB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkgPSBzcGhlcmVCb2R5O1xuICAgICAgICAgICAgICAgIHNwaGVyZUJvZHkuYWRkU2hhcGUoc3BoZXJlU2hhcGUpO1xuICAgICAgICAgICAgICAgIHNwaGVyZUJvZHkucG9zaXRpb24uc2V0KHNwaGVyZU1lc2gucG9zaXRpb24ueCwgc3BoZXJlTWVzaC5wb3NpdGlvbi55LCBzcGhlcmVNZXNoLnBvc2l0aW9uLnopO1xuICAgICAgICAgICAgICAgIHNwaGVyZUJvZHkucXVhdGVybmlvbi5zZXQoc3BoZXJlTWVzaC5xdWF0ZXJuaW9uLngsIHNwaGVyZU1lc2gucXVhdGVybmlvbi55LCBzcGhlcmVNZXNoLnF1YXRlcm5pb24ueiwgc3BoZXJlTWVzaC5xdWF0ZXJuaW9uLncpO1xuICAgICAgICAgICAgICAgIC8vIOWInemAn+OCkuS4juOBiOOCi1xuICAgICAgICAgICAgICAgIHNwaGVyZUJvZHkudmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgICAgICAgICAgIC8vIOaoquWQkeOBjeODmeODq+ODiOOBqOOBruihneeqgeWIpOWumlxuICAgICAgICAgICAgICAgIHNwaGVyZUJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY29sbGlkZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdGhlckJvZHkgPSBldmVudC5ib2R5O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGJlbHRCb2R5IOOBq+ihneeqgeOBl+OBn+OBqOOBjeOBruOBv+WHpueQhlxuICAgICAgICAgICAgICAgICAgICBpZiAob3RoZXJCb2R5ID09PSBiZWx0Qm9keSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BoZXJlQm9keS52ZWxvY2l0eS5zZXQoMCwgMCwgLTQwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdGhlckJvZHkgPT09IHRoaXMuc2lkZUJlbHRMQm9keSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BoZXJlQm9keS52ZWxvY2l0eS5zZXQoLTEyMCwgMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB3b3JsZC5hZGRCb2R5KHNwaGVyZUJvZHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICAvLyDjg6njgqTjg4joqK3lrppcbiAgICAgICAgdGhpcy5saWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcbiAgICAgICAgY29uc3QgbHZlYyA9IG5ldyBUSFJFRS5WZWN0b3IzKC0xMCwgMTAsIDEpLm5vcm1hbGl6ZSgpO1xuICAgICAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldChsdmVjLngsIGx2ZWMueSwgbHZlYy56KTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5saWdodCk7XG5cbiAgICAgICAgbGV0IGFycm93QWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgbGV0IGVudGVyQWN0aW9uID0gdHJ1ZTtcblxuICAgICAgICAvLyDkuK3lpK7jg4fjgqPjgrnjg5fjg6zjgqRcbiAgICAgICAgdGhpcy5kaXNwbGF5TWVzaCA9IHRoaXMuY3JlYXRlVGV4dERpc3BsYXkoXCLlgJLjgozjgZ/jg5Tjg7M6IDBcIiwgbmV3IFRIUkVFLlZlY3RvcjMoMTAwLCA1MCwgMCksIG5ldyBUSFJFRS5FdWxlcigwLCAtTWF0aC5QSSAvIDIsIDApLCAyNCk7XG4gICAgICAgIC8vIOWPs+ODh+OCo+OCueODl+ODrOOCpFxuICAgICAgICBjb25zdCBkaXNwbGF5TWVzaDIgPSB0aGlzLmNyZWF0ZVRleHREaXNwbGF5KFwi44OS44Oz44OIIFxcbueQg+OCkuaKleOBkuOBpuOBhOOCi+mWk+OCgiBcXG7jgq3jg7zmk43kvZzjgYwuLi5cIiwgbmV3IFRIUkVFLlZlY3RvcjMoMTAwLCA1MCwgMTAwKSwgbmV3IFRIUkVFLkV1bGVyKDAsIC1NYXRoLlBJIC8gMiwgMCksIDE4KTtcbiAgICAgICAgLy8g5bem44OH44Kj44K544OX44Os44KkXG4gICAgICAgIGNvbnN0IGRpc3BsYXlNZXNoMyA9IHRoaXMuY3JlYXRlVGV4dERpc3BsYXkoXCLmk43kvZzoqqzmmI4gXFxu5bem5Y+z44Kt44O877ya44Oc44O844Or56e75YuVIFxcbkVudGVy77ya5oqV44GS44KLIFxcbnLvvJrjg6rjgrvjg4Pjg4hcIiwgbmV3IFRIUkVFLlZlY3RvcjMoMTAwLCA1MCwgLTEwMCksIG5ldyBUSFJFRS5FdWxlcigwLCAtTWF0aC5QSSAvIDIsIDApLCAxOCk7XG5cblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudGVyQWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkudmVsb2NpdHkuc2V0KDE1MCwgMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYUFjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50ZXJBY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93QWN0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZhbGxlbiA9IHRoaXMuY291bnRGYWxsZW5QaW5zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mYWxsZW4gPSBmYWxsZW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOWAkuOCjOOBn+ODlOODs+OBruacrOaVsDogJHtmYWxsZW59YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGluQ291bnRMYWJlbCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbCkgbGFiZWwuaW5uZXJUZXh0ID0gYOWAkuOCjOOBn+ODlOODszogJHtmYWxsZW59YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRleHREaXNwbGF5KHRoaXMuZGlzcGxheU1lc2gsIGDlgJLjgozjgZ/jg5Tjg7M6ICR7ZmFsbGVufWAsIDI0LCBmYWxsZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgODAwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFycm93QWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zcGhlcmVCb2R5LnBvc2l0aW9uLnogPCB0aGlzLmdyb3VuZFdpZHRoIC8gMiArIHRoaXMuZ2FydGVyUmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGhlcmVCb2R5LnBvc2l0aW9uLnogKz0gMC41O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJvd0FjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3BoZXJlQm9keS5wb3NpdGlvbi56ID4gLSh0aGlzLmdyb3VuZFdpZHRoIC8gMiArIHRoaXMuZ2FydGVyUmFkaXVzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3BoZXJlQm9keS5wb3NpdGlvbi56IC09IDAuNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdSJzpcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRQaW5zKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3BoZXJlQm9keS5wb3NpdGlvbi5zZXQoLTUsIDUsIDIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkudmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd0FjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRlckFjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgdXBkYXRlOiBGcmFtZVJlcXVlc3RDYWxsYmFjayA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICB3b3JsZC5maXhlZFN0ZXAoKTtcblxuICAgICAgICAgICAgdGhpcy5zcGhlcmVNZXNoLnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkucG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkucG9zaXRpb24uelxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuc3BoZXJlTWVzaC5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkucXVhdGVybmlvbi54LFxuICAgICAgICAgICAgICAgIHRoaXMuc3BoZXJlQm9keS5xdWF0ZXJuaW9uLnksXG4gICAgICAgICAgICAgICAgdGhpcy5zcGhlcmVCb2R5LnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZUJvZHkucXVhdGVybmlvbi53XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zcGhlcmVCb2R5LnBvc2l0aW9uLnkgPD0gLTEwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGhlcmVCb2R5LnBvc2l0aW9uLnNldCgtMzQsIDUsIC0yMik7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGhlcmVCb2R5LnZlbG9jaXR5LnNldCgtMiwgMCwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGhlcmVCb2R5LmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaW5NZXNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwaW5NZXNoZXNbaV0ucG9zaXRpb24uc2V0KFxuICAgICAgICAgICAgICAgICAgICBwaW5Cb2RpZXNbaV0ucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgcGluQm9kaWVzW2ldLnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgICAgIHBpbkJvZGllc1tpXS5wb3NpdGlvbi56XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBwaW5NZXNoZXNbaV0ucXVhdGVybmlvbi5zZXQoXG4gICAgICAgICAgICAgICAgICAgIHBpbkJvZGllc1tpXS5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICAgICAgICAgIHBpbkJvZGllc1tpXS5xdWF0ZXJuaW9uLnksXG4gICAgICAgICAgICAgICAgICAgIHBpbkJvZGllc1tpXS5xdWF0ZXJuaW9uLnosXG4gICAgICAgICAgICAgICAgICAgIHBpbkJvZGllc1tpXS5xdWF0ZXJuaW9uLncsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICB9XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0KTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBsZXQgY29udGFpbmVyID0gbmV3IFRocmVlSlNDb250YWluZXIoKTtcbiAgICBsZXQgdmlld3BvcnQgPSBjb250YWluZXIuY3JlYXRlUmVuZGVyZXJET00oNjQwLCA0ODAsIG5ldyBUSFJFRS5WZWN0b3IzKC04MCwgMTUsIDApKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHZpZXdwb3J0KTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIm1haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rY2dwcmVuZGVyaW5nXCJdID0gc2VsZltcIndlYnBhY2tDaHVua2NncHJlbmRlcmluZ1wiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfY2Fubm9uLWVzX2Rpc3RfY2Fubm9uLWVzX2pzLW5vZGVfbW9kdWxlc190aHJlZV9leGFtcGxlc19qc21fY29udHJvbHNfT3JiLTA2ZjhlNVwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hcHAudHNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==