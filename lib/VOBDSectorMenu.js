/**
 * Created with JetBrains WebStorm.
 * User: vadim
 * Date: 02.10.13
 * Time: 21:42
 * To change this template use File | Settings | File Templates.
 */

/**
 *      Our sector menu with 5 sectors and central
 **/
VOBD.SectorMenu = function(parameters){

    this.meshes = new THREE.Object3D();
    this.updateItems = new VOBD.UpdateItems();
    this.selectedSector = this._oldSelectedSector = 0;
    this.meshes.rotation.z = DU.ang2Rad(52);

    var sectorMesh;

    // Add sector meshes
    for( var i = 0; i < 5; i++){
        sectorMesh = new VOBD.SectorMesh({
            innerRadius : 100,
            innerRadiusMorph : 270,
            outerRadius : 395,
            angle : 78,
            angleMorph: 120,
            segments : 30,
            viewPortWidth : screenWidth,
            viewPortHeight : screenHeight,
            number: i    // Sector number
        });

        sectorMesh.rotation.z = DU.ang2Rad(72 * i);
        this.meshes.add(sectorMesh);
    }

    // Add central sphere
    var sphereGeometry = new THREE.SphereGeometry( 180, 50, 50);
    var sphereGeometryMorph0 = new THREE.SphereGeometry( 305, 50, 50);
    sphereGeometry.morphTargets.push( {name: "target0", vertices: sphereGeometryMorph0.vertices });
    var sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xD01000,
        specular: 0xD01000,
        shininess: 6,
        transparent: false,
        opacity: 1.0,
        depthTest: true,
        morphTargets: true,
        index0AttributeName: "position"
    });
    var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.z = -138;
    sphereMesh.morphTargetInfluences[0] = 0.0;

    this.meshes.add(sphereMesh);


};

VOBD.SectorMenu.prototype.update = function(delta){
    var uniforms;

    this.updateItems.update( delta );

    //Check weather user selected other sector than current
    if(this.selectedSector != this._oldSelectedSector){

        if(this._oldSelectedSector > 0){
            uniforms = this.meshes.children[this._oldSelectedSector - 1].material.uniforms;

            this.updateItems.add(
                    new VOBD.UpdateItem({
                        object: uniforms["uAlpha"],
                        key: "value",
                        value: 0.27,
                        speed: 0.01
                    })
                ).add( new VOBD.UpdateItem({
                    object: uniforms["uColMul"],
                    key: "value",
                    value: 0.13,
                    speed: 0.01
                })
                ).add(
                    new VOBD.UpdateItem({
                        object: uniforms["uStepMul"],
                        key: "value",
                        value: 0.6,
                        speed: 0.01
                    })
                );
        }

        if(this.selectedSector > 0){
            uniforms = this.meshes.children[this.selectedSector - 1].material.uniforms;

            this.updateItems.add(
                    new VOBD.UpdateItem({
                        object: uniforms["uAlpha"],
                        key: "value",
                        value: 0.50,
                        speed: 0.05
                    })
                ).add( new VOBD.UpdateItem({
                    object: uniforms["uColMul"],
                    key: "value",
                    value: 0.10,
                    speed: 1.0
                })
                ).add( new VOBD.UpdateItem({
                    object: uniforms["uStepMul"],
                    key: "value",
                    value: 0.15,
                    speed: 0.1
                })
                );
        }
        this._oldSelectedSector = this.selectedSector;
    }

}


/**
 *  SectorMesh is a THREE.Mesh object with custom geometry and our glow shader
 * @param innerRadius
 * @constructor
 */
VOBD.SectorMesh = function(parameters){

    // Create basic(main) sector geometry
    var sectorGeometry = new VOBD.Geometry.Sector( parameters.innerRadius,
        parameters.outerRadius,
        parameters.angle,
        parameters.segments);

    // Create Morph0 geometry (change of inner radius)
    var sectorGeometryMorph0 = new VOBD.Geometry.Sector( parameters.innerRadiusMorph,
        parameters.outerRadius,
        parameters.angle,
        parameters.segments);

    // Create  Morph1 geometry (change of angle to big one)
    var sectorGeometryMorph1 = new VOBD.Geometry.Sector( parameters.innerRadius,
        parameters.outerRadius,
        parameters.angleMorph,
        parameters.segments);

    sectorGeometry.morphTargets.push( {name: "target0", vertices: sectorGeometryMorph0.vertices });
    sectorGeometry.morphTargets.push( {name: "target1", vertices: sectorGeometryMorph1.vertices });

    var shader = new VOBD.Shader.GlowShaderA(parameters.viewPortWidth, parameters.viewPortHeight);

    var sectorMaterial = new THREE.ShaderMaterial({
        vertexShader : shader.vertexShader,
        fragmentShader : shader.fragmentShader,
        uniforms : shader.uniforms,
        attributes : shader.attributes,
        transparent: true,
        wireframe: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true,
        morphTargets: true
    });
    sectorMaterial.attributes.aTexCoord.value = sectorGeometry.aTexCoord;
    sectorMaterial.uniforms.uStepMul.value = 0.6;
    sectorMaterial.uniforms.uColMul.value = 0.14;
    sectorMaterial.uniforms.uAlpha.value = 0.27;

    var mesh = new THREE.Mesh(sectorGeometry, sectorMaterial);
    mesh.morphTargetInfluences[0] = 0.0;
    mesh.morphTargetInfluences[1] = 0.0;
    mesh.sectorNumber = parameters.number + 1;
    return mesh;
};

