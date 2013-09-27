/**
 * Created with JetBrains WebStorm.
 * User: vadim
 * Date: 20.09.13
 * Time: 11:32
 * To change this template use File | Settings | File Templates.
 */

var VOBD = VOBD || {VersionMajor: "1", VersionMinor:"0"};

/**
 VOBD.Shader
 Container(object) for VOBD shader objects.
 Shader object contains shader programs, uniforms and attributes
 */
VOBD.Shader = {};

/**
 * VOBD.Geometry
 * Container(objec) for our custom geometries.
 * VOBD custom geometry inherits from THREE.Geometry and represent THREE.Geometry object that can be used
 * for mesh creation.
 * @type {{}}
 */
VOBD.Geometry = {};

/**
 *  VOBD.Shader.GlowShaderA (currently used for menu sectors)
 *
 */
VOBD.Shader.GlowShaderA = function(viewPortWidth, viewPortHeight){

    // texture coordinates transferred for procedural drawing in fragment shader
    this.attributes = {
        "aTexCoord" : { type: "v4", value:[]}
    };

    /*
        uResolution - view port width and height
        uTime   - tick time
        uStepMul - distance of glowing
        uColMul - color final multiplication
        uAlpha  - transparency of object
        uAlphaThr - Alpha threshold for discard fragments
        uGlowColor - general color of the object
        uMorph - ? //TODO: Delete
     */
    this.uniforms = {
        "uResolution" : { type: "v2", value: new THREE.Vector2( viewPortWidth, viewPortHeight)},
        "uTime"       : { type: "f",  value: 0.0},
        "uStepMul"    : { type: "f",  value: 0.0 },
        "uColMul"     : { type: "f",  value: 0.0 },
        "uAlpha"      : { type: "f",  value: 0.0 },
        "uAlphaThr"   : { type: "f",  value: 0.0 },
        "uGlowColor"  : { type: "v3", value: new THREE.Vector3(1.0, 0.1, 0.02)},
        "uMorph"      : { type: "f",  value: 0.0 }
    };

    this.vertexShader = [

        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",

        "attribute vec4 aTexCoord;",
        "varying vec4 vTexCoord;",
        THREE.ShaderChunk.morphtarget_pars_vertex,

        "void main(){",
            "vTexCoord = aTexCoord;",
            "//gl_Position = projectionMatrix * modelViewMatrix *  vec4(position, 1.0);",
            THREE.ShaderChunk.morphtarget_vertex,
            "gl_Position = projectionMatrix * modelViewMatrix *  vec4(morphed, 1.0);",
        "}"
    ].join("\n");

    this.fragmentShader = [
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",

    "uniform vec2  uResolution;",
    "uniform float uTime;",
    "uniform float uStepMul;",
    "uniform float uColMul;",
    "uniform float uAlpha;",
    "uniform vec3  uGlowColor;",
    "uniform float uAlphaThr;",
    "uniform float uMorph;",
    "varying vec4  vTexCoord;",


    "void main()",
    "{",
        "vec3 color;",
        "float alpha;",
        "float dif;",
        "float step, stepX, stepY, stepD;",

        "vec2 normPos = vTexCoord.xy;",
        "normPos.x = normPos.x / vTexCoord.w;",
        "//normPos.y = normPos.y * 0.7;",
        "stepX = abs(normPos.x - 0.5) - 0.4;",
        "stepY = abs(normPos.y - 0.5) - 0.4;",
        "stepY = stepY * (1. - uMorph * 0.7);",
        "if(stepX > 0.0 && stepY > 0.0) step = distance(vec2(stepX, stepY), vec2(0.0, 0.0));",
        "else step = max(stepX, stepY);",

        "if(step > 0.0){",
            "color = vec3(max(0.0, 1. - step * uStepMul * 70.));",
            "alpha = color.r;",
            "color = color * uGlowColor * uColMul * 10.;",
            "if( step < 0.008 ) color = color * (1.5 - min(0.2,normPos.y));",

        "}else{",
            "alpha = uAlpha - max(0.0, smoothstep(0.0, 1.0, normPos.y * 0.4));",
            "vec3 color1 = uGlowColor;",

            "//if( mod(normPos.x * 400., 58.0) < (5.0 - normPos.y * 5. - uMorph * 2.5)){",
            "if( mod(normPos.x * 400., 58.0) < 2.0){",
                "alpha = max(alpha, 0.5 * (1.0 - normPos.y * 0.9));",
            "}",

            "if( mod(normPos.y * 400., 70.) < 1.0 + uMorph * 3.){",
                "alpha = max(alpha, 0.5 * (1.0 - normPos.y * 1.0));",
            "}",

            "if( mod(normPos.x * 400., 58.0) < 5.0 && mod(normPos.y * 400., 70.0) < 3.0){",
                "alpha = max(alpha, 0.7 * (1.0 - normPos.y * 1.0));",
            "}",

            "color = color1;",
        "}",
        "if(alpha < uAlphaThr) discard;",
        "//alpha = 0.0;",
        "gl_FragColor = vec4(color, alpha);",

    "}"
    ].join("\n");
};


/**************************************************************************************
                    S E C T O R    G O M E T R Y
 ****************************************************************************************/
