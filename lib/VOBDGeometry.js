/**
 * Created with JetBrains WebStorm.
 * User: vadim
 * Date: 02.10.13
 * Time: 20:35
 * To change this template use File | Settings | File Templates.
 */
/**
 * VOBD.Geometry
 * Container(objec) for our custom geometries.
 * VOBD custom geometry inherits from THREE.Geometry and represent THREE.Geometry object that can be used
 * for mesh creation.
 * @type {{}}
 */
VOBD.Geometry = {};

/**************************************************************************************
 S E C T O R    G O M E T R Y
 ****************************************************************************************/
VOBD.Geometry.Sector = function ( innerRadius, outerRadius, angle, nSegments) {

    THREE.Geometry.call( this );

    // We use our texture coordinates (not Geometry.UVs) because we need perspective division coordinate
    this.aTexCoord = [];

    var outerRadius = outerRadius || 1,
        innerRadius = innerRadius || .5,
        gridY = nSegments || 10;

    var i, twopi = DU.ang2Rad(angle);

    var iVer = Math.max( 2, gridY );

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
        this.faces.push(new THREE.Face3( i * 4, i * 4 + 1, i * 4 + 2));
        this.faces.push(new THREE.Face3( i * 4, i * 4 + 2, i * 4 + 3));

        // Calculate our texture coordinates with projection correction
        var projX =  v2.distanceTo(v3)/ v1.distanceTo(v4);
        this.aTexCoord.push( new THREE.Vector4(  1 - fRad1,          0, 0, 1 ) );
        this.aTexCoord.push( new THREE.Vector4( (1 - fRad1) * projX, 1, 0, projX ) );
        this.aTexCoord.push( new THREE.Vector4( (1 - fRad2) * projX, 1, 0, projX ) );
        this.aTexCoord.push( new THREE.Vector4(  1 - fRad2,          0, 0, 1 ) );
    }

    this.computeCentroids();
    this.computeFaceNormals();
    this.computeBoundingSphere();
};

VOBD.Geometry.Sector.prototype = new THREE.Geometry();
VOBD.Geometry.Sector.prototype.constructor = VOBD.Geometry.Sector;
