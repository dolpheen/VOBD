/**
 * Created with JetBrains WebStorm.
 * User: vadim
 * Date: 02.10.13
 * Time: 20:32
 * To change this template use File | Settings | File Templates.
 */
/**
 VOBD.Shader
 Container(object) for VOBD shader objects.
 Shader object contains shader programs, uniforms and attributes
 */
VOBD.Shader = {};

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
        "uGlowColor"  : { type: "v3", value: new THREE.Vector3(1.0, 0.05, 0.05)},
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
        "//alpha = 1.0;",
        "//color = vec3(0.0, 0.8, 0.0);",
        "gl_FragColor = vec4(color, alpha);",

        "}"
    ].join("\n");
};

