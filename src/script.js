import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'lil-gui'

/*
    Loader
*/
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()

/**
 * Base
 */
// Debug
const global = {}
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.backgroundBlurriness = 0
scene.backgroundIntensity = 5

gui.add(scene, 'backgroundBlurriness').min(0).max(1)
gui.add(scene, 'backgroundIntensity').min(0).max(10)

// HDR equirectangular
rgbeLoader.load('/environmentMaps/0/2k.hdr', (envMap) => {
    console.log(envMap);
    envMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = envMap
    scene.environment = envMap
})

/*
    Utils
*/
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if(child.isMesh && child.material.isMeshStandardMaterial) {
            child.material.envMapIntensity = global.envMapIntensity
        }
    })
}

/*
    Environment Map
*/
global.envMapIntensity = 1;
gui.add(global, 'envMapIntensity')
    .min(0)
    .max(10)
    .onChange(updateAllMaterials)
// LDR Cube texture
// const environmentMap = cubeTextureLoader.load([
//     '/environmentMaps/1/px.png',
//     '/environmentMaps/1/nx.png',
//     '/environmentMaps/1/py.png',
//     '/environmentMaps/1/ny.png',
//     '/environmentMaps/1/pz.png',
//     '/environmentMaps/1/nz.png',
// ])

// scene.environment = environmentMap
// scene.background = environmentMap

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 1,
        color: "#0xaaaa"
    })
)
torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

/*
    Models
*/
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10)
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()