VOBD.Geometry.Sector = function ( innerRadius, outerRadius, angle, nSegments) {

        THREE.Geometry.call( this );

        var outerRadius = outerRadius || 1,
            innerRadius = innerRadius || .5,
            gridY = nSegments || 10;

        var i, twopi = DU.ang2Rad(angle);

        var iVer = Math.max( 2, gridY );

        this.aTexCoord = [];

        for ( i = 0; i < ( iVer + 1 ) ; i++ ) {

            var fRad1 = i / iVer;
            var fRad2 = (i + 1) / iVer;

            var fX1 = innerRadius * Math.cos( fRad1 * twopi );
            var fY1 = innerRadius * Math.sin( fRad1 * twopi );
            var fX2 = outerRadius * Math.cos( fRad1 * twopi );
            var fY2 = outerRadius * Math.sin( fRad1 * twopi );
            var fX4 = innerRadius * Math.cos( fRad2 * twopi );
            var fY4 = innerRadius * Math.sin( fRad2 * twopi );
            var fX3 = outerRadius * Math.cos( fRad2 * twopi );
            var fY3 = outerRadius * Math.sin( fRad2 * twopi );

            var v1 = new THREE.Vector3( fX1, fY1, 0 );
            var v2 = new THREE.Vector3( fX2, fY2, 0 );
            var v3 = new THREE.Vector3( fX3, fY3, 0 );
            var v4 = new THREE.Vector3( fX4, fY4, 0 );
            this.vertices.push(v1);
            this.vertices.push(v2);
            this.vertices.push(v3);
            this.vertices.push(v4);

            var dist_1_4 = v1.distanceTo(v4);
            var dist_2_3 = v2.distanceTo(v3);
            var texScaleX =  dist_2_3/dist_1_4;

            this.aTexCoord.push( new THREE.Vector4( 1 - fRad1, 0, 0, 1 ) );
            this.aTexCoord.push( new THREE.Vector4( texScaleX - fRad1 * texScaleX, 1, 0, texScaleX ) );
            this.aTexCoord.push( new THREE.Vector4( texScaleX - fRad2 * texScaleX, 1, 0, texScaleX ) );
            this.aTexCoord.push( new THREE.Vector4( 1 - fRad2,         0, 0, 1 ) );

        }

        for ( i = 0; i < iVer ; i++ ) {

            this.faces.push(new THREE.Face3( i * 4, i * 4 + 1, i * 4 + 2));
            this.faces.push(new THREE.Face3( i * 4, i * 4 + 2, i * 4 + 3));

        }

        this.computeCentroids();
        this.computeFaceNormals();

        //this.boundingSphere = { radius: outerRadius };
        this.computeBoundingSphere();
};

VOBD.Geometry.Sector.prototype = new THREE.Geometry();
VOBD.Geometry.Sector.prototype.constructor = VOBD.Geometry.Sector;

/**
               V O B D     O B J E C T S
*/

/**
 *
 * @param innerRadius
 * @constructor
 */

VOBD.SectorMesh = function(parameters){

    var sectorGeometry = new VOBD.Geometry.Sector( parameters.innerRadius,
                        parameters.outerRadius,
                        parameters.angle,
                        parameters.segments);
    var sectorGeometryMorph0 = new VOBD.Geometry.Sector( parameters.innerRadius,
        parameters.outerRadius * 1.5,
        parameters.angle,
        parameters.segments);

    var sectorGeometryMorph1 = new VOBD.Geometry.Sector( parameters.innerRadiusMorph1,
        parameters.outerRadius,
        parameters.angle,
        parameters.segments);

    var sectorGeometryMorph2 = new VOBD.Geometry.Sector( parameters.innerRadius,
        parameters.outerRadius,
        parameters.angleMorph,
        parameters.segments);

    sectorGeometry.morphTargets.push( {name: "target0", vertices: sectorGeometryMorph0.vertices });
    sectorGeometry.morphTargets.push( {name: "target1", vertices: sectorGeometryMorph1.vertices });
    sectorGeometry.morphTargets.push( {name: "target2", vertices: sectorGeometryMorph2.vertices });

    var shader = new VOBD.Shader.GlowShaderA(parameters.viewPortWidth, parameters.viewPortHeight);
    var sectorMaterial = new THREE.ShaderMaterial({
        vertexShader : shader.vertexShader,
        fragmentShader : shader.fragmentShader,
        uniforms : shader.uniforms,
        attributes : shader.attributes,
        transparent: true,
        //opacity: 0.5,
        wireframe: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        depthWrite: true,
        depthTest: true,
        morphTargets: true
    });
    sectorMaterial.attributes.aTexCoord.value = sectorGeometry.aTexCoord;
    sectorMaterial.uniforms.uStepMul.value = 0.7;
    sectorMaterial.uniforms.uColMul.value = 0.1;
    sectorMaterial.uniforms.uAlpha.value = 0.27;

    var mesh = new THREE.Mesh(sectorGeometry, sectorMaterial);
    mesh.morphTargetInfluences[0] = 0.0;
    mesh.morphTargetInfluences[1] = 0.0;
    mesh.morphTargetInfluences[2] = 0.0;

    return mesh;
